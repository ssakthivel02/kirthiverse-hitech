import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'math.cbse6.ganita-prakash.ch10.integers-number-line.v1',
  'math.cbse6.ganita-prakash.ch10.add-subtract-integers.v1',
  'math.cbse6.ganita-prakash.ch10.signed-contexts-expressions.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.11.0');
assert.equal(map.chapters[9].chapter,10);
assert.equal(map.chapters[9].title,'The Other Side of Zero');
assert.equal(map.chapters[9].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter10Topics.length,3);
assert.ok(map.chapter10Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter10CompletionEvidence.lessonCount,3);
assert.equal(map.chapter10CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter10CompletionEvidence.lazyAssessmentLoadingRequired,true);
assert.equal(map.chapter10CompletionEvidence.startupRequestCeilingPreserved,true);
assert.equal(map.chapter10CompletionEvidence.schoolNeedsValidationRequired,true);
assert.equal(map.chapter10CompletionEvidence.schoolNeedsValidationPresent,true);
assert.equal(map.chapter10CompletionEvidence.schoolNeedsValidationArtifact,'docs/class6-pilot/MATH_CH10_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.ok(fs.existsSync(map.chapter10CompletionEvidence.schoolNeedsValidationArtifact));
assert.equal(map.chapter10CompletionEvidence.runtimeCarrier,'data/class6-math-pilot.js');
assert.equal(map.chapter10CompletionEvidence.sourceOfTruth,'data/class6-math-ch10.js');

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-math-ch10.js','utf8'),sandbox,{filename:'class6-math-ch10.js'});
vm.runInContext(fs.readFileSync('data/class6-math-ch10-assessments.js','utf8'),sandbox,{filename:'class6-math-ch10-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
assert.equal(lessons.length,3);
assert.deepEqual([...lessons.map(x=>x.id)].sort(),[...lessonIds].sort());
assert.equal(new Set(lessons.map(x=>x.topicId)).size,3);
for(const lesson of lessons){
  assert.equal(lesson.subject,'Mathematics');assert.equal(lesson.board,'CBSE');assert.equal(lesson.classLevel,6);assert.equal(lesson.book,'Ganita Prakash');assert.equal(lesson.chapter,10);assert.equal(lesson.chapterTitle,'The Other Side of Zero');assert.equal(lesson.ageBand,'11-13');
  assert.ok(lesson.learningObjective.length>40);assert.ok(lesson.content.length>300);assert.ok(lesson.workedExample.length>100);assert.ok(Array.isArray(lesson.sourceRefs)&&lesson.sourceRefs.length>=2);assert.match(lesson.rightsStatus,/ORIGINAL/);assert.notEqual(lesson.schoolMappingStatus,'VERIFIED');
  for(const field of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt']) assert.ok(lesson.kikiTeaching?.[field],`${lesson.id} missing kikiTeaching.${field}`);
  for(const field of ['trigger','strategy','masteryEvidence']) assert.ok(lesson.remediation?.[field],`${lesson.id} missing remediation.${field}`);
}
assert.equal(assessments.length,15);
const expectedIds=Array.from({length:15},(_,i)=>`KV-CBSE6-MATH-${String(i+136).padStart(4,'0')}`);
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),expectedIds);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} assessment count`);
  for(const type of ['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']) assert.ok(attached.some(x=>x.assessmentType===type),`${lessonId} missing ${type}`);
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter10Topics}).toLowerCase();
for(const required of ['integer','negative','number line','opposite','zero pair','addition','subtraction','temperature','elevation','credit','debit','reference']) assert.ok(allText.includes(required),`missing Chapter 10 concept: ${required}`);
assert.ok(allText.includes('zero is neither positive nor negative'),'zero sign-category boundary missing');
assert.ok(allText.includes('subtracting')&&allText.includes('opposite'),'subtraction-as-add-opposite reasoning missing');
assert.ok(!allText.includes('multiplication of integers')&&!allText.includes('division of integers'),'unsupported operation scope must not be introduced');

const carrierSandbox={window:{KV_LESSONS:[]}};vm.createContext(carrierSandbox);vm.runInContext(fs.readFileSync('data/class6-math-pilot.js','utf8'),carrierSandbox,{filename:'class6-math-pilot.js'});
const carrier=carrierSandbox.window.KV_LESSONS;
const ch1=carrier.filter(x=>x.chapter===1),ch9=carrier.filter(x=>x.chapter===9),runtimeChapter10=carrier.filter(x=>x.chapter===10);
assert.equal(ch1.length,3,'historical Chapter 1 carrier must retain exactly three Chapter 1 lessons');
assert.equal(ch9.length,3,'Chapter 9 carrier lessons must remain exactly three');
assert.equal(runtimeChapter10.length,3,'Chapter 10 runtime carrier must expose exactly three lessons');
assert.equal(carrier.length,9,'Chapter 1/9/10 carrier must expose exactly nine lessons');
assert.equal(new Set(carrier.map(x=>x.id)).size,9,'carrier lesson IDs must remain unique');
const sourceById=new Map(lessons.map(x=>[x.id,x]));for(const runtimeLesson of runtimeChapter10)assert.deepEqual(JSON.parse(JSON.stringify(runtimeLesson)),JSON.parse(JSON.stringify(sourceById.get(runtimeLesson.id))),`Chapter 10 runtime drift detected for ${runtimeLesson.id}`);
const ch9Sandbox={window:{KV_LESSONS:[]}};vm.createContext(ch9Sandbox);vm.runInContext(fs.readFileSync('data/class6-math-ch9.js','utf8'),ch9Sandbox,{filename:'class6-math-ch9.js'});const ch9ById=new Map(ch9Sandbox.window.KV_LESSONS.map(x=>[x.id,x]));for(const runtimeLesson of ch9)assert.deepEqual(JSON.parse(JSON.stringify(runtimeLesson)),JSON.parse(JSON.stringify(ch9ById.get(runtimeLesson.id))),`Chapter 9 runtime drift detected for ${runtimeLesson.id}`);

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-math-pilot.js','data/class6-math-ch10-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.ok(entry.includes('ch(?:2|3|4|5|6|7|8|9|10)\\.'),'Chapter 1-10 deferred-assessment route coverage missing');assert.ok(!entry.includes("/^\\/lesson\\/math\\./"),'generic Mathematics lessons must not trigger Class 6 assessment bundles');
const baseChunk=entry.slice(entry.indexOf('const mathBaseFiles'),entry.indexOf('const loadClass6MathPilot'));assert.ok(baseChunk.includes('data/class6-math-pilot.js'));assert.ok(!baseChunk.includes('data/class6-math-ch10.js'),'standalone Chapter 10 source module must not add a startup request');assert.ok(!baseChunk.includes('data/class6-math-ch10-assessments.js'),'Chapter 10 assessments must remain deferred');
assert.ok(entry.includes("datasetKey:'class6ScienceDeferredAssessments',subject:'Science'"),'Science deferred loader identity must remain Science');
const sw=fs.readFileSync('sw-v30.js','utf8');assert.match(sw,/kirthiverse-preview-v45/);assert.ok(sw.includes('/data/class6-math-ch10-assessments.js'),'Chapter 10 assessments must be precached');
const index=fs.readFileSync('index.html','utf8');assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));assert.ok(index.includes('microphone:false'));assert.ok(index.includes('recording:false'));assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_MATH_CH10_PASS topics=${map.chapter10Topics.length} lessons=${lessons.length} assessments=${assessments.length} runtimeParity=${runtimeChapter10.length} startupCeiling=${map.chapter10CompletionEvidence.startupRequestCeilingPreserved}`);