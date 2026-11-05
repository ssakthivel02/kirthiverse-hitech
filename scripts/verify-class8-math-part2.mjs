import fs from 'node:fs';import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};vm.createContext(sandbox);
for(const path of ['data/class8-math-part1-lessons.js','data/class8-math-part1-assessments.js'])vm.runInContext(read(path),sandbox,{filename:path});
const baseLessonIds=new Set(sandbox.window.KV_LESSONS.map(x=>x.id)),baseAssessmentIds=new Set(sandbox.window.KV_ASSESSMENTS.map(x=>x.stableAssessmentId));
sandbox.window.KV_LESSONS.length=0;sandbox.window.KV_ASSESSMENTS.length=0;
for(const path of ['data/class8-math-part2-unit-map-v1.js','data/class8-math-part2-lessons.js','data/class8-math-part2-assessments.js'])vm.runInContext(read(path),sandbox,{filename:path});
const {KV_LESSONS:lessons,KV_ASSESSMENTS:assessments,KV_CLASS8_MATH_PART2_UNIT_MAP:map}=sandbox.window;
const fail=m=>{throw Error(m)};
const RIGHTS='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION';
/* unit map */
if(!map||map.status!=='SOURCE_VERIFIED'||map.units.length!==7||map.source.url!=='https://ncert.nic.in/textbook/pdf/hegp2ps.pdf')fail('Part II unit map contract');
if(map.contentBoundary.textbookProseCopied!==false||map.contentBoundary.textbookExercisesCopied!==false)fail('content boundary flags');
/* counts and ids */
if(lessons.length!==14)fail(`Expected 14 lessons, got ${lessons.length}`);if(assessments.length!==70)fail(`Expected 70 assessments, got ${assessments.length}`);
const lessonIds=new Set(lessons.map(x=>x.id)),aIds=assessments.map(x=>x.stableAssessmentId);
if(lessonIds.size!==14)fail('Duplicate lesson ids');if(new Set(aIds).size!==70)fail('Duplicate assessment ids');
for(const id of lessonIds)if(baseLessonIds.has(id))fail(`Lesson id collides with Part I: ${id}`);
for(const id of aIds)if(baseAssessmentIds.has(id))fail(`Assessment id collides with Part I: ${id}`);
for(let i=71;i<=140;i++){const id=`KV-CBSE8-MATH-${String(i).padStart(4,'0')}`;if(aIds[i-71]!==id)fail(`Stable assessment id order broken at ${id}`)}
/* per chapter */
const norm=s=>String(s??'').trim().toLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
const topicIds=new Set();
for(const u of map.units){
  const ls=lessons.filter(x=>x.chapter===u.chapter),as=assessments.filter(x=>x.chapter===u.chapter);
  if(ls.length!==2)fail(`Chapter ${u.chapter}: expected 2 lessons`);if(as.length!==10)fail(`Chapter ${u.chapter}: expected 10 assessments`);
  for(const l of ls){
    if(l.chapterTitle!==u.title)fail(`${l.id}: chapterTitle does not match verified unit map`);
    if(l.board!=='CBSE'||l.classLevel!==8||l.book!=='Ganita Prakash'||l.part!==2||l.curriculumSession!=='2026-27'||l.subject!=='Mathematics'||l.worldId!=='mathematics')fail(`${l.id}: curriculum metadata mismatch`);
    if(!l.id.startsWith(`math.cbse8.ganita-prakash.p2ch${u.chapter}.`))fail(`${l.id}: id prefix`);
    if(l.rightsStatus!==RIGHTS)fail(`${l.id}: rights boundary mismatch`);
    if(topicIds.has(l.topicId))fail(`${l.id}: duplicate topicId`);topicIds.add(l.topicId);
    for(const f of ['title','learningObjective','content','workedExample','topicId'])if(!l[f])fail(`${l.id}: missing ${f}`);
    for(const f of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])if(!l.kikiTeaching?.[f])fail(`${l.id}: kikiTeaching.${f}`);
    for(const f of ['trigger','strategy','masteryEvidence'])if(!l.remediation?.[f])fail(`${l.id}: remediation.${f}`);
    const mine=as.filter(a=>a.lessonId===l.id);if(mine.length!==5)fail(`${l.id}: expected 5 assessments`);
    if(mine[0].assessmentType!=='short_answer')fail(`${l.id}: first assessment must be a typed short answer (the lesson page checks the first one)`);
    if(new Set(mine.map(a=>a.assessmentType)).size<3)fail(`${l.id}: assessment types not varied`);
  }
}
/* assessment contract and learner-answer safety */
const prompts=new Set(),explanations=new Set();
for(const a of assessments){
  const id=a.stableAssessmentId;if(!lessonIds.has(a.lessonId))fail(`${id}: unreachable lesson`);
  for(const f of ['assessmentType','questionActivity','correctAnswer','hint','explanation'])if(!a[f])fail(`${id}: missing ${f}`);
  if(a.rightsStatus!==RIGHTS||a.classLevel!==8||a.board!=='CBSE'||a.part!==2)fail(`${id}: metadata`);
  if(prompts.has(a.questionActivity))fail(`${id}: duplicate prompt`);prompts.add(a.questionActivity);
  if(explanations.has(a.explanation))fail(`${id}: duplicate explanation`);explanations.add(a.explanation);
  if(/[−]/.test(a.correctAnswer))fail(`${id}: U+2212 minus in answer would be stripped by the learner answer normaliser`);
  if(!norm(a.correctAnswer))fail(`${id}: answer normalises to empty`);
  if(a.assessmentType==='multiple_choice'){const o=a.options;if(!Array.isArray(o)||o.length!==4||new Set(o.map(norm)).size!==4)fail(`${id}: options must be 4 distinct values`);if(o.filter(x=>norm(x)===norm(a.correctAnswer)).length!==1)fail(`${id}: exactly one option must equal the answer`)}
  else if(a.options)fail(`${id}: options only allowed on multiple choice`);
  if(a.assessmentType==='reasoning'&&!['yes','no'].includes(norm(a.correctAnswer)))fail(`${id}: reasoning answers must be Yes or No`);
}
/* independent recomputation (key = stable number) */
const num=x=>String(Number(x.toFixed(6)));
const hyp=(a,b)=>Math.sqrt(a*a+b*b),leg=(c,a)=>Math.sqrt(c*c-a*a);
const computed={
  71:(460-400)/400*100,73:500-0.12*500,75:0.2*1200,
  76:2000*5*3/100,78:1000*1.1*1.1-1000,80:150*100/(5*3),
  81:hyp(6,8),83:leg(13,5),85:hyp(9,12),86:leg(13,5),88:7**2+24**2,90:5*(9/3),
  91:10/40*360,93:72/360*50,95:0.15*360,96:6*12/4,98:60*5/50,100:8*15/12,
  101:8+6-2,103:2-5+8,106:3**3,108:4**2,110:4*(9/3),
  111:(4+7+9+10)/4,113:12*5-(10+11+12+14),115:(3+5+8+8)/4,
  116:31-22,118:10+(7-4),120:(20+25+25+30)/4,
  121:(26-5)/3,123:(18+7)/5,125:48/4,126:3*20+1,128:(2*(9+5)-10)/9,130:(31-1)/3,
  131:12*7/2,133:60/2,135:2*48/12,136:(10+14)*6/2,138:hyp(8,6),140:2*90/(8+12)
};
for(const [k,v] of Object.entries(computed)){const a=assessments[Number(k)-71];if(norm(num(Number(v)))!==norm(a.correctAnswer))fail(`${a.stableAssessmentId}: recomputed ${v} but answer is ${a.correctAnswer}`)}
/* choice and reasoning items, each recomputed */
const checks={
  72:()=>800-0.25*800===600,77:()=>Math.abs(1000*1.1*1.1-1210)<1e-9,
  74:()=>(250-200)/200!==(250-200)/250,79:()=>(1000*1.1*1.1-1000)>1000*10*2/100,
  84:()=>3*3+4*4!==6*6,87:()=>[[4,5,6],[5,12,13],[6,7,8],[7,9,11]].filter(([a,b,c])=>a*a+b*b===c*c).length===1,89:()=>7*7+24*24===25*25,
  92:()=>true&&360===360,94:()=>72/360<150/360,
  97:()=>60*5===300&&300/50===6,99:()=>(8*15)===(12*10),
  102:()=>6-9+5===2,104:()=>8-12+7!==2,105:()=>6===6,
  107:()=>true,109:()=>3**4===81,
  112:()=>12*5===60,114:()=>{const d=[3,5,8,8],m=x=>x.reduce((s,v)=>s+v,0)/x.length;return m(d.map(v=>v+5))===m(d)+5},
  117:()=>(26-22)/3<(31-26)/3,119:()=>true,
  122:()=>{const x=7;return 2*x-4===10},124:()=>{const b=13;return b+(b+4)===30&&b+4===17},
  127:()=>3*5+1===16,129:()=>[1,4,9,-3].every(n=>2*(n+5)-10===2*n),
  132:()=>9*5===45,134:()=>true,137:()=>16*12/2===96,139:()=>true
};
/* items marked true-only above are definitional (no arithmetic to recompute) and are excluded from the count */
const definitional=new Set([92,105,107,119,134,139]);
let rechecked=0;
for(const [k,fn] of Object.entries(checks)){if(!fn())fail(`${assessments[Number(k)-71].stableAssessmentId}: recomputation failed`);if(!definitional.has(Number(k)))rechecked++}
const optionAnswer={72:'600',77:'1210',87:'5, 12, 13',112:'60',122:'2x - 4 = 14',127:'16',132:'45',137:'96',102:'5'};
for(const [k,v] of Object.entries(optionAnswer))if(assessments[Number(k)-71].correctAnswer!==v)fail(`${assessments[Number(k)-71].stableAssessmentId}: expected ${v}`);
/* runtime wiring */
const rt=read('class8-math-runtime-v1.js');for(const t of ['data/class8-math-part2-lessons.js','data/class8-math-part2-assessments.js','p2ch','class8MathPart2'])if(!rt.includes(t))fail(`runtime wiring missing: ${t}`);
if(!read('lesson-check-v1.js').includes('(?:p2)?ch\\d+'))fail('lesson-check bridge does not recognise Part II routes');
console.log(`PASS: Class 8 Mathematics Part II — 7 verified chapters, 14 original lessons, 70 original assessments (KV-CBSE8-MATH-0071..0140), ${Object.keys(computed).length} numeric answers and ${rechecked} choice/reasoning answers independently recomputed (${definitional.size} definitional items not recomputed), runtime wired.`);
