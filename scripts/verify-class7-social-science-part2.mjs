import fs from 'node:fs';import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');const fail=m=>{throw Error(m)};
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};vm.createContext(sandbox);
for(const path of ['data/class7-social-science-unit-map-v1.js','data/class7-social-science-part2-lessons.js','data/class7-social-science-part2-assessments.js'])vm.runInContext(read(path),sandbox,{filename:path});
const {KV_LESSONS:lessons,KV_ASSESSMENTS:assessments,KV_CLASS7_SOCIAL_SCIENCE_UNIT_MAP:map}=sandbox.window;
const RIGHTS='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_PROSE_OR_EXERCISE_REPRODUCTION';
const units=map.units.filter(u=>u.part===2);if(units.length!==8)fail('unit map must hold eight Part 2 chapters');
if(lessons.length!==16)fail(`Expected 16 lessons, got ${lessons.length}`);if(assessments.length!==80)fail(`Expected 80 assessments, got ${assessments.length}`);
const lessonIds=new Set(lessons.map(x=>x.id));if(lessonIds.size!==16)fail('Duplicate lesson ids');
const aIds=assessments.map(x=>x.stableAssessmentId);if(new Set(aIds).size!==80)fail('Duplicate assessment ids');
for(let i=0;i<80;i++){const want=`KV-CBSE7-SOC-${String(i+1).padStart(4,'0')}`;if(aIds[i]!==want)fail(`Stable assessment id order broken at ${want}`)}
const norm=s=>String(s??'').trim().toLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
for(const u of units){
  const ls=lessons.filter(x=>x.chapter===u.chapter),as=assessments.filter(x=>x.chapter===u.chapter);
  if(ls.length!==2)fail(`Chapter ${u.chapter}: expected 2 lessons`);if(as.length!==10)fail(`Chapter ${u.chapter}: expected 10 assessments`);
  for(const l of ls){
    if(l.chapterTitle!==u.title)fail(`${l.id}: chapterTitle does not match verified unit map`);
    if(!l.id.startsWith(`social-science.cbse7.exploring-society.p2ch${u.chapter}.`))fail(`${l.id}: id prefix`);
    if(l.subject!=='Social Science'||l.worldId!=='geography'||l.board!=='CBSE'||l.classLevel!==7||l.part!==2||l.curriculumSession!=='2026-27'||l.book!=='Exploring Society: India and Beyond')fail(`${l.id}: curriculum metadata mismatch`);
    if(l.rightsStatus!==RIGHTS)fail(`${l.id}: rights boundary mismatch`);
    if(l.schoolOverlay!=='SAN Academy Tambaram'||l.schoolMappingStatus!=='VALIDATION_CONTEXT_ONLY_NO_SCHOOL_PACING_OR_EDITION_CLAIM')fail(`${l.id}: school overlay boundary`);
    for(const f of ['title','learningObjective','content','workedExample','topicId'])if(!l[f])fail(`${l.id}: missing ${f}`);
    if(l.content.length<400)fail(`${l.id}: content too thin`);
    for(const f of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])if(!l.kikiTeaching?.[f])fail(`${l.id}: kikiTeaching.${f}`);
    for(const f of ['trigger','strategy','masteryEvidence'])if(!l.remediation?.[f])fail(`${l.id}: remediation.${f}`);
    if(as.filter(a=>a.lessonId===l.id).length!==5)fail(`${l.id}: expected 5 assessments`);
    if(new Set(as.filter(a=>a.lessonId===l.id).map(a=>a.questionActivity)).size!==5)fail(`${l.id}: assessments must be five distinct questions`);
  }
}
const prompts=new Set();
for(const a of assessments){
  const id=a.stableAssessmentId;if(!lessonIds.has(a.lessonId))fail(`${id}: unreachable lesson`);
  for(const f of ['assessmentType','questionActivity','correctAnswer','hint','explanation'])if(!a[f])fail(`${id}: missing ${f}`);
  if(a.rightsStatus!==RIGHTS)fail(`${id}: rights`);if(prompts.has(a.questionActivity))fail(`${id}: duplicate prompt`);prompts.add(a.questionActivity);
  if(!norm(a.correctAnswer))fail(`${id}: answer normalises to empty`);
  if(a.assessmentType==='multiple_choice'){const o=a.options;if(!Array.isArray(o)||o.length!==4||new Set(o.map(norm)).size!==4)fail(`${id}: options must be 4 distinct values`);if(o.filter(x=>norm(x)===norm(a.correctAnswer)).length!==1)fail(`${id}: exactly one option must equal the answer`)}
}
/* independent recomputation of the one numeric answer */
const compound=1000*1.1*1.1;const q=assessments.find(a=>a.questionActivity.startsWith('1000 rupees earns 10 percent'));if(!q||norm(q.correctAnswer)!==norm(String(Math.round(compound))))fail('compound interest answer mismatch');
/* collisions with earlier content */
const base={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};vm.createContext(base);
for(const f of fs.readdirSync('data').filter(f=>/^class6-social-science.*\.js$/.test(f)))vm.runInContext(read('data/'+f),base);
const old=new Set(base.window.KV_LESSONS.map(x=>x.id)),oldA=new Set(base.window.KV_ASSESSMENTS.map(x=>x.stableAssessmentId));
for(const id of lessonIds)if(old.has(id))fail(`lesson id collision: ${id}`);for(const id of aIds)if(oldA.has(id))fail(`assessment id collision: ${id}`);
/* runtime wiring */
const rt=read('class7-social-science-runtime-v1.js');for(const t of ['data/class7-social-science-part2-lessons.js','data/class7-social-science-part2-assessments.js','p2ch\\d+','window.KV_CLASS7_SOCIAL_SCIENCE_RUNTIME','kv:class7-social-science-ready'])if(!rt.includes(t))fail(`runtime wiring missing: ${t}`);
if(!read('lesson-check-v1.js').includes('class7-social-science-runtime-v1.js'))fail('lesson-check bridge missing');
console.log('PASS: Class 7 Social Science Part 2 — 8 verified chapters, 16 original lessons, 80 original assessments (KV-CBSE7-SOC-0001..0080), runtime wired, no id collisions.');
