import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const lessonPath='data/class7-math-ch2.js';
const assessmentPath='data/class7-math-ch2-assessments.js';
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
vm.runInContext(read(lessonPath),sandbox,{filename:lessonPath});
vm.runInContext(read(assessmentPath),sandbox,{filename:assessmentPath});
const lessons=sandbox.window.KV_LESSONS;
const assessments=sandbox.window.KV_ASSESSMENTS;
const expectedLessons=['math.cbse7.ganita-prakash.ch2.expression-structure.v1','math.cbse7.ganita-prakash.ch2.evaluate-reason.v1'];
if(lessons.length!==2) throw Error(`Expected 2 Chapter 2 lessons, got ${lessons.length}`);
if(assessments.length!==10) throw Error(`Expected 10 Chapter 2 assessments, got ${assessments.length}`);
for(const id of expectedLessons){if(!lessons.some(x=>x.id===id))throw Error(`Missing lesson ${id}`);if(assessments.filter(x=>x.lessonId===id).length!==5)throw Error(`Expected 5 assessments for ${id}`)}
const ids=assessments.map(x=>x.stableAssessmentId);if(new Set(ids).size!==10)throw Error('Duplicate Chapter 2 assessment IDs');
const expectedIds=Array.from({length:10},(_,i)=>`KV-CBSE7-MATH-${String(i+11).padStart(4,'0')}`);for(const id of expectedIds)if(!ids.includes(id))throw Error(`Missing assessment ${id}`);
for(const lesson of lessons){if(lesson.classLevel!==7||lesson.chapter!==2||lesson.chapterTitle!=='Arithmetic Expressions'||lesson.book!=='Ganita Prakash'||lesson.board!=='CBSE')throw Error(`Curriculum metadata mismatch for ${lesson.id}`);if(!String(lesson.rightsStatus||'').includes('ORIGINAL'))throw Error(`Rights boundary missing for ${lesson.id}`);for(const field of ['learningObjective','content','workedExample','kikiTeaching','remediation'])if(!lesson[field])throw Error(`${lesson.id} missing ${field}`)}
for(const a of assessments)for(const field of ['stableAssessmentId','lessonId','assessmentType','questionActivity','correctAnswer','hint','explanation'])if(!a[field])throw Error(`${a.stableAssessmentId||'assessment'} missing ${field}`);
console.log('PASS: Class 7 Mathematics Chapter 2 content contract — 2 original lessons, 10 original assessments, complete metadata and reachability.');