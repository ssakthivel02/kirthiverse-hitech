import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'math.cbse6.ganita-prakash.ch3.number-relations-line.v1',
  'math.cbse6.ganita-prakash.ch3.digit-processes.v1',
  'math.cbse6.ganita-prakash.ch3.mental-pattern-estimation.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.6.0');
assert.equal(map.chapters[2].chapter,3);
assert.equal(map.chapters[2].title,'Number Play');
assert.equal(map.chapters[2].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter3Topics.length,3);
assert.ok(map.chapter3Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter3CompletionEvidence.lessonCount,3);
assert.equal(map.chapter3CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter3CompletionEvidence.lazyAssessmentLoadingRequired,true);
assert.equal(map.chapter3CompletionEvidence.schoolNeedsValidationRequired,true);
assert.equal(map.chapter3CompletionEvidence.schoolNeedsValidationPresent,true);
assert.equal(map.chapter3CompletionEvidence.schoolNeedsValidationArtifact,'docs/class6-pilot/MATH_CH3_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.ok(fs.existsSync(map.chapter3CompletionEvidence.schoolNeedsValidationArtifact),'Chapter 3 school-needs artifact missing');

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
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter3Topics}).toLowerCase();
for(const required of ['number line','interval','place value','digit sum','palindrome','leading zero','mental','estimate','conjecture','proof','strategy']) assert.ok(allText.includes(required),`missing Chapter 3 concept: ${required}`);

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-math-ch3-4-runtime.js','data/class6-math-ch3-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.ok(entry.includes('ch(?:2|3|4|5)\\.'),'Chapter 1-5 deferred-assessment route coverage missing');
assert.ok(!entry.includes("/^\\/lesson\\/math\\./"),'generic Mathematics lessons must not trigger Class 6 assessment bundles');
const baseChunk=entry.slice(entry.indexOf('const mathBaseFiles'),entry.indexOf('const loadClass6MathPilot'));
assert.ok(baseChunk.includes('data/class6-math-ch3-4-runtime.js'),'Chapter 3 must remain in consolidated base runtime');
assert.ok(baseChunk.includes('deferredMathAssessments'),'release-closure must load deferred Mathematics assessments');

const runtimeSandbox={window:{KV_LESSONS:[]}};vm.createContext(runtimeSandbox);vm.runInContext(fs.readFileSync('data/class6-math-ch3-4-runtime.js','utf8'),runtimeSandbox);
assert.equal(runtimeSandbox.window.KV_LESSONS.length,9,'consolidated Chapters 3-5 runtime must expose nine lessons');
assert.ok(lessonIds.every(id=>runtimeSandbox.window.KV_LESSONS.some(x=>x.id===id)),'consolidated runtime missing Chapter 3 lesson');

const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v45/);
for(const asset of ['/data/class6-math-ch3-4-runtime.js','/data/class6-math-ch3-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_MATH_CH3_PASS topics=${map.chapter3Topics.length} lessons=${lessons.length} assessments=${assessments.length} schoolNeeds=${map.chapter3CompletionEvidence.schoolNeedsValidationPresent}`);
