import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadArray(path,key){const sandbox={window:{[key]:[]}};vm.runInNewContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});return sandbox.window[key];}
const lessons=loadArray('data/class6-social-science-ch8.js','KV_LESSONS');
const assessments=loadArray('data/class6-social-science-ch8-assessments.js','KV_ASSESSMENTS');
const rec=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CH8_SOURCE_TOPIC_RECONCILIATION_V1.json','utf8'));
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json','utf8'));

assert.equal(lessons.length,4);assert.equal(assessments.length,20);
assert.equal(new Set(lessons.map(x=>x.id)).size,4);assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,20);
assert.deepEqual(lessons.map(x=>x.topicId),['TOPIC-SOC6-08-01','TOPIC-SOC6-08-02','TOPIC-SOC6-08-03','TOPIC-SOC6-08-04']);
assert.ok(lessons.every(x=>x.subject==='Social Science'&&x.worldId==='geography'&&x.board==='CBSE'&&x.classLevel===6&&x.chapter===8&&x.chapterTitle==='Unity in Diversity, or ‘Many in the One’'));
assert.ok(lessons.every(x=>x.book==='Exploring Society: India and Beyond'&&x.curriculumSession==='2026-27'));
assert.ok(lessons.every(x=>x.rightsStatus==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_PROSE_OR_EXERCISE_REPRODUCTION'));
assert.ok(lessons.every(x=>x.schoolMappingStatus==='VALIDATION_CONTEXT_ONLY_NO_SCHOOL_PACING_OR_EDITION_CLAIM'));
assert.ok(lessons.every(x=>x.sourceRefs.includes('KVS-CBSE6-SOC-CH8-SOURCE-TOPIC-V1')));
for(const lesson of lessons){
  for(const key of ['learningObjective','content','workedExample'])assert.ok(String(lesson[key]||'').length>80,`${lesson.id} ${key}`);
  for(const key of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])assert.ok(String(lesson.kikiTeaching?.[key]||'').length>10,`${lesson.id} kiki ${key}`);
  for(const key of ['trigger','strategy','masteryEvidence'])assert.ok(String(lesson.remediation?.[key]||'').length>20,`${lesson.id} remediation ${key}`);
  const aa=assessments.filter(a=>a.lessonId===lesson.id);assert.equal(aa.length,5,`${lesson.id} assessment count`);
  assert.deepEqual(new Set(aa.map(a=>a.assessmentType)),new Set(['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']));
  assert.ok(aa.every(a=>a.questionActivity&&a.correctAnswer&&a.hint&&a.explanation));
}
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:20},(_,i)=>`KV-CBSE6-SOC-${String(i+136).padStart(4,'0')}`));
assert.equal(rec.decision,'CHAPTER_8_SOURCE_TOPIC_BOUNDARY_RECONCILED');
assert.deepEqual(rec.reconciledTopicBoundary.map(x=>x.topicId),lessons.map(x=>x.topicId));

const ch8=map.chapters.find(x=>x.chapter===8);
assert.equal(ch8.status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(ch8.topicCount,4);
assert.equal(ch8.lessonDataset,'data/class6-social-science-ch8.js');
assert.equal(ch8.assessmentDataset,'data/class6-social-science-ch8-assessments.js');
assert.equal(ch8.assessmentCount,20);
assert.equal(ch8.schoolNeedsValidationRequired,true);
assert.equal(ch8.schoolNeedsValidationPresent,true);
assert.equal(ch8.schoolNeedsValidationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH8_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.equal(map.implementationStatus.implementedChapterCount,8);
assert.equal(map.implementationStatus.schoolNeedsValidatedChapterCount,8);
assert.equal(map.implementationStatus.completionClaim,false);

const text=JSON.stringify({lessons,assessments}).toLowerCase();
for(const required of ['diversity','variation','food','textile','festival','story','epic','adaptation','evidence','context'])assert.ok(text.includes(required),`missing Chapter 8 teaching boundary: ${required}`);
for(const forbidden of ['share your religion','share your caste','share your sect','share your tribe','share your ancestry','share your home language','share your political preference','prove your patriotism','our culture is superior','you must chant','you must pray','you must worship','you must convert'])assert.ok(!text.includes(forbidden),`forbidden Chapter 8 learner prompt/claim: ${forbidden}`);
const diversity=lessons.find(x=>x.topicId==='TOPIC-SOC6-08-01');assert.match(diversity.content,/divers|unity|variation|evidence/i);assert.match(diversity.kikiTeaching.misconceptionCheck,/does not mean|not mean|does not require/i);
const food=lessons.find(x=>x.topicId==='TOPIC-SOC6-08-02');assert.match(food.content,/food|cotton|textile|variation/i);assert.match(food.content,/authentic|rank|standard/i);
const festivals=lessons.find(x=>x.topicId==='TOPIC-SOC6-08-03');assert.match(festivals.content,/festival|season|region|relig/i);assert.match(festivals.content,/does not require|without asking|rather than asking/i);
const stories=lessons.find(x=>x.topicId==='TOPIC-SOC6-08-04');assert.match(stories.content,/ramayana|mahabharata|panchatantra|adapt/i);assert.match(stories.content,/not evidence of corruption|not.*inferior|not.*authentic/i);
assert.ok(assessments.filter(x=>x.assessmentType==='mastery_check').every(x=>/evidence|limit|variation|ranking|uniform|adapt|continuity|change/i.test(`${x.correctAnswer} ${x.explanation}`)));
console.log(`CLASS6_SOCIAL_SCIENCE_CH8_PASS lessons=${lessons.length} assessments=${assessments.length} schoolNeeds=validated`);
