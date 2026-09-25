import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadArray(path,key){const sandbox={window:{[key]:[]}};vm.runInNewContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});return sandbox.window[key];}
const lessons=loadArray('data/class6-social-science-ch9.js','KV_LESSONS');
const assessments=loadArray('data/class6-social-science-ch9-assessments.js','KV_ASSESSMENTS');
const rec=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CH9_SOURCE_TOPIC_RECONCILIATION_V1.json','utf8'));
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json','utf8'));

assert.equal(lessons.length,4);assert.equal(assessments.length,20);
assert.equal(new Set(lessons.map(x=>x.id)).size,4);assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,20);
assert.deepEqual(lessons.map(x=>x.topicId),['TOPIC-SOC6-09-01','TOPIC-SOC6-09-02','TOPIC-SOC6-09-03','TOPIC-SOC6-09-04']);
assert.ok(lessons.every(x=>x.subject==='Social Science'&&x.worldId==='geography'&&x.board==='CBSE'&&x.classLevel===6&&x.chapter===9&&x.chapterTitle==='Family and Community'));
assert.ok(lessons.every(x=>x.book==='Exploring Society: India and Beyond'&&x.curriculumSession==='2026-27'));
assert.ok(lessons.every(x=>x.rightsStatus==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_PROSE_OR_EXERCISE_REPRODUCTION'));
assert.ok(lessons.every(x=>x.schoolMappingStatus==='VALIDATION_CONTEXT_ONLY_NO_SCHOOL_PACING_OR_EDITION_CLAIM'));
assert.ok(lessons.every(x=>x.sourceRefs.includes('KVS-CBSE6-SOC-CH9-SOURCE-TOPIC-V1')));
for(const lesson of lessons){
  for(const key of ['learningObjective','content','workedExample'])assert.ok(String(lesson[key]||'').length>80,`${lesson.id} ${key}`);
  for(const key of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])assert.ok(String(lesson.kikiTeaching?.[key]||'').length>10,`${lesson.id} kiki ${key}`);
  for(const key of ['trigger','strategy','masteryEvidence'])assert.ok(String(lesson.remediation?.[key]||'').length>20,`${lesson.id} remediation ${key}`);
  const aa=assessments.filter(a=>a.lessonId===lesson.id);assert.equal(aa.length,5,`${lesson.id} assessment count`);
  assert.deepEqual(new Set(aa.map(a=>a.assessmentType)),new Set(['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']));
  assert.ok(aa.every(a=>a.questionActivity&&a.correctAnswer&&a.hint&&a.explanation));
}
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:20},(_,i)=>`KV-CBSE6-SOC-${String(i+156).padStart(4,'0')}`));
assert.equal(rec.decision,'CHAPTER_9_SOURCE_TOPIC_BOUNDARY_RECONCILED');
assert.deepEqual(rec.reconciledTopicBoundary.map(x=>x.topicId),lessons.map(x=>x.topicId));

const ch9=map.chapters.find(x=>x.chapter===9);
assert.equal(ch9.status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(ch9.topicCount,4);
assert.equal(ch9.lessonDataset,'data/class6-social-science-ch9.js');
assert.equal(ch9.assessmentDataset,'data/class6-social-science-ch9-assessments.js');
assert.equal(ch9.assessmentCount,20);
assert.equal(ch9.schoolNeedsValidationRequired,true);
assert.equal(ch9.schoolNeedsValidationPresent,false);
assert.equal(map.implementationStatus.implementedChapterCount,9);
assert.equal(map.implementationStatus.schoolNeedsValidatedChapterCount,8);
assert.equal(map.implementationStatus.completionClaim,false);

const text=JSON.stringify({lessons,assessments}).toLowerCase();
for(const required of ['family','household','care','responsib','community','cooperation','fair','evidence','privacy','fictional'])assert.ok(text.includes(required),`missing Chapter 9 teaching boundary: ${required}`);
for(const forbidden of ['share your religion','share your caste','share your sect','share your tribe','share your income','share your address','share your political','prove your patriotism','family is superior','normal family','you must vote','you must pray','you must worship','you must convert'])assert.ok(!text.includes(forbidden),`forbidden Chapter 9 learner prompt/claim: ${forbidden}`);
const forms=lessons.find(x=>x.topicId==='TOPIC-SOC6-09-01');assert.match(forms.content,/family|household|arrangement|care/i);assert.match(`${forms.content} ${forms.kikiTeaching.misconceptionCheck}`,/not.*superior|not.*normal|different|var/i);
const roles=lessons.find(x=>x.topicId==='TOPIC-SOC6-09-02');assert.match(roles.content,/role|responsib|care|support|fair/i);assert.match(`${roles.content} ${roles.kikiTeaching.misconceptionCheck}`,/gender|identity|stereotyp|circumstance/i);
const community=lessons.find(x=>x.topicId==='TOPIC-SOC6-09-03');assert.match(community.content,/community|network|place|institution|connection/i);assert.match(`${community.content} ${community.kikiTeaching.misconceptionCheck}`,/relig|caste|language|politic|identity|infer/i);
const cooperation=lessons.find(x=>x.topicId==='TOPIC-SOC6-09-04');assert.match(cooperation.content,/cooper|rule|particip|disagree|fair/i);assert.match(`${cooperation.content} ${cooperation.kikiTeaching.misconceptionCheck}`,/conform|agreement|loyal|disagree|identity/i);
assert.ok(assessments.filter(x=>x.assessmentType==='mastery_check').every(x=>/evidence|fair|assumption|privacy|identity|review|ranking|stereotype|access|disagreement/i.test(`${x.correctAnswer} ${x.explanation}`)));

const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/kirthiverse-preview-v48/);assert.match(sw,/MANUS-VISUAL-MASTER-05-PWA-48/);
assert.ok(sw.includes("'/data/class6-social-science-ch9.js'"));assert.ok(sw.includes("'/data/class6-social-science-ch9-assessments.js'"));
const entry=fs.readFileSync('p0-entry-v1.js','utf8');
assert.ok(entry.includes("['class6-social-science-ch9-lessons','data/class6-social-science-ch9.js']"));
assert.ok(entry.includes("['class6-social-science-ch9-assessments','data/class6-social-science-ch9-assessments.js']"));
assert.match(entry,/CBSE6-SOC-CH9-1/);assert.match(entry,/ch\(\?:1\|2\|3\|4\|5\|6\|7\|8\|9\)/);
console.log(`CLASS6_SOCIAL_SCIENCE_CH9_PASS lessons=${lessons.length} assessments=${assessments.length} schoolNeeds=pending pwa=v48`);
