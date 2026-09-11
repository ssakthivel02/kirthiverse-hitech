import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lessonIds=[
  'science.cbse6.curiosity.ch11.air-water-sun.v1',
  'science.cbse6.curiosity.ch11.forests-soil-rocks-minerals.v1',
  'science.cbse6.curiosity.ch11.renewable-nonrenewable-resources.v1',
];
const map=JSON.parse(fs.readFileSync('docs/class6-pilot/SCIENCE_CURIOSITY_MAP_V1.json','utf8'));
assert.equal(map.schemaVersion,'1.10.0');
assert.equal(map.chapters.length,12);
assert.equal(map.chapters[10].title,'Nature’s Treasures');
assert.equal(map.chapters[10].status,'KIKI_TEACHING_SLICE_COMPLETE');
assert.equal(map.chapter11Topics.length,3);
assert.ok(map.chapter11Topics.every(x=>x.status==='END_TO_END_PILOT_IMPLEMENTED'));
assert.ok(map.chapter11Topics.every(x=>Array.isArray(x.competencies)&&x.competencies.length>=3));
assert.ok(map.chapter11Topics.every(x=>Array.isArray(x.misconceptions)&&x.misconceptions.length>=3));
assert.ok(map.chapter11Topics.every(x=>Array.isArray(x.safetyBoundary)&&x.safetyBoundary.length>=3));
assert.equal(map.chapter11CompletionEvidence.lessonCount,3);
assert.equal(map.chapter11CompletionEvidence.assessmentCount,15);
assert.equal(map.chapter11CompletionEvidence.resourceSafetyRequired,true);
assert.equal(map.chapter11CompletionEvidence.potabilityClaimBoundaryRequired,true);
assert.equal(map.chapter11CompletionEvidence.renewableImpactBoundaryRequired,true);
assert.equal(map.chapter11CompletionEvidence.status,'CHAPTER11_KIKI_TEACHING_SLICE_COMPLETE');
assert.match(map.chapter11CompletionRule,/freshwater/i);
assert.match(map.chapter11CompletionRule,/renewable/i);
assert.match(map.chapter11CompletionRule,/no-fuel-handling/i);
assert.match(map.completionRule,/all twelve/i);

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data/class6-science-ch11.js','utf8'),sandbox,{filename:'class6-science-ch11.js'});
vm.runInContext(fs.readFileSync('data/class6-science-ch11-assessments.js','utf8'),sandbox,{filename:'class6-science-ch11-assessments.js'});
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
  assert.equal(lesson.chapter,11);
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
assert.deepEqual(assessments.map(x=>x.stableAssessmentId),Array.from({length:15},(_,i)=>`KV-CBSE6-SCI-${String(i+151).padStart(4,'0')}`));
for(const lessonId of lessonIds){
  const attached=assessments.filter(x=>x.lessonId===lessonId);
  assert.equal(attached.length,5,`${lessonId} needs exactly five assessments`);
  assert.ok(attached.some(x=>x.assessmentType==='reasoning'));
  assert.ok(attached.some(x=>x.assessmentType==='mastery_check'));
  for(const item of attached) for(const field of ['questionActivity','correctAnswer','hint','explanation']) assert.ok(item[field],`${item.stableAssessmentId} missing ${field}`);
}
const allText=JSON.stringify({lessons,assessments,map:map.chapter11Topics}).toLowerCase();
for(const required of ['air','nitrogen','oxygen','freshwater','solar','forest','soil','rock','mineral','fossil fuel','renewable','non-renewable']) assert.ok(allText.includes(required),`missing Chapter 11 concept: ${required}`);
for(const required of ['accessible freshwater','safe to drink','formation','replenishment','zero environmental impact']) assert.ok(allText.includes(required),`missing Chapter 11 claim boundary: ${required}`);
for(const required of ['no breath-holding','no direct sun viewing','no dumps roadsides mines quarries','no fuel sniffing','no petrol','roadside traffic surveys']) assert.ok(allText.includes(required),`missing Chapter 11 safety boundary: ${required}`);
assert.ok(allText.includes('untreated')&&allText.includes('water'));
assert.ok(allText.includes('roof')||allText.includes('rooftop'));
assert.ok(allText.includes('filling-station')||allText.includes('filling station'));
for(const unsafeDirective of ['hold your breath for as long as possible','look directly at the sun','climb onto the roof','drink the untreated water','enter the quarry','visit the mine shaft','sniff the petrol','handle the lpg','stand beside traffic to count vehicles','dismantle the battery']) assert.ok(!allText.includes(unsafeDirective),`unsafe resource directive detected: ${unsafeDirective}`);

const entry=fs.readFileSync('p0-entry-v1.js','utf8');
for(const asset of ['data/class6-science-ch11.js','data/class6-science-ch11-assessments.js']) assert.ok(entry.includes(asset),`loader missing ${asset}`);
assert.match(entry,/datasetKey:'class6SciencePilot'/);
assert.match(entry,/CBSE6-SCI-CH11-1/);
assert.match(entry,/ch\(\?:2\|3\|4\|5\|6\|7\|8\|9\|10\|11\)/);
const sw=fs.readFileSync('sw-v30.js','utf8');
assert.match(sw,/CACHE='kirthiverse-preview-v44'/);
assert.match(sw,/VERSION='MANUS-VISUAL-MASTER-05-PWA-44'/);
for(const asset of ['/data/class6-science-ch11.js','/data/class6-science-ch11-assessments.js']) assert.ok(sw.includes(asset),`precache missing ${asset}`);
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("I’m Kiki, your KirthiVerse guide."));
assert.ok(index.includes('microphone:false'));
assert.ok(index.includes('recording:false'));
assert.ok(index.includes('speechRecognition:false'));
console.log(`CLASS6_SCIENCE_CH11_PASS topics=${map.chapter11Topics.length} lessons=${lessons.length} assessments=${assessments.length} resourceSafety=${map.chapter11CompletionEvidence.resourceSafetyRequired}`);
