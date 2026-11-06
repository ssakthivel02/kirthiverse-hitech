/* KirthiVerse Class 8 Science runtime v1 — route-deferred loader.
   Chapters 1–13 are one shared batch. Loaded only on Class 8 Science lesson routes, the Science world and search. */
(()=>{
  const batches={
    all:{lesson:'data/class8-science-bundle-v1.js',assessment:'data/class8-science-bundle-v1.js',version:'CBSE8-SCI-1'}
  };
  const loaded=new Set(),loading=new Map(),assetPromises=new Map();
  const relevantSurface=()=>['/world/science','/search'].includes(location.pathname);
  const batchFromRoute=()=>/^\/lesson\/science\.cbse8\.curiosity\.ch\d+\./.test(location.pathname)?'all':null;
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
    document.documentElement.dataset.class8Science='loading';
    const work=(async()=>{try{
      await inject(`class8-science-${name}-lessons`,cfg.lesson,cfg.version);
      await inject(`class8-science-${name}-assessments`,cfg.assessment,cfg.version);
      loaded.add(name);document.documentElement.dataset.class8Science='ready';
      dispatchEvent(new PopStateEvent('popstate'));dispatchEvent(new CustomEvent('kv:class8-science-ready',{detail:{classLevel:8,subject:'Science',batch:name,localOnly:true}}));
    }catch(error){document.documentElement.dataset.class8Science='load-error';console.error('[KirthiVerse] Class 8 Science load failed',error)}})();
    loading.set(name,work);await work;loading.delete(name)
  }
  function reconcile(){const direct=batchFromRoute();if(direct)loadBatch(direct);if(relevantSurface())for(const name of Object.keys(batches))loadBatch(name)}
  window.KV_CLASS8_SCIENCE_RUNTIME={loadBatch,reconcile,batches:Object.freeze({...batches})};
  reconcile();addEventListener('popstate',reconcile);addEventListener('kv:rendered',reconcile)
})();
