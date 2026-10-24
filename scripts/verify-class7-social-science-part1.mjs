import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const fail=m=>{throw Error(m)};
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};
vm.createContext(sandbox);
for(const path of ['data/class7-social-science-unit-map-v1.js','data/class7-social-science-part1-lessons.js','data/class7-social-science-part1-assessments.js'])vm.runInContext(read(path),sandbox,{filename:path});
const {KV_LESSONS:lessons,KV_ASSESSMENTS:assessments,KV_CLASS7_SOCIAL_SCIENCE_UNIT_MAP:map}=sandbox.window;
const RIGHTS='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_PROSE_OR_EXERCISE_REPRODUCTION';
const units=map.units.filter(x=>x.part===1);
if(units.length!==12)fail('Part 1 unit map must hold twelve chapters');
if(lessons.length!==24)fail(`Expected 24 Part 1 lessons, got ${lessons.length}`);
if(assessments.length!==120)fail(`Expected 120 Part 1 assessments, got ${assessments.length}`);
const lessonIds=new Set(lessons.map(x=>x.id));
if(lessonIds.size!==24)fail('Duplicate Part 1 lesson ids');
const ids=assessments.map(x=>x.stableAssessmentId);
if(new Set(ids).size!==120)fail('Duplicate Part 1 assessment ids');
for(let i=0;i<120;i++)if(ids[i]!==`KV-CBSE7-SOC-${String(i+81).padStart(4,'0')}`)fail(`Assessment id range/order error at ${ids[i]}`);
const norm=s=>String(s??'').trim().toLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
const allQuestions=new Set();
for(const unit of units){
  const ls=lessons.filter(x=>x.chapter===unit.chapter),as=assessments.filter(x=>x.chapter===unit.chapter);
  if(ls.length!==2)fail(`Chapter ${unit.chapter}: expected two lessons`);
  if(as.length!==10)fail(`Chapter ${unit.chapter}: expected ten assessments`);
  for(const l of ls){
    if(l.chapterTitle!==unit.title)fail(`${l.id}: chapter title differs from unit map`);
    if(!l.id.startsWith(`social-science.cbse7.exploring-society.p1ch${unit.chapter}.`))fail(`${l.id}: lesson id prefix`);
    if(l.subject!=='Social Science'||l.worldId!=='geography'||l.board!=='CBSE'||l.classLevel!==7||l.part!==1||l.curriculumSession!=='2026-27'||l.book!=='Exploring Society: India and Beyond')fail(`${l.id}: curriculum metadata mismatch`);
    if(l.rightsStatus!==RIGHTS)fail(`${l.id}: copyright boundary mismatch`);
    for(const field of ['title','learningObjective','content','workedExample','topicId'])if(!l[field])fail(`${l.id}: missing ${field}`);
    if(l.content.length<300)fail(`${l.id}: explanation is too short`);
    for(const field of ['objective','intro','priorKnowledge','visualIdea','misconceptionCheck','recap','parentPrompt'])if(!l.kikiTeaching?.[field])fail(`${l.id}: missing Kiki teaching field ${field}`);
    for(const field of ['trigger','strategy','masteryEvidence'])if(!l.remediation?.[field])fail(`${l.id}: missing remediation field ${field}`);
    const own=as.filter(a=>a.lessonId===l.id);
    if(own.length!==5||new Set(own.map(a=>a.questionActivity)).size!==5)fail(`${l.id}: expected five distinct questions`);
  }
}
for(const a of assessments){
  if(!lessonIds.has(a.lessonId))fail(`${a.stableAssessmentId}: lesson missing`);
  if(a.rightsStatus!==RIGHTS)fail(`${a.stableAssessmentId}: copyright boundary mismatch`);
  for(const field of ['questionActivity','correctAnswer','hint','explanation'])if(!a[field])fail(`${a.stableAssessmentId}: missing ${field}`);
  if(allQuestions.has(a.questionActivity))fail(`${a.stableAssessmentId}: repeated question`);
  allQuestions.add(a.questionActivity);
  if(a.assessmentType==='multiple_choice'){
    if(!Array.isArray(a.options)||a.options.length!==4||new Set(a.options.map(norm)).size!==4)fail(`${a.stableAssessmentId}: needs four distinct options`);
    if(a.options.filter(x=>norm(x)===norm(a.correctAnswer)).length!==1)fail(`${a.stableAssessmentId}: correct option must appear exactly once`);
  }
}
const runtime=read('class7-social-science-runtime-v1.js');
for(const token of ['data/class7-social-science-part1-lessons.js','data/class7-social-science-part1-assessments.js','p1ch\\d+','Part1','Part2','window.KV_CLASS7_SOCIAL_SCIENCE_RUNTIME'])if(!runtime.includes(token))fail(`runtime missing ${token}`);
if(!read('lesson-check-v1.js').includes('class7-social-science-runtime-v1.js'))fail('Social Science runtime bridge missing');
console.log('CLASS7_SOCIAL_SCIENCE_PART1_CORPUS_PASS');
