import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'math.cbse6.ganita-prakash.patterns.number-patterns.v1',
  'math.cbse6.ganita-prakash.patterns.shape-patterns.v1',
  'math.cbse6.ganita-prakash.patterns.everyday-patterns.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json','utf8'));
assert.equal(map.board,'CBSE');
assert.equal(map.classLevel,6);
assert.equal(map.chapters.length,10);
assert.deepEqual(map.chapters.map(x=>x.chapter),[1,2,3,4,5,6,7,8,9,10]);
assert.equal(new Set(map.chapters.map(x=>x.id)).size,10);
assert.equal(map.chapters[0].title,'Patterns in Mathematics');
assert.equal(map.chapters[0].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.match(map.completionRule,/all ten chapters/i);
assert.equal(map.schoolOverlay.school,'SAN Academy Tambaram');
assert.notEqual(map.schoolOverlay.mappingStatus,'VERIFIED');
assert.equal(map.chapter1Topics.length,3);
assert.ok(map.chapter1Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter1CompletionEvidence?.lessonCount,3);
assert.equal(map.chapter1CompletionEvidence?.assessmentCount,15);
assert.equal(map.chapter1CompletionEvidence?.status,'CHAPTER1_KIKI_TEACHING_SLICE_COMPLETE');

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-math-pilot.js','utf8'),sandbox,{filename:'class6-math-pilot.js'});
vm.runInContext(fs.readFileSync('data/class6-math-assessments.js','utf8'),sandbox,{filename:'class6-math-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
assert.equal(lessons.length,3);
assert.deepEqual([...lessons.map(x=>x.id)].sort(),[...lessonIds].sort());
assert.equal(new Set(lessons.map(x=>x.id)).size,3);
assert.equal(new Set(lessons.map(x=>x.topicId)).size,3);
for(const lesson of lessons){
  assert.equal(lesson.subject,'Mathematics');
  assert.equal(lesson.board,'CBSE');
  assert.equal(lesson.classLevel,6);
  assert.equal(lesson.book,'Ganita Prakash');
  assert.equal(lesson.chapter,1);
  assert.equal(lesson.ageBand,'11-13');
  assert.ok(lesson.learningObjective.length>40);
  assert.ok(lesson.content.length>300);
  assert.ok(lesson.workedExample.length>100);
  assert.ok(Array.isArray(lesson.sourceRefs)&&lesson.sourceRefs.length>=2);
  assert.match(lesson.rightsStatus,/ORIGINAL/);
  for(const field of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt']) assert.ok(lesson.kikiTeaching?.[field],`${lesson.id} missing kikiTeaching.${field}`);
  assert.ok(lesson.remediation?.trigger);
  assert.ok(lesson.remediation?.strategy);
  assert.ok(lesson.remediation?.masteryEvidence);
}
assert.equal(assessments.length,15);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} assessment count`);
  for(const item of attached) for(const field of ['stableAssessmentId','assessmentType','questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`assessment missing ${field}`);
  assert.ok(attached.some(x=>x.assessmentType==='reasoning'),`${lessonId} reasoning assessment missing`);
  assert.ok(attached.some(x=>x.assessmentType==='mastery_check'),`${lessonId} mastery assessment missing`);
}
assert.ok(assessments.some(x=>/without recording personal data/i.test(x.questionActivity)));
assert.ok(assessments.some(x=>/do not prove/i.test(x.correctAnswer)));

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-math-pilot.js','data/class6-math-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.match(entry,/datasetKey:'class6MathPilot'/);
assert.match(entry,/document\.documentElement\.dataset\[datasetKey\]='load-error'/);
const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v39/);
for(const asset of ['/data/class6-math-pilot.js','/data/class6-math-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."),'canonical Kiki wording missing');
assert.ok(index.includes('microphone:false'),'Kiki microphone safety assertion missing');
assert.ok(index.includes('recording:false'),'Kiki recording safety assertion missing');
assert.ok(index.includes('speechRecognition:false'),'Kiki speech-recognition safety assertion missing');
console.log(`CLASS6_MATH_CH1_PASS chapters=${map.chapters.length} chapter1Topics=${map.chapter1Topics.length} lessons=${lessons.length} assessments=${assessments.length} school=${map.schoolOverlay.school}`);
