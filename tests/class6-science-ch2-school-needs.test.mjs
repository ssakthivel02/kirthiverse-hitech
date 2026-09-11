import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const validation=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CH2_SCHOOL_NEEDS_VALIDATION_V1.json','utf8'));
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(validation.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');
assert.match(validation.claimBoundary,/not a live student study/i);
for(const [key,value] of Object.entries(validation.privacyBoundary)) assert.equal(value,false,`privacy boundary ${key} must remain false`);
assert.equal(validation.schoolOverlay.schoolSpecificPacingClaimed,false);
assert.equal(validation.schoolOverlay.liveSchoolEvidenceCollected,false);
assert.ok(validation.scenarios.length>=8);
assert.equal(new Set(validation.scenarios.map(x=>x.id)).size,validation.scenarios.length);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch2.js','utf8'),sandbox,{filename:'class6-science-ch2.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch2-assessments.js','utf8'),sandbox,{filename:'class6-science-ch2-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
const implemented=new Set(map.chapter2Topics.filter(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED').map(x=>x.id));
const coverage=new Map();
for(const scenario of validation.scenarios){
  assert.ok(implemented.has(scenario.topicId),`${scenario.id} maps to unimplemented topic`);
  const lesson=lessons.find(x=>x.topicId===scenario.topicId);
  assert.ok(lesson,`${scenario.id} missing lesson`);
  assert.ok(lesson.kikiTeaching?.misconceptionCheck,`${scenario.id} missing misconception check`);
  assert.ok(lesson.remediation?.strategy,`${scenario.id} missing remediation strategy`);
  assert.ok(lesson.remediation?.masteryEvidence,`${scenario.id} missing lesson mastery evidence`);
  assert.ok(scenario.safeLearnerAction.length>50);
  assert.ok(scenario.masteryCriterion.length>50);
  const linked=assessments.filter(x=>x.lessonId===lesson.id);
  assert.equal(linked.length,5,`${scenario.id} expected five linked assessments`);
  for(const type of scenario.requiredAssessmentTypes) assert.ok(linked.some(x=>x.assessmentType===type),`${scenario.id} missing ${type}`);
  coverage.set(scenario.topicId,(coverage.get(scenario.topicId)||0)+1);
}
for(const topic of map.chapter2Topics) assert.ok((coverage.get(topic.id)||0)>=2,`${topic.id} needs at least two scenarios`);
const text=JSON.stringify(validation).toLowerCase();
for(const required of ['universal','classification','branching','precise location','photo','evolutionary']) assert.ok(text.includes(required),`coverage missing ${required}`);
console.log(`CLASS6_SCIENCE_CH2_SCHOOL_NEEDS_PASS scenarios=${validation.scenarios.length} topics=${coverage.size}`);
