import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const validation=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CH3_SCHOOL_NEEDS_VALIDATION_V1.json','utf8'));
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(validation.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');
assert.match(validation.claimBoundary,/not a live student study/i);
assert.match(validation.claimBoundary,/not .*personalised nutrition plan|personalised nutrition plan/i);
for(const [key,value] of Object.entries(validation.privacyBoundary)) assert.equal(value,false,`privacy boundary ${key} must remain false`);
assert.equal(validation.schoolOverlay.school,'SAN Academy Tambaram');
assert.equal(validation.schoolOverlay.schoolSpecificPacingClaimed,false);
assert.equal(validation.schoolOverlay.liveSchoolEvidenceCollected,false);
assert.equal(validation.scenarios.length,8);
assert.equal(new Set(validation.scenarios.map(x=>x.id)).size,8);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch3.js','utf8'),sandbox,{filename:'class6-science-ch3.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch3-assessments.js','utf8'),sandbox,{filename:'class6-science-ch3-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
const implementedTopicIds=new Set(map.chapter3Topics.filter(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED').map(x=>x.id));

for(const scenario of validation.scenarios){
  assert.ok(implementedTopicIds.has(scenario.topicId),`${scenario.id} maps to unimplemented topic ${scenario.topicId}`);
  const lesson=lessons.find(x=>x.topicId===scenario.topicId);
  assert.ok(lesson,`${scenario.id} missing lesson for ${scenario.topicId}`);
  assert.ok(lesson.kikiTeaching?.misconceptionCheck,`${scenario.id} missing misconception check`);
  assert.ok(lesson.remediation?.strategy,`${scenario.id} missing remediation strategy`);
  assert.ok(lesson.remediation?.masteryEvidence,`${scenario.id} missing mastery evidence`);
  assert.ok(scenario.safeLearnerAction?.length>60,`${scenario.id} safe learner action too weak`);
  assert.ok(scenario.masteryCriterion?.length>60,`${scenario.id} mastery criterion too weak`);
  const linked=assessments.filter(x=>x.lessonId===lesson.id);
  assert.equal(linked.length,5,`${scenario.id} requires five linked assessments`);
  for(const type of scenario.requiredAssessmentTypes) assert.ok(linked.some(x=>x.assessmentType===type),`${scenario.id} missing assessment type ${type}`);
}

const coverage=new Map();
for(const scenario of validation.scenarios) coverage.set(scenario.topicId,(coverage.get(scenario.topicId)||0)+1);
for(const topic of map.chapter3Topics) assert.ok((coverage.get(topic.id)||0)>=2,`${topic.id} needs at least two school-needs scenarios`);

const allText=JSON.stringify(validation).toLowerCase();
for(const required of ['calorie','weight','bmi','fasting','allergy','supplement','trusted adult','qualified healthcare','offline']) assert.ok(allText.includes(required),`missing boundary ${required}`);
for(const forbidden of ['real child data collected','remote teacher monitoring enabled','child-facing cloud ai enabled','school-specific pacing verified','collect the learner\'s weight','record the learner\'s bmi','upload a meal photo']) assert.ok(!allText.includes(forbidden),`forbidden readiness claim found: ${forbidden}`);
assert.match(allText,/no personal medical disclosure|disclose no personal health information/);
assert.match(allText,/no .*body tracking|body tracking/);
assert.match(allText,/network-dependent tutoring step/);
assert.match(allText,/do not consume or self-test/);

console.log(`CLASS6_SCIENCE_CH3_SCHOOL_NEEDS_PASS scenarios=${validation.scenarios.length} topics=${coverage.size} medicalHistoryCollection=${validation.privacyBoundary.medicalHistoryCollection}`);
