import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'science.cbse6.curiosity.ch5.standard-units-measurement.v1',
  'science.cbse6.curiosity.ch5.curved-length-estimation.v1',
  'science.cbse6.curiosity.ch5.motion-reference-types.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(map.chapters.length,12);
assert.equal(map.chapters[4].title,'Measurement of Length and Motion');
assert.equal(map.chapters[4].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter5Topics.length,3);
assert.ok(map.chapter5Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.ok(map.chapter5Topics.every(x=>Array.isArray(x.competencies)&&x.competencies.length>=3));
assert.ok(map.chapter5Topics.every(x=>Array.isArray(x.misconceptions)&&x.misconceptions.length>=3));
assert.ok(map.chapter5Topics.every(x=>Array.isArray(x.safetyBoundary)&&x.safetyBoundary.length>=3));
assert.equal(map.chapter5CompletionEvidence.lessonCount,3);
assert.equal(map.chapter5CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter5CompletionEvidence.measurementSafetyRequired,true);
assert.equal(map.chapter5CompletionEvidence.status,'CHAPTER5_KIKI_TEACHING_SLICE_COMPLETE');
assert.match(map.chapter5CompletionRule,/reference-aware motion/i);
assert.match(map.completionRule,/all twelve/i);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch5.js','utf8'),sandbox,{filename:'class6-science-ch5.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch5-assessments.js','utf8'),sandbox,{filename:'class6-science-ch5-assessments.js'});
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
  assert.equal(lesson.chapter,5);
  assert.equal(lesson.ageBand,'11-13');
  assert.ok(lesson.learningObjective.length>60);
  assert.ok(lesson.content.length>650);
  assert.ok(lesson.workedExample.length>180);
  assert.ok(Array.isArray(lesson.sourceRefs)&&lesson.sourceRefs.length>=2);
  assert.match(lesson.rightsStatus,/ORIGINAL/);
  for(const field of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt']) assert.ok(lesson.kikiTeaching?.[field],`${lesson.id} missing Kiki ${field}`);
  for(const field of ['trigger','strategy','masteryEvidence']) assert.ok(lesson.remediation?.[field],`${lesson.id} missing remediation ${field}`);
}
assert.equal(assessments.length,15);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:15},(_,i)=>`KV-CBSE6-SCI-${String(i+61).padStart(4,'0')}`));
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} needs exactly five assessments`);
  assert.ok(attached.some(x=>x.assessmentType==='reasoning'));
  assert.ok(attached.some(x=>x.assessmentType==='mastery_check'));
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter5Topics}).toLowerCase();
for(const required of ['final minus initial','parallax','curved','non-stretch string','reference point','rectilinear','circular','periodic']) assert.ok(allText.includes(required),`missing Chapter 5 concept: ${required}`);
for(const required of ['no road','moving vehicle','moving machinery','no cords around the body']) assert.ok(allText.includes(required),`missing Chapter 5 safety boundary: ${required}`);
for(const unsafeDirective of ['stand in the road','chase a moving vehicle','lean from a moving vehicle','wrap the string around your neck']) assert.ok(!allText.includes(unsafeDirective),`unsafe motion directive detected: ${unsafeDirective}`);

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-science-ch5.js','data/class6-science-ch5-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.match(entry,/datasetKey:'class6SciencePilot'/);
assert.match(entry,/CBSE6-SCI-CH5-1/);
const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v38/);
for(const asset of ['/data/class6-science-ch5.js','/data/class6-science-ch5-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_SCIENCE_CH5_PASS topics=${map.chapter5Topics.length} lessons=${lessons.length} assessments=${assessments.length} measurementSafety=${map.chapter5CompletionEvidence.measurementSafetyRequired}`);
