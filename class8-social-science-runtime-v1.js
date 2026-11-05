/* KirthiVerse Class 8 Social Science runtime v1 — route-deferred loader.
   Parts 1 and 2 are registered here.
   Loads only on Class 8 Social Science lesson routes, the Geography/History worlds and search. */
(()=>{
  const batches={
    part1:{lesson:'data/class8-social-science-part1-lessons.js',assessment:'data/class8-social-science-part1-assessments.js',version:'CBSE8-SOC-P1-1',flag:'class8SocialSciencePart1'},
    part2:{lesson:'data/class8-social-science-part2-lessons.js',assessment:'data/class8-social-science-part2-assessments.js',version:'CBSE8-SOC-P2-1',flag:'class8SocialSciencePart2'}
  };
  const loaded=new Set(),loading=new Map(),assetPromises=new Map();
  const relevantSurface=()=>['/world/geography','/world/history','/search'].includes(location.pathname);
  const batchFromRoute=()=>{const m=location.pathname.match(/^\/lesson\/social-science\.cbse8\.exploring-society\.p(\d)ch\d+\./);return m&&batches['part'+m[1]]?'part'+m[1]:null};
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
    document.documentElement.dataset.class8SocialScience='loading';
    const work=(async()=>{try{
      await inject(`class8-social-science-${name}-lessons`,cfg.lesson,cfg.version);
      await inject(`class8-social-science-${name}-assessments`,cfg.assessment,cfg.version);
      loaded.add(name);document.documentElement.dataset[cfg.flag]='ready';
      document.documentElement.dataset.class8SocialScience=Object.keys(batches).every(k=>loaded.has(k))?'ready':'partial';
      dispatchEvent(new PopStateEvent('popstate'));dispatchEvent(new CustomEvent('kv:class8-social-science-ready',{detail:{classLevel:8,subject:'Social Science',batch:name,localOnly:true}}));
    }catch(error){document.documentElement.dataset.class8SocialScience='load-error';document.documentElement.dataset[cfg.flag]='load-error';console.error('[KirthiVerse] Class 8 Social Science load failed',error)}})();
    loading.set(name,work);await work;loading.delete(name)
  }
  function reconcile(){const direct=batchFromRoute();if(direct)loadBatch(direct);if(relevantSurface())for(const name of Object.keys(batches))loadBatch(name)}
  window.KV_CLASS8_SOCIAL_SCIENCE_RUNTIME={loadBatch,reconcile,batches:Object.freeze({...batches})};
  reconcile();addEventListener('popstate',reconcile);addEventListener('kv:rendered',reconcile)
})();
