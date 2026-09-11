import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'science.cbse6.curiosity.ch8.states-properties.v1',
  'science.cbse6.curiosity.ch8.state-changes.v1',
  'science.cbse6.curiosity.ch8.evaporation-condensation-cycle.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.9.0');
assert.equal(map.chapters.length,12);
assert.equal(map.chapters[7].title,'A Journey through States of Water');
assert.equal(map.chapters[7].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter8Topics.length,3);
assert.ok(map.chapter8Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.ok(map.chapter8Topics.every(x=>Array.isArray(x.competencies)&&x.competencies.length>=3));
assert.ok(map.chapter8Topics.every(x=>Array.isArray(x.misconceptions)&&x.misconceptions.length>=3));
assert.ok(map.chapter8Topics.every(x=>Array.isArray(x.safetyBoundary)&&x.safetyBoundary.length>=3));
assert.equal(map.chapter8CompletionEvidence.lessonCount,3);
assert.equal(map.chapter8CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter8CompletionEvidence.waterStateSafetyRequired,true);
assert.equal(map.chapter8CompletionEvidence.modelLimitBoundaryRequired,true);
assert.equal(map.chapter8CompletionEvidence.status,'CHAPTER8_KIKI_TEACHING_SLICE_COMPLETE');
assert.match(map.chapter8CompletionRule,/vapour-versus-droplet/i);
assert.match(map.chapter8CompletionRule,/no-boiling/i);
assert.match(map.chapter8CompletionRule,/model-limit/i);
assert.match(map.completionRule,/all twelve/i);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch8.js','utf8'),sandbox,{filename:'class6-science-ch8.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch8-assessments.js','utf8'),sandbox,{filename:'class6-science-ch8-assessments.js'});
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
  assert.equal(lesson.chapter,8);
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
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:15},(_,i)=>`KV-CBSE6-SCI-${String(i+106).padStart(4,'0')}`));
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} needs exactly five assessments`);
  assert.ok(attached.some(x=>x.assessmentType==='reasoning'));
  assert.ok(attached.some(x=>x.assessmentType==='mastery_check'));
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter8Topics}).toLowerCase();
for(const required of ['water vapour','visible mist','solid','liquid','melting','freezing','evaporation','condensation','sealed cold','fair comparison']) assert.ok(allText.includes(required),`missing Chapter 8 concept: ${required}`);
for(const required of ['no boiling','no learner boiling-water','no kettle','no heat source','no drinking test water']) assert.ok(allText.includes(required),`missing Chapter 8 safety boundary: ${required}`);
assert.ok(allText.includes('normally invisible')||allText.includes('invisible water vapour'));
assert.ok(allText.includes('not a complete weather forecast')||allText.includes('not a complete explanation or forecast'));
for(const unsafeDirective of ['boil the water yourself','put your hand in steam','drink the test water','heat a sealed container','climb onto the roof to collect rain']) assert.ok(!allText.includes(unsafeDirective),`unsafe water-state directive detected: ${unsafeDirective}`);

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-science-ch8.js','data/class6-science-ch8-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.match(entry,/datasetKey:'class6SciencePilot'/);
assert.match(entry,/CBSE6-SCI-CH10-1/);
assert.match(entry,/ch\(\?:2\|3\|4\|5\|6\|7\|8\|9\|10\)/);
const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/CACHE='kirthiverse-preview-v43'/);
assert.match(sw,/VERSION='MANUS-VISUAL-MASTER-05-PWA-43'/);
for(const asset of ['/data/class6-science-ch8.js','/data/class6-science-ch8-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_SCIENCE_CH8_PASS topics=${map.chapter8Topics.length} lessons=${lessons.length} assessments=${assessments.length} waterStateSafety=${map.chapter8CompletionEvidence.waterStateSafetyRequired}`);
