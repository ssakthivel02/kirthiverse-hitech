import fs from 'node:fs';import vm from 'node:vm';
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};vm.createContext(sandbox);
for(const path of ['data/class7-science-ch1-lessons.js','data/class7-science-ch1-assessments.js'])vm.runInContext(fs.readFileSync(path,'utf8'),sandbox);
const L=sandbox.window.KV_LESSONS,A=sandbox.window.KV_ASSESSMENTS;
if(L.length!==1||A.length!==5)throw Error(`expected one intro lesson and five formative checks; got ${L.length}/${A.length}`);
const lesson=L[0],id='science.cbse7.curiosity.ch1.science-as-process.v1';
if(lesson.id!==id||lesson.chapter!==1||lesson.subject!=='Science'||lesson.classLevel!==7||lesson.board!=='CBSE')throw Error('chapter 1 lesson identity mismatch');
if(!lesson.content||!lesson.workedExample||!lesson.kikiTeaching?.objective||!lesson.remediation?.masteryEvidence)throw Error('chapter 1 teaching contract incomplete');
if(lesson.rightsStatus!=='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION')throw Error('original-content rights boundary missing');
const norm=x=>String(x??'').trim().toLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
for(let i=0;i<A.length;i++){
 const a=A[i],want=`KV-CBSE7-SCI-${String(i+91).padStart(4,'0')}`;
 if(a.stableAssessmentId!==want||a.lessonId!==id||a.chapter!==1)throw Error(`assessment identity mismatch: ${a.stableAssessmentId}`);
 if(!a.correctAnswer||!a.hint||!a.explanation||a.rightsStatus!=='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION')throw Error(`assessment incomplete: ${a.stableAssessmentId}`);
 if(a.assessmentType==='multiple_choice'&&(!Array.isArray(a.options)||a.options.length!==4||a.options.filter(o=>norm(o)===norm(a.correctAnswer)).length!==1))throw Error(`MCQ options/answer mismatch: ${a.stableAssessmentId}`);
}
console.log('CLASS7_SCIENCE_CH1_INTRO_PASS');
