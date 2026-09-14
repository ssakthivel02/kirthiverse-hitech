import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadArray(path,key){const sandbox={window:{[key]:[]}};vm.runInNewContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});return sandbox.window[key];}
const lessons=loadArray('data/class6-social-science-pilot.js','KV_LESSONS');
const assessments=loadArray('data/class6-social-science-assessments.js','KV_ASSESSMENTS');
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json','utf8'));
const rec=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CH2_SOURCE_TOPIC_RECONCILIATION_V1.json','utf8'));
const ch2Lessons=lessons.filter(x=>x.chapter===2);
const ch2Assessments=assessments.filter(x=>ch2Lessons.some(l=>l.id===x.lessonId));
assert.equal(ch2Lessons.length,4);assert.equal(ch2Assessments.length,20);
assert.deepEqual(ch2Lessons.map(x=>x.topicId),['TOPIC-SOC6-02-01','TOPIC-SOC6-02-02','TOPIC-SOC6-02-03','TOPIC-SOC6-02-04']);
assert.ok(ch2Lessons.every(x=>x.subject==='Social Science'&&x.worldId==='geography'&&x.board==='CBSE'&&x.classLevel===6&&x.chapterTitle==='Oceans and Continents'));
assert.ok(ch2Lessons.every(x=>x.book==='Exploring Society: India and Beyond'&&x.curriculumSession==='2026-27'));
assert.ok(ch2Lessons.every(x=>x.rightsStatus==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_PROSE_OR_EXERCISE_REPRODUCTION'));
assert.ok(ch2Lessons.every(x=>x.schoolMappingStatus==='VALIDATION_CONTEXT_ONLY_NO_SCHOOL_PACING_OR_EDITION_CLAIM'));
for(const lesson of ch2Lessons){for(const key of ['learningObjective','content','workedExample'])assert.ok(String(lesson[key]||'').length>80,`${lesson.id} ${key}`);for(const key of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])assert.ok(String(lesson.kikiTeaching?.[key]||'').length>10,`${lesson.id} kiki ${key}`);for(const key of ['trigger','strategy','masteryEvidence'])assert.ok(String(lesson.remediation?.[key]||'').length>20,`${lesson.id} remediation ${key}`);const aa=ch2Assessments.filter(a=>a.lessonId===lesson.id);assert.equal(aa.length,5);assert.deepEqual(new Set(aa.map(a=>a.assessmentType)),new Set(['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']));assert.ok(aa.every(a=>a.questionActivity&&a.correctAnswer&&a.hint&&a.explanation));}
assert.deepEqual(ch2Assessments.map(x=>x.stableAssessmentId),Array.from({length:20},(_,i)=>`KV-CBSE6-SOC-${String(i+16).padStart(4,'0')}`));
const ch2=map.chapters.find(x=>x.chapter===2);assert.equal(map.schemaVersion,'1.6.0');assert.equal(ch2.status,'KIKI_TEACHING_SLICE_COMPLETE');assert.equal(ch2.topicCount,4);assert.equal(ch2.assessmentCount,20);assert.equal(ch2.schoolNeedsValidationRequired,true);assert.equal(ch2.schoolNeedsValidationPresent,true);assert.equal(map.implementationStatus.implementedChapterCount,2);assert.equal(map.implementationStatus.schoolNeedsValidatedChapterCount,2);assert.equal(map.implementationStatus.completionClaim,false);
assert.equal(rec.decision,'CHAPTER_2_SOURCE_TOPIC_BOUNDARY_RECONCILED');assert.deepEqual(rec.reconciledTopicBoundary.map(x=>x.topicId),ch2Lessons.map(x=>x.topicId));
const text=JSON.stringify({lessons:ch2Lessons,assessments:ch2Assessments}).toLowerCase();
for(const forbidden of ['share your home address','upload your precise location','share your precise coordinates','live gps','plate tectonics','bathymetry'])assert.ok(!text.includes(forbidden),`forbidden Chapter 2 boundary found: ${forbidden}`);
for(const advancedMarineChemistry of ['salinity calculation','ocean ph','seawater ph','dissolved oxygen calculation','marine chemical composition','carbonate chemistry'])assert.ok(!text.includes(advancedMarineChemistry),`advanced marine chemistry teaching found: ${advancedMarineChemistry}`);
assert.ok(!text.includes('ocean currents are required'),'ocean currents must not be promoted to required scope');
console.log(`CLASS6_SOCIAL_SCIENCE_CH2_PASS lessons=${ch2Lessons.length} assessments=${ch2Assessments.length}`);
