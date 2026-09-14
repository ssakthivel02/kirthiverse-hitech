import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadArray(path,key){const sandbox={window:{[key]:[]}};vm.runInNewContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});return sandbox.window[key];}
const lessons=loadArray('data/class6-social-science-pilot.js','KV_LESSONS');
const assessments=loadArray('data/class6-social-science-assessments.js','KV_ASSESSMENTS');
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json','utf8'));
const rec=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CH3_SOURCE_TOPIC_RECONCILIATION_V1.json','utf8'));
const ch3Lessons=lessons.filter(x=>x.chapter===3);
const ch3LessonIds=new Set(ch3Lessons.map(x=>x.id));
const ch3Assessments=assessments.filter(x=>ch3LessonIds.has(x.lessonId));

assert.equal(ch3Lessons.length,4);
assert.equal(ch3Assessments.length,20);
assert.equal(new Set(ch3Lessons.map(x=>x.id)).size,4);
assert.equal(new Set(ch3Assessments.map(x=>x.stableAssessmentId)).size,20);
assert.deepEqual(ch3Lessons.map(x=>x.topicId),['TOPIC-SOC6-03-01','TOPIC-SOC6-03-02','TOPIC-SOC6-03-03','TOPIC-SOC6-03-04']);
assert.ok(ch3Lessons.every(x=>x.subject==='Social Science'&&x.worldId==='geography'&&x.board==='CBSE'&&x.classLevel===6&&x.chapter===3&&x.chapterTitle==='Landforms and Life'));
assert.ok(ch3Lessons.every(x=>x.book==='Exploring Society: India and Beyond'&&x.curriculumSession==='2026-27'));
assert.ok(ch3Lessons.every(x=>x.rightsStatus==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_PROSE_OR_EXERCISE_REPRODUCTION'));
assert.ok(ch3Lessons.every(x=>x.schoolMappingStatus==='VALIDATION_CONTEXT_ONLY_NO_SCHOOL_PACING_OR_EDITION_CLAIM'));
assert.ok(ch3Lessons.every(x=>x.sourceRefs.includes('KVS-CBSE6-SOC-CH3-SOURCE-TOPIC-V1')));
for(const lesson of ch3Lessons){
  for(const key of ['learningObjective','content','workedExample'])assert.ok(String(lesson[key]||'').length>80,`${lesson.id} ${key}`);
  for(const key of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])assert.ok(String(lesson.kikiTeaching?.[key]||'').length>10,`${lesson.id} kiki ${key}`);
  for(const key of ['trigger','strategy','masteryEvidence'])assert.ok(String(lesson.remediation?.[key]||'').length>20,`${lesson.id} remediation ${key}`);
  const aa=ch3Assessments.filter(a=>a.lessonId===lesson.id);
  assert.equal(aa.length,5,`${lesson.id} assessment count`);
  assert.deepEqual(new Set(aa.map(a=>a.assessmentType)),new Set(['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']));
  assert.ok(aa.every(a=>a.questionActivity&&a.correctAnswer&&a.hint&&a.explanation));
}
assert.deepEqual(ch3Assessments.map(x=>x.stableAssessmentId),Array.from({length:20},(_,i)=>`KV-CBSE6-SOC-${String(i+36).padStart(4,'0')}`));
assert.equal(rec.decision,'CHAPTER_3_SOURCE_TOPIC_BOUNDARY_RECONCILED');
assert.deepEqual(rec.reconciledTopicBoundary.map(x=>x.topicId),ch3Lessons.map(x=>x.topicId));
const ch3=map.chapters.find(x=>x.chapter===3);
assert.equal(map.schemaVersion,'1.10.0');
assert.equal(ch3.status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(ch3.topicCount,4);
assert.equal(ch3.assessmentCount,20);
assert.equal(ch3.lessonDataset,'data/class6-social-science-pilot.js');
assert.equal(ch3.assessmentDataset,'data/class6-social-science-assessments.js');
assert.equal(ch3.schoolNeedsValidationRequired,true);
assert.equal(ch3.schoolNeedsValidationPresent,true);
assert.equal(ch3.schoolNeedsValidationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH3_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.equal(map.implementationStatus.implementedChapterCount,4);
assert.equal(map.implementationStatus.schoolNeedsValidatedChapterCount,3);
assert.equal(map.implementationStatus.completionClaim,false);
const text=JSON.stringify({lessons:ch3Lessons,assessments:ch3Assessments}).toLowerCase();
for(const forbidden of ['share your home address','upload your precise location','share your precise coordinates','live gps','plate tectonics cycle','advanced geomorphology'])assert.ok(!text.includes(forbidden),`forbidden Chapter 3 boundary found: ${forbidden}`);
const mountains=ch3Lessons.find(x=>x.topicId==='TOPIC-SOC6-03-02');
const plateaus=ch3Lessons.find(x=>x.topicId==='TOPIC-SOC6-03-03');
const plains=ch3Lessons.find(x=>x.topicId==='TOPIC-SOC6-03-04');
assert.match(mountains.content,/possibilities, not rules/i);
assert.match(mountains.kikiTeaching.misconceptionCheck,/does not determine/i);
assert.match(plateaus.kikiTeaching.misconceptionCheck,/not every plateau/i);
assert.match(plains.kikiTeaching.misconceptionCheck,/not always fertile/i);
assert.ok(ch3Assessments.filter(x=>x.assessmentType==='mastery_check').every(x=>/vary|must|evidence|conditional|balance|multiple/i.test(`${x.correctAnswer} ${x.explanation}`)));
console.log(`CLASS6_SOCIAL_SCIENCE_CH3_PASS lessons=${ch3Lessons.length} assessments=${ch3Assessments.length}`);
