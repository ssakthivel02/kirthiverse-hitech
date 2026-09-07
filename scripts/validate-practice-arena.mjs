import fs from 'node:fs';
import vm from 'node:vm';

const need=(ok,msg)=>{if(!ok)throw new Error(msg)};
const read=p=>fs.readFileSync(p,'utf8');

const html=read('practice.html');
const js=read('practice-arena.js');
const css=read('practice-arena.css');
const visual=read('visual-controller-v27.js');

for (const marker of ['practice-arena.css','practice-arena.js','data/assessments-1.js','data/assessments-2.js','data/assessments-3.js']) {
  need(html.includes(marker),`practice.html missing ${marker}`);
}
for (const marker of ['3 min','5 min','10 min','Calm Mode','Try again','Got it ✓','stableAssessmentId','localStorage']) {
  need(js.includes(marker),`practice runtime missing ${marker}`);
}
for (const forbidden of ['fetch(','XMLHttpRequest','WebSocket(','navigator.sendBeacon','getUserMedia','MediaRecorder']) {
  need(!js.includes(forbidden),`forbidden network/device capability in practice runtime: ${forbidden}`);
}
need(css.includes('prefers-reduced-motion:reduce'),'reduced-motion support missing');
need(/@media\(max-width:\d+px\)/.test(css),'small-screen support missing');
need(css.includes('.pa-modes{grid-template-columns:1fr}'),'mobile single-column mission modes missing');

for (const marker of ["a.href='/practice.html'","vm-nav-practice","vm-practice-cta","practiceArenaEntry:true","practiceArenaDirectLink:true"]) {
  need(visual.includes(marker),`visual master missing practice integration marker: ${marker}`);
}
const practiceBlock=visual.split('practice=()=>{',2)[1]?.split('},nav=',1)[0]||'';
need(practiceBlock.includes("a.href='/practice.html'"),'practice integration must target standalone arena page');
need(!practiceBlock.includes("dataset.link"),'practice links must bypass SPA data-link routing');

const context={window:{KV_ASSESSMENTS:[]}};
vm.createContext(context);
for (const p of ['data/assessments-1.js','data/assessments-2.js','data/assessments-3.js']) {
  vm.runInContext(read(p),context,{filename:p});
}
const A=context.window.KV_ASSESSMENTS;
need(Array.isArray(A)&&A.length>0,'canonical assessment corpus did not load');
const ids=A.map(a=>a.stableAssessmentId);
need(ids.every(Boolean),'every assessment must expose stableAssessmentId');
need(new Set(ids).size===ids.length,'stableAssessmentId values must be unique');
need(A.every(a=>a.lessonId),'every assessment must link to a lesson');
need(A.every(a=>a.correctAnswer),'every assessment must have canonical guidance');
need(A.every(a=>typeof a.questionActivity==='string'||a.questionActivity?.prompt),'every assessment must expose a renderable prompt');

const uidExpr=/a\.stableAssessmentId\|\|a\.id\|\|a\.assessmentId/;
need(uidExpr.test(js),'arena must prioritise stableAssessmentId');
need(js.includes('retryIds'),'retry queue contract missing');
need(js.includes('slice(-200)'),'bounded local history contract missing');

console.log(`PRACTICE_ARENA_CONTRACT_PASS: ${A.length} canonical assessments; unique stable IDs; local-only runtime; visual-master direct entry; reduced-motion/mobile markers present`);
