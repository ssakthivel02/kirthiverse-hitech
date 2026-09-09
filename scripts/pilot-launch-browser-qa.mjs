const port=process.env.KV_DEBUG_PORT||'9344';
const pages=await fetch(`http://127.0.0.1:${port}/json/list`).then(r=>r.json());
const page=pages.find(x=>x.type==='page');if(!page)throw Error('No Chromium page target');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((ok,bad)=>{ws.onopen=ok;ws.onerror=bad});
let seq=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.bad(Error(m.error.message)):p.ok(m.result)}};
const send=(method,params={})=>new Promise((ok,bad)=>{const id=++seq;pending.set(id,{ok,bad});ws.send(JSON.stringify({id,method,params}))});
await send('Runtime.enable');await send('Page.enable');
const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text||JSON.stringify(r.exceptionDetails));return r.result?.value};
const wait=async(expression,label,timeout=20000)=>{const end=Date.now()+timeout;while(Date.now()<end){try{if(await ev(expression))return true}catch{}await new Promise(r=>setTimeout(r,250))}throw Error('Timeout: '+label)};
const nav=async path=>{await ev(`window.KV_NAVIGATION.navigate(${JSON.stringify(path)});true`);await wait(`location.pathname===${JSON.stringify(path)}`,'route '+path)};
await wait(`!!window.KV_NAVIGATION&&!!window.KV_PARENT_RUNTIME&&!!window.KV_PILOT_METRICS&&!!window.KV_PILOT_LAUNCH`,'P4 runtimes');
if(!(await ev(`window.KV_PILOT_LAUNCH.localOnly===true&&window.KV_PILOT_LAUNCH.adultIdentityVerified===false&&window.KV_PILOT_LAUNCH.legalConsentVerified===false&&window.KV_PILOT_LAUNCH.productionReady===false`)))throw Error('Pilot launch evidence boundary mismatch');

// Locked pilot route must redirect the adult to Parent Space, not pretend identity exists.
await nav('/pilot-readiness');await wait(`!!document.querySelector('a[href="/parent"]')`,'pilot locked view');

// Create the existing local Parent Space, then confirm P4 pilot form becomes available.
await nav('/parent');await wait(`!!document.getElementById('pv-setup')`,'parent setup');
await ev(`document.getElementById('pv-child').value='Pilot Learner';document.getElementById('pv-pin').value='4826';document.getElementById('pv-setup').requestSubmit();true`);await wait(`!!document.getElementById('pv-export')`,'parent unlocked');
await nav('/pilot-readiness');await wait(`!!document.getElementById('pl-start')`,'pilot setup');
if(await ev(`document.getElementById('pl-assist').checked`))throw Error('Pilot assistance must default OFF');

// Start a pilot with adult self-attestation; bounded assistance remains OFF.
const target=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
await ev(`document.getElementById('pl-alias').value='Learner A';document.getElementById('pl-target').value=${JSON.stringify(target)};document.getElementById('pl-ack').checked=true;document.getElementById('pl-start').requestSubmit();true`);await wait(`window.KV_PILOT_LAUNCH.state()?.status==='active'`,'pilot active');
const launch=await ev(`window.KV_PILOT_LAUNCH.state()`);if(launch.adultAcknowledgement.mode!=='self-attestation'||launch.adultAcknowledgement.identityVerified!==false||launch.adultAcknowledgement.legalConsentVerified!==false)throw Error('Adult acknowledgement overclaims identity/consent');if(launch.assistanceEnabledAtStart!==false)throw Error('Pilot assistance state not OFF');
const gate=await ev(`JSON.parse(localStorage.getItem('kirthiverse.hitech.parentgate.v1'))`);if(gate.assistanceEnabled!==false)throw Error('Parent assistance was not disabled at pilot start');if(!gate.pinHash||!gate.pinSalt)throw Error('Parent gate secret fields unexpectedly lost');

// Create genuine post-start local evidence through the existing metrics API, then end and freeze summary.
await ev(`window.KV_PILOT_METRICS.record('lesson_started',{lessonId:'qa.lesson'},new Date().toISOString());window.KV_PILOT_METRICS.record('lesson_completed',{lessonId:'qa.lesson'},new Date().toISOString());true`);
await ev(`document.getElementById('pl-end').click();true`);await wait(`window.KV_PILOT_LAUNCH.state()?.status==='ended'`,'pilot ended');
const ended=await ev(`window.KV_PILOT_LAUNCH.state()`);if(!ended.endedAt||!ended.finalSummary?.metrics)throw Error('Final pilot summary not frozen');if(ended.finalSummary.metrics.uniqueLessonsCompleted<1)throw Error('Final summary missing post-start learning evidence');

// Export must expose evidence boundary and never Parent PIN secret material.
const exportText=await ev(`(async()=>{window.__plBlob=null;const old=URL.createObjectURL;URL.createObjectURL=b=>{window.__plBlob=b;return 'blob:p4qa'};const oldClick=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){};document.getElementById('pl-export').click();const text=await window.__plBlob.text();URL.createObjectURL=old;HTMLAnchorElement.prototype.click=oldClick;return text})()`);
if(exportText.includes('4826')||exportText.includes('pinHash')||exportText.includes('pinSalt')||exportText.includes('pinIterations'))throw Error('Pilot export leaked Parent PIN material');const bundle=JSON.parse(exportText);if(bundle.evidenceBoundary.legalConsentVerified!==false||bundle.evidenceBoundary.adultIdentityVerified!==false||bundle.evidenceBoundary.productionReady!==false)throw Error('Export evidence boundary mismatch');

// Pilot-only reset must preserve ordinary learning progress and Parent Space.
await ev(`localStorage.setItem('kirthiverse.hitech.static.progress.v2',JSON.stringify({started:['keep'],completed:['keep']}));localStorage.setItem('kirthiverse.hitech.educator.pilot.v1',JSON.stringify({className:'reset-me'}));window.confirm=()=>true;document.getElementById('pl-reset').click();true`);await wait(`!localStorage.getItem('kirthiverse.hitech.pilot.launch.v1')`,'pilot reset');
if(!(await ev(`!!localStorage.getItem('kirthiverse.hitech.static.progress.v2')&&!!localStorage.getItem('kirthiverse.hitech.parentgate.v1')&&!localStorage.getItem('kirthiverse.hitech.educator.pilot.v1')&&!localStorage.getItem('kirthiverse.hitech.pilot.metrics.v1')`)))throw Error('Pilot-only reset scope incorrect');

// Full deletion removes only KirthiVerse-prefixed local/session keys and leaves unrelated origin storage intact.
await nav('/pilot-readiness');await wait(`!!document.getElementById('pl-start')`,'pilot setup after reset');
await ev(`localStorage.setItem('unrelated.keep','yes');sessionStorage.setItem('unrelated.session','yes');document.getElementById('pl-delete-confirm').value='DELETE LOCAL DATA';document.getElementById('pl-delete-confirm').dispatchEvent(new Event('input',{bubbles:true}));window.confirm=()=>true;document.getElementById('pl-delete').click();true`);await new Promise(r=>setTimeout(r,1200));
const deletion=await ev(`({kvLocal:Object.keys(localStorage).filter(k=>k.startsWith('kirthiverse.hitech.')).length,kvSession:Object.keys(sessionStorage).filter(k=>k.startsWith('kirthiverse.hitech.')).length,unrelated:localStorage.getItem('unrelated.keep'),unrelatedSession:sessionStorage.getItem('unrelated.session')})`);if(deletion.kvLocal||deletion.kvSession||deletion.unrelated!=='yes'||deletion.unrelatedSession!=='yes')throw Error('Full local deletion scope incorrect');

// Mobile overflow and PWA cache for launch assets.
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await nav('/');if(!(await ev(`document.documentElement.scrollWidth<=window.innerWidth+1`)))throw Error('Mobile horizontal overflow');
await ev(`navigator.serviceWorker.register('/sw-v30.js',{scope:'/',updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(()=>true)`);await wait(`caches.keys().then(k=>k.includes('kirthiverse-preview-v31'))`,'v31 cache');const cached=await ev(`caches.open('kirthiverse-preview-v31').then(async c=>(await Promise.all(['/pilot-launch-v1.js','/pilot-launch-v1.css'].map(x=>c.match(x).then(Boolean)))).every(Boolean))`);if(!cached)throw Error('Pilot launch assets missing from PWA cache');
console.log('PILOT_LAUNCH_BROWSER_PASS');
console.log(JSON.stringify({status:ended.status,assistanceEnabledAtStart:ended.assistanceEnabledAtStart,identityVerified:ended.adultAcknowledgement.identityVerified,legalConsentVerified:ended.adultAcknowledgement.legalConsentVerified,completedLessons:ended.finalSummary.metrics.uniqueLessonsCompleted},null,2));
ws.close();