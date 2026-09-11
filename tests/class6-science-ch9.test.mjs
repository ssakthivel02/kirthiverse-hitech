import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'science.cbse6.curiosity.ch9.separation-properties.v1',
  'science.cbse6.curiosity.ch9.mechanical-separation.v1',
  'science.cbse6.curiosity.ch9.evaporative-multistep-separation.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.8.0');
assert.equal(map.chapters.length,12);
assert.equal(map.chapters[8].title,'Methods of Separation in Everyday Life');
assert.equal(map.chapters[8].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter9Topics.length,3);
assert.ok(map.chapter9Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.ok(map.chapter9Topics.every(x=>Array.isArray(x.competencies)&&x.competencies.length>=3));
assert.ok(map.chapter9Topics.every(x=>Array.isArray(x.misconceptions)&&x.misconceptions.length>=3));
assert.ok(map.chapter9Topics.every(x=>Array.isArray(x.safetyBoundary)&&x.safetyBoundary.length>=3));
assert.equal(map.chapter9CompletionEvidence.lessonCount,3);
assert.equal(map.chapter9CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter9CompletionEvidence.separationSafetyRequired,true);
assert.equal(map.chapter9CompletionEvidence.purityPotabilityBoundaryRequired,true);
assert.equal(map.chapter9CompletionEvidence.status,'CHAPTER9_KIKI_TEACHING_SLICE_COMPLETE');
assert.match(map.chapter9CompletionRule,/purity\/potability/i);
assert.match(map.chapter9CompletionRule,/no-hazardous-heating/i);
assert.match(map.completionRule,/all twelve/i);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch9.js','utf8'),sandbox,{filename:'class6-science-ch9.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch9-assessments.js','utf8'),sandbox,{filename:'class6-science-ch9-assessments.js'});
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
  assert.equal(lesson.chapter,9);
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
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:15},(_,i)=>`KV-CBSE6-SCI-${String(i+121).padStart(4,'0')}`));
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} needs exactly five assessments`);
  assert.ok(attached.some(x=>x.assessmentType==='reasoning'));
  assert.ok(attached.some(x=>x.assessmentType==='mastery_check'));
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter9Topics}).toLowerCase();
for(const required of ['handpicking','sieving','winnowing','settling','decantation','filtration','evaporation','dissolved','insoluble','potability']) assert.ok(allText.includes(required),`missing Chapter 9 concept: ${required}`);
for(const required of ['no tasting','no improvised powered','no drinking','no flame']) assert.ok(allText.includes(required),`missing Chapter 9 safety boundary: ${required}`);
for(const hazard of ['kettle','hot plate']) assert.ok(allText.includes(hazard),`missing Chapter 9 named heat hazard: ${hazard}`);
assert.ok(allText.includes('never use open flames')||allText.includes('no hazardous heating')||allText.includes('reject flame/kettle'),'missing Chapter 9 explicit heating prohibition');
assert.ok(allText.includes('not automatically pure')||allText.includes('not automatically chemically pure'));
assert.ok(allText.includes('not automatically safe to drink')||allText.includes('not potability'));
for(const unsafeDirective of ['taste the unknown mixture','inhale the powder','drink the filtered water','heat a sealed container','use a fan to blow dust','boil the solution yourself']) assert.ok(!allText.includes(unsafeDirective),`unsafe separation directive detected: ${unsafeDirective}`);

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-science-ch9.js','data/class6-science-ch9-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.match(entry,/datasetKey:'class6SciencePilot'/);
assert.match(entry,/CBSE6-SCI-CH9-1/);
assert.match(entry,/ch\(\?:2\|3\|4\|5\|6\|7\|8\|9\)/);
const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/CACHE='kirthiverse-preview-v42'/);
assert.match(sw,/VERSION='MANUS-VISUAL-MASTER-05-PWA-42'/);
for(const asset of ['/data/class6-science-ch9.js','/data/class6-science-ch9-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_SCIENCE_CH9_PASS topics=${map.chapter9Topics.length} lessons=${lessons.length} assessments=${assessments.length} separationSafety=${map.chapter9CompletionEvidence.separationSafetyRequired}`);
