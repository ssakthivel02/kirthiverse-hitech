import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'science.cbse6.curiosity.ch10.living-characteristics-evidence.v1',
  'science.cbse6.curiosity.ch10.germination-plant-growth.v1',
  'science.cbse6.curiosity.ch10.life-cycles.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.9.0');
assert.equal(map.chapters.length,12);
assert.equal(map.chapters[9].title,'Living Creatures: Exploring their Characteristics');
assert.equal(map.chapters[9].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter10Topics.length,3);
assert.ok(map.chapter10Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.ok(map.chapter10Topics.every(x=>Array.isArray(x.competencies)&&x.competencies.length>=3));
assert.ok(map.chapter10Topics.every(x=>Array.isArray(x.misconceptions)&&x.misconceptions.length>=3));
assert.ok(map.chapter10Topics.every(x=>Array.isArray(x.safetyBoundary)&&x.safetyBoundary.length>=3));
assert.equal(map.chapter10CompletionEvidence.lessonCount,3);
assert.equal(map.chapter10CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter10CompletionEvidence.organismWelfareRequired,true);
assert.equal(map.chapter10CompletionEvidence.singleCharacteristicClaimBoundaryRequired,true);
assert.equal(map.chapter10CompletionEvidence.status,'CHAPTER10_KIKI_TEACHING_SLICE_COMPLETE');
assert.match(map.chapter10CompletionRule,/life cycle/i);
assert.match(map.chapter10CompletionRule,/organism-welfare/i);
assert.match(map.completionRule,/all twelve/i);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch10.js','utf8'),sandbox,{filename:'class6-science-ch10.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch10-assessments.js','utf8'),sandbox,{filename:'class6-science-ch10-assessments.js'});
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
  assert.equal(lesson.chapter,10);
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
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:15},(_,i)=>`KV-CBSE6-SCI-${String(i+136).padStart(4,'0')}`));
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} needs exactly five assessments`);
  assert.ok(attached.some(x=>x.assessmentType==='reasoning'));
  assert.ok(attached.some(x=>x.assessmentType==='mastery_check'));
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter10Topics}).toLowerCase();
for(const required of ['living','non-living','growth','respiration','response','germination','moisture','air','temperature','life cycle','seedling','reproduction']) assert.ok(allText.includes(required),`missing Chapter 10 concept: ${required}`);
for(const required of ['movement alone','stillness','fair comparison','species','supplied','wild']) assert.ok(allText.includes(required),`missing Chapter 10 evidence/model boundary: ${required}`);
for(const required of ['no tasting','no deliberate mould','no unknown','do not collect','do not disturb']) assert.ok(allText.includes(required),`missing Chapter 10 safety/welfare boundary: ${required}`);
assert.ok(allText.includes('not a universal')||allText.includes('not universal'));
assert.ok(allText.includes('non-invasive')||allText.includes('non-destructive'));
for(const unsafeDirective of ['go collect wild eggs','collect tadpoles from the pond for this activity','taste the experimental seeds to test them','grow mould deliberately for this experiment','uproot the plant repeatedly to inspect it','handle the unknown animal yourself']) assert.ok(!allText.includes(unsafeDirective),`unsafe biology directive detected: ${unsafeDirective}`);

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-science-ch10.js','data/class6-science-ch10-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.match(entry,/datasetKey:'class6SciencePilot'/);
assert.match(entry,/CBSE6-SCI-CH10-1/);
assert.match(entry,/ch\(\?:2\|3\|4\|5\|6\|7\|8\|9\|10\)/);
const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/CACHE='kirthiverse-preview-v43'/);
assert.match(sw,/VERSION='MANUS-VISUAL-MASTER-05-PWA-43'/);
for(const asset of ['/data/class6-science-ch10.js','/data/class6-science-ch10-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_SCIENCE_CH10_PASS topics=${map.chapter10Topics.length} lessons=${lessons.length} assessments=${assessments.length} organismWelfare=${map.chapter10CompletionEvidence.organismWelfareRequired}`);
