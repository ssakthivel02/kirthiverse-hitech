import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=readFileSync('sw-v30.js','utf8');
for(const fault of ['none','http','html']){
  const events=new Map(),stores=new Map([['kirthiverse-preview-v49',new Map([['old','old bytes']])]]);
  let skipWaiting=false;
  const sandbox={Response,URL,console,
    self:{addEventListener:(name,fn)=>events.set(name,fn),skipWaiting:async()=>{skipWaiting=true},clients:{claim:async()=>{}},location:{origin:'https://qa.invalid'}},
    caches:{open:async name=>{if(!stores.has(name))stores.set(name,new Map());return {put:async(url,response)=>stores.get(name).set(url,response)}},keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name)},
    fetch:async url=>url==='/data/class8-science-bundle-v2.js'&&fault!=='none'
      ?new Response(fault==='html'?'<html>SPA fallback</html>':'Unavailable',{status:fault==='http'?503:200,headers:{'Content-Type':fault==='html'?'text/html':'text/plain'}})
      :new Response('/* synthetic cache admission fixture */',{headers:{'Content-Type':'application/javascript'}})};
  vm.runInNewContext(source,sandbox);
  let pending;events.get('install')({waitUntil:p=>{pending=p}});
  if(fault==='none'){
    await pending;assert.equal(skipWaiting,true);
    assert(stores.get('kirthiverse-preview-v50').has('/data/class8-science-bundle-v2.js'));
    events.get('activate')({waitUntil:p=>{pending=p}});await pending;
    assert.equal(stores.has('kirthiverse-preview-v49'),false);
  }else{
    await assert.rejects(pending,/Class 8 precache incomplete/);
    assert.equal(skipWaiting,false);
    assert.equal(stores.get('kirthiverse-preview-v49').get('old'),'old bytes');
  }
}
console.log('CLASS8_CACHE_ADMISSION_PASS success activates; HTTP/HTML failures retain previous worker/cache');
