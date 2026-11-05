import fs from 'node:fs';import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};vm.createContext(sandbox);
for(const path of ['data/class8-social-science-part1-unit-map-v1.js','data/class8-social-science-part1-lessons.js','data/class8-social-science-part1-assessments.js'])vm.runInContext(read(path),sandbox,{filename:path});
const {KV_LESSONS:lessons,KV_ASSESSMENTS:assessments,KV_CLASS8_SOCIAL_SCIENCE_PART1_UNIT_MAP:map}=sandbox.window;
const fail=m=>{throw Error(m)};
const RIGHTS='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION';
/* unit map */
if(!map||map.status!=='SOURCE_VERIFIED'||map.units.length!==7||map.source.url!=='https://ncert.nic.in/textbook/pdf/hees1ps.pdf'||map.source.isbn!=='978-93-5729-293-1')fail('Part 1 unit map contract');
if(map.units.some((u,i)=>u.chapter!==i+1||!u.title||!u.theme))fail('unit map chapter order');
if(map.contentBoundary.textbookProseCopied!==false||map.contentBoundary.textbookExercisesCopied!==false)fail('content boundary flags');
/* counts and ids */
if(lessons.length!==14)fail(`Expected 14 lessons, got ${lessons.length}`);if(assessments.length!==70)fail(`Expected 70 assessments, got ${assessments.length}`);
const lessonIds=new Set(lessons.map(x=>x.id)),aIds=assessments.map(x=>x.stableAssessmentId);
if(lessonIds.size!==14)fail('Duplicate lesson ids');if(new Set(aIds).size!==70)fail('Duplicate assessment ids');
for(let i=1;i<=70;i++){const id=`KV-CBSE8-SOC-${String(i).padStart(4,'0')}`;if(aIds[i-1]!==id)fail(`Stable assessment id order broken at ${id}`)}
/* per chapter */
const norm=s=>String(s??'').trim().toLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
const WORLD={history:'history',geography:'geography',civics:'geography',economics:'geography'};
const topicIds=new Set();
for(const u of map.units){
  const ls=lessons.filter(x=>x.chapter===u.chapter),as=assessments.filter(x=>x.chapter===u.chapter);
  if(ls.length!==2)fail(`Chapter ${u.chapter}: expected 2 lessons`);if(as.length!==10)fail(`Chapter ${u.chapter}: expected 10 assessments`);
  for(const l of ls){
    if(l.chapterTitle!==u.title)fail(`${l.id}: chapterTitle does not match verified unit map`);
    if(l.board!=='CBSE'||l.classLevel!==8||l.part!==1||l.curriculumSession!=='2026-27'||l.subject!=='Social Science'||l.book!=='Exploring Society: India and Beyond')fail(`${l.id}: curriculum metadata mismatch`);
    if(l.worldId!==WORLD[u.discipline])fail(`${l.id}: worldId ${l.worldId} does not match discipline ${u.discipline}`);
    if(!l.id.startsWith(`social-science.cbse8.exploring-society.p1ch${u.chapter}.`))fail(`${l.id}: id prefix`);
    if(l.rightsStatus!==RIGHTS)fail(`${l.id}: rights boundary mismatch`);
    if(l.schoolOverlay!=='SAN Academy Tambaram'||!/VALIDATION_CONTEXT_ONLY/.test(l.schoolMappingStatus))fail(`${l.id}: school overlay metadata`);
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
  if(a.rightsStatus!==RIGHTS||a.classLevel!==8||a.board!=='CBSE'||a.subject!=='Social Science'||a.part!==1)fail(`${id}: metadata`);
  if(prompts.has(a.questionActivity))fail(`${id}: duplicate prompt`);prompts.add(a.questionActivity);
  if(explanations.has(a.explanation))fail(`${id}: duplicate explanation`);explanations.add(a.explanation);
  if(/[−]/.test(a.correctAnswer))fail(`${id}: U+2212 minus in answer would be stripped by the learner answer normaliser`);
  if(!norm(a.correctAnswer))fail(`${id}: answer normalises to empty`);
  if(a.assessmentType==='multiple_choice'){const o=a.options;if(!Array.isArray(o)||o.length!==4||new Set(o.map(norm)).size!==4)fail(`${id}: options must be 4 distinct values`);if(o.filter(x=>norm(x)===norm(a.correctAnswer)).length!==1)fail(`${id}: exactly one option must equal the answer`)}
  else if(a.options)fail(`${id}: options only allowed on multiple choice`);
  if(a.assessmentType==='reasoning'&&!['yes','no'].includes(norm(a.correctAnswer)))fail(`${id}: reasoning answers must be Yes or No`);
}
/* independent recomputation of arithmetic items (key = stable number) */
const computed={18:1556-1526,22:1680-1674,34:1764-1757,12:['Mamluk','Khalji','Tughlaq','Sayyid','Lodi'].length,54:['President','Lok Sabha','Rajya Sabha'].length};
for(const [k,v] of Object.entries(computed)){const a=assessments[Number(k)-1];if(norm(String(v))!==norm(a.correctAnswer))fail(`${a.stableAssessmentId}: recomputed ${v} but answer is ${a.correctAnswer}`)}
/* the five dynasty names behind item 12 must be taught in its lesson */
const lessonText=Object.fromEntries(lessons.map(l=>[l.id,norm(JSON.stringify([l.title,l.subtopic,l.content,l.workedExample,l.kikiTeaching]).replace(/[^\p{L}\p{N}.\-\s]/gu,' '))]));
const l2a=assessments[11].lessonId;for(const d of ['Mamluk','Khalji','Tughlaq','Sayyid','Lodi'])if(!lessonText[l2a].includes(norm(d)))fail(`dynasty ${d} not taught in ${l2a}`);
/* typed answers (words and years) must be taught in their own lesson; small counts need no check */
let taught=0,numericSkipped=0;
for(const a of assessments){
  if(a.assessmentType!=='short_answer')continue;
  const ans=a.correctAnswer;
  if(/^-?[\d.]+$/.test(ans)&&ans.length<3){numericSkipped++;continue}
  if(!lessonText[a.lessonId].includes(norm(ans)))fail(`${a.stableAssessmentId}: typed answer "${ans}" is not taught in its lesson`);taught++
}
console.log(`CLASS8_SOCIAL_SCIENCE_PART1_VERIFY_PASS lessons=${lessons.length} assessments=${assessments.length} chapters=7 arithmetic_recomputed=${Object.keys(computed).length} typed_answers_found_in_lesson=${taught} small_numeric_skipped=${numericSkipped}`);
console.log('NOTE: dates, names and civics facts are structure-checked and checked for presence in the lesson text only; they are not independently verified against a source by this script. Small numbers (term lengths, seat count, voting age) were not recomputed.');
