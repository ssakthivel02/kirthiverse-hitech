import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'math.cbse6.ganita-prakash.ch3.number-relations-line.v1',
  'math.cbse6.ganita-prakash.ch3.digit-processes.v1',
  'math.cbse6.ganita-prakash.ch3.mental-pattern-estimation.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.3.0');
assert.equal(map.chapters[2].chapter,3);
assert.equal(map.chapters[2].title,'Number Play');
assert.equal(map.chapters[2].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter3Topics.length,3);
assert.ok(map.chapter3Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter3CompletionEvidence.lessonCount,3);
assert.equal(map.chapter3CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter3CompletionEvidence.lazyAssessmentLoadingRequired,true);
assert.equal(map.chapter3CompletionEvidence.schoolNeedsValidationRequired,true);
assert.equal(map.chapter3CompletionEvidence.schoolNeedsValidationPresent,false);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-math-ch3.js','utf8'),sandbox,{filename:'class6-math-ch3.js'});
vm.runInContext(fs.readFileSync('data/class6-math-ch3-assessments.js','utf8'),sandbox,{filename:'class6-math-ch3-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
assert.equal(lessons.length,3);
assert.deepEqual([...lessons.map(x=>x.id)].sort(),[...lessonIds].sort());
assert.equal(new Set(lessons.map(x=>x.topicId)).size,3);
for(const lesson of lessons){
  assert.equal(lesson.subject,'Mathematics');
  assert.equal(lesson.board,'CBSE');
  assert.equal(lesson.classLevel,6);
  assert.equal(lesson.book,'Ganita Prakash');
  assert.equal(lesson.chapter,3);
  assert.equal(lesson.chapterTitle,'Number Play');
  assert.equal(lesson.ageBand,'11-13');
  assert.ok(lesson.learningObjective.length>40);
  assert.ok(lesson.content.length>300);
  assert.ok(lesson.workedExample.length>100);
  assert.ok(Array.isArray(lesson.sourceRefs)&&lesson.sourceRefs.length>=2);
  assert.match(lesson.rightsStatus,/ORIGINAL/);
  assert.notEqual(lesson.schoolMappingStatus,'VERIFIED');
  for(const field of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt']) assert.ok(lesson.kikiTeaching?.[field],`${lesson.id} missing kikiTeaching.${field}`);
  for(const field of ['trigger','strategy','masteryEvidence']) assert.ok(lesson.remediation?.[field],`${lesson.id} missing remediation.${field}`);
}

assert.equal(assessments.length,15);
const expectedIds=Array.from({length:15},(_,i)=>`KV-CBSE6-MATH-${String(i+31).padStart(4,'0')}`);
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),expectedIds);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} assessment count`);
  assert.ok(attached.some(x=>x.assessmentType==='reasoning'),`${lessonId} reasoning assessment missing`);
  assert.ok(attached.some(x=>x.assessmentType==='mastery_check'),`${lessonId} mastery assessment missing`);
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter3Topics}).toLowerCase();
for(const required of ['number line','interval','place value','digit sum','palindrome','leading zero','mental','estimate','conjecture','proof','strategy']) assert.ok(allText.includes(required),`missing Chapter 3 concept: ${required}`);
assert.ok(allText.includes('many tested examples')||allText.includes('millions of starting values'),'conjecture evidence boundary missing');
assert.ok(allText.includes('not')&&allText.includes('proof'),'proof boundary missing');

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-math-ch3.js','data/class6-math-ch3-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.match(entry,/class6MathDeferredAssessments/);
assert.ok(entry.includes("/^\\/lesson\\/math\\./"),'all-Mathematics lesson-route matcher missing');
assert.match(entry,/release-closure/);
const baseChunk=entry.slice(entry.indexOf('const mathBaseFiles'),entry.indexOf('const loadClass6MathPilot'));
assert.ok(baseChunk.includes('data/class6-math-ch3.js'),'Chapter 3 lesson must load in Mathematics base slice');
assert.ok(baseChunk.includes('deferredMathAssessments'),'release-closure must load deferred Mathematics assessments');
assert.ok(!baseChunk.includes("['class6-math-ch1-assessments','data/class6-math-assessments.js']"),'Chapter 1 assessments must not be an unconditional startup request');

const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v45/);
for(const asset of ['/data/class6-math-ch3.js','/data/class6-math-ch3-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));

console.log(`CLASS6_MATH_CH3_PASS topics=${map.chapter3Topics.length} lessons=${lessons.length} assessments=${assessments.length}`);
