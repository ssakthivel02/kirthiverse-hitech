import fs from 'node:fs';import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};vm.createContext(sandbox);
for(const path of ['data/class8-science-unit-map-v1.js','data/class8-science-lessons.js','data/class8-science-assessments.js'])vm.runInContext(read(path),sandbox,{filename:path});
const {KV_LESSONS:lessons,KV_ASSESSMENTS:assessments,KV_CLASS8_SCIENCE_UNIT_MAP:map}=sandbox.window;
const fail=m=>{throw Error(m)};
const RIGHTS='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION';
/* unit map */
if(!map||map.status!=='SOURCE_VERIFIED'||map.units.length!==13||map.source.url!=='https://ncert.nic.in/textbook/pdf/hecu1ps.pdf')fail('Science unit map contract');
if(map.units.some((u,i)=>u.chapter!==i+1||!u.title))fail('unit map chapter order');
if(map.contentBoundary.textbookProseCopied!==false||map.contentBoundary.textbookExercisesCopied!==false)fail('content boundary flags');
/* counts and ids */
if(lessons.length!==25)fail(`Expected 25 lessons, got ${lessons.length}`);if(assessments.length!==125)fail(`Expected 125 assessments, got ${assessments.length}`);
const lessonIds=new Set(lessons.map(x=>x.id)),aIds=assessments.map(x=>x.stableAssessmentId);
if(lessonIds.size!==25)fail('Duplicate lesson ids');if(new Set(aIds).size!==125)fail('Duplicate assessment ids');
for(let i=1;i<=125;i++){const id=`KV-CBSE8-SCI-${String(i).padStart(4,'0')}`;if(aIds[i-1]!==id)fail(`Stable assessment id order broken at ${id}`)}
/* per chapter */
const norm=s=>String(s??'').trim().toLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
const topicIds=new Set();
for(const u of map.units){
  const ls=lessons.filter(x=>x.chapter===u.chapter),as=assessments.filter(x=>x.chapter===u.chapter);
  const want=u.chapter===1?1:2;
  if(ls.length!==want)fail(`Chapter ${u.chapter}: expected ${want} lessons`);if(as.length!==want*5)fail(`Chapter ${u.chapter}: expected ${want*5} assessments`);
  for(const l of ls){
    if(l.chapterTitle!==u.title)fail(`${l.id}: chapterTitle does not match verified unit map`);
    if(l.board!=='CBSE'||l.classLevel!==8||l.book!=='Curiosity'||l.curriculumSession!=='2026-27'||l.subject!=='Science'||l.worldId!=='science')fail(`${l.id}: curriculum metadata mismatch`);
    if(!l.id.startsWith(`science.cbse8.curiosity.ch${u.chapter}.`))fail(`${l.id}: id prefix`);
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
  if(a.rightsStatus!==RIGHTS||a.classLevel!==8||a.board!=='CBSE'||a.subject!=='Science')fail(`${id}: metadata`);
  if(prompts.has(a.questionActivity))fail(`${id}: duplicate prompt`);prompts.add(a.questionActivity);
  if(explanations.has(a.explanation))fail(`${id}: duplicate explanation`);explanations.add(a.explanation);
  if(/[−]/.test(a.correctAnswer))fail(`${id}: U+2212 minus in answer would be stripped by the learner answer normaliser`);
  if(!norm(a.correctAnswer))fail(`${id}: answer normalises to empty`);
  if(a.assessmentType==='multiple_choice'){const o=a.options;if(!Array.isArray(o)||o.length!==4||new Set(o.map(norm)).size!==4)fail(`${id}: options must be 4 distinct values`);if(o.filter(x=>norm(x)===norm(a.correctAnswer)).length!==1)fail(`${id}: exactly one option must equal the answer`)}
  else if(a.options)fail(`${id}: options only allowed on multiple choice`);
  if(a.assessmentType==='reasoning'&&!['yes','no'].includes(norm(a.correctAnswer)))fail(`${id}: reasoning answers must be Yes or No`);
}
/* independent recomputation of arithmetic items (key = stable number) */
const num=x=>String(Number(x.toFixed(6)));
const computed={40:5-5,46:200/0.5,48:600/2,50:500*0.2,78:40-36,81:10/(10+90)*100,83:30/(30+120)*100,86:30,88:2*2,103:365+1};
for(const [k,v] of Object.entries(computed)){const a=assessments[Number(k)-1];if(norm(num(Number(v)))!==norm(a.correctAnswer))fail(`${a.stableAssessmentId}: recomputed ${v} but answer is ${a.correctAnswer}`)}
/* typed word answers must be taught: the answer text must appear in the lesson's own content, example or teaching script */
const lessonText=Object.fromEntries(lessons.map(l=>[l.id,norm(JSON.stringify([l.title,l.subtopic,l.content,l.workedExample,l.kikiTeaching]).replace(/[^\p{L}\p{N}.\-\s]/gu,' ').replace(/\s+/g,'')).toString()]));
let taught=0,numericTyped=0;
for(const a of assessments){
  if(a.assessmentType!=='short_answer')continue;
  if(/^-?[\d.]+$/.test(a.correctAnswer)){numericTyped++;continue}
  const t=lessonText[a.lessonId];if(!t.includes(norm(a.correctAnswer)))fail(`${a.stableAssessmentId}: typed answer "${a.correctAnswer}" is not taught in its lesson`);taught++
}
console.log(`CLASS8_SCIENCE_VERIFY_PASS lessons=${lessons.length} assessments=${assessments.length} chapters=13 arithmetic_recomputed=${Object.keys(computed).length} typed_words_found_in_lesson=${taught} typed_numeric=${numericTyped}`);
console.log('NOTE: factual items (definitions, constants, MC, Yes/No reasoning) are checked for structure only, not independently verified against a source; arithmetic items above are recomputed.');
