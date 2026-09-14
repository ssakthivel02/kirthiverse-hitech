import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadArray(path,key){const sandbox={window:{[key]:[]}};vm.runInNewContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});return sandbox.window[key];}
const lessons=loadArray('data/class6-social-science-pilot.js','KV_LESSONS');
const assessments=loadArray('data/class6-social-science-assessments.js','KV_ASSESSMENTS');
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json','utf8'));
const rec=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CH4_SOURCE_TOPIC_RECONCILIATION_V1.json','utf8'));
const ch4Lessons=lessons.filter(x=>x.chapter===4);
const ch4LessonIds=new Set(ch4Lessons.map(x=>x.id));
const ch4Assessments=assessments.filter(x=>ch4LessonIds.has(x.lessonId));

assert.equal(ch4Lessons.length,4);
assert.equal(ch4Assessments.length,20);
assert.equal(new Set(ch4Lessons.map(x=>x.id)).size,4);
assert.equal(new Set(ch4Assessments.map(x=>x.stableAssessmentId)).size,20);
assert.deepEqual(ch4Lessons.map(x=>x.topicId),['TOPIC-SOC6-04-01','TOPIC-SOC6-04-02','TOPIC-SOC6-04-03','TOPIC-SOC6-04-04']);
assert.ok(ch4Lessons.every(x=>x.subject==='Social Science'&&x.worldId==='geography'&&x.board==='CBSE'&&x.classLevel===6&&x.chapter===4&&x.chapterTitle==='Timeline and Sources of History'));
assert.ok(ch4Lessons.every(x=>x.book==='Exploring Society: India and Beyond'&&x.curriculumSession==='2026-27'));
assert.ok(ch4Lessons.every(x=>x.rightsStatus==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_PROSE_OR_EXERCISE_REPRODUCTION'));
assert.ok(ch4Lessons.every(x=>x.schoolMappingStatus==='VALIDATION_CONTEXT_ONLY_NO_SCHOOL_PACING_OR_EDITION_CLAIM'));
assert.ok(ch4Lessons.every(x=>x.sourceRefs.includes('KVS-CBSE6-SOC-CH4-SOURCE-TOPIC-V1')));
for(const lesson of ch4Lessons){
  for(const key of ['learningObjective','content','workedExample'])assert.ok(String(lesson[key]||'').length>80,`${lesson.id} ${key}`);
  for(const key of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])assert.ok(String(lesson.kikiTeaching?.[key]||'').length>10,`${lesson.id} kiki ${key}`);
  for(const key of ['trigger','strategy','masteryEvidence'])assert.ok(String(lesson.remediation?.[key]||'').length>20,`${lesson.id} remediation ${key}`);
  const aa=ch4Assessments.filter(a=>a.lessonId===lesson.id);
  assert.equal(aa.length,5,`${lesson.id} assessment count`);
  assert.deepEqual(new Set(aa.map(a=>a.assessmentType)),new Set(['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']));
  assert.ok(aa.every(a=>a.questionActivity&&a.correctAnswer&&a.hint&&a.explanation));
}
assert.deepEqual(ch4Assessments.map(x=>x.stableAssessmentId),Array.from({length:20},(_,i)=>`KV-CBSE6-SOC-${String(i+56).padStart(4,'0')}`));
assert.equal(rec.decision,'CHAPTER_4_SOURCE_TOPIC_BOUNDARY_RECONCILED');
assert.deepEqual(rec.reconciledTopicBoundary.map(x=>x.topicId),ch4Lessons.map(x=>x.topicId));
const ch4=map.chapters.find(x=>x.chapter===4);
assert.equal(map.schemaVersion,'1.14.0');
assert.equal(ch4.status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(ch4.topicCount,4);
assert.equal(ch4.assessmentCount,20);
assert.equal(ch4.lessonDataset,'data/class6-social-science-pilot.js');
assert.equal(ch4.assessmentDataset,'data/class6-social-science-assessments.js');
assert.equal(ch4.schoolNeedsValidationRequired,true);
assert.equal(ch4.schoolNeedsValidationPresent,true);
assert.equal(ch4.schoolNeedsValidationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH4_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.equal(map.implementationStatus.implementedChapterCount,6);
assert.equal(map.implementationStatus.schoolNeedsValidatedChapterCount,6);
assert.equal(map.implementationStatus.completionClaim,false);

const text=JSON.stringify({lessons:ch4Lessons,assessments:ch4Assessments}).toLowerCase();
for(const forbidden of ['share your home address','upload your home address','share your religion','share your caste','upload your family photo','record your family story','share your ancestry','upload your dna','share your precise migration route'])assert.ok(!text.includes(forbidden),`forbidden Chapter 4 prompt found: ${forbidden}`);
for(const advanced of ['radiocarbon calibration','stratigraphic seriation','ancient dna analysis','genetic haplogroup','palaeoanthropological taxonomy'])assert.ok(!text.includes(advanced),`advanced deferred Chapter 4 topic found: ${advanced}`);
const humanPast=ch4Lessons.find(x=>x.topicId==='TOPIC-SOC6-04-01');
const time=ch4Lessons.find(x=>x.topicId==='TOPIC-SOC6-04-02');
const sources=ch4Lessons.find(x=>x.topicId==='TOPIC-SOC6-04-03');
const early=ch4Lessons.find(x=>x.topicId==='TOPIC-SOC6-04-04');
assert.match(humanPast.content,/evidence|inference|unknown/i);
assert.match(time.kikiTeaching.misconceptionCheck,/800 BCE.*300 BCE|BCE/i);
assert.match(sources.content,/corroborat/i);
assert.match(early.content,/evidence suggests|reasonable interpretation|uncertainty/i);
assert.ok(ch4Assessments.filter(x=>x.assessmentType==='mastery_check').every(x=>/evidence|uncertain|interpret|corrobor|chronolog|supported/i.test(`${x.correctAnswer} ${x.explanation}`)));
console.log(`CLASS6_SOCIAL_SCIENCE_CH4_PASS lessons=${ch4Lessons.length} assessments=${ch4Assessments.length}`);
