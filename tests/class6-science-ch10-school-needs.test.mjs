import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const validation=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CH10_SCHOOL_NEEDS_VALIDATION_V1.json','utf8'));
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(validation.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');
assert.match(validation.claimBoundary,/not a live student study/i);
assert.match(validation.claimBoundary,/not .*organism-welfare certification|organism-welfare certification/i);
assert.match(validation.claimBoundary,/not .*medical assessment|medical assessment/i);
assert.equal(validation.schoolOverlay.liveSchoolEvidenceCollected,false);
assert.equal(validation.schoolOverlay.schoolSpecificPacingClaimed,false);
for(const value of Object.values(validation.privacyBoundary)) assert.equal(value,false);
assert.equal(validation.scenarios.length,8);
assert.equal(new Set(validation.scenarios.map(x=>x.id)).size,8);
assert.deepEqual(validation.scenarios.map(x=>x.id),Array.from({length:8},(_,i)=>`SN-SCI6-CH10-${String(i+1).padStart(3,'0')}`));

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch10.js','utf8'),sandbox,{filename:'class6-science-ch10.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch10-assessments.js','utf8'),sandbox,{filename:'class6-science-ch10-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
assert.equal(lessons.length,3);
assert.equal(assessments.length,15);
const topicIds=new Set(map.chapter10Topics.map(x=>x.id));
assert.equal(topicIds.size,3);
const lessonByTopic=new Map(lessons.map(x=>[x.topicId,x]));
for(const scenario of validation.scenarios){
  assert.ok(topicIds.has(scenario.topicId),`${scenario.id} maps to unknown Chapter 10 topic`);
  const lesson=lessonByTopic.get(scenario.topicId);
  assert.ok(lesson,`${scenario.id} has no implemented lesson`);
  assert.ok(scenario.need.length>70,`${scenario.id} need is under-specified`);
  assert.ok(scenario.safeLearnerAction.length>90,`${scenario.id} safe action is under-specified`);
  assert.ok(scenario.masteryCriterion.length>70,`${scenario.id} mastery criterion is under-specified`);
  assert.ok(Array.isArray(scenario.requiredAssessmentTypes)&&scenario.requiredAssessmentTypes.length>=2);
  const attached=assessments.filter(x=>x.lessonId===lesson.id);
  assert.equal(attached.length,5,`${scenario.id} expected five linked assessments`);
  const available=new Set(attached.map(x=>x.assessmentType));
  for(const required of scenario.requiredAssessmentTypes) assert.ok(available.has(required),`${scenario.id} missing linked assessment type ${required}`);
  assert.ok(lesson.kikiTeaching?.misconceptionCheck,`${scenario.id} missing Kiki misconception coverage`);
  assert.ok(lesson.remediation?.strategy,`${scenario.id} missing remediation path`);
}
const scenarioText=JSON.stringify(validation.scenarios).toLowerCase();
for(const concept of ['movement alone','reproduction','moisture','fair comparison','mould','life-cycle','wild eggs','offline']) assert.ok(scenarioText.includes(concept),`missing school-needs concept: ${concept}`);
for(const boundary of ['non-destructive','reject collection','no physical experiment','without sensors','without handling organisms']) assert.ok(scenarioText.includes(boundary),`missing safe evidence boundary: ${boundary}`);
assert.ok(scenarioText.includes('organism-welfare')||scenarioText.includes('welfare/conservation'));
assert.ok(!scenarioText.includes('upload your photo'));
assert.ok(!scenarioText.includes('share your location'));
assert.ok(!scenarioText.includes('taste the experimental seeds'));
assert.ok(!scenarioText.includes('collect wild eggs and'));
assert.ok(!scenarioText.includes('handle the unknown animal'));

const workflow=fs.readFileSync('.github/workflows/class6-science-pilot-qa.yml','utf8');
assert.ok(workflow.includes('SCIENCE_CH10_SCHOOL_NEEDS_VALIDATION_V1.json'));
assert.ok(workflow.includes('tests/class6-science-ch10-school-needs.test.mjs'));
assert.match(workflow,/Validate Chapter 10 synthetic school-learning needs/i);
console.log(`CLASS6_SCIENCE_CH10_SCHOOL_NEEDS_PASS scenarios=${validation.scenarios.length} topics=${topicIds.size} privacySafe=true organismWelfare=true`);
