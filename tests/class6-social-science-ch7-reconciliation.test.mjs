import assert from 'node:assert/strict';
import fs from 'node:fs';

const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json','utf8'));
const rec=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CH7_SOURCE_TOPIC_RECONCILIATION_V1.json','utf8'));
const ch7=map.chapters.find(x=>x.chapter===7);

assert.equal(rec.decision,'CHAPTER_7_SOURCE_TOPIC_BOUNDARY_RECONCILED');
assert.equal(rec.chapter,7);
assert.equal(rec.chapterTitle,'India’s Cultural Roots');
assert.equal(rec.canonicalSourceAuthority,'NCERT');
assert.equal(rec.curriculumSession,'2026-27');
assert.equal(rec.reconciledTopicBoundary.length,4);
assert.deepEqual(rec.reconciledTopicBoundary.map(x=>x.topicId),['TOPIC-SOC6-07-01','TOPIC-SOC6-07-02','TOPIC-SOC6-07-03','TOPIC-SOC6-07-04']);
assert.ok(rec.reconciledTopicBoundary.every(x=>x.scope&&x.kikiTeachingIntent&&Array.isArray(x.boundaries)&&x.boundaries.length));
assert.ok(rec.reconciledTopicBoundary.every(x=>x.boundaries.every(b=>typeof b==='string'&&b.length>20)));
assert.equal(ch7.title,'India’s Cultural Roots');
assert.equal(ch7.status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(ch7.topicCount,4);
assert.equal(ch7.lessonDataset,'data/class6-social-science-ch7.js');
assert.equal(ch7.assessmentDataset,'data/class6-social-science-ch7-assessments.js');
assert.equal(ch7.assessmentCount,20);
assert.equal(ch7.sourceTopicReconciliationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH7_SOURCE_TOPIC_RECONCILIATION_V1.json');
assert.equal(ch7.schoolNeedsValidationRequired,true);
assert.equal(ch7.schoolNeedsValidationPresent,true);
assert.equal(ch7.schoolNeedsValidationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH7_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.equal(map.implementationStatus.implementedChapterCount,8);
assert.equal(map.implementationStatus.schoolNeedsValidatedChapterCount,7);
assert.equal(map.implementationStatus.completionClaim,false);

console.log('CLASS6_SOCIAL_SCIENCE_CH7_RECONCILIATION_PASS topics=4 teaching=implemented schoolNeeds=validated beliefDisclosure=false');