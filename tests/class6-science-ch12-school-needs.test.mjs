import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const validation=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CH12_SCHOOL_NEEDS_VALIDATION_V1.json','utf8'));
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(validation.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');
assert.match(validation.claimBoundary,/not a live student study/i);
assert.match(validation.claimBoundary,/astronomy-observation safety certification/i);
assert.match(validation.claimBoundary,/solar-viewing certification/i);
assert.match(validation.claimBoundary,/extraterrestrial-life finding/i);
assert.match(validation.claimBoundary,/model-scale certification/i);
assert.equal(validation.schoolOverlay.liveSchoolEvidenceCollected,false);
assert.equal(validation.schoolOverlay.schoolSpecificPacingClaimed,false);
for(const value of Object.values(validation.privacyBoundary)) assert.equal(value,false);
assert.equal(validation.scenarios.length,8);
assert.equal(new Set(validation.scenarios.map(x=>x.id)).size,8);
assert.deepEqual(validation.scenarios.map(x=>x.id),Array.from({length:8},(_,i)=>`SN-SCI6-CH12-${String(i+1).padStart(3,'0')}`));

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch12.js','utf8'),sandbox,{filename:'class6-science-ch12.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch12-assessments.js','utf8'),sandbox,{filename:'class6-science-ch12-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
assert.equal(lessons.length,3);
assert.equal(assessments.length,15);
const topicIds=new Set(map.chapter12Topics.map(x=>x.id));
assert.equal(topicIds.size,3);
const lessonByTopic=new Map(lessons.map(x=>[x.topicId,x]));
const coveredTopics=new Set();
for(const scenario of validation.scenarios){
  assert.ok(topicIds.has(scenario.topicId),`${scenario.id} maps to unknown Chapter 12 topic`);
  coveredTopics.add(scenario.topicId);
  const lesson=lessonByTopic.get(scenario.topicId);
  assert.ok(lesson,`${scenario.id} has no implemented lesson`);
  assert.ok(scenario.need.length>90,`${scenario.id} need is under-specified`);
  assert.ok(scenario.safeLearnerAction.length>110,`${scenario.id} safe action is under-specified`);
  assert.ok(scenario.masteryCriterion.length>90,`${scenario.id} mastery criterion is under-specified`);
  assert.ok(Array.isArray(scenario.requiredAssessmentTypes)&&scenario.requiredAssessmentTypes.length>=2);
  const attached=assessments.filter(x=>x.lessonId===lesson.id);
  assert.equal(attached.length,5,`${scenario.id} expected five linked assessments`);
  const available=new Set(attached.map(x=>x.assessmentType));
  for(const required of scenario.requiredAssessmentTypes) assert.ok(available.has(required),`${scenario.id} missing linked assessment type ${required}`);
  assert.ok(lesson.kikiTeaching?.misconceptionCheck,`${scenario.id} missing Kiki misconception coverage`);
  assert.ok(lesson.remediation?.strategy,`${scenario.id} missing remediation path`);
  assert.ok(lesson.remediation?.masteryEvidence,`${scenario.id} missing observable lesson mastery evidence`);
}
assert.deepEqual([...coveredTopics].sort(),[...topicIds].sort(),'all three Chapter 12 topics must be covered');

const scenarioText=JSON.stringify(validation.scenarios).toLowerCase();
for(const concept of ['bright point','constellation','different distances','apparent brightness','reflected sunlight','scale model','direct sun','laser','milky way','universe','unidentified','alien spacecraft','offline']) assert.ok(scenarioText.includes(concept),`missing school-needs concept: ${concept}`);
for(const boundary of ['do not use a camera','adult-supervised safe ground-level','without photographing the real sky','rather than direct solar observation','never look directly at the sun','never point lasers','no location, camera, microphone','instead of rooftop, roadside, isolated or unsupervised night observing']) assert.ok(scenarioText.includes(boundary),`missing safe evidence boundary: ${boundary}`);
assert.ok(!scenarioText.includes('upload your photo'));
assert.ok(!scenarioText.includes('share your precise location'));
assert.ok(!scenarioText.includes('record your voice'));
assert.ok(!scenarioText.includes('look through binoculars at the sun'));
assert.ok(!scenarioText.includes('climb onto the roof'));
assert.ok(!scenarioText.includes('stand beside the road'));
assert.ok(!scenarioText.includes('the light proves aliens'));

const unsafeDirectives=[
  /(?:should|must|try to) look directly at the sun/,
  /(?:should|must|try to) use (?:ordinary )?(?:binoculars|a telescope|telescope) (?:to|for) (?:look|view).*sun/,
  /(?:should|must|try to) point (?:a|the) laser (?:into|at|toward) (?:the sky|aircraft)/,
  /(?:should|must|try to) climb (?:onto|on) (?:a|the) roof/,
  /(?:should|must|try to) travel alone at night/,
  /(?:should|must) conclude .*alien spacecraft/,
];
for(const pattern of unsafeDirectives) assert.ok(!pattern.test(scenarioText),`unsafe positive directive detected: ${pattern}`);

const workflow=fs.readFileSync('.github/workflows/class6-science-pilot-qa.yml','utf8');
assert.ok(workflow.includes('SCIENCE_CH12_SCHOOL_NEEDS_VALIDATION_V1.json'));
assert.ok(workflow.includes('tests/class6-science-ch12-school-needs.test.mjs'));
assert.match(workflow,/Validate Chapter 12 synthetic school-learning needs/i);
console.log(`CLASS6_SCIENCE_CH12_SCHOOL_NEEDS_PASS scenarios=${validation.scenarios.length} topics=${topicIds.size} privacySafe=true astronomySafety=true evidenceProportional=true`);
