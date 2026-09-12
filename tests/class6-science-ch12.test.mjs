import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'science.cbse6.curiosity.ch12.stars-constellations-night-sky.v1',
  'science.cbse6.curiosity.ch12.solar-system.v1',
  'science.cbse6.curiosity.ch12.milky-way-universe-scale.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.10.0');
assert.equal(map.chapters.length,12);
assert.equal(map.chapters[11].title,'Beyond Earth');
assert.equal(map.chapters[11].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter12Topics.length,3);
assert.ok(map.chapter12Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.ok(map.chapter12Topics.every(x=>Array.isArray(x.competencies)&&x.competencies.length>=3));
assert.ok(map.chapter12Topics.every(x=>Array.isArray(x.misconceptions)&&x.misconceptions.length>=3));
assert.ok(map.chapter12Topics.every(x=>Array.isArray(x.safetyBoundary)&&x.safetyBoundary.length>=3));
assert.equal(map.chapter12CompletionEvidence.lessonCount,3);
assert.equal(map.chapter12CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter12CompletionEvidence.astronomyObservationSafetyRequired,true);
assert.equal(map.chapter12CompletionEvidence.modelScaleBoundaryRequired,true);
assert.equal(map.chapter12CompletionEvidence.extraterrestrialClaimBoundaryRequired,true);
assert.equal(map.chapter12CompletionEvidence.status,'CHAPTER12_KIKI_TEACHING_SLICE_COMPLETE');
assert.match(map.chapter12CompletionRule,/no-direct-Sun-viewing/i);
assert.match(map.chapter12CompletionRule,/no-laser/i);
assert.match(map.chapter12CompletionRule,/model-scale/i);
assert.match(map.completionRule,/all twelve/i);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch12.js','utf8'),sandbox,{filename:'class6-science-ch12.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch12-assessments.js','utf8'),sandbox,{filename:'class6-science-ch12-assessments.js'});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
assert.equal(lessons.length,3);
assert.deepEqual([...lessons.map(x=>x.id)].sort(),[...lessonIds].sort());
assert.equal(new Set(lessons.map(x=>x.topicId)).size,3);
for(const lesson of lessons){
  assert.equal(lesson.subject,'Science');
  assert.equal(lesson.board,'CBSE');
  assert.equal(lesson.classLevel,6);
  assert.equal(lesson.book,'Curiosity');
  assert.equal(lesson.chapter,12);
  assert.equal(lesson.ageBand,'11-13');
  assert.ok(lesson.learningObjective.length>60);
  assert.ok(lesson.content.length>650);
  assert.ok(lesson.workedExample.length>180);
  assert.ok(Array.isArray(lesson.sourceRefs)&&lesson.sourceRefs.length>=2);
  assert.match(lesson.rightsStatus,/ORIGINAL/);
  for(const field of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt']) assert.ok(lesson.kikiTeaching?.[field],`${lesson.id} missing Kiki ${field}`);
  for(const field of ['trigger','strategy','masteryEvidence']) assert.ok(lesson.remediation?.[field],`${lesson.id} missing remediation ${field}`);
}
assert.equal(assessments.length,15);
assert.equal(new Set(assessments.map(x=>x.stableAssessmentId)).size,15);
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:15},(_,i)=>`KV-CBSE6-SCI-${String(i+166).padStart(4,'0')}`));
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} needs exactly five assessments`);
  assert.ok(attached.some(x=>x.assessmentType==='reasoning'));
  assert.ok(attached.some(x=>x.assessmentType==='mastery_check'));
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter12Topics}).toLowerCase();
const instructionalText=JSON.stringify({lessons,map:map.chapter12Topics}).toLowerCase();
for(const required of ['star','constellation','polaris','solar system','sun','planet','natural satellite','asteroid','comet','milky way','galaxy','universe']) assert.ok(allText.includes(required),`missing Chapter 12 concept: ${required}`);
for(const required of ['different distances','reflected sunlight','scale','unidentified','alien']) assert.ok(allText.includes(required),`missing Chapter 12 claim boundary: ${required}`);
assert.ok(allText.includes('no direct sun viewing')||allText.includes('never look directly at the sun'));
assert.ok(allText.includes('no laser')||(allText.includes('never')&&allText.includes('laser')));
assert.ok(allText.includes('rooftop')||allText.includes('rooftops'));
assert.ok(allText.includes('roadside')||allText.includes('roads'));
assert.ok(allText.includes('unsupervised'));
const unsafePositiveDirectives=[
  /(?:you should|learners should|students should|try to) look directly at the sun/,
  /(?:you should|learners should|students should|try to) point (?:a|the) laser (?:at|toward) (?:an )?aircraft/,
  /(?:you should|learners should|students should|try to) climb (?:onto|on) (?:a|the) roof/,
  /(?:you should|learners should|students should|try to) travel alone at night/,
  /(?:you should|learners should|students should|try to) use binoculars to look at the sun/,
  /(?:you should|learners should|students should|try to) focus sunlight onto (?:your|their) skin/,
];
for(const unsafePattern of unsafePositiveDirectives) assert.ok(!unsafePattern.test(instructionalText),`unsafe astronomy directive detected: ${unsafePattern}`);
assert.ok(!/(?:kiki|we|learners|students) (?:should|can|must) (?:claim|conclude|state) (?:that )?(?:an )?unidentified light (?:proves|confirms) alien life/.test(instructionalText),'unsupported extraterrestrial-life endorsement detected');

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-science-ch12.js','data/class6-science-ch12-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.match(entry,/datasetKey:'class6SciencePilot'/);
assert.match(entry,/CBSE6-SCI-CH12-1/);
assert.match(entry,/ch\(\?:2\|3\|4\|5\|6\|7\|8\|9\|10\|11\|12\)/);
const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/CACHE='kirthiverse-preview-v45'/);
for(const asset of ['/data/class6-science-ch12.js','/data/class6-science-ch12-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_SCIENCE_CH12_PASS topics=${map.chapter12Topics.length} lessons=${lessons.length} assessments=${assessments.length} astronomySafety=${map.chapter12CompletionEvidence.astronomyObservationSafetyRequired}`);
