import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const audit=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_COMPLETION_AUDIT_V1.json','utf8'));
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));

assert.equal(audit.schemaVersion,'1.0.0');
assert.equal(audit.auditId,'KVS-CBSE6-SCIENCE-COMPLETION-AUDIT-V1');
assert.equal(audit.decision,'SCIENCE_COMPLETE');
assert.match(audit.decisionBoundary,/not a live-school efficacy claim/i);
assert.match(audit.accessibilityBoundary,/not a human WCAG conformance certification/i);
assert.equal(map.chapters.length,12);
assert.ok(map.chapters.every(x=>x.status==='KIKI_TEACHING_SLICE_COMPLETE'));

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);

for(let chapter=1;chapter<=12;chapter++){
  const lessonPath=chapter===1?'data/class6-science-pilot.js':`data/class6-science-ch${chapter}.js`;
  const assessmentPath=chapter===1?'data/class6-science-assessments.js':`data/class6-science-ch${chapter}-assessments.js`;
  const schoolNeedsPath=`docs/class6-pilot/SCIENCE_CH${chapter}_SCHOOL_NEEDS_VALIDATION_V1.json`;
  for(const path of [lessonPath,assessmentPath,schoolNeedsPath]) assert.ok(fs.existsSync(path),`missing Chapter ${chapter} evidence: ${path}`);

  const beforeLessons=sandbox.window.KV_LESSONS.length;
  const beforeAssessments=sandbox.window.KV_ASSESSMENTS.length;
  vm.runInContext(fs.readFileSync(lessonPath,'utf8'),sandbox,{filename:lessonPath});
  vm.runInContext(fs.readFileSync(assessmentPath,'utf8'),sandbox,{filename:assessmentPath});
  const chapterLessons=sandbox.window.KV_LESSONS.slice(beforeLessons);
  const chapterAssessments=sandbox.window.KV_ASSESSMENTS.slice(beforeAssessments);
  assert.equal(chapterLessons.length,3,`Chapter ${chapter} must have three lessons`);
  assert.equal(chapterAssessments.length,15,`Chapter ${chapter} must have fifteen assessments`);

  for(const lesson of chapterLessons){
    assert.equal(lesson.subject,'Science');
    assert.equal(lesson.board,'CBSE');
    assert.equal(lesson.classLevel,6);
    assert.equal(lesson.chapter,chapter);
    assert.ok(Array.isArray(lesson.sourceRefs)&&lesson.sourceRefs.length>=2,`${lesson.id} missing source refs`);
    assert.match(lesson.rightsStatus,/ORIGINAL/,`${lesson.id} missing original-rights boundary`);
    for(const field of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt']) assert.ok(lesson.kikiTeaching?.[field],`${lesson.id} missing Kiki ${field}`);
    for(const field of ['trigger','strategy','masteryEvidence']) assert.ok(lesson.remediation?.[field],`${lesson.id} missing remediation ${field}`);
    const linked=chapterAssessments.filter(x=>x.lessonId===lesson.id);
    assert.equal(linked.length,5,`${lesson.id} must have five linked assessments`);
    assert.ok(linked.some(x=>x.assessmentType==='reasoning'),`${lesson.id} missing reasoning assessment`);
    assert.ok(linked.some(x=>x.assessmentType==='mastery_check'),`${lesson.id} missing mastery assessment`);
  }

  const needs=JSON.parse(fs.readFileSync(schoolNeedsPath,'utf8'));
  assert.equal(needs.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');
  assert.equal(needs.scenarios.length,8,`Chapter ${chapter} must have eight school-needs scenarios`);
  assert.equal(new Set(needs.scenarios.map(x=>x.id)).size,8,`Chapter ${chapter} school-needs IDs must be unique`);
  assert.equal(needs.schoolOverlay.liveSchoolEvidenceCollected,false);
  assert.equal(needs.schoolOverlay.schoolSpecificPacingClaimed,false);
  for(const value of Object.values(needs.privacyBoundary)) assert.equal(value,false,`Chapter ${chapter} privacy boundary must remain false`);
}

assert.equal(sandbox.window.KV_LESSONS.length,36);
assert.equal(sandbox.window.KV_ASSESSMENTS.length,180);
assert.equal(new Set(sandbox.window.KV_LESSONS.map(x=>x.id)).size,36);
assert.equal(new Set(sandbox.window.KV_ASSESSMENTS.map(x=>x.stableAssessmentId)).size,180);

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
const sw=fs.readFileSync('sw-v30.js','utf8');
for(let chapter=1;chapter<=12;chapter++){
  const lessonAsset=chapter===1?'data/class6-science-pilot.js':`data/class6-science-ch${chapter}.js`;
  const assessmentAsset=chapter===1?'data/class6-science-assessments.js':`data/class6-science-ch${chapter}-assessments.js`;
  for(const asset of [lessonAsset,assessmentAsset]){
    assert.ok(entry.includes(asset),`loader missing ${asset}`);
    assert.ok(sw.includes(`/${asset}`),`offline precache missing ${asset}`);
  }
}

const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
for(const privacyFlag of ['microphone:false','recording:false','speechRecognition:false']) assert.ok(index.includes(privacyFlag),`index missing privacy control ${privacyFlag}`);

const workflow=fs.readFileSync('.github/workflows/class6-science-pilot-qa.yml','utf8');
assert.ok(workflow.includes('SCIENCE_COMPLETION_AUDIT_V1.json'));
assert.ok(workflow.includes('tests/class6-science-completion-audit.test.mjs'));
assert.match(workflow,/Validate aggregate Class 6 Science completion evidence/i);

assert.equal(audit.evidenceSummary.chapterCount,12);
assert.equal(audit.evidenceSummary.topicCount,36);
assert.equal(audit.evidenceSummary.lessonCount,36);
assert.equal(audit.evidenceSummary.assessmentCount,180);
assert.equal(audit.evidenceSummary.syntheticSchoolNeedsScenarioCount,96);
for(const value of Object.values(audit.privacyBoundary)) assert.equal(value,false);

console.log(`CLASS6_SCIENCE_COMPLETION_AUDIT_PASS decision=${audit.decision} chapters=${map.chapters.length} lessons=${sandbox.window.KV_LESSONS.length} assessments=${sandbox.window.KV_ASSESSMENTS.length} syntheticScenarios=${audit.evidenceSummary.syntheticSchoolNeedsScenarioCount}`);
