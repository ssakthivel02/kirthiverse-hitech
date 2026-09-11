import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const validation=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CH1_SCHOOL_NEEDS_VALIDATION_V1.json','utf8'));
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));

assert.equal(validation.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');
assert.match(validation.claimBoundary,/not a live student study/i);
for(const [key,value] of Object.entries(validation.privacyBoundary)) assert.equal(value,false,`privacy boundary ${key} must remain false`);
assert.equal(validation.schoolOverlay.school,'SAN Academy Tambaram');
assert.equal(validation.schoolOverlay.schoolSpecificPacingClaimed,false);
assert.equal(validation.schoolOverlay.liveSchoolEvidenceCollected,false);
assert.ok(validation.scenarios.length>=8);
assert.equal(new Set(validation.scenarios.map(x=>x.id)).size,validation.scenarios.length);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-pilot.js','utf8'),sandbox,{filename:'class6-science-pilot.js'});
vm.runInContext(fs.readFileSync('data/class6-science-assessments.js','utf8'),sandbox,{filename:'class6-science-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
const implementedTopicIds=new Set(map.chapter1Topics.filter(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED').map(x=>x.id));

for(const scenario of validation.scenarios){
  assert.ok(implementedTopicIds.has(scenario.topicId),`${scenario.id} maps to unimplemented topic ${scenario.topicId}`);
  const lesson=lessons.find(x=>x.topicId===scenario.topicId);
  assert.ok(lesson,`${scenario.id} missing lesson for ${scenario.topicId}`);
  assert.ok(lesson.kikiTeaching?.misconceptionCheck,`${scenario.id} missing misconception check`);
  assert.ok(lesson.remediation?.strategy,`${scenario.id} missing remediation strategy`);
  assert.ok(lesson.remediation?.masteryEvidence,`${scenario.id} missing mastery evidence`);
  assert.ok(scenario.safeLearnerAction?.length>40,`${scenario.id} safe learner action too weak`);
  assert.ok(scenario.masteryCriterion?.length>40,`${scenario.id} mastery criterion too weak`);
  const linked=assessments.filter(x=>x.lessonId===lesson.id);
  assert.ok(linked.length>=5,`${scenario.id} requires at least five linked assessments`);
  for(const type of scenario.requiredAssessmentTypes){
    assert.ok(linked.some(x=>x.assessmentType===type),`${scenario.id} missing required assessment type ${type}`);
  }
}

const topicCoverage=new Map();
for(const scenario of validation.scenarios) topicCoverage.set(scenario.topicId,(topicCoverage.get(scenario.topicId)||0)+1);
for(const topic of map.chapter1Topics){
  assert.ok((topicCoverage.get(topic.id)||0)>=2,`${topic.id} needs at least two school-needs scenarios`);
}

const allText=JSON.stringify(validation).toLowerCase();
for(const forbidden of ['real child data collected','remote teacher monitoring enabled','child-facing cloud ai enabled','school-specific pacing verified']){
  assert.ok(!allText.includes(forbidden),`forbidden claim found: ${forbidden}`);
}
for(const required of ['offline','no network-dependent tutoring step','unexpected result','universal claim']){
  assert.ok(allText.includes(required),`required readiness coverage missing: ${required}`);
}

console.log(`CLASS6_SCIENCE_SCHOOL_NEEDS_PASS scenarios=${validation.scenarios.length} topics=${topicCoverage.size} realChildData=${validation.privacyBoundary.realChildData}`);
