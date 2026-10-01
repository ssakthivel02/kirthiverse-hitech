import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(p,'utf8');
const entry=read('p0-entry-v1.js');
const lessonPath='data/class7-math-ch1.js';
const assessmentPath='data/class7-math-ch1-assessments.js';

for(const required of [lessonPath,assessmentPath,'class7MathChapter1','CBSE7-MATH-CH1-1']){
  if(!entry.includes(required)) throw new Error(`Runtime loader missing ${required}`);
}
if(!entry.includes('math\\.cbse7\\.ganita-prakash\\.ch1\\.')) throw new Error('Class 7 Chapter 1 lesson-route gate missing');

const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(read(lessonPath),sandbox,{filename:lessonPath});
vm.runInContext(read(assessmentPath),sandbox,{filename:assessmentPath});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;

const expectedLessons=[
  'math.cbse7.ganita-prakash.ch1.place-value-estimation.v1',
  'math.cbse7.ganita-prakash.ch1.operations-reasoning.v1'
];
for(const id of expectedLessons){
  if(!lessons.some(x=>x.id===id)) throw new Error(`Missing lesson ${id}`);
  if(!assessments.some(x=>x.lessonId===id)) throw new Error(`No assessment reaches ${id}`);
}
if(lessons.length!==2) throw new Error(`Expected 2 Class 7 Chapter 1 lessons, got ${lessons.length}`);
if(assessments.length!==10) throw new Error(`Expected 10 Class 7 Chapter 1 assessments, got ${assessments.length}`);
const assessmentIds=assessments.map(x=>x.stableAssessmentId);
if(new Set(assessmentIds).size!==assessmentIds.length) throw new Error('Duplicate stable assessment IDs');
for(const a of assessments){
  for(const field of ['stableAssessmentId','lessonId','assessmentType','questionActivity','correctAnswer','hint','explanation']){
    if(!a[field]) throw new Error(`${a.stableAssessmentId||'assessment'} missing ${field}`);
  }
}
for(const lesson of lessons){
  if(lesson.classLevel!==7||lesson.chapter!==1||lesson.book!=='Ganita Prakash') throw new Error(`Curriculum metadata mismatch for ${lesson.id}`);
  if(!String(lesson.rightsStatus||'').includes('ORIGINAL')) throw new Error(`Rights boundary missing for ${lesson.id}`);
}
console.log(`PASS: ${lessons.length} lessons and ${assessments.length} assessments are runtime-wired and internally reachable.`);
