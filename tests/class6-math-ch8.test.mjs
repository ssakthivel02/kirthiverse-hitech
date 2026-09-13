import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'math.cbse6.ganita-prakash.ch8.compass-circles-arcs.v1',
  'math.cbse6.ganita-prakash.ch8.square-rectangle-properties.v1',
  'math.cbse6.ganita-prakash.ch8.construct-squares-rectangles.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.10.0');
assert.equal(map.chapters[7].chapter,8);
assert.equal(map.chapters[7].title,'Playing with Constructions');
assert.equal(map.chapters[7].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter8Topics.length,3);
assert.ok(map.chapter8Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter8CompletionEvidence.lessonCount,3);
assert.equal(map.chapter8CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter8CompletionEvidence.lazyAssessmentLoadingRequired,true);
assert.equal(map.chapter8CompletionEvidence.startupRequestCeilingPreserved,true);
assert.equal(map.chapter8CompletionEvidence.schoolNeedsValidationRequired,true);
assert.equal(map.chapter8CompletionEvidence.schoolNeedsValidationPresent,true);
assert.equal(map.chapter8CompletionEvidence.schoolNeedsValidationArtifact,'docs/class6-pilot/MATH_CH8_SCHOOL_NEEDS_VALIDATION_V1.json');

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-math-ch8.js','utf8'),sandbox,{filename:'class6-math-ch8.js'});
vm.runInContext(fs.readFileSync('data/class6-math-ch8-assessments.js','utf8'),sandbox,{filename:'class6-math-ch8-assessments.js'});
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
  assert.equal(lesson.chapter,8);
  assert.equal(lesson.chapterTitle,'Playing with Constructions');
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
const expectedIds=Array.from({length:15},(_,i)=>`KV-CBSE6-MATH-${String(i+106).padStart(4,'0')}`);
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),expectedIds);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} assessment count`);
  for(const type of ['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']) assert.ok(attached.some(x=>x.assessmentType===type),`${lessonId} missing ${type}`);
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}

const allText=JSON.stringify({lessons,assessments,map:map.chapter8Topics}).toLowerCase();
for(const required of ['compass','circle','centre','radius','fixed distance','arc','square','rectangle','rotation','perpendicular','right angle','diagonal','verify']) assert.ok(allText.includes(required),`missing Chapter 8 concept: ${required}`);
assert.ok(allText.includes('orientation'),'rotation/orientation invariance must be explicit');
assert.ok(allText.includes('one diagonal length alone')||allText.includes('one diagonal'),'insufficient diagonal-only constraint boundary missing');

const carrierSandbox={window:{KV_LESSONS:[]}};
vm.createContext(carrierSandbox);
vm.runInContext(fs.readFileSync('data/class6-math-ch2.js','utf8'),carrierSandbox,{filename:'class6-math-ch2.js'});
const carrierLessons=carrierSandbox.window.KV_LESSONS;
const carrierChapter2=carrierLessons.filter(x=>x.chapter===2);
const runtimeChapter8=carrierLessons.filter(x=>x.chapter===8);
assert.equal(carrierChapter2.length,3,'historical Chapter 2 startup carrier must retain exactly three Chapter 2 lessons');
assert.equal(runtimeChapter8.length,3,'historical Chapter 2 startup carrier must append exactly three Chapter 8 runtime lessons');
assert.equal(new Set(carrierLessons.map(x=>x.id)).size,6,'startup carrier lesson IDs must remain unique');
assert.deepEqual([...runtimeChapter8.map(x=>x.id)].sort(),[...lessonIds].sort(),'startup carrier missing Chapter 8 lesson');
const sourceById=new Map(lessons.map(x=>[x.id,x]));
for(const runtimeLesson of runtimeChapter8){
  assert.deepEqual(JSON.parse(JSON.stringify(runtimeLesson)),JSON.parse(JSON.stringify(sourceById.get(runtimeLesson.id))),`Chapter 8 runtime drift detected for ${runtimeLesson.id}`);
}

const establishedRuntime={window:{KV_LESSONS:[]}};
vm.createContext(establishedRuntime);
vm.runInContext(fs.readFileSync('data/class6-math-ch3-4-runtime.js','utf8'),establishedRuntime,{filename:'class6-math-ch3-4-runtime.js'});
assert.equal(establishedRuntime.window.KV_LESSONS.length,15,'approved Chapters 3-7 runtime bundle must remain fifteen lessons');

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-math-ch2.js','data/class6-math-ch3-4-runtime.js','data/class6-math-ch8-assessments.js','data/class6-math-ch9-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.ok(entry.includes('ch(?:2|3|4|5|6|7|8|9)\\.'),'Chapter 1-9 deferred-assessment route coverage missing');
assert.ok(!entry.includes("/^\\/lesson\\/math\\./"),'generic Mathematics lessons must not trigger Class 6 assessment bundles');
const baseChunk=entry.slice(entry.indexOf('const mathBaseFiles'),entry.indexOf('const loadClass6MathPilot'));
assert.ok(baseChunk.includes('data/class6-math-ch2.js'),'existing Chapter 2 startup request must remain the Chapter 8 runtime carrier');
assert.ok(baseChunk.includes('data/class6-math-ch3-4-runtime.js'),'approved Chapter 3-7 runtime must remain in base slice');
assert.ok(!baseChunk.includes('data/class6-math-ch8.js'),'standalone Chapter 8 source module must not add a startup request');
assert.ok(!baseChunk.includes('data/class6-math-ch9.js'),'standalone Chapter 9 source module must not add a startup request');
assert.ok(!baseChunk.includes('data/class6-math-ch8-assessments.js'),'Chapter 8 assessments must remain deferred');
assert.ok(!baseChunk.includes('data/class6-math-ch9-assessments.js'),'Chapter 9 assessments must remain deferred');

const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v45/);
for(const asset of ['/data/class6-math-ch2.js','/data/class6-math-ch3-4-runtime.js','/data/class6-math-ch8-assessments.js','/data/class6-math-ch9-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));

console.log(`CLASS6_MATH_CH8_PASS topics=${map.chapter8Topics.length} lessons=${lessons.length} assessments=${assessments.length} runtimeParity=${runtimeChapter8.length} startupCeiling=${map.chapter8CompletionEvidence.startupRequestCeilingPreserved} schoolNeeds=${map.chapter8CompletionEvidence.schoolNeedsValidationPresent}`);