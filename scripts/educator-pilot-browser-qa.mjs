const port=process.env.KV_DEBUG_PORT||'9340';
const pages=await fetch(`http://127.0.0.1:${port}/json/list`).then(r=>r.json());
const page=pages.find(x=>x.type==='page');if(!page)throw Error('No Chromium page target');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((ok,bad)=>{ws.onopen=ok;ws.onerror=bad});
let seq=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.bad(Error(m.error.message)):p.ok(m.result)}};
const send=(method,params={})=>new Promise((ok,bad)=>{const id=++seq;pending.set(id,{ok,bad});ws.send(JSON.stringify({id,method,params}))});
await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text||'Runtime error');return r.result?.value};
const wait=async(expression,label,timeout=20000)=>{const end=Date.now()+timeout;while(Date.now()<end){try{if(await ev(expression))return true}catch{}await new Promise(r=>setTimeout(r,250))}throw Error('Timeout: '+label)};
const nav=async path=>{await ev(`window.KV_NAVIGATION.navigate(${JSON.stringify(path)});true`);await wait(`location.pathname===${JSON.stringify(path)}`,'route '+path)};
const lesson='math.number.place-value.base10.age6-8.l1';

await wait(`!!window.KV_NAVIGATION&&!!window.KV_MASTERY`,'core + mastery');
await wait(`!!document.querySelector('script[data-ep-pilot]')`,'educator module loader');
await wait(`!!document.querySelector('.topbar nav a[href="/educator"]')`,'educator nav');

await nav('/educator');await wait(`document.querySelector('main')?.textContent.includes('Unlock Parent Space first')`,'locked educator state');
await nav('/parent');await wait(`!!document.getElementById('pv-setup')`,'parent setup');
await ev(`document.getElementById('pv-child').value='Pilot Learner';document.getElementById('pv-pin').value='4826';document.getElementById('pv-setup').requestSubmit();true`);
await wait(`!!document.getElementById('pv-export')`,'parent unlocked');

await nav('/educator');await wait(`!!document.getElementById('ep-assignment-form')`,'educator dashboard');
if(!(await ev(`document.querySelectorAll('.ep-roster li').length===1&&document.querySelector('.ep-roster').textContent.includes('Linked local learner')`)))throw Error('linked local learner missing');
if(!(await ev(`document.querySelector('.ep-table')===null&&document.querySelector('main').textContent.includes('No assignments yet')`)))throw Error('honest empty state missing');

await ev(`document.getElementById('ep-learner-alias').value='Pilot Alias B';document.getElementById('ep-learner-form').requestSubmit();true`);await wait(`document.querySelectorAll('.ep-roster li').length===2`,'second roster alias');
if(!(await ev(`document.querySelector('.ep-roster').textContent.includes('Alias only — no device evidence')`)))throw Error('unlinked evidence boundary missing');
if(!(await ev(`[...document.getElementById('ep-lesson').options].some(o=>o.value===${JSON.stringify(lesson)})`)))throw Error('canonical lesson missing');
await ev(`document.getElementById('ep-lesson').value=${JSON.stringify(lesson)};document.querySelectorAll('input[name="ep-learner"]').forEach(x=>x.checked=true);document.getElementById('ep-assignment-form').requestSubmit();true`);await wait(`document.querySelectorAll('.ep-table tbody tr').length===2`,'assignment rows');
let rows=await ev(`[...document.querySelectorAll('.ep-table tbody tr')].map(r=>r.textContent)`);if(!rows.some(x=>x.includes('No evidence yet'))||!rows.some(x=>x.includes('No device evidence')))throw Error('honest assignment states missing');

await ev(`localStorage.setItem('kirthiverse.hitech.static.progress.v2',JSON.stringify({started:[${JSON.stringify(lesson)}],completed:[${JSON.stringify(lesson)}],agePath:'all'}));window.KV_NAVIGATION.navigate('/');window.KV_NAVIGATION.navigate('/educator');true`);await wait(`document.querySelector('.ep-table')?.textContent.includes('Completed')`,'linked completion');
rows=await ev(`[...document.querySelectorAll('.ep-table tbody tr')].map(r=>r.textContent)`);if(rows.filter(x=>x.includes('Completed')).length!==1||rows.filter(x=>x.includes('No device evidence')).length!==1)throw Error('linked/unlinked evidence isolation failed');

const exported=await ev(`(async()=>{window.__epBlob=null;const old=URL.createObjectURL;URL.createObjectURL=b=>{window.__epBlob=b;return 'blob:qa'};const click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){};document.getElementById('ep-export').click();const text=await window.__epBlob.text();URL.createObjectURL=old;HTMLAnchorElement.prototype.click=click;return text})()`);
if(exported.includes('pinHash')||exported.includes('pinSalt')||exported.includes('4826'))throw Error('educator export leaked parent gate material');
const payload=JSON.parse(exported);if(payload.localOnly!==true||payload.notSchoolAccount!==true||payload.assignments.length!==1)throw Error('educator export contract invalid');

await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await new Promise(r=>setTimeout(r,250));if(await ev(`document.documentElement.scrollWidth>document.documentElement.clientWidth+2`))throw Error('mobile horizontal overflow');
await ev(`navigator.serviceWorker.register('/sw-v30.js',{scope:'/',updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(()=>true)`);await wait(`caches.keys().then(k=>k.includes('kirthiverse-preview-v31'))`,'v31 cache');
const cached=await ev(`caches.open('kirthiverse-preview-v31').then(async c=>(await Promise.all(['/educator-pilot-v1.js','/educator-pilot-v1.css'].map(x=>c.match(x).then(Boolean)))).every(Boolean))`);if(!cached)throw Error('educator assets missing from PWA cache');

console.log('EDUCATOR_PILOT_BROWSER_PASS');ws.close();
