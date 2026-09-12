import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'math.cbse6.ganita-prakash.ch5.factors-multiples.v1',
  'math.cbse6.ganita-prakash.ch5.primes-factorisation.v1',
  'math.cbse6.ganita-prakash.ch5.divisibility.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.6.0');
assert.equal(map.chapters[4].chapter,5);
assert.equal(map.chapters[4].title,'Prime Time');
assert.equal(map.chapters[4].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter5Topics.length,3);
assert.ok(map.chapter5Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter5CompletionEvidence.lessonCount,3);
assert.equal(map.chapter5CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter5CompletionEvidence.lazyAssessmentLoadingRequired,true);
assert.equal(map.chapter5CompletionEvidence.startupRequestCeilingPreserved,true);
assert.equal(map.chapter5CompletionEvidence.schoolNeedsValidationRequired,true);
assert.equal(map.chapter5CompletionEvidence.schoolNeedsValidationPresent,false);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-math-ch5.js','utf8'),sandbox,{filename:'class6-math-ch5.js'});
vm.runInContext(fs.readFileSync('data/class6-math-ch5-assessments.js','utf8'),sandbox,{filename:'class6-math-ch5-assessments.js'});
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
  assert.equal(lesson.chapter,5);
  assert.equal(lesson.chapterTitle,'Prime Time');
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
const expectedIds=Array.from({length:15},(_,i)=>`KV-CBSE6-MATH-${String(i+61).padStart(4,'0')}`);
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),expectedIds);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} assessment count`);
  for(const type of ['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']) assert.ok(attached.some(x=>x.assessmentType===type),`${lessonId} missing ${type}`);
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter5Topics}).toLowerCase();
for(const required of ['factor','multiple','prime','composite','co-prime','prime factorisation','divisibility','last two digits','last three digits']) assert.ok(allText.includes(required),`missing Chapter 5 concept: ${required}`);
assert.ok(allText.includes('1 is neither prime nor composite'),'status of 1 must be explicit');
assert.ok(!allText.includes('hcf')&&!allText.includes('lcm'),'HCF/LCM must not be silently added to this bounded Chapter 5 slice');

const runtimeSandbox={window:{KV_LESSONS:[]}};
vm.createContext(runtimeSandbox);
vm.runInContext(fs.readFileSync('data/class6-math-ch3-4-runtime.js','utf8'),runtimeSandbox,{filename:'class6-math-ch3-4-runtime.js'});
const runtimeLessons=runtimeSandbox.window.KV_LESSONS;
assert.equal(runtimeLessons.length,9,'consolidated Chapters 3-5 runtime bundle must expose nine lessons');
assert.ok(lessonIds.every(id=>runtimeLessons.some(x=>x.id===id)),'runtime bundle missing Chapter 5 lesson');
assert.equal(new Set(runtimeLessons.map(x=>x.id)).size,9,'runtime bundle lesson IDs must remain unique');

const sourceSandbox={window:{KV_LESSONS:[]}};
vm.createContext(sourceSandbox);
for(const file of ['data/class6-math-ch3.js','data/class6-math-ch4.js','data/class6-math-ch5.js']) vm.runInContext(fs.readFileSync(file,'utf8'),sourceSandbox,{filename:file});
assert.equal(sourceSandbox.window.KV_LESSONS.length,9,'source-of-truth Chapters 3-5 must expose nine lessons');
const sourceById=new Map(sourceSandbox.window.KV_LESSONS.map(x=>[x.id,x]));
for(const runtimeLesson of runtimeLessons){
  assert.ok(sourceById.has(runtimeLesson.id),`runtime lesson ${runtimeLesson.id} missing from source-of-truth modules`);
  assert.deepEqual(JSON.parse(JSON.stringify(runtimeLesson)),JSON.parse(JSON.stringify(sourceById.get(runtimeLesson.id))),`runtime drift detected for ${runtimeLesson.id}`);
}

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-math-ch3-4-runtime.js','data/class6-math-ch5-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.ok(entry.includes('ch(?:2|3|4|5)\\.'),'Chapter 1-5 deferred-assessment route coverage missing');
assert.ok(!entry.includes("/^\\/lesson\\/math\\./"),'generic Mathematics lessons must not trigger Class 6 assessment bundles');
const baseChunk=entry.slice(entry.indexOf('const mathBaseFiles'),entry.indexOf('const loadClass6MathPilot'));
assert.ok(baseChunk.includes('data/class6-math-ch3-4-runtime.js'),'combined Chapter 3-5 runtime must load in base slice');
assert.ok(!baseChunk.includes('data/class6-math-ch5.js'),'standalone Chapter 5 source module must not add a startup request');
assert.ok(!baseChunk.includes('data/class6-math-ch5-assessments.js'),'Chapter 5 assessments must remain deferred');

const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v45/);
for(const asset of ['/data/class6-math-ch3-4-runtime.js','/data/class6-math-ch5-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));

console.log(`CLASS6_MATH_CH5_PASS topics=${map.chapter5Topics.length} lessons=${lessons.length} assessments=${assessments.length} runtimeParity=${runtimeLessons.length} startupCeiling=${map.chapter5CompletionEvidence.startupRequestCeilingPreserved}`);
