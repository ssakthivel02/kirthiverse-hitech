import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'math.cbse6.ganita-prakash.ch6.perimeter-boundaries.v1',
  'math.cbse6.ganita-prakash.ch6.area-grid-rectangles.v1',
  'math.cbse6.ganita-prakash.ch6.triangles-composite-area.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.9.0');
assert.equal(map.chapters[5].chapter,6);
assert.equal(map.chapters[5].title,'Perimeter and Area');
assert.equal(map.chapters[5].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter6Topics.length,3);
assert.ok(map.chapter6Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter6CompletionEvidence.lessonCount,3);
assert.equal(map.chapter6CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter6CompletionEvidence.lazyAssessmentLoadingRequired,true);
assert.equal(map.chapter6CompletionEvidence.startupRequestCeilingPreserved,true);
assert.equal(map.chapter6CompletionEvidence.schoolNeedsValidationRequired,true);
assert.equal(map.chapter6CompletionEvidence.schoolNeedsValidationPresent,true);
assert.equal(map.chapter6CompletionEvidence.schoolNeedsValidationArtifact,'docs/class6-pilot/MATH_CH6_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.ok(fs.existsSync(map.chapter6CompletionEvidence.schoolNeedsValidationArtifact),'Chapter 6 school-needs artifact missing');

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-math-ch6.js','utf8'),sandbox,{filename:'class6-math-ch6.js'});
vm.runInContext(fs.readFileSync('data/class6-math-ch6-assessments.js','utf8'),sandbox,{filename:'class6-math-ch6-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
assert.equal(lessons.length,3);
assert.deepEqual([...lessons.map(x=>x.id)].sort(),[...lessonIds].sort());
assert.equal(new Set(lessons.map(x=>x.topicId)).size,3);
for(const lesson of lessons){
  assert.equal(lesson.subject,'Mathematics');assert.equal(lesson.board,'CBSE');assert.equal(lesson.classLevel,6);assert.equal(lesson.book,'Ganita Prakash');assert.equal(lesson.chapter,6);assert.equal(lesson.chapterTitle,'Perimeter and Area');assert.equal(lesson.ageBand,'11-13');
  assert.ok(lesson.learningObjective.length>40);assert.ok(lesson.content.length>300);assert.ok(lesson.workedExample.length>100);assert.ok(Array.isArray(lesson.sourceRefs)&&lesson.sourceRefs.length>=2);assert.match(lesson.rightsStatus,/ORIGINAL/);assert.notEqual(lesson.schoolMappingStatus,'VERIFIED');
  for(const field of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])assert.ok(lesson.kikiTeaching?.[field]);
  for(const field of ['trigger','strategy','masteryEvidence'])assert.ok(lesson.remediation?.[field]);
}
assert.equal(assessments.length,15);
const expectedIds=Array.from({length:15},(_,i)=>`KV-CBSE6-MATH-${String(i+76).padStart(4,'0')}`);
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),expectedIds);assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
for(const lessonId of lessonIds){const attached=assessments.filter(x=>x.lessonId===lessonId);assert.equal(attached.length,5);for(const type of ['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check'])assert.ok(attached.some(x=>x.assessmentType===type));}
const allText=JSON.stringify({lessons,assessments,map:map.chapter6Topics}).toLowerCase();
for(const required of ['perimeter','boundary','area','square units','grid','rectangle','square','triangle','perpendicular height','composite'])assert.ok(allText.includes(required));
assert.ok(allText.includes('equal area')&&allText.includes('different perimeter'));assert.ok(allText.includes('no overlap')||allText.includes('non-overlapping'));

const runtimeSandbox={window:{KV_LESSONS:[]}};vm.createContext(runtimeSandbox);vm.runInContext(fs.readFileSync('data/class6-math-ch3-4-runtime.js','utf8'),runtimeSandbox,{filename:'class6-math-ch3-4-runtime.js'});const runtimeLessons=runtimeSandbox.window.KV_LESSONS;
assert.equal(runtimeLessons.length,15,'approved Chapters 3-7 runtime must remain fifteen lessons');assert.ok(lessonIds.every(id=>runtimeLessons.some(x=>x.id===id)));assert.equal(new Set(runtimeLessons.map(x=>x.id)).size,15);
const sourceSandbox={window:{KV_LESSONS:[]}};vm.createContext(sourceSandbox);for(const file of ['data/class6-math-ch3.js','data/class6-math-ch4.js','data/class6-math-ch5.js','data/class6-math-ch6.js','data/class6-math-ch7.js'])vm.runInContext(fs.readFileSync(file,'utf8'),sourceSandbox,{filename:file});assert.equal(sourceSandbox.window.KV_LESSONS.length,15);const sourceById=new Map(sourceSandbox.window.KV_LESSONS.map(x=>[x.id,x]));for(const runtimeLesson of runtimeLessons){assert.ok(sourceById.has(runtimeLesson.id));assert.deepEqual(JSON.parse(JSON.stringify(runtimeLesson)),JSON.parse(JSON.stringify(sourceById.get(runtimeLesson.id)),null),`runtime drift detected for ${runtimeLesson.id}`)}

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-math-ch3-4-runtime.js','data/class6-math-ch6-assessments.js','data/class6-math-ch7-assessments.js','data/class6-math-ch8-assessments.js'])assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.ok(entry.includes('ch(?:2|3|4|5|6|7|8)\\.'),'Chapter 1-8 deferred-assessment route coverage missing');assert.ok(!entry.includes("/^\\/lesson\\/math\\./"));
const baseChunk=entry.slice(entry.indexOf('const mathBaseFiles'),entry.indexOf('const loadClass6MathPilot'));
assert.ok(baseChunk.includes('data/class6-math-ch3-4-runtime.js'));assert.ok(!baseChunk.includes('data/class6-math-ch6.js'));assert.ok(!baseChunk.includes('data/class6-math-ch7.js'));assert.ok(!baseChunk.includes('data/class6-math-ch8.js'));assert.ok(!baseChunk.includes('data/class6-math-ch6-assessments.js'));assert.ok(!baseChunk.includes('data/class6-math-ch7-assessments.js'));assert.ok(!baseChunk.includes('data/class6-math-ch8-assessments.js'));
const sw=fs.readFileSync('sw-v30.js','utf8');assert.match(sw,/kirthiverse-preview-v45/);for(const asset of ['/data/class6-math-ch3-4-runtime.js','/data/class6-math-ch6-assessments.js','/data/class6-math-ch7-assessments.js','/data/class6-math-ch8-assessments.js'])assert.ok(sw.includes(asset));
const index=fs.readFileSync('index.html','utf8');assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));assert.ok(index.includes('microphone:false'));assert.ok(index.includes('recording:false'));assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_MATH_CH6_PASS topics=${map.chapter6Topics.length} lessons=${lessons.length} assessments=${assessments.length} runtimeParity=${runtimeLessons.length} schoolNeeds=${map.chapter6CompletionEvidence.schoolNeedsValidationPresent}`);