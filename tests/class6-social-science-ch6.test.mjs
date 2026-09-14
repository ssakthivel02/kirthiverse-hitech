import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadArray(path,key){const sandbox={window:{[key]:[]}};vm.runInNewContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});return sandbox.window[key];}
const lessons=loadArray('data/class6-social-science-ch6.js','KV_LESSONS');
const assessments=loadArray('data/class6-social-science-ch6-assessments.js','KV_ASSESSMENTS');
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json','utf8'));
const rec=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CH6_SOURCE_TOPIC_RECONCILIATION_V1.json','utf8'));
const loader=fs.readFileSync('p0-entry-v1.js','utf8');
const sw=fs.readFileSync('sw-v30.js','utf8');

assert.equal(lessons.length,4);assert.equal(assessments.length,20);
assert.equal(new Set(lessons.map(x=>x.id)).size,4);assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,20);
assert.deepEqual(lessons.map(x=>x.topicId),['TOPIC-SOC6-06-01','TOPIC-SOC6-06-02','TOPIC-SOC6-06-03','TOPIC-SOC6-06-04']);
assert.ok(lessons.every(x=>x.subject==='Social Science'&&x.worldId==='geography'&&x.board==='CBSE'&&x.classLevel===6&&x.chapter===6&&x.chapterTitle==='The Beginnings of Indian Civilisation'));
assert.ok(lessons.every(x=>x.book==='Exploring Society: India and Beyond'&&x.curriculumSession==='2026-27'));
assert.ok(lessons.every(x=>x.rightsStatus==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_PROSE_OR_EXERCISE_REPRODUCTION'));
assert.ok(lessons.every(x=>x.schoolMappingStatus==='VALIDATION_CONTEXT_ONLY_NO_SCHOOL_PACING_OR_EDITION_CLAIM'));
assert.ok(lessons.every(x=>x.sourceRefs.includes('KVS-CBSE6-SOC-CH6-SOURCE-TOPIC-V1')));
for(const lesson of lessons){
  for(const key of ['learningObjective','content','workedExample'])assert.ok(String(lesson[key]||'').length>80,`${lesson.id} ${key}`);
  for(const key of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])assert.ok(String(lesson.kikiTeaching?.[key]||'').length>10,`${lesson.id} kiki ${key}`);
  for(const key of ['trigger','strategy','masteryEvidence'])assert.ok(String(lesson.remediation?.[key]||'').length>20,`${lesson.id} remediation ${key}`);
  const aa=assessments.filter(a=>a.lessonId===lesson.id);assert.equal(aa.length,5,`${lesson.id} assessment count`);
  assert.deepEqual(new Set(aa.map(a=>a.assessmentType)),new Set(['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']));
  assert.ok(aa.every(a=>a.questionActivity&&a.correctAnswer&&a.hint&&a.explanation));
}
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:20},(_,i)=>`KV-CBSE6-SOC-${String(i+96).padStart(4,'0')}`));
assert.equal(rec.decision,'CHAPTER_6_SOURCE_TOPIC_BOUNDARY_RECONCILED');
assert.deepEqual(rec.reconciledTopicBoundary.map(x=>x.topicId),lessons.map(x=>x.topicId));
const ch6=map.chapters.find(x=>x.chapter===6);
assert.equal(map.schemaVersion,'1.14.0');assert.equal(ch6.status,'KIKI_TEACHING_SLICE_COMPLETE');assert.equal(ch6.topicCount,4);assert.equal(ch6.assessmentCount,20);
assert.equal(ch6.lessonDataset,'data/class6-social-science-ch6.js');assert.equal(ch6.assessmentDataset,'data/class6-social-science-ch6-assessments.js');
assert.equal(ch6.schoolNeedsValidationRequired,true);assert.equal(ch6.schoolNeedsValidationPresent,true);assert.equal(ch6.schoolNeedsValidationArtifact,'docs/class6-pilot/SOCIAL_SCIENCE_CH6_SCHOOL_NEEDS_VALIDATION_V1.json');
assert.equal(map.implementationStatus.implementedChapterCount,6);assert.equal(map.implementationStatus.schoolNeedsValidatedChapterCount,6);assert.equal(map.implementationStatus.completionClaim,false);
assert.match(loader,/data\/class6-social-science-ch6\.js/);assert.match(loader,/data\/class6-social-science-ch6-assessments\.js/);assert.match(loader,/ch\(\?:1\|2\|3\|4\|5\|6\)/);assert.match(loader,/CBSE6-SOC-CH6-1/);
assert.match(sw,/kirthiverse-preview-v45/);assert.match(sw,/data\/class6-social-science-ch6\.js/);assert.match(sw,/data\/class6-social-science-ch6-assessments\.js/);
const text=JSON.stringify({lessons,assessments}).toLowerCase();
for(const forbidden of ['share your religion','share your caste','share your ancestry','share your political preference','prove your patriotism','our civilisation was superior','harappan script has been deciphered','one invasion certainly ended'])assert.ok(!text.includes(forbidden),`forbidden Chapter 6 learner prompt/claim: ${forbidden}`);
for(const required of ['evidence','uncertainty','archaeolog','harappan','drain','water','craft','exchange','undeciphered','multiple'])assert.ok(text.includes(required),`missing Chapter 6 teaching boundary: ${required}`);
assert.match(lessons.find(x=>x.topicId==='TOPIC-SOC6-06-01').content,/model|evidence|ranking|superior/i);
assert.match(lessons.find(x=>x.topicId==='TOPIC-SOC6-06-02').content,/settlement|drain|well|interpret/i);
assert.match(lessons.find(x=>x.topicId==='TOPIC-SOC6-06-03').content,/craft|raw materials|exchange|water/i);
assert.match(lessons.find(x=>x.topicId==='TOPIC-SOC6-06-04').content,/multiple|river|undeciphered|uncertainty/i);
assert.ok(assessments.filter(x=>x.assessmentType==='mastery_check').every(x=>/evidence|uncertain|inference|clue|support|identity|cause/i.test(`${x.correctAnswer} ${x.explanation}`)));
console.log(`CLASS6_SOCIAL_SCIENCE_CH6_PASS lessons=${lessons.length} assessments=${assessments.length} schoolNeeds=validated`);
