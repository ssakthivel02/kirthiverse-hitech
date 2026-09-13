import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'math.cbse6.ganita-prakash.ch9.line-reflection-symmetry.v1',
  'math.cbse6.ganita-prakash.ch9.generate-symmetric-figures.v1',
  'math.cbse6.ganita-prakash.ch9.rotational-symmetry.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.10.0');
assert.equal(map.chapters[8].chapter,9);
assert.equal(map.chapters[8].title,'Symmetry');
assert.equal(map.chapters[8].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter9Topics.length,3);
assert.ok(map.chapter9Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter9CompletionEvidence.lessonCount,3);
assert.equal(map.chapter9CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter9CompletionEvidence.lazyAssessmentLoadingRequired,true);
assert.equal(map.chapter9CompletionEvidence.startupRequestCeilingPreserved,true);
assert.equal(map.chapter9CompletionEvidence.schoolNeedsValidationRequired,true);
assert.equal(map.chapter9CompletionEvidence.schoolNeedsValidationPresent,true);
assert.equal(map.chapter9CompletionEvidence.schoolNeedsValidationArtifact,'docs/class6-pilot/MATH_CH9_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.ok(fs.existsSync(map.chapter9CompletionEvidence.schoolNeedsValidationArtifact));
assert.equal(map.chapter9CompletionEvidence.runtimeCarrier,'data/class6-math-pilot.js');
assert.equal(map.chapter9CompletionEvidence.sourceOfTruth,'data/class6-math-ch9.js');

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-math-ch9.js','utf8'),sandbox,{filename:'class6-math-ch9.js'});
vm.runInContext(fs.readFileSync('data/class6-math-ch9-assessments.js','utf8'),sandbox,{filename:'class6-math-ch9-assessments.js'});
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
  assert.equal(lesson.chapter,9);
  assert.equal(lesson.chapterTitle,'Symmetry');
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
const expectedIds=Array.from({length:15},(_,i)=>`KV-CBSE6-MATH-${String(i+121).padStart(4,'0')}`);
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),expectedIds);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} assessment count`);
  for(const type of ['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']) assert.ok(attached.some(x=>x.assessmentType===type),`${lessonId} missing ${type}`);
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter9Topics}).toLowerCase();
for(const required of ['line of symmetry','reflection','perpendicular distance','rotational symmetry','order','smallest positive angle','circle','diameter']) assert.ok(allText.includes(required),`missing Chapter 9 concept: ${required}`);
assert.ok(allText.includes('360')&&allText.includes('less than 360'),'non-trivial rotation boundary missing');
assert.ok(allText.includes('mirror line')||allText.includes('mirror symmetry'),'reflection terminology missing');

const carrierSandbox={window:{KV_LESSONS:[]}};
vm.createContext(carrierSandbox);
vm.runInContext(fs.readFileSync('data/class6-math-pilot.js','utf8'),carrierSandbox,{filename:'class6-math-pilot.js'});
const carrierLessons=carrierSandbox.window.KV_LESSONS;
const carrierChapter1=carrierLessons.filter(x=>x.chapter===1);
const runtimeChapter9=carrierLessons.filter(x=>x.chapter===9);
assert.equal(carrierChapter1.length,3,'historical Chapter 1 startup carrier must retain exactly three Chapter 1 lessons');
assert.equal(runtimeChapter9.length,3,'historical Chapter 1 startup carrier must append exactly three Chapter 9 runtime lessons');
assert.equal(new Set(carrierLessons.map(x=>x.id)).size,6,'startup carrier lesson IDs must remain unique');
assert.deepEqual([...runtimeChapter9.map(x=>x.id)].sort(),[...lessonIds].sort(),'startup carrier missing Chapter 9 lesson');
const sourceById=new Map(lessons.map(x=>[x.id,x]));
for(const runtimeLesson of runtimeChapter9){
  assert.deepEqual(JSON.parse(JSON.stringify(runtimeLesson)),JSON.parse(JSON.stringify(sourceById.get(runtimeLesson.id))),`Chapter 9 runtime drift detected for ${runtimeLesson.id}`);
}

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-math-pilot.js','data/class6-math-ch9-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.ok(entry.includes('ch(?:2|3|4|5|6|7|8|9)\\.'),'Chapter 1-9 deferred-assessment route coverage missing');
assert.ok(!entry.includes("/^\\/lesson\\/math\\./"),'generic Mathematics lessons must not trigger Class 6 assessment bundles');
const baseChunk=entry.slice(entry.indexOf('const mathBaseFiles'),entry.indexOf('const loadClass6MathPilot'));
assert.ok(baseChunk.includes('data/class6-math-pilot.js'),'existing Chapter 1 startup request must remain the Chapter 9 runtime carrier');
assert.ok(!baseChunk.includes('data/class6-math-ch9.js'),'standalone Chapter 9 source module must not add a startup request');
assert.ok(!baseChunk.includes('data/class6-math-ch9-assessments.js'),'Chapter 9 assessments must remain deferred');

const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v45/);
for(const asset of ['/data/class6-math-pilot.js','/data/class6-math-ch9-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));

console.log(`CLASS6_MATH_CH9_PASS topics=${map.chapter9Topics.length} lessons=${lessons.length} assessments=${assessments.length} runtimeParity=${runtimeChapter9.length} startupCeiling=${map.chapter9CompletionEvidence.startupRequestCeilingPreserved}`);