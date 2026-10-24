import fs from 'node:fs';import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};vm.createContext(sandbox);
for(const path of ['data/class7-math-part2-unit-map-v1.js','data/class7-math-ch1.js','data/class7-math-ch1-assessments.js','data/class7-math-ch2.js','data/class7-math-ch2-assessments.js','data/class7-math-ch3-8-lessons.js','data/class7-math-ch3-8-assessments.js']){vm.runInContext(read(path),sandbox,{filename:path})}
const baseLessonIds=new Set(sandbox.window.KV_LESSONS.map(x=>x.id)),baseAssessmentIds=new Set(sandbox.window.KV_ASSESSMENTS.map(x=>x.stableAssessmentId));
sandbox.window.KV_LESSONS.length=0;sandbox.window.KV_ASSESSMENTS.length=0;
for(const path of ['data/class7-math-part2-lessons.js','data/class7-math-part2-assessments.js'])vm.runInContext(read(path),sandbox,{filename:path});
const {KV_LESSONS:lessons,KV_ASSESSMENTS:assessments,KV_CLASS7_MATH_PART2_UNIT_MAP:map}=sandbox.window;
const fail=m=>{throw Error(m)};
const RIGHTS='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION';
/* unit map */
if(!map||map.status!=='SOURCE_VERIFIED'||map.units.length!==7||map.source.url!=='https://ncert.nic.in/textbook/pdf/gegp2ps.pdf')fail('Part II unit map contract');
if(map.contentBoundary.textbookProseCopied!==false||map.contentBoundary.textbookExercisesCopied!==false)fail('content boundary flags');
/* counts and ids */
if(lessons.length!==14)fail(`Expected 14 lessons, got ${lessons.length}`);if(assessments.length!==70)fail(`Expected 70 assessments, got ${assessments.length}`);
const lessonIds=new Set(lessons.map(x=>x.id)),aIds=assessments.map(x=>x.stableAssessmentId);
if(lessonIds.size!==14)fail('Duplicate lesson ids');if(new Set(aIds).size!==70)fail('Duplicate assessment ids');
for(const id of lessonIds)if(baseLessonIds.has(id))fail(`Lesson id collides with existing content: ${id}`);
for(const id of aIds)if(baseAssessmentIds.has(id))fail(`Assessment id collides with existing content: ${id}`);
for(let i=81;i<=150;i++){const id=`KV-CBSE7-MATH-${String(i).padStart(4,'0')}`;if(aIds[i-81]!==id)fail(`Stable assessment id order broken at ${id}`)}
/* per chapter */
const norm=s=>String(s??'').trim().toLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
for(const u of map.units){
  const ls=lessons.filter(x=>x.chapter===u.chapter),as=assessments.filter(x=>x.chapter===u.chapter);
  if(ls.length!==2)fail(`Chapter ${u.chapter}: expected 2 lessons`);if(as.length!==10)fail(`Chapter ${u.chapter}: expected 10 assessments`);
  for(const l of ls){
    if(l.chapterTitle!==u.title)fail(`${l.id}: chapterTitle does not match verified unit map`);
    if(l.board!=='CBSE'||l.classLevel!==7||l.book!=='Ganita Prakash'||l.part!==2||l.curriculumSession!=='2026-27')fail(`${l.id}: curriculum metadata mismatch`);
    if(!l.id.startsWith(`math.cbse7.ganita-prakash.p2ch${u.chapter}.`))fail(`${l.id}: id prefix`);
    if(l.rightsStatus!==RIGHTS)fail(`${l.id}: rights boundary mismatch`);
    for(const f of ['title','learningObjective','content','workedExample','topicId'])if(!l[f])fail(`${l.id}: missing ${f}`);
    for(const f of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])if(!l.kikiTeaching?.[f])fail(`${l.id}: kikiTeaching.${f}`);
    for(const f of ['trigger','strategy','masteryEvidence'])if(!l.remediation?.[f])fail(`${l.id}: remediation.${f}`);
    if(as.filter(a=>a.lessonId===l.id).length!==5)fail(`${l.id}: expected 5 assessments`);
  }
}
/* assessment contract and learner-answer safety */
const prompts=new Set();
for(const a of assessments){
  const id=a.stableAssessmentId;if(!lessonIds.has(a.lessonId))fail(`${id}: unreachable lesson`);
  for(const f of ['assessmentType','questionActivity','correctAnswer','hint','explanation'])if(!a[f])fail(`${id}: missing ${f}`);
  if(a.rightsStatus!==RIGHTS)fail(`${id}: rights`);if(prompts.has(a.questionActivity))fail(`${id}: duplicate prompt`);prompts.add(a.questionActivity);
  if(/[−]/.test(a.correctAnswer))fail(`${id}: U+2212 minus in answer would be stripped by the learner answer normaliser`);
  if(!norm(a.correctAnswer))fail(`${id}: answer normalises to empty`);
  if(a.assessmentType==='multiple_choice'){const o=a.options;if(!Array.isArray(o)||o.length!==4||new Set(o.map(norm)).size!==4)fail(`${id}: options must be 4 distinct values`);if(o.filter(x=>norm(x)===norm(a.correctAnswer)).length!==1)fail(`${id}: exactly one option must equal the answer`)}
}
/* independent recomputation of objectively computable answers */
const gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a*b/gcd(a,b),mean=v=>v.reduce((s,x)=>s+x,0)/v.length,median=v=>{const s=[...v].sort((a,b)=>a-b),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2},num=x=>String(Number(x.toFixed(6)));
const computed={91:-7+12,93:4-(-6),95:-12+5-9,96:-8*3,97:-7*-6,98:-45/9,99:-2*-3*-4,100:5*-3,103:gcd(24,36),104:gcd(17,25),106:lcm(8,12),107:4*60/12,108:lcm(6,8),109:lcm(5,7),111:num(0.4*0.3),112:num(1.5*2.4),115:num(12.5*0.8),116:num(3.6/10),117:num(7.2/0.9),119:num(1.5/0.25),121:mean([4,8,6,10,12]),122:median([9,3,7,5,11]),123:median([2,4,8,10]),127:Math.max(14,9,21,17,12)-Math.min(14,9,21,17,12),130:7*6,141:15-9,142:28/4,143:(11-3)/2,144:(16+4)/5,146:(17-5)/2,147:(33-3)/3,149:(13+5)/6};
for(const [k,v] of Object.entries(computed)){const a=assessments[Number(k)-81];if(norm(String(v))!==norm(a.correctAnswer))fail(`${a.stableAssessmentId}: recomputed ${v} but answer is ${a.correctAnswer}`)}
/* runtime wiring */
const rt=read('class7-math-runtime-v1.js');for(const t of ["p2:{lesson:part2Lesson,assessment:part2Assessment","data/class7-math-part2-lessons.js","data/class7-math-part2-assessments.js","p2ch\\d+"])if(!rt.includes(t))fail(`runtime wiring missing: ${t}`);
if(!read('lesson-check-v1.js').includes('(?:p2)?ch\\d+'))fail('lesson-check does not recognise Part II routes');
console.log(`PASS: Class 7 Mathematics Part II — 7 verified chapters, 14 original lessons, 70 original assessments (KV-CBSE7-MATH-0081..0150), ${Object.keys(computed).length} answers independently recomputed, runtime wired.`);
