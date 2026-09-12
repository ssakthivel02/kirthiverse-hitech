import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'math.cbse6.ganita-prakash.ch2.geometry-primitives.v1',
  'math.cbse6.ganita-prakash.ch2.angle-compare-classify.v1',
  'math.cbse6.ganita-prakash.ch2.measure-draw-angles.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.3.0');
assert.equal(map.chapters[1].chapter,2);
assert.equal(map.chapters[1].title,'Lines and Angles');
assert.equal(map.chapters[1].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter2Topics.length,3);
assert.ok(map.chapter2Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter2CompletionEvidence.lessonCount,3);
assert.equal(map.chapter2CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter2CompletionEvidence.lazyAssessmentLoadingRequired,true);
assert.equal(map.chapter2CompletionEvidence.schoolNeedsValidationRequired,true);
assert.equal(map.chapter2CompletionEvidence.schoolNeedsValidationPresent,true);
assert.equal(map.chapter2CompletionEvidence.schoolNeedsValidationArtifact,'docs/class6-pilot/MATH_CH2_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.ok(fs.existsSync(map.chapter2CompletionEvidence.schoolNeedsValidationArtifact),'Chapter 2 school-needs artifact missing');

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-math-ch2.js','utf8'),sandbox,{filename:'class6-math-ch2.js'});
vm.runInContext(fs.readFileSync('data/class6-math-ch2-assessments.js','utf8'),sandbox,{filename:'class6-math-ch2-assessments.js'});
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
  assert.equal(lesson.chapter,2);
  assert.equal(lesson.chapterTitle,'Lines and Angles');
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
const expectedIds=Array.from({length:15},(_,i)=>`KV-CBSE6-MATH-${String(i+16).padStart(4,'0')}`);
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),expectedIds);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} assessment count`);
  for(const item of attached) for(const field of ['stableAssessmentId','assessmentType','questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`assessment missing ${field}`);
  assert.ok(attached.some(x=>x.assessmentType==='reasoning'),`${lessonId} reasoning assessment missing`);
  assert.ok(attached.some(x=>x.assessmentType==='mastery_check'),`${lessonId} mastery assessment missing`);
}
assert.ok(assessments.some(x=>/Ray AB starts at A/i.test(x.correctAnswer)),'ray direction misconception not tested');
assert.ok(assessments.some(x=>/arm length/i.test(x.questionActivity)||/arm length/i.test(x.explanation)),'angle arm-length misconception not tested');
assert.ok(assessments.some(x=>/opposite scale|correct scale|scale/i.test(x.questionActivity)&&/125°/.test(x.correctAnswer)),'protractor scale misconception not tested');
assert.ok(assessments.some(x=>/360°/.test(x.correctAnswer)&&/230°/.test(x.correctAnswer)),'reflex-angle reasoning not tested');
assert.ok(assessments.some(x=>/42°/.test(x.correctAnswer)&&/bisector/i.test(x.explanation)),'angle-bisector verification not tested');

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-math-ch2.js','data/class6-math-ch2-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.match(entry,/class6MathDeferredAssessments/);
assert.ok(entry.includes("/^\\/lesson\\/math\\.cbse6\\.ganita-prakash\\.\\(?:patterns\\\\.\\|ch\\(?:2\\|3\\)\\\\.\\)/")||entry.includes("/^\\/lesson\\/math\\.cbse6\\.ganita-prakash\\.(?:patterns\\.|ch(?:2|3)\\.)/"),'Ganita Prakash Chapter 1-3 lesson-route matcher missing');
assert.ok(!entry.includes("/^\\/lesson\\/math\\./"),'generic Mathematics lessons must not trigger Class 6 assessment bundles');
assert.match(entry,/release-closure/);
const baseChunk=entry.slice(entry.indexOf('const mathBaseFiles'),entry.indexOf('const loadClass6MathPilot'));
assert.ok(baseChunk.includes('data/class6-math-ch2.js'),'Chapter 2 lesson must load in Mathematics base slice');
assert.ok(baseChunk.includes('deferredMathAssessments'),'release-closure must be able to load Chapter 2 assessments with base readiness');
assert.ok(!baseChunk.includes("['class6-math-ch1-assessments','data/class6-math-assessments.js']"),'Chapter 1 assessments must not be an unconditional startup request');

const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v45/);
assert.match(sw,/MANUS-VISUAL-MASTER-05-PWA-45/);
for(const asset of ['/data/class6-math-ch2.js','/data/class6-math-ch2-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);

const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."),'canonical Kiki wording missing');
assert.ok(index.includes('microphone:false'),'Kiki microphone safety assertion missing');
assert.ok(index.includes('recording:false'),'Kiki recording safety assertion missing');
assert.ok(index.includes('speechRecognition:false'),'Kiki speech-recognition safety assertion missing');

console.log(`CLASS6_MATH_CH2_PASS topics=${map.chapter2Topics.length} lessons=${lessons.length} assessments=${assessments.length} schoolNeeds=${map.chapter2CompletionEvidence.schoolNeedsValidationPresent}`);
