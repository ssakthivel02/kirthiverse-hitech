const port=process.env.KV_DEBUG_PORT||'9342';
const pages=await fetch(`http://127.0.0.1:${port}/json/list`).then(r=>r.json());
const page=pages.find(x=>x.type==='page');if(!page)throw Error('No Chromium page target');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((ok,bad)=>{ws.onopen=ok;ws.onerror=bad});
let seq=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.bad(Error(m.error.message)):p.ok(m.result)}};
const send=(method,params={})=>new Promise((ok,bad)=>{const id=++seq;pending.set(id,{ok,bad});ws.send(JSON.stringify({id,method,params}))});
await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text||'Runtime error');return r.result?.value};
const wait=async(expression,label,timeout=25000)=>{const end=Date.now()+timeout;while(Date.now()<end){try{if(await ev(expression))return true}catch{}await new Promise(r=>setTimeout(r,250))}throw Error('Timeout: '+label)};
const nav=async path=>{await ev(`window.KV_NAVIGATION.navigate(${JSON.stringify(path)});true`);await wait(`location.pathname===${JSON.stringify(path)}`,'route '+path)};
const lesson='math.number.place-value.base10.age6-8.l1';
const METRICS='kirthiverse.hitech.pilot.metrics.v1',SPEED='kirthiverse.hitech.speedlab.v1',DIAG='kirthiverse.hitech.diagnostic.v1',CHECK='kirthiverse.hitech.lessoncheck.v1',GATE='kirthiverse.hitech.parentgate.v1',UNLOCK='kirthiverse.hitech.parentgate.unlocked.v1';

await wait(`!!window.KV_NAVIGATION&&!!window.KV_MASTERY&&!!window.KV_PILOT_METRICS`,'metrics runtime');
if(!(await ev(`window.KV_PILOT_METRICS.version==='v1'&&window.KV_PILOT_METRICS.localOnly===true&&window.KV_PILOT_METRICS.tamperEvident===false&&window.KV_PILOT_METRICS.backfillsHistory===false`)))throw Error('metrics evidence boundary mismatch');

const old=new Date(Date.now()-3600000).toISOString();
await ev(`localStorage.setItem(${JSON.stringify(SPEED)},JSON.stringify({history:[{at:${JSON.stringify(old)},skill:'multiplication',duration:60,correct:8,accuracy:80}],bestByKey:{},levelBySkill:{}}));localStorage.setItem(${JSON.stringify(DIAG)},JSON.stringify({completedAt:${JSON.stringify(old)},overallAccuracy:70,totalQuestions:10,correct:7}));localStorage.setItem(${JSON.stringify(CHECK)},JSON.stringify({[${JSON.stringify(lesson)}]:{at:${JSON.stringify(old)},correct:true,attempts:1}}));localStorage.removeItem(${JSON.stringify(METRICS)});location.reload();true`);
await wait(`!!window.KV_PILOT_METRICS`,'metrics runtime after baseline reload');
let summary=await ev(`window.KV_PILOT_METRICS.summary()`);
if(summary.quickSkillsSessions!==0||summary.diagnosticCompletions!==0||summary.answerChecks!==0)throw Error('historical source evidence was backfilled');

await nav('/weekly-report');await wait(`document.querySelector('main')?.textContent.includes('Unlock Parent Space first')`,'weekly report parent gate');
await ev(`localStorage.setItem(${JSON.stringify(GATE)},JSON.stringify({pinHash:'QA_ONLY_HASH',pinSalt:'QA_ONLY_SALT',pinIterations:120000,childName:'QA Learner',assistanceEnabled:true,createdAt:new Date().toISOString()}));sessionStorage.setItem(${JSON.stringify(UNLOCK)},'1');true`);
await ev(`(()=>{const at=new Date().toISOString();const s=JSON.parse(localStorage.getItem(${JSON.stringify(SPEED)}));s.history.push({at,skill:'multiplication',duration:60,correct:9,accuracy:90});localStorage.setItem(${JSON.stringify(SPEED)},JSON.stringify(s));localStorage.setItem(${JSON.stringify(DIAG)},JSON.stringify({completedAt:at,overallAccuracy:90,totalQuestions:10,correct:9}));localStorage.setItem(${JSON.stringify(CHECK)},JSON.stringify({[${JSON.stringify(lesson)}]:{at,correct:true,attempts:1}}));dispatchEvent(new Event('kv:rendered'));return true})()`);
await wait(`window.KV_PILOT_METRICS.summary().quickSkillsSessions===1&&window.KV_PILOT_METRICS.summary().diagnosticCompletions===1&&window.KV_PILOT_METRICS.summary().answerChecks===1`,'new evidence sync');

await nav('/lesson/'+lesson);await wait(`!!document.getElementById('complete')`,'lesson route');
await ev(`document.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));true`);
await new Promise(r=>setTimeout(r,16500));
await ev(`document.getElementById('complete').click();true`);
await new Promise(r=>setTimeout(r,300));
summary=await ev(`window.KV_PILOT_METRICS.summary()`);
if(summary.activeSeconds<15||summary.activeDays<1)throw Error('active learning heartbeat not measured');
if(summary.uniqueLessonsStarted<1||summary.uniqueLessonsCompleted<1)throw Error('lesson start/completion metrics missing');
if(summary.completeSevenDayWindow!==false||summary.observationDays!==1)throw Error('early observation window was overstated');
if(summary.evidenceBoundary.tamperEvident!==false||summary.evidenceBoundary.backfilledHistory!==false)throw Error('evidence boundary missing');

await nav('/weekly-report');await wait(`document.querySelector('main')?.textContent.includes('Early pilot window')`,'weekly report early-window warning');
if(!(await ev(`document.querySelector('main').textContent.includes('ACTIVE LEARNING')&&document.querySelector('main').textContent.includes('EVIDENCE BOUNDARY')`)))throw Error('weekly report metrics/evidence sections missing');
const exported=await ev(`(async()=>{window.__pmBlob=null;const old=URL.createObjectURL;URL.createObjectURL=b=>{window.__pmBlob=b;return 'blob:qa'};const click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){};document.getElementById('pm-export').click();const text=await window.__pmBlob.text();URL.createObjectURL=old;HTMLAnchorElement.prototype.click=click;return text})()`);
const payload=JSON.parse(exported);if(payload.claim!=='LOCAL_PILOT_EVIDENCE_ONLY'||payload.evidenceBoundary.tamperEvident!==false||payload.evidenceBoundary.networkTelemetry!==false)throw Error('weekly evidence export contract invalid');
if(exported.includes('QA_ONLY_HASH')||exported.includes('QA_ONLY_SALT')||exported.includes('pinHash')||exported.includes('pinSalt')||exported.includes('childName'))throw Error('weekly evidence export leaked parent identity/gate material');

await nav('/parent');await wait(`!!document.querySelector('.pm-parent-card')`,'parent weekly card');
await nav('/educator');await wait(`!!document.querySelector('.pm-educator-card')`,'educator weekly card');
if(!(await ev(`document.querySelector('.pm-educator-card').textContent.includes('linked learner')||document.querySelector('.pm-educator-card').textContent.includes('LINKED LEARNER')`)))throw Error('educator linked-learner boundary missing');
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await new Promise(r=>setTimeout(r,250));
await nav('/weekly-report');if(await ev(`document.documentElement.scrollWidth>document.documentElement.clientWidth+2`))throw Error('weekly report mobile horizontal overflow');
await ev(`navigator.serviceWorker.register('/sw-v30.js',{scope:'/',updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(()=>true)`);await wait(`caches.keys().then(k=>k.includes('kirthiverse-preview-v44'))`,'v44 cache');
const cached=await ev(`caches.open('kirthiverse-preview-v44').then(async c=>(await Promise.all(['/pilot-metrics-v1.js','/pilot-metrics-v1.css'].map(x=>c.match(x).then(Boolean)))).every(Boolean))`);if(!cached)throw Error('pilot metrics assets missing from active PWA cache');

console.log('PILOT_METRICS_BROWSER_PASS');
console.log(JSON.stringify({activeSeconds:summary.activeSeconds,activeDays:summary.activeDays,quickSkillsSessions:summary.quickSkillsSessions,diagnosticCompletions:summary.diagnosticCompletions,answerChecks:summary.answerChecks,uniqueLessonsStarted:summary.uniqueLessonsStarted,uniqueLessonsCompleted:summary.uniqueLessonsCompleted,completeSevenDayWindow:summary.completeSevenDayWindow},null,2));
ws.close();