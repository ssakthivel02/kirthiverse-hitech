/* KirthiVerse controlled-preview service worker v23 */
const VERSION='MANUS-VISUAL-MASTER-05-PWA-23';
const CACHE='kirthiverse-preview-v23';
const PRECACHE=[
  '/', '/index.html', '/manifest.webmanifest', '/kirthiverse-mark.svg',
  '/styles.css','/learning-foundation-v19.css','/learning-tools-v20.css','/visual-master-v15.css','/visual-master-pages-v15.css','/visual-master-features-v15.css',
  '/app.js','/navigation-v18.js','/runtime-lifecycle-v16.js','/learning-foundation-v19.js','/learning-tools-v20.js','/visual-master-v15.js','/profile-v17.js','/visual-master-pages-v15.js','/pwa-v23.js','/visual-preview-gate.js',
  '/data/lessons-1.js','/data/lessons-2.js','/data/lessons-3.js','/data/lessons-4.js','/data/lessons-5.js','/data/lessons-6.js','/data/assessments-1.js','/data/assessments-2.js','/data/assessments-3.js'
];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const results=await Promise.allSettled(PRECACHE.map(async url=>{
      const response=await fetch(url,{cache:'reload'});
      if(!response.ok)throw new Error(`${url} ${response.status}`);
      await cache.put(url,response.clone());
    }));
    const failed=results.filter(x=>x.status==='rejected');
    if(failed.length)console.warn('[KirthiVerse PWA] precache partial',failed.length);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('kirthiverse-preview-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
async function networkFirst(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request);
    if(response.ok)cache.put(request,response.clone());
    return response;
  }catch(error){
    return (await cache.match(request,{ignoreSearch:true}))||(request.mode==='navigate'?await cache.match('/'):undefined)||Response.error();
  }
}
async function cacheFirst(request){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request,{ignoreSearch:true});
  if(cached)return cached;
  const response=await fetch(request);
  if(response.ok)cache.put(request,response.clone());
  return response;
}
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'||['script','style'].includes(request.destination))event.respondWith(networkFirst(request));
  else event.respondWith(cacheFirst(request));
});
self.addEventListener('message',event=>{
  if(event.data==='KV_PWA_VERSION')event.source?.postMessage({type:'KV_PWA_VERSION',version:VERSION,cache:CACHE});
});
