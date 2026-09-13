import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson=(path)=>JSON.parse(fs.readFileSync(path,'utf8'));
const manifest=readJson('docs/class6-pilot/CLASS6_COVERAGE_MANIFEST_V1.json');
const maths=readJson('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json');
const mathNeeds=[2,3,4,5,6,7].map(ch=>readJson(`docs/class6-pilot/MATH_CH${ch}_SCHOOL_NEEDS_VALIDATION_V1.json`));
const scienceMap=readJson('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json');
const scienceAudit=readJson('docs/class6-pilot/SCIENCE_COMPLETION_AUDIT_V1.json');

assert.equal(manifest.schemaVersion,'1.5.0');assert.equal(manifest.pilot.board,'CBSE');assert.equal(manifest.pilot.class,6);assert.equal(manifest.pilot.canonicalRepository,'ssakthivel02/kirthiverse-hitech');assert.equal(manifest.pilot.lastReconciledMain,'9fa11ee2bd8eb1e2609f938cd2ddcd5ea8d68563');
const byId=Object.fromEntries(manifest.subjects.map(x=>[x.id,x]));assert.equal(manifest.subjects.length,11);assert.equal(Object.keys(byId).length,11);
const science=byId.science;assert.equal(science.status,'SCIENCE_COMPLETE');assert.equal(science.completionClaim,true);assert.equal(science.mappedChapterCount,12);assert.equal(science.implementedChapterCount,12);assert.equal(science.schoolNeedsValidatedChapterCount,12);assert.equal(scienceAudit.decision,'SCIENCE_COMPLETE');assert.equal(scienceMap.chapters.length,12);assert.ok(scienceMap.chapters.every(x=>x.status==='KIKI_TEACHING_SLICE_COMPLETE'));assert.match(science.completionBoundary,/not live-school efficacy/i);

const mathematics=byId.mathematics;assert.equal(mathematics.status,'IMPLEMENTATION_IN_PROGRESS');assert.equal(mathematics.completionClaim,false);assert.equal(maths.schemaVersion,'1.9.0');assert.equal(maths.chapters.length,10);
const implementedMath=maths.chapters.filter(x=>x.status==='KIKI_TEACHING_SLICE_COMPLETE');const pendingMath=maths.chapters.filter(x=>x.status==='MAPPED_NOT_YET_IMPLEMENTED');
assert.deepEqual(implementedMath.map(x=>x.chapter),[1,2,3,4,5,6,7,8]);assert.equal(pendingMath.length,2);assert.equal(pendingMath[0].chapter,9);assert.equal(pendingMath[0].title,'Symmetry');
assert.equal(mathematics.mappedChapterCount,10);assert.equal(mathematics.implementedChapterCount,8);assert.equal(mathematics.remainingMappedChapterCount,2);assert.equal(mathematics.schoolNeedsValidatedChapterCount,7);assert.equal(mathematics.nextLargestGap,'Chapter 8 — School Needs Validation');
for(const chapter of [2,3,4,5,6,7])assert.equal(maths[`chapter${chapter}CompletionEvidence`]?.schoolNeedsValidationPresent,true,`Chapter ${chapter} school-needs evidence must be present`);
assert.equal(maths.chapter8CompletionEvidence?.schoolNeedsValidationRequired,true);assert.equal(maths.chapter8CompletionEvidence?.schoolNeedsValidationPresent,false);assert.equal(maths.chapter8CompletionEvidence?.startupRequestCeilingPreserved,true);assert.equal(maths.chapter8CompletionEvidence?.runtimeCarrier,'data/class6-math-ch2.js');assert.equal(maths.chapter8CompletionEvidence?.sourceOfTruth,'data/class6-math-ch8.js');
for(const artifact of mathNeeds){assert.equal(artifact.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');assert.equal(artifact.schoolOverlay.liveSchoolEvidenceCollected,false);assert.equal(artifact.scenarios.length,8);}
assert.equal(mathNeeds.at(-1).validationId,'KVS-CBSE6-MATH-CH7-SCHOOL-NEEDS-V1');
assert.equal(manifest.priorityDecision.selectedLane,'mathematics');assert.equal(manifest.priorityDecision.selectedNextChapter,8);assert.equal(manifest.priorityDecision.selectedNextChapterTitle,'Playing with Constructions');assert.equal(manifest.priorityDecision.selectedNextTask,'Chapter 8 School Needs Validation');assert.equal(manifest.priorityDecision.requiresFreshConcurrencyCheckBeforeWrite,true);
for(const id of ['english','language-2','language-3','social-science','life-skills-aptitude','computer-science','health-physical-education','work-education','art-education'])assert.notEqual(byId[id].completionClaim,true,`${id} must not claim completion`);
assert.equal(manifest.safety.unrestrictedChildChat,false);assert.equal(manifest.safety.microphoneCapture,false);assert.equal(manifest.safety.externalLearnerPrompts,false);assert.equal(manifest.safety.childFacingCloudAI,false);assert.equal(manifest.safety.realChildCloudPersistence,false);assert.equal(manifest.legacyPolicy.oldReposAreReadOnlyDonors,true);assert.equal(manifest.legacyPolicy.bulkCopyAllowed,false);assert.equal(manifest.legacyPolicy.reconcileOnlyIfMissing,true);assert.equal(manifest.legacyPolicy.sourceAndRightsReviewRequired,true);
console.log('Class 6 coverage reconciliation: PASS');