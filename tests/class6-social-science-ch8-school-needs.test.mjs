import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const validation=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CH8_SCHOOL_NEEDS_VALIDATION_V1.json','utf8'));
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json','utf8'));
assert.equal(validation.schemaVersion,'1.0.0');
assert.equal(validation.validationId,'KVS-CBSE6-SOC-CH8-SCHOOL-NEEDS-V1');
assert.equal(validation.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');
assert.match(validation.scope,/Chapter 8 · Unity in Diversity/);
assert.match(validation.claimBoundary,/not a live student study/i);
assert.match(validation.claimBoundary,/not .*religious instruction/i);
assert.match(validation.claimBoundary,/not .*patriotic loyalty test/i);
for(const [key,value] of Object.entries(validation.privacyBoundary)) assert.equal(value,false,`privacy boundary ${key} must remain false`);
assert.equal(validation.schoolOverlay.school,'SAN Academy Tambaram');
assert.equal(validation.schoolOverlay.schoolSpecificPacingClaimed,false);
assert.equal(validation.schoolOverlay.schoolTextbookEditionDirectlyVerified,false);
assert.equal(validation.schoolOverlay.liveSchoolEvidenceCollected,false);
assert.equal(validation.scenarios.length,8);
assert.equal(new Set(validation.scenarios.map(x=>x.id)).size,8);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-social-science-ch8.js','utf8'),sandbox,{filename:'class6-social-science-ch8.js'});
vm.runInContext(fs.readFileSync('data/class6-social-science-ch8-assessments.js','utf8'),sandbox,{filename:'class6-social-science-ch8-assessments.js'});
const lessons=sandbox.window.KV_LESSONS.filter(x=>x.chapter===8);
const assessments=sandbox.window.KV_ASSESSMENTS.filter(x=>lessons.some(l=>l.id===x.lessonId));
const chapter=map.chapters.find(x=>x.chapter===8);
assert.ok(chapter);
assert.equal(chapter.status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(lessons.length,4);
assert.equal(assessments.length,20);

const validTopicIds=new Set(lessons.map(x=>x.topicId));
for(const scenario of validation.scenarios){
  assert.ok(validTopicIds.has(scenario.topicId),`${scenario.id} maps to unknown topic ${scenario.topicId}`);
  const lesson=lessons.find(x=>x.topicId===scenario.topicId);
  assert.ok(lesson?.kikiTeaching?.misconceptionCheck,`${scenario.id} missing misconception check`);
  assert.ok(lesson?.remediation?.strategy,`${scenario.id} missing remediation strategy`);
  assert.ok(lesson?.remediation?.masteryEvidence,`${scenario.id} missing mastery evidence`);
  assert.ok(scenario.safeLearnerAction?.length>80,`${scenario.id} safe learner action too weak`);
  assert.ok(scenario.masteryCriterion?.length>80,`${scenario.id} mastery criterion too weak`);
  const linked=assessments.filter(x=>x.lessonId===lesson.id);
  assert.equal(linked.length,5,`${scenario.id} requires exactly five linked assessments`);
  for(const type of scenario.requiredAssessmentTypes) assert.ok(linked.some(x=>x.assessmentType===type),`${scenario.id} missing required assessment type ${type}`);
}

const topicCoverage=new Map();
for(const scenario of validation.scenarios) topicCoverage.set(scenario.topicId,(topicCoverage.get(scenario.topicId)||0)+1);
for(const topicId of validTopicIds) assert.equal(topicCoverage.get(topicId),2,`${topicId} needs exactly two school-needs scenarios`);

const allText=JSON.stringify(validation).toLowerCase();
for(const required of ['diversity','uniformity','food','textile','festival','story','adaptation','authenticity','belief neutrality','offline','devotional','political']) assert.ok(allText.includes(required),`missing Chapter 8 school-needs boundary: ${required}`);
for(const forbidden of [
  'real child data collected',
  'remote teacher monitoring enabled',
  'child-facing cloud ai enabled',
  'school-specific pacing verified',
  'religiondisclosurerequired":true',
  'castedisclosurerequired":true',
  'tribedisclosurerequired":true',
  'homelanguagedisclosurerequired":true',
  'familyfestivaldisclosurerequired":true',
  'homedietdisclosurerequired":true',
  'familydressdisclosurerequired":true',
  'politicalopiniondisclosurerequired":true',
  'worship required',
  'conversion required',
  'superior community',
  'inferior culture'
]) assert.ok(!allText.replace(/\s/g,'').includes(forbidden.replace(/\s/g,'')),`forbidden claim found: ${forbidden}`);

for(const scenario of validation.scenarios){
  const text=JSON.stringify(scenario).toLowerCase();
  assert.ok(!/ask .*learner.*(?:religion|caste|tribe|community|belief|home language|ancestry|migration|family festival|home diet|family dress|political opinion)/.test(text),`${scenario.id} requests sensitive identity disclosure`);
  assert.ok(!/(?:pray|chant|worship|convert|meditate) (?:to|with|as|required)/.test(text),`${scenario.id} contains devotional/persuasive learner direction`);
}

console.log(`CLASS6_SOCIAL_SCIENCE_CH8_SCHOOL_NEEDS_PASS scenarios=${validation.scenarios.length} topics=${topicCoverage.size} realChildData=${validation.privacyBoundary.realChildData}`);
