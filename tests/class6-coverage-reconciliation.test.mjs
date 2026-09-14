import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const manifest=readJson('docs/class6-pilot/CLASS6_COVERAGE_MANIFEST_V1.json');
const maths=readJson('docs/class6-pilot/MATHEMATICS_GANITA_PRAKASH_MAP_V1.json');
const mathAudit=readJson('docs/class6-pilot/MATHEMATICS_COMPLETION_AUDIT_V1.json');
const mathNeeds=Array.from({length:10},(_,i)=>readJson(`docs/class6-pilot/MATH_CH${i+1}_SCHOOL_NEEDS_VALIDATION_V1.json`));
const scienceMap=readJson('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json');
const scienceAudit=readJson('docs/class6-pilot/SCIENCE_COMPLETION_AUDIT_V1.json');
const socialSource=readJson('docs/class6-pilot/SOCIAL_SCIENCE_SOURCE_RECONCILIATION_V1.json');
const socialMap=readJson('docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json');
const socialOverlay=readJson('docs/class6-pilot/SOCIAL_SCIENCE_PROVENANCE_RIGHTS_SCHOOL_OVERLAY_V1.json');
const socialNeeds=[1,2,3,4,5,6,7].map(ch=>readJson(`docs/class6-pilot/SOCIAL_SCIENCE_CH${ch}_SCHOOL_NEEDS_VALIDATION_V1.json`));
const socialRec=[2,3,4,5,6,7,8].map(ch=>readJson(`docs/class6-pilot/SOCIAL_SCIENCE_CH${ch}_SOURCE_TOPIC_RECONCILIATION_V1.json`));

assert.equal(manifest.schemaVersion,'1.21.0');
assert.equal(manifest.pilot.board,'CBSE');
assert.equal(manifest.pilot.class,6);
assert.equal(manifest.pilot.canonicalRepository,'ssakthivel02/kirthiverse-hitech');
assert.equal(manifest.pilot.lastReconciledMain,'46998b5f2a65c60206d7045e851cb68f2ff6d8e1');
const byId=Object.fromEntries(manifest.subjects.map(x=>[x.id,x]));
assert.equal(manifest.subjects.length,11);assert.equal(Object.keys(byId).length,11);

const mathematics=byId.mathematics;
assert.equal(mathematics.status,'MATHEMATICS_COMPLETE');assert.equal(mathematics.completionClaim,true);
assert.equal(mathematics.mappedChapterCount,10);assert.equal(mathematics.implementedChapterCount,10);assert.equal(mathematics.schoolNeedsValidatedChapterCount,10);
assert.equal(mathAudit.decision,'MATHEMATICS_COMPLETE');assert.equal(maths.schemaVersion,'1.11.0');assert.equal(maths.chapters.length,10);
assert.ok(maths.chapters.every(x=>x.status==='KIKI_TEACHING_SLICE_COMPLETE'));
for(const chapter of [1,2,3,4,5,6,7,8,9,10])assert.equal(maths[`chapter${chapter}CompletionEvidence`]?.schoolNeedsValidationPresent,true,`Math Chapter ${chapter} school-needs evidence must be present`);
for(const artifact of mathNeeds){assert.equal(artifact.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');assert.equal(artifact.schoolOverlay.liveSchoolEvidenceCollected,false);assert.equal(artifact.schoolOverlay.schoolSpecificPacingClaimed,false);assert.equal(artifact.scenarios.length,8);}assert.equal(mathNeeds.flatMap(x=>x.scenarios).length,80);

const science=byId.science;
assert.equal(science.status,'SCIENCE_COMPLETE');assert.equal(science.completionClaim,true);assert.equal(science.mappedChapterCount,12);assert.equal(science.implementedChapterCount,12);assert.equal(science.schoolNeedsValidatedChapterCount,12);
assert.equal(scienceAudit.decision,'SCIENCE_COMPLETE');assert.equal(scienceMap.chapters.length,12);assert.ok(scienceMap.chapters.every(x=>x.status==='KIKI_TEACHING_SLICE_COMPLETE'));

const social=byId['social-science'];
assert.equal(social.status,'CHAPTERS_1_7_IMPLEMENTED_AND_SCHOOL_NEEDS_VALIDATED_CHAPTER8_RECONCILED');
assert.equal(social.sourceReconciliation,'docs/class6-pilot/SOCIAL_SCIENCE_SOURCE_RECONCILIATION_V1.json');
assert.equal(social.curriculumMap,'docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json');
assert.equal(social.provenanceReconciliation,'docs/class6-pilot/SOCIAL_SCIENCE_PROVENANCE_RIGHTS_SCHOOL_OVERLAY_V1.json');
assert.equal(social.officialChapterLinkCountVerified,12);assert.equal(social.mappedChapterCount,14);assert.equal(social.chapterTitlesVerified,true);
assert.equal(social.implementedChapterCount,7);assert.equal(social.schoolNeedsValidatedChapterCount,7);assert.notEqual(social.completionClaim,true);
for(const ch of [2,3,4,5,6,7]){assert.equal(social[`chapter${ch}SchoolNeedsValidationRequired`],true);assert.equal(social[`chapter${ch}SchoolNeedsValidationPresent`],true);assert.equal(social[`chapter${ch}SchoolNeedsValidationArtifact`],`docs/class6-pilot/SOCIAL_SCIENCE_CH${ch}_SCHOOL_NEEDS_VALIDATION_V1.json`);}
assert.equal(social.chapter6SourceTopicReconciliation,'docs/class6-pilot/SOCIAL_SCIENCE_CH6_SOURCE_TOPIC_RECONCILIATION_V1.json');
assert.equal(social.chapter7SourceTopicReconciliation,'docs/class6-pilot/SOCIAL_SCIENCE_CH7_SOURCE_TOPIC_RECONCILIATION_V1.json');
assert.equal(social.chapter7SchoolNeedsValidationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH7_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.equal(social.chapter8SourceTopicReconciliation,'docs/class6-pilot/SOCIAL_SCIENCE_CH8_SOURCE_TOPIC_RECONCILIATION_V1.json');
assert.equal(social.chapter8SchoolNeedsValidationRequired,true);assert.equal(social.chapter8SchoolNeedsValidationPresent,false);

assert.equal(socialSource.decision,'SOCIAL_SCIENCE_MAPPING_REQUIRES_14_CHAPTER_BASELINE');assert.equal(socialSource.officialSource.provider,'NCERT');assert.equal(socialSource.officialSource.publicationCode,'0681');assert.equal(socialSource.officialSource.currentWorkingChapterCount,14);assert.equal(socialSource.officialSource.chapterContentExtracted,false);assert.equal(socialSource.officialSource.chapterTitlesVerified,true);
assert.equal(socialMap.schemaVersion,'1.15.0');assert.equal(socialMap.decision,'SOCIAL_SCIENCE_14_CHAPTER_MAPPING_BASELINE');assert.equal(socialMap.chapters.length,14);assert.deepEqual(socialMap.chapters.map(x=>x.chapter),[1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
const implementedSocial=socialMap.chapters.slice(0,7);assert.ok(implementedSocial.every(x=>x.status==='KIKI_TEACHING_SLICE_COMPLETE'));
assert.deepEqual(implementedSocial.map(x=>x.topicCount),[3,4,4,4,4,4,4]);assert.deepEqual(implementedSocial.map(x=>x.assessmentCount),[15,20,20,20,20,20,20]);
assert.ok(implementedSocial.every(x=>x.schoolNeedsValidationRequired===true&&x.schoolNeedsValidationPresent===true));
const ch6=socialMap.chapters[5];assert.equal(ch6.title,'The Beginnings of Indian Civilisation');assert.equal(ch6.lessonDataset,'data/class6-social-science-ch6.js');assert.equal(ch6.assessmentDataset,'data/class6-social-science-ch6-assessments.js');assert.equal(ch6.schoolNeedsValidationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH6_SCHOOL_NEEDS_VALIDATION_V1.json');
const ch7=socialMap.chapters[6];assert.equal(ch7.title,'India’s Cultural Roots');assert.equal(ch7.status,'KIKI_TEACHING_SLICE_COMPLETE');assert.equal(ch7.topicCount,4);assert.equal(ch7.lessonDataset,'data/class6-social-science-ch7.js');assert.equal(ch7.assessmentDataset,'data/class6-social-science-ch7-assessments.js');assert.equal(ch7.assessmentCount,20);assert.equal(ch7.sourceTopicReconciliationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH7_SOURCE_TOPIC_RECONCILIATION_V1.json');assert.equal(ch7.schoolNeedsValidationRequired,true);assert.equal(ch7.schoolNeedsValidationPresent,true);assert.equal(ch7.schoolNeedsValidationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH7_SCHOOL_NEEDS_VALIDATION_V1.json');
const ch8=socialMap.chapters[7];assert.equal(ch8.title,'Unity in Diversity, or ‘Many in the One’');assert.equal(ch8.status,'SOURCE_TOPIC_RECONCILED_NOT_IMPLEMENTED');assert.equal(ch8.topicCount,4);assert.equal(ch8.sourceTopicReconciliationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH8_SOURCE_TOPIC_RECONCILIATION_V1.json');
assert.ok(socialMap.chapters.slice(8).every(x=>x.status==='MAPPED_NOT_YET_IMPLEMENTED'));
assert.equal(socialMap.implementationStatus.implementedChapterCount,7);assert.equal(socialMap.implementationStatus.schoolNeedsValidatedChapterCount,7);assert.notEqual(socialMap.implementationStatus.completionClaim,true);

for(const [i,artifact] of socialNeeds.entries()){const ch=i+1;assert.equal(artifact.validationType,'SYNTHETIC_SCHOOL_LEARNING_NEEDS_READINESS');assert.equal(artifact.scenarios.length,8,`Social Science Chapter ${ch} scenario count`);assert.equal(artifact.schoolOverlay.liveSchoolEvidenceCollected,false);assert.equal(artifact.schoolOverlay.schoolSpecificPacingClaimed,false);}
assert.equal(socialNeeds[6].validationId,'KVS-CBSE6-SOC-CH7-SCHOOL-NEEDS-V1');assert.ok(socialNeeds[6].scenarios.every(x=>x.safeLearnerAction.length>80&&x.masteryCriterion.length>80));assert.equal(socialNeeds.flatMap(x=>x.scenarios).length,56);

for(const [i,rec] of socialRec.entries()){const ch=i+2;assert.equal(rec.decision,`CHAPTER_${ch}_SOURCE_TOPIC_BOUNDARY_RECONCILED`);assert.equal(rec.chapter,ch);assert.equal(rec.canonicalSource.provider,'NCERT');assert.equal(rec.reconciledTopicBoundary.length,4);assert.ok(rec.reconciledTopicBoundary.every(x=>x.independentAuthoringAllowed===true));assert.equal(rec.implementationGate.schoolNeedsValidationRequiredAfterTeachingSlice,true);assert.equal(rec.implementationGate.completionClaim,false);}
const ch7Rec=socialRec[5];assert.equal(ch7Rec.canonicalSource.sacredTextQuotationsCopied,false);assert.equal(ch7Rec.rightsAndSchoolBoundary.learnerBeliefDisclosureRequired,false);assert.equal(ch7Rec.rightsAndSchoolBoundary.liveSchoolEvidenceCollected,false);assert.equal(ch7Rec.rightsAndSchoolBoundary.realChildDataCollected,false);assert.equal(ch7Rec.implementationGate.runtimeChangeRequiredByThisReconciliation,false);
const ch7Text=JSON.stringify(ch7Rec).toLowerCase();for(const required of ['vedas','upanishad','charvaka','buddhism','jainism','folk','tribal'])assert.ok(ch7Text.includes(required),`missing Chapter 7 reconciliation boundary ${required}`);assert.ok(/devotional|persuasive/.test(ch7Text));assert.ok(/religion|caste|community|tribe/.test(ch7Text));
const ch8Rec=socialRec[6];assert.equal(ch8Rec.canonicalSource.chapterNumber,8);assert.equal(ch8Rec.currentStructureCorroboration.chapter8Title,'Unity in Diversity, or ‘Many in the One’');assert.equal(ch8Rec.reconciledTopicBoundary.length,4);assert.equal(ch8Rec.rightsAndSchoolBoundary.sensitiveIdentityDisclosureRequired,false);assert.equal(ch8Rec.rightsAndSchoolBoundary.liveSchoolEvidenceCollected,false);assert.equal(ch8Rec.rightsAndSchoolBoundary.realChildDataCollected,false);assert.equal(ch8Rec.implementationGate.runtimeChangeRequiredByThisReconciliation,false);const ch8Text=JSON.stringify(ch8Rec).toLowerCase();for(const required of ['diversity','food','textiles','festivals','epic','regional','folk'])assert.ok(ch8Text.includes(required),`missing Chapter 8 reconciliation boundary ${required}`);assert.ok(/uniform|devotional|political|religion|language|community/.test(ch8Text));

assert.equal(socialOverlay.decision,'SOCIAL_SCIENCE_PROVENANCE_RIGHTS_SCHOOL_OVERLAY_RECONCILED');assert.equal(socialOverlay.schoolValidationOverlay.status,'VALIDATION_CONTEXT_ONLY');assert.equal(socialOverlay.schoolValidationOverlay.liveSchoolEvidenceCollected,false);assert.equal(socialOverlay.schoolValidationOverlay.realChildDataCollected,false);
assert.equal(manifest.priorityDecision.selectedLane,'class6-coverage');assert.equal(manifest.priorityDecision.selectedSubject,'social-science');assert.equal(manifest.priorityDecision.selectedNextChapter,8);assert.equal(manifest.priorityDecision.selectedNextChapterTitle,'Unity in Diversity, or ‘Many in the One’');assert.equal(manifest.priorityDecision.selectedNextTask,'Social Science Chapter 8 Kiki Teaching Slice');assert.equal(manifest.priorityDecision.requiresFreshConcurrencyCheckBeforeWrite,true);
for(const id of ['english','language-2','language-3','social-science','life-skills-aptitude','computer-science','health-physical-education','work-education','art-education'])assert.notEqual(byId[id].completionClaim,true,`${id} must not claim completion`);
assert.equal(manifest.safety.unrestrictedChildChat,false);assert.equal(manifest.safety.microphoneCapture,false);assert.equal(manifest.safety.externalLearnerPrompts,false);assert.equal(manifest.safety.childFacingCloudAI,false);assert.equal(manifest.safety.realChildCloudPersistence,false);assert.equal(manifest.legacyPolicy.oldReposAreReadOnlyDonors,true);assert.equal(manifest.legacyPolicy.bulkCopyAllowed,false);assert.equal(manifest.legacyPolicy.sourceAndRightsReviewRequired,true);
console.log('Class 6 coverage reconciliation: PASS');
