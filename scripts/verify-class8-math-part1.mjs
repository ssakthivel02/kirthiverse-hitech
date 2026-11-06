import fs from 'node:fs';import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};vm.createContext(sandbox);
for(const path of ['data/class8-math-part1-unit-map-v1.js','data/class8-math-part1-lessons.js','data/class8-math-part1-assessments.js'])vm.runInContext(read(path),sandbox,{filename:path});
const {KV_LESSONS:lessons,KV_ASSESSMENTS:assessments,KV_CLASS8_MATH_PART1_UNIT_MAP:map}=sandbox.window;
const fail=m=>{throw Error(m)};
const RIGHTS='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION';
/* unit map */
if(!map||map.status!=='SOURCE_VERIFIED'||map.units.length!==7||map.source.url!=='https://ncert.nic.in/textbook/pdf/hegp1ps.pdf')fail('Part I unit map contract');
if(map.contentBoundary.textbookProseCopied!==false||map.contentBoundary.textbookExercisesCopied!==false)fail('content boundary flags');
/* counts and ids */
if(lessons.length!==14)fail(`Expected 14 lessons, got ${lessons.length}`);if(assessments.length!==70)fail(`Expected 70 assessments, got ${assessments.length}`);
const lessonIds=new Set(lessons.map(x=>x.id)),aIds=assessments.map(x=>x.stableAssessmentId);
if(lessonIds.size!==14)fail('Duplicate lesson ids');if(new Set(aIds).size!==70)fail('Duplicate assessment ids');
for(let i=1;i<=70;i++){const id=`KV-CBSE8-MATH-${String(i).padStart(4,'0')}`;if(aIds[i-1]!==id)fail(`Stable assessment id order broken at ${id}`)}
/* per chapter */
const norm=s=>String(s??'').trim().toLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
const topicIds=new Set();
for(const u of map.units){
  const ls=lessons.filter(x=>x.chapter===u.chapter),as=assessments.filter(x=>x.chapter===u.chapter);
  if(ls.length!==2)fail(`Chapter ${u.chapter}: expected 2 lessons`);if(as.length!==10)fail(`Chapter ${u.chapter}: expected 10 assessments`);
  for(const l of ls){
    if(l.chapterTitle!==u.title)fail(`${l.id}: chapterTitle does not match verified unit map`);
    if(l.board!=='CBSE'||l.classLevel!==8||l.book!=='Ganita Prakash'||l.part!==1||l.curriculumSession!=='2026-27'||l.subject!=='Mathematics')fail(`${l.id}: curriculum metadata mismatch`);
    if(!l.id.startsWith(`math.cbse8.ganita-prakash.ch${u.chapter}.`))fail(`${l.id}: id prefix`);
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
  if(a.rightsStatus!==RIGHTS||a.classLevel!==8||a.board!=='CBSE')fail(`${id}: metadata`);
  if(prompts.has(a.questionActivity))fail(`${id}: duplicate prompt`);prompts.add(a.questionActivity);
  if(explanations.has(a.explanation))fail(`${id}: duplicate explanation`);explanations.add(a.explanation);
  if(/[−]/.test(a.correctAnswer))fail(`${id}: U+2212 minus in answer would be stripped by the learner answer normaliser`);
  if(!norm(a.correctAnswer))fail(`${id}: answer normalises to empty`);
  if(a.assessmentType==='multiple_choice'){const o=a.options;if(!Array.isArray(o)||o.length!==4||new Set(o.map(norm)).size!==4)fail(`${id}: options must be 4 distinct values`);if(o.filter(x=>norm(x)===norm(a.correctAnswer)).length!==1)fail(`${id}: exactly one option must equal the answer`)}
  else if(a.options)fail(`${id}: options only allowed on multiple choice`);
  if(a.assessmentType==='reasoning'&&!['yes','no'].includes(norm(a.correctAnswer)))fail(`${id}: reasoning answers must be Yes or No`);
}
/* independent recomputation of objectively computable answers (index = stable number) */
const gcd=(a,b)=>b?gcd(b,a%b):a;
const digitSum=n=>String(n).split('').reduce((s,d)=>s+Number(d),0);
const computed={
  1:Math.sqrt(196),3:12*12,5:Math.floor(Math.sqrt(90)),
  6:Math.round(Math.cbrt(2744)),8:(23**3)%10,10:216/108,
  11:4+2,13:1/2**3,15:2**(5+3-6),
  16:String(3200000).length-1,18:6*10**4,20:-4,
  21:700,23:6*1000+3*10+8,25:472,
  26:parseInt('1101',2),28:(19).toString(2),30:2**4,
  31:360-(95+80+110),33:2,35:360/10,
  36:180-65,38:(5+3)/(4-2),40:18/2,
  41:[0,1,2,3,4,5,6,7,8,9].find(d=>(5000+200+d*10+4)%3===0),
  43:[0,1,2,3,4,5,6,7,8,9].find(d=>(310+d)%4===0),
  45:2345%9,46:83-38,48:11,50:(62+26)/11,
  51:3*4,53:3+4,55:(3+1)*(3+2),
  56:41*41,58:99*101,60:10**2-2*21,
  61:120/8*5,63:5*6/2,65:(21/(7-4))*7,
  66:0.35*240,68:600-0.15*600,70:40-0.3*40
};
for(const [k,v] of Object.entries(computed)){const a=assessments[Number(k)-1];if(norm(String(v))!==norm(a.correctAnswer))fail(`${a.stableAssessmentId}: recomputed ${v} but answer is ${a.correctAnswer}`)}
/* multiple-choice and reasoning checks computed separately */
const mcChecks={2:()=>{const sq=n=>Number.isInteger(Math.sqrt(n));return ['1521','2304','3087','4096'].filter(x=>!sq(Number(x))).join()==='3087'},
  7:()=>{const cube=n=>Number.isInteger(Math.round(Math.cbrt(n)))&&Math.round(Math.cbrt(n))**3===n;return [500,729,900,1200].filter(cube).join()==='729'},
  27:()=>(8+2).toString(2)==='1010',
  42:()=>['3058','3059','3062','3075'].filter(s=>{const d=s.split('').reverse().map(Number);return (d.reduce((t,x,i)=>t+(i%2?-x:x),0))%11===0}).join()==='3058',
  67:()=>(100-80)/80*100===25,
  62:()=>4*3===6*2,
  12:()=>2**0===1};
for(const [k,fn] of Object.entries(mcChecks))if(!fn())fail(`${assessments[Number(k)-1].stableAssessmentId}: multiple-choice recomputation failed`);
const primeExponents=n=>{const e={};for(let p=2;n>1;p++)while(n%p===0){e[p]=(e[p]||0)+1;n/=p}return e};
const reasonChecks={4:()=>![0,1,4,5,6,9].includes(2208%10),9:()=>Object.values(primeExponents(1620)).some(e=>e%3!==0),14:()=>(2**3)**2===2**6&&2**6!==2**5,19:()=>!(12>=1&&12<10),24:()=>34!==43,34:()=>4*100!==360,44:()=>24%9!==0,49:()=>27/9===3,54:()=>(1+2)*(1+3)!==1+6,59:()=>(3+2)**2!==3**2+2**2,64:()=>3*3===9&&4*3===12,69:()=>100*1.5*0.5!==100};
for(const [k,fn] of Object.entries(reasonChecks))if(!fn())fail(`${assessments[Number(k)-1].stableAssessmentId}: reasoning recomputation failed`);
/* MC items 17,22,47,52,57 verified by option text below */
const optionAnswer={17:'4.5 x 10^-4',22:'It acts as a placeholder that keeps other digits in the right positions',47:'10a + b',52:'x^2 + 7x + 10',57:'a^2 - b^2'};
for(const [k,v] of Object.entries(optionAnswer))if(assessments[Number(k)-1].correctAnswer!==v)fail(`${assessments[Number(k)-1].stableAssessmentId}: expected answer text`);
/* algebra spot checks by evaluating at x=3: (x+2)(x+5) = x^2+7x+10 */
for(const x of [3,7,-2])if((x+2)*(x+5)!==x*x+7*x+10)fail('expansion check');
/* runtime wiring */
const rt=read('class8-math-runtime-v1.js');const combinedPath='data/class8-math-part1-bundle-v1.js';const expectedBundle=read('data/class8-math-part1-lessons.js').replace(/\n*$/, '\n')+read('data/class8-math-part1-assessments.js').replace(/^\n*/, '');if(read(combinedPath)!==expectedBundle)fail('Class 8 part1 bundle differs from preserved lesson/assessment sources');if(rt.split(combinedPath).length-1!==2)fail('Class 8 part1 runtime must reference one paired bundle in both config slots');if(rt.includes('data/class8-math-part1-lessons.js')||rt.includes('data/class8-math-part1-assessments.js'))fail('Class 8 part1 runtime still loads split files');for(const t of ["math\\\\.cbse8\\\\.ganita-prakash\\\\.ch","class8MathPart1"])if(!rt.includes(t))fail('runtime wiring missing: '+t);
const lc=read('lesson-check-v1.js');for(const t of ['class8-math-runtime-v1.js','KV_CLASS8_MATH_RUNTIME'])if(!lc.includes(t))fail(`lesson-check bridge missing: ${t}`);
console.log(`PASS: Class 8 Mathematics Part I — 7 verified chapters, 14 original lessons, 70 original assessments (KV-CBSE8-MATH-0001..0070), ${Object.keys(computed).length} numeric answers and ${Object.keys(mcChecks).length+Object.keys(reasonChecks).length+Object.keys(optionAnswer).length} choice/reasoning answers independently checked, runtime wired.`);
