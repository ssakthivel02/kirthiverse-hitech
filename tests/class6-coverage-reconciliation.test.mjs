import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson=(path)=>JSON.parse(fs.readFileSync(path,'utf8'));
const manifest=readJson('docs/class6-pilot/CLASS6_COVERAGE_MANIFEST_V1.json');
const maths=readJson('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json');
const mathCh2Needs=readJson('docs/class6-pilot/MATH_CH2_SCHOOL_NEEDS_VALIDATION_V1.json');
const scienceMap=readJson('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json');
const scienceAudit=readJson('docs/class6-pilot/SCIENCE_COMPLETION_AUDIT_V1.json');

assert.equal(manifest.schemaVersion,'1.3.0');
assert.equal(manifest.pilot.board,'CBSE');
assert.equal(manifest.pilot.class,6);
assert.equal(manifest.pilot.canonicalRepository,'ssakthivel02/kirthiverse-hitech');
assert.equal(manifest.pilot.lastReconciledMain,'364a3cdccaa29d9965c6389aa3c9e02043894893');

const byId=Object.fromEntries(manifest.subjects.map(x=>[x.id,x]));
assert.equal(manifest.subjects.length,11);
assert.equal(Object.keys(byId).length,11,'subject IDs must be unique');

const science=byId.science;
assert.equal(science.status,'SCIENCE_COMPLETE');
assert.equal(science.completionClaim,true);
assert.equal(science.mappedChapterCount,12);
assert.equal(science.implementedChapterCount,12);
assert.equal(science.schoolNeedsValidatedChapterCount,12);
assert.equal(scienceAudit.decision,'SCIENCE_COMPLETE');
assert.equal(scienceMap.chapters.length,12);
assert.ok(scienceMap.chapters.every(x=>x.status==='KIKI_TEACHING_SLICE_COMPLETE'));
assert.match(science.completionBoundary,/not live-school efficacy/i);

const mathematics=byId.mathematics;
assert.equal(mathematics.status,'IMPLEMENTATION_IN_PROGRESS');
assert.equal(mathematics.completionClaim,false);
assert.equal(maths.schemaVersion,'1.3.0');
assert.equal(maths.chapters.length,10);
const implementedMath=maths.chapters.filter(x=>x.status==='KIKI_TEACHING_SLICE_COMPLETE');
const pendingMath=maths.chapters.filter(x=>x.status==='MAPPED_NOT_YET_IMPLEMENTED');
assert.deepEqual(implementedMath.map(x=>x.chapter),[1,2,3]);
assert.equal(pendingMath.length,7);
assert.equal(pendingMath[0].chapter,4);
assert.equal(pendingMath[0].title,'Data Handling and Presentation');
assert.equal(mathematics.mappedChapterCount,maths.chapters.length);
assert.equal(mathematics.implementedChapterCount,implementedMath.length);
assert.equal(mathematics.remainingMappedChapterCount,pendingMath.length);
assert.equal(mathematics.schoolNeedsValidatedChapterCount,2);
assert.equal(mathematics.nextLargestGap,'Chapter 3 — School Needs Validation');
assert.equal(maths.chapter2CompletionEvidence?.schoolNeedsValidationPresent,true);
assert.equal(maths.chapter3CompletionEvidence?.schoolNeedsValidationRequired,true);
assert.equal(maths.chapter3CompletionEvidence?.schoolNeedsValidationPresent,false);
assert.equal(mathCh2Needs.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');
assert.equal(mathCh2Needs.schoolOverlay.liveSchoolEvidenceCollected,false);
assert.equal(mathCh2Needs.scenarios.length,8);

assert.equal(manifest.priorityDecision.selectedLane,'mathematics');
assert.equal(manifest.priorityDecision.selectedNextChapter,3);
assert.equal(manifest.priorityDecision.selectedNextChapterTitle,'Number Play');
assert.equal(manifest.priorityDecision.selectedNextTask,'Chapter 3 School Needs Validation');
assert.equal(manifest.priorityDecision.requiresFreshConcurrencyCheckBeforeWrite,true);

for(const id of ['english','language-2','language-3','social-science','life-skills-aptitude','computer-science','health-physical-education','work-education','art-education']){
  assert.notEqual(byId[id].completionClaim,true,`${id} must not claim completion`);
}

assert.equal(manifest.safety.unrestrictedChildChat,false);
assert.equal(manifest.safety.microphoneCapture,false);
assert.equal(manifest.safety.externalLearnerPrompts,false);
assert.equal(manifest.safety.childFacingCloudAI,false);
assert.equal(manifest.safety.realChildCloudPersistence,false);
assert.equal(manifest.legacyPolicy.oldReposAreReadOnlyDonors,true);
assert.equal(manifest.legacyPolicy.bulkCopyAllowed,false);
assert.equal(manifest.legacyPolicy.reconcileOnlyIfMissing,true);
assert.equal(manifest.legacyPolicy.sourceAndRightsReviewRequired,true);

console.log('Class 6 coverage reconciliation: PASS');
