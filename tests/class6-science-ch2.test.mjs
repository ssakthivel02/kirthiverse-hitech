import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'science.cbse6.curiosity.ch2.diversity-observation.v1',
  'science.cbse6.curiosity.ch2.classification-keys.v1',
  'science.cbse6.curiosity.ch2.habitats-adaptations.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(map.chapters.length,12);
assert.equal(map.chapters[1].title,'Diversity in the Living World');
assert.equal(map.chapters[1].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter2Topics.length,3);
assert.ok(map.chapter2Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter2CompletionEvidence.lessonCount,3);
assert.equal(map.chapter2CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter2CompletionEvidence.status,'CHAPTER2_KIKI_TEACHING_SLICE_COMPLETE');
assert.match(map.completionRule,/all twelve/i);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch2.js','utf8'),sandbox,{filename:'class6-science-ch2.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch2-assessments.js','utf8'),sandbox,{filename:'class6-science-ch2-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
assert.equal(lessons.length,3);
assert.deepEqual([...lessons.map(x=>x.id)].sort(),[...lessonIds].sort());
assert.equal(new Set(lessons.map(x=>x.topicId)).size,3);
for(const lesson of lessons){
  assert.equal(lesson.subject,'Science');
  assert.equal(lesson.board,'CBSE');
  assert.equal(lesson.classLevel,6);
  assert.equal(lesson.book,'Curiosity');
  assert.equal(lesson.chapter,2);
  assert.equal(lesson.ageBand,'11-13');
  assert.ok(lesson.learningObjective.length>50);
  assert.ok(lesson.content.length>500);
  assert.ok(lesson.workedExample.length>180);
  assert.ok(Array.isArray(lesson.sourceRefs)&&lesson.sourceRefs.length>=2);
  assert.match(lesson.rightsStatus,/ORIGINAL/);
  for(const field of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt']) assert.ok(lesson.kikiTeaching?.[field],`${lesson.id} missing Kiki ${field}`);
  for(const field of ['trigger','strategy','masteryEvidence']) assert.ok(lesson.remediation?.[field],`${lesson.id} missing remediation ${field}`);
}
assert.equal(assessments.length,15);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} needs exactly five assessments`);
  assert.ok(attached.some(x=>x.assessmentType==='reasoning'));
  assert.ok(attached.some(x=>x.assessmentType==='mastery_check'));
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments}).toLowerCase();
for(const required of ['variation','classification','observable','habitat','evidence']) assert.ok(allText.includes(required),`missing concept ${required}`);
assert.ok(allText.includes('without collecting personal data')||allText.includes('without disturbing wildlife'));
assert.ok(allText.includes('does not by itself prove')||allText.includes('do not by themselves prove'));

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-science-ch2.js','data/class6-science-ch2-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.match(entry,/datasetKey:'class6SciencePilot'/);
const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v35/);
for(const asset of ['/data/class6-science-ch2.js','/data/class6-science-ch2-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_SCIENCE_CH2_PASS topics=${map.chapter2Topics.length} lessons=${lessons.length} assessments=${assessments.length}`);
