import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadArray(path,key){
  const sandbox={window:{[key]:[]}};
  vm.runInNewContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});
  return sandbox.window[key];
}

const allLessons=loadArray('data/class6-social-science-pilot.js','KV_LESSONS');
const allAssessments=loadArray('data/class6-social-science-assessments.js','KV_ASSESSMENTS');
const lessons=allLessons.filter(x=>x.chapter===1);
const lessonIds=new Set(lessons.map(x=>x.id));
const assessments=allAssessments.filter(x=>lessonIds.has(x.lessonId));
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_CURRICULUM_MAPPING_V1.json','utf8'));
const overlay=JSON.parse(fs.readFileSync('docs/class6-pilot/SOCIAL_SCIENCE_PROVENANCE_RIGHTS_SCHOOL_OVERLAY_V1.json','utf8'));
const loader=fs.readFileSync('p0-entry-v1.js','utf8');
const sw=fs.readFileSync('sw-v30.js','utf8');

assert.equal(lessons.length,3);
assert.equal(assessments.length,15);
assert.equal(new Set(lessons.map(x=>x.id)).size,3);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
assert.deepEqual(lessons.map(x=>x.topicId),['TOPIC-SOC6-01-01','TOPIC-SOC6-01-02','TOPIC-SOC6-01-03']);
assert.ok(lessons.every(x=>x.subject==='Social Science'&&x.worldId==='geography'&&x.board==='CBSE'&&x.classLevel===6&&x.chapter===1&&x.chapterTitle==='Locating Places on the Earth'));
assert.ok(lessons.every(x=>x.book==='Exploring Society: India and Beyond'&&x.curriculumSession==='2026-27'));
assert.ok(lessons.every(x=>x.rightsStatus==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_PROSE_OR_EXERCISE_REPRODUCTION'));
assert.ok(lessons.every(x=>x.schoolMappingStatus==='VALIDATION_CONTEXT_ONLY_NO_SCHOOL_PACING_OR_EDITION_CLAIM'));
assert.ok(lessons.every(x=>x.sourceRefs.includes('NCERT-EXPLORING-SOCIETY-G6-2026-27-CH1')));
for(const lesson of lessons){
  for(const key of ['learningObjective','content','workedExample'])assert.ok(String(lesson[key]||'').length>80,`${lesson.id} ${key}`);
  for(const key of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])assert.ok(String(lesson.kikiTeaching?.[key]||'').length>10,`${lesson.id} kiki ${key}`);
  for(const key of ['trigger','strategy','masteryEvidence'])assert.ok(String(lesson.remediation?.[key]||'').length>20,`${lesson.id} remediation ${key}`);
  const aa=assessments.filter(a=>a.lessonId===lesson.id);
  assert.equal(aa.length,5,`${lesson.id} assessment count`);
  assert.deepEqual(new Set(aa.map(a=>a.assessmentType)),new Set(['multiple_choice','reasoning','worked_challenge','short_answer','mastery_check']));
  assert.ok(aa.every(a=>a.questionActivity&&a.correctAnswer&&a.hint&&a.explanation));
}
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:15},(_,i)=>`KV-CBSE6-SOC-${String(i+1).padStart(4,'0')}`));
assert.ok(assessments.every(a=>lessons.some(l=>l.id===a.lessonId)));

const ch1=map.chapters.find(x=>x.chapter===1);
assert.equal(map.schemaVersion,'1.14.0');
assert.equal(ch1.status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(ch1.topicCount,3);assert.equal(ch1.assessmentCount,15);
assert.equal(ch1.schoolNeedsValidationRequired,true);assert.equal(ch1.schoolNeedsValidationPresent,true);
assert.equal(map.implementationStatus.implementedChapterCount,7);
assert.equal(map.implementationStatus.schoolNeedsValidatedChapterCount,6);
assert.equal(map.implementationStatus.completionClaim,false);
assert.equal(overlay.decision,'SOCIAL_SCIENCE_PROVENANCE_RIGHTS_SCHOOL_OVERLAY_RECONCILED');
assert.ok(overlay.rightsSafeAuthoringBoundary.mustBeIndependentlyAuthored.includes('assessment items'));
assert.equal(overlay.schoolValidationOverlay.status,'VALIDATION_CONTEXT_ONLY');
assert.equal(overlay.schoolValidationOverlay.realChildDataCollected,false);

assert.match(loader,/CBSE6-SOC-CH7-1/);
assert.match(loader,/class6-social-science-pilot\.js/);
assert.match(loader,/class6-social-science-assessments\.js/);
assert.match(loader,/class6-social-science-ch5\.js/);
assert.match(loader,/class6-social-science-ch5-assessments\.js/);
assert.match(loader,/class6-social-science-ch6\.js/);
assert.match(loader,/class6-social-science-ch6-assessments\.js/);
assert.match(loader,/class6-social-science-ch7\.js/);
assert.match(loader,/class6-social-science-ch7-assessments\.js/);
assert.match(loader,/p==='\/world\/geography'/);
assert.match(loader,/ch\(\?:1\|2\|3\|4\|5\|6\|7\)/);
assert.ok(!/loadCurriculumPilot\(\{datasetKey:'class6SocialSciencePilot'[^\n]*\}\);\s*loadPilotMetrics/.test(loader),'Social Science must not be converted into an unconditional startup request');
assert.match(sw,/MANUS-VISUAL-MASTER-05-PWA-46/);
assert.match(sw,/\/data\/class6-social-science-pilot\.js/);
assert.match(sw,/\/data\/class6-social-science-assessments\.js/);
assert.match(sw,/\/data\/class6-social-science-ch5\.js/);
assert.match(sw,/\/data\/class6-social-science-ch5-assessments\.js/);
assert.match(sw,/\/data\/class6-social-science-ch6\.js/);
assert.match(sw,/\/data\/class6-social-science-ch6-assessments\.js/);
assert.match(sw,/\/data\/class6-social-science-ch7\.js/);
assert.match(sw,/\/data\/class6-social-science-ch7-assessments\.js/);

const joined=JSON.stringify({lessons,assessments}).toLowerCase();
for(const forbidden of ['share your home address','upload your precise location','share your precise coordinates','collect real child data'])assert.ok(!joined.includes(forbidden),`forbidden learner-data prompt: ${forbidden}`);
console.log('Class 6 Social Science Chapter 1: PASS');
