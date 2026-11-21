/* KirthiVerse Class 8 Mathematics runtime v1 — route-deferred loader.
   Part I (Ganita Prakash, chapters 1–7) and Part II (chapters 1–7, ids prefixed p2ch) are separate batches.
   Loaded only on Class 8 Mathematics lesson routes, the Mathematics world and search, so unrelated surfaces keep their request budget. */
(()=>{
  const batches={
    part1:{lesson:'data/class8-math-part1-bundle-v1.js',assessment:'data/class8-math-part1-bundle-v1.js',version:'CBSE8-MATH-P1-1',flag:'class8MathPart1'},
    part2:{lesson:'data/class8-math-part2-bundle-v1.js',assessment:'data/class8-math-part2-bundle-v1.js',version:'CBSE8-MATH-P2-1',flag:'class8MathPart2'}
  };
  const loaded=new Set(),loading=new Map(),assetPromises=new Map();
  const relevantSurface=()=>['/world/mathematics','/search'].includes(location.pathname);
  const batchFromRoute=()=>/^\/lesson\/math\.cbse8\.ganita-prakash\.ch\d+\./.test(location.pathname)?'part1':/^\/lesson\/math\.cbse8\.ganita-prakash\.p2ch\d+\./.test(location.pathname)?'part2':null;
  const inject=(tag,src,version)=>{
    const key=`${src}?v=${version}`;
    if(assetPromises.has(key))return assetPromises.get(key);
    const work=new Promise((resolve,reject)=>{
      const existing=[...document.scripts].find(x=>x.src&&new URL(x.src,location.href).pathname===`/${src}`);
      if(existing){if(existing.dataset.loadFailed==='true')reject(new Error(`${tag} previously failed`));else if(existing.dataset.kvLoaded==='true'||existing.readyState==='complete')resolve();else{existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(new Error(`Failed to load ${src}`)),{once:true})}return}
      const s=document.createElement('script');s.async=false;s.src=`/${key}`;s.setAttribute(`data-${tag}`,'script');
      s.addEventListener('load',()=>{s.dataset.kvLoaded='true';resolve()},{once:true});s.addEventListener('error',()=>{s.dataset.loadFailed='true';reject(new Error(`Failed to load ${src}`))},{once:true});document.body.appendChild(s)
    });
    assetPromises.set(key,work);return work
  };
  async function loadBatch(name){
    const cfg=batches[name];if(!cfg||loaded.has(name))return;if(loading.has(name))return loading.get(name);
    document.documentElement.dataset.class8Math='loading';
    const work=(async()=>{try{
      await inject(`class8-math-${name}-lessons`,cfg.lesson,cfg.version);
      await inject(`class8-math-${name}-assessments`,cfg.assessment,cfg.version);
      loaded.add(name);document.documentElement.dataset[cfg.flag]='ready';document.documentElement.dataset.class8Math='ready';
      dispatchEvent(new PopStateEvent('popstate'));dispatchEvent(new CustomEvent('kv:class8-math-ready',{detail:{classLevel:8,subject:'Mathematics',batch:name,localOnly:true}}));
    }catch(error){document.documentElement.dataset.class8Math='load-error';document.documentElement.dataset[cfg.flag]='load-error';console.error('[KirthiVerse] Class 8 Mathematics load failed',error)}})();
    loading.set(name,work);await work;loading.delete(name)
  }
  function reconcile(){const direct=batchFromRoute();if(direct)loadBatch(direct);if(relevantSurface())for(const name of Object.keys(batches))loadBatch(name)}
  window.KV_CLASS8_MATH_RUNTIME={loadBatch,reconcile,batches:Object.freeze({...batches})};
  reconcile();addEventListener('popstate',reconcile);addEventListener('kv:rendered',reconcile)
})();
