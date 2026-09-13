import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const readJson=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const audit=readJson('docs/class6-pilot/MATHEMATICS_COMPLETION_AUDIT_V1.json');
const map=readJson('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json');
const manifest=readJson('docs/class6-pilot/CLASS6_COVERAGE_MANIFEST_V1.json');

assert.equal(audit.schemaVersion,'1.0.0');
assert.equal(audit.auditId,'KVS-CBSE6-MATHEMATICS-COMPLETION-AUDIT-V1');
assert.equal(audit.auditedBaseCommit,'970b9773aa02d9bf30e5cd772ceb6c9f8d55690c');
assert.equal(audit.decision,'MATHEMATICS_COMPLETE');
assert.match(audit.decisionBoundary,/repository contains/i);
assert.match(audit.decisionBoundary,/not a live-school efficacy claim/i);
assert.equal(audit.evidenceSummary.chapterCount,10);
assert.equal(audit.evidenceSummary.topicCount,30);
assert.equal(audit.evidenceSummary.lessonCount,30);
assert.equal(audit.evidenceSummary.assessmentCount,150);
assert.equal(audit.evidenceSummary.syntheticSchoolNeedsScenarioCount,80);
assert.equal(audit.evidenceSummary.schoolNeedsScenariosPerChapter,8);
for(const key of ['allChapterTeachingSlicesComplete','allChapterSchoolNeedsSlicesPresent','offlineIntegrationRequired','accessibilityContractRequired','releaseRegressionRequired','rightsAndSourceBoundaryRequired','childSafetyPrivacyBoundaryRequired']) assert.equal(audit.evidenceSummary[key],true,`audit evidence flag ${key} must be true`);
for(const [key,value] of Object.entries(audit.privacyBoundary)) assert.equal(value,false,`audit privacy boundary ${key} must remain false`);
assert.match(audit.rightsBoundary,/independently authored/i);
assert.match(audit.schoolBoundary,/does not claim school attestation/i);
assert.match(audit.accessibilityBoundary,/not a human WCAG conformance certification/i);

assert.equal(map.schemaVersion,'1.11.0');
assert.equal(map.chapters.length,10);
assert.ok(map.chapters.every(x=>x.status==='KIKI_TEACHING_SLICE_COMPLETE'),'all ten Mathematics chapters must be teaching-slice complete');
const topicArrays=Array.from({length:10},(_,i)=>map[`chapter${i+1}Topics`]);
assert.ok(topicArrays.every(x=>Array.isArray(x)&&x.length===3),'every Mathematics chapter must expose three mapped topics');
assert.equal(topicArrays.flat().length,30);
assert.ok(topicArrays.flat().every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'),'all thirty Mathematics topics must be implemented');
for(let chapter=1;chapter<=10;chapter++){
  const evidence=map[`chapter${chapter}CompletionEvidence`];
  assert.ok(evidence,`Chapter ${chapter} completion evidence missing`);
  assert.equal(evidence.lessonCount,3,`Chapter ${chapter} lesson count`);
  assert.equal(evidence.assessmentCount,15,`Chapter ${chapter} assessment count`);
  assert.equal(evidence.schoolNeedsValidationRequired,true,`Chapter ${chapter} school-needs required flag`);
  assert.equal(evidence.schoolNeedsValidationPresent,true,`Chapter ${chapter} school-needs evidence must be acknowledged`);
}
assert.equal(map.chapter10CompletionEvidence.schoolNeedsValidationArtifact,'docs/class6-pilot/MATH_CH10_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.ok(fs.existsSync(map.chapter10CompletionEvidence.schoolNeedsValidationArtifact));

const runtime={window:{KV_LESSONS:[]}};
vm.createContext(runtime);
for(const file of ['data/class6-math-pilot.js','data/class6-math-ch2.js','data/class6-math-ch3-4-runtime.js']) vm.runInContext(fs.readFileSync(file,'utf8'),runtime,{filename:file});
const runtimeLessons=runtime.window.KV_LESSONS;
assert.equal(runtimeLessons.length,30,'Mathematics runtime must expose exactly thirty Class 6 lessons');
assert.equal(new Set(runtimeLessons.map(x=>x.id)).size,30,'Mathematics runtime lesson IDs must be unique');
assert.deepEqual([...new Set(runtimeLessons.map(x=>x.chapter))].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9,10]);
assert.equal(new Set(runtimeLessons.map(x=>x.topicId)).size,30,'Mathematics runtime topic IDs must be unique');
for(const lesson of runtimeLessons){
  assert.equal(lesson.subject,'Mathematics');
  assert.equal(lesson.board,'CBSE');
  assert.equal(lesson.classLevel,6);
  assert.equal(lesson.book,'Ganita Prakash');
  assert.match(lesson.rightsStatus,/ORIGINAL/);
  assert.ok(lesson.kikiTeaching?.misconceptionCheck);
  assert.ok(lesson.remediation?.strategy);
  assert.ok(lesson.remediation?.masteryEvidence);
}

const assessmentSandbox={window:{KV_ASSESSMENTS:[]}};
vm.createContext(assessmentSandbox);
const assessmentFiles=['data/class6-math-assessments.js',...Array.from({length:9},(_,i)=>`data/class6-math-ch${i+2}-assessments.js`)];
for(const file of assessmentFiles) vm.runInContext(fs.readFileSync(file,'utf8'),assessmentSandbox,{filename:file});
const assessments=assessmentSandbox.window.KV_ASSESSMENTS;
assert.equal(assessments.length,150,'Mathematics must expose exactly 150 linked assessments');
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,150,'Mathematics stable assessment IDs must be unique');
const expectedAssessmentIds=Array.from({length:150},(_,i)=>`KV-CBSE6-MATH-${String(i+1).padStart(4,'0')}`);
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),expectedAssessmentIds);
for(const lesson of runtimeLessons){
  const linked=assessments.filter(x=>x.lessonId===lesson.id);
  assert.equal(linked.length,5,`${lesson.id} must retain exactly five assessments`);
  for(const type of ['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']) assert.ok(linked.some(x=>x.assessmentType===type),`${lesson.id} missing ${type}`);
}

const schoolNeeds=[];
for(let chapter=1;chapter<=10;chapter++){
  const artifact=readJson(`docs/class6-pilot/MATH_CH${chapter}_SCHOOL_NEEDS_VALIDATION_V1.json`);
  schoolNeeds.push(artifact);
  assert.equal(artifact.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS',`Chapter ${chapter} school-needs type`);
  assert.equal(artifact.scenarios.length,8,`Chapter ${chapter} must retain eight synthetic scenarios`);
  assert.equal(artifact.schoolOverlay.liveSchoolEvidenceCollected,false,`Chapter ${chapter} must not claim live school evidence`);
  assert.equal(artifact.schoolOverlay.schoolSpecificPacingClaimed,false,`Chapter ${chapter} must not claim school-specific pacing`);
  for(const value of Object.values(artifact.privacyBoundary)) assert.equal(value,false,`Chapter ${chapter} privacy boundary must remain false`);
}
assert.equal(schoolNeeds.flatMap(x=>x.scenarios).length,80);
assert.equal(new Set(schoolNeeds.flatMap(x=>x.scenarios.map(s=>s.id))).size,80,'synthetic scenario IDs must be unique');

const mathematics=manifest.subjects.find(x=>x.id==='mathematics');
assert.ok(mathematics,'Mathematics manifest subject missing');
assert.equal(mathematics.status,'MATHEMATICS_COMPLETE');
assert.equal(mathematics.completionClaim,true);
assert.equal(mathematics.mappedChapterCount,10);
assert.equal(mathematics.implementedChapterCount,10);
assert.equal(mathematics.remainingMappedChapterCount,0);
assert.equal(mathematics.schoolNeedsValidatedChapterCount,10);
assert.equal(mathematics.completionAudit,'docs/class6-pilot/MATHEMATICS_COMPLETION_AUDIT_V1.json');
assert.match(mathematics.completionBoundary,/not live-school efficacy/i);

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
assert.ok(entry.includes('ch(?:2|3|4|5|6|7|8|9|10)\\.'),'bounded Mathematics deferred-assessment route coverage must remain through Chapter 10');
assert.ok(!entry.includes("/^\\/lesson\\/math\\./"),'generic Mathematics lesson routes must not trigger Class 6 bundles');
const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v45/);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));

console.log(`CLASS6_MATH_COMPLETION_AUDIT_PASS chapters=${map.chapters.length} topics=${topicArrays.flat().length} lessons=${runtimeLessons.length} assessments=${assessments.length} schoolNeeds=${schoolNeeds.flatMap(x=>x.scenarios).length}`);
