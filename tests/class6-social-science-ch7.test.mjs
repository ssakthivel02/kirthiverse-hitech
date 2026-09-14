import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadArray(path,key){const sandbox={window:{[key]:[]}};vm.runInNewContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});return sandbox.window[key];}
const lessons=loadArray('data/class6-social-science-ch7.js','KV_LESSONS');
const assessments=loadArray('data/class6-social-science-ch7-assessments.js','KV_ASSESSMENTS');
const rec=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CH7_SOURCE_TOPIC_RECONCILIATION_V1.json','utf8'));

assert.equal(lessons.length,4);assert.equal(assessments.length,20);
assert.equal(new Set(lessons.map(x=>x.id)).size,4);assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,20);
assert.deepEqual(lessons.map(x=>x.topicId),['TOPIC-SOC6-07-01','TOPIC-SOC6-07-02','TOPIC-SOC6-07-03','TOPIC-SOC6-07-04']);
assert.ok(lessons.every(x=>x.subject==='Social Science'&&x.worldId==='geography'&&x.board==='CBSE'&&x.classLevel===6&&x.chapter===7&&x.chapterTitle==='India’s Cultural Roots'));
assert.ok(lessons.every(x=>x.book==='Exploring Society: India and Beyond'&&x.curriculumSession==='2026-27'));
assert.ok(lessons.every(x=>x.rightsStatus==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_PROSE_OR_EXERCISE_REPRODUCTION'));
assert.ok(lessons.every(x=>x.schoolMappingStatus==='VALIDATION_CONTEXT_ONLY_NO_SCHOOL_PACING_OR_EDITION_CLAIM'));
assert.ok(lessons.every(x=>x.sourceRefs.includes('KVS-CBSE6-SOC-CH7-SOURCE-TOPIC-V1')));
for(const lesson of lessons){
  for(const key of ['learningObjective','content','workedExample'])assert.ok(String(lesson[key]||'').length>80,`${lesson.id} ${key}`);
  for(const key of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])assert.ok(String(lesson.kikiTeaching?.[key]||'').length>10,`${lesson.id} kiki ${key}`);
  for(const key of ['trigger','strategy','masteryEvidence'])assert.ok(String(lesson.remediation?.[key]||'').length>20,`${lesson.id} remediation ${key}`);
  const aa=assessments.filter(a=>a.lessonId===lesson.id);assert.equal(aa.length,5,`${lesson.id} assessment count`);
  assert.deepEqual(new Set(aa.map(a=>a.assessmentType)),new Set(['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']));
  assert.ok(aa.every(a=>a.questionActivity&&a.correctAnswer&&a.hint&&a.explanation));
}
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:20},(_,i)=>`KV-CBSE6-SOC-${String(i+116).padStart(4,'0')}`));
assert.equal(rec.decision,'CHAPTER_7_SOURCE_TOPIC_BOUNDARY_RECONCILED');
assert.deepEqual(rec.reconciledTopicBoundary.map(x=>x.topicId),lessons.map(x=>x.topicId));

const text=JSON.stringify({lessons,assessments}).toLowerCase();
for(const required of ['vedas','oral','upanishad','vedanta','yoga','charvaka','buddhism','jainism','folk','tribal','evidence','context','variation'])assert.ok(text.includes(required),`missing Chapter 7 teaching boundary: ${required}`);
for(const forbidden of ['share your religion','share your caste','share your sect','share your tribe','share your ancestry','share your political preference','prove your faith','prove your patriotism','our religion is superior','tribal people are primitive','folk traditions are inferior','you must chant','you must pray','you must worship','you must convert'])assert.ok(!text.includes(forbidden),`forbidden Chapter 7 learner prompt/claim: ${forbidden}`);
const veda=lessons.find(x=>x.topicId==='TOPIC-SOC6-07-01');assert.match(veda.content,/histor|oral|source|belief/i);assert.match(veda.kikiTeaching.misconceptionCheck,/does not require|does not mean|not require|not.*pract/i);
const schools=lessons.find(x=>x.topicId==='TOPIC-SOC6-07-02');assert.match(schools.content,/upanishad|vedant|yoga|charvaka/i);assert.match(schools.content,/divers|disagree|sceptic/i);
const traditions=lessons.find(x=>x.topicId==='TOPIC-SOC6-07-03');assert.match(traditions.content,/buddhism|jainism|distinct|histor/i);assert.match(traditions.kikiTeaching.misconceptionCheck,/not interchangeable|neither promote nor criticise/i);
const plural=lessons.find(x=>x.topicId==='TOPIC-SOC6-07-04');assert.match(plural.content,/folk|tribal|local|variation|change/i);assert.match(plural.kikiTeaching.misconceptionCheck,/does not mean primitive|not mean primitive/i);
assert.ok(assessments.filter(x=>x.assessmentType==='mastery_check').every(x=>/evidence|context|uncert|limit|variation|belief|ranking|distinct/i.test(`${x.correctAnswer} ${x.explanation}`)));
console.log(`CLASS6_SOCIAL_SCIENCE_CH7_PASS lessons=${lessons.length} assessments=${assessments.length} schoolNeeds=pending`);
