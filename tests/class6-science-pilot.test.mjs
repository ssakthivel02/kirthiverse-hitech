import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'science.cbse6.curiosity.ch1.observation-questions.v1',
  'science.cbse6.curiosity.ch1.fair-investigations.v1',
  'science.cbse6.curiosity.ch1.evidence-conclusions.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(map.board,'CBSE');
assert.equal(map.classLevel,6);
assert.equal(map.book.title,'Curiosity');
assert.equal(map.chapters.length,12);
assert.deepEqual(map.chapters.map(x=>x.chapter),Array.from({length:12},(_,i)=>i+1));
assert.equal(new Set(map.chapters.map(x=>x.id)).size,12);
assert.equal(map.chapters[0].title,'The Wonderful World of Science');
assert.equal(map.chapters[0].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter1Topics.length,3);
assert.ok(map.chapter1Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.equal(map.chapter1CompletionEvidence.lessonCount,3);
assert.equal(map.chapter1CompletionEvidence.assessmentCount,15);
assert.match(map.completionRule,/all twelve/i);
assert.notEqual(map.schoolOverlay.mappingStatus,'VERIFIED');
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-pilot.js','utf8'),sandbox,{filename:'class6-science-pilot.js'});
vm.runInContext(fs.readFileSync('data/class6-science-assessments.js','utf8'),sandbox,{filename:'class6-science-assessments.js'});
const lessons=sandbox.window.KV_LESSONS,assessments=sandbox.window.KV_ASSESSMENTS;
assert.equal(lessons.length,3);assert.deepEqual([...lessons.map(x=>x.id)].sort(),[...lessonIds].sort());assert.equal(new Set(lessons.map(x=>x.topicId)).size,3);
for(const lesson of lessons){assert.equal(lesson.subject,'Science');assert.equal(lesson.board,'CBSE');assert.equal(lesson.classLevel,6);assert.equal(lesson.book,'Curiosity');assert.equal(lesson.chapter,1);assert.ok(lesson.learningObjective.length>50);assert.ok(lesson.content.length>500);assert.ok(lesson.workedExample.length>180);assert.ok(Array.isArray(lesson.sourceRefs)&&lesson.sourceRefs.length>=2);assert.match(lesson.rightsStatus,/ORIGINAL/);for(const field of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])assert.ok(lesson.kikiTeaching?.[field]);for(const field of ['trigger','strategy','masteryEvidence'])assert.ok(lesson.remediation?.[field]);}
assert.equal(assessments.length,15);assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
for(const lessonId of lessonIds){const attached=assessments.filter(x=>x.lessonId===lessonId);assert.equal(attached.length,5);assert.ok(attached.some(x=>x.assessmentType==='reasoning'));assert.ok(attached.some(x=>x.assessmentType==='mastery_check'));}
const allAssessmentText=JSON.stringify(assessments).toLowerCase();assert.match(allAssessmentText,/evidence/);assert.match(allAssessmentText,/prediction/);assert.match(allAssessmentText,/without collecting personal data|teacher-provided anonymous/);
const entry=fs.readFileSync('p0-entry-v1.js','utf8');for(const asset of ['data/class6-science-pilot.js','data/class6-science-assessments.js'])assert.ok(entry.includes(asset));assert.match(entry,/class6SciencePilot/);assert.match(entry,/load-error/);assert.match(entry,/CBSE6-SCI-CH6-1/);
const sw=fs.readFileSync('sw-v30.js','utf8');assert.match(sw,/kirthiverse-preview-v39/);for(const asset of ['/data/class6-science-pilot.js','/data/class6-science-assessments.js'])assert.ok(sw.includes(asset));
const index=fs.readFileSync('index.html','utf8');assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));assert.ok(index.includes('microphone:false'));assert.ok(index.includes('recording:false'));assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_SCIENCE_CH1_PASS chapters=${map.chapters.length} topics=${map.chapter1Topics.length} lessons=${lessons.length} assessments=${assessments.length}`);
