/* KirthiVerse Class 7 Social Science runtime v1 — route-deferred loader.
   Part 1 and Part 2 use separate route-deferred batches. */
(()=>{
  const batches={
    part1:{lesson:'data/class7-social-science-part1-lessons.js',assessment:'data/class7-social-science-part1-assessments.js',version:'CBSE7-SOC-P1-1'},
    part2:{lesson:'data/class7-social-science-part2-lessons.js',assessment:'data/class7-social-science-part2-assessments.js',version:'CBSE7-SOC-P2-1'}
  };
  const loaded=new Set(),loading=new Map(),assetPromises=new Map();
  const relevantSurface=()=>['/search','/practice','/practice-arena','/diagnostic'].includes(location.pathname)||new URLSearchParams(location.search).has('release-closure');
  const batchFromRoute=()=>{const p=location.pathname;if(/^\/lesson\/social-science\.cbse7\.exploring-society\.p1ch\d+\./.test(p))return'part1';if(/^\/lesson\/social-science\.cbse7\.exploring-society\.p2ch\d+\./.test(p))return'part2';return null};
  const inject=(tag,src,version)=>{
    const key=src+'?v='+version;
    if(assetPromises.has(key))return assetPromises.get(key);
    const work=new Promise((resolve,reject)=>{
      const existing=[...document.scripts].find(x=>x.src&&new URL(x.src,location.href).pathname==='/'+src);
      if(existing){if(existing.dataset.loadFailed==='true')reject(new Error(tag+' previously failed'));else if(existing.dataset.kvLoaded==='true'||existing.readyState==='complete')resolve();else{existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(new Error('Failed to load '+src)),{once:true})}return}
      const s=document.createElement('script');s.async=false;s.src='/'+key;s.setAttribute('data-'+tag,'script');
      s.addEventListener('load',()=>{s.dataset.kvLoaded='true';resolve()},{once:true});s.addEventListener('error',()=>{s.dataset.loadFailed='true';reject(new Error('Failed to load '+src))},{once:true});document.body.appendChild(s)
    });
    assetPromises.set(key,work);return work
  };
  async function loadBatch(name){
    const cfg=batches[name];if(!cfg||loaded.has(name))return;if(loading.has(name))return loading.get(name);
    document.documentElement.dataset.class7SocialScience='loading';
    const work=(async()=>{try{
      await inject('class7-social-science-'+name+'-lessons',cfg.lesson,cfg.version);
      await inject('class7-social-science-'+name+'-assessments',cfg.assessment,cfg.version);
      loaded.add(name);document.documentElement.dataset[`class7SocialScience${name==='part1'?'Part1':'Part2'}`]='ready';document.documentElement.dataset.class7SocialScience='ready';
      dispatchEvent(new PopStateEvent('popstate'));dispatchEvent(new CustomEvent('kv:class7-social-science-ready',{detail:{classLevel:7,subject:'Social Science',batch:name,localOnly:true}}))
    }catch(error){document.documentElement.dataset.class7SocialScience='load-error';document.documentElement.dataset[`class7SocialScience${name==='part1'?'Part1':'Part2'}`]='load-error';console.error('[KirthiVerse] Class 7 Social Science load failed',error)}})();
    loading.set(name,work);await work;loading.delete(name)
  }
  function reconcile(){const direct=batchFromRoute();if(direct)loadBatch(direct);if(relevantSurface())for(const name of Object.keys(batches))loadBatch(name)}
  window.KV_CLASS7_SOCIAL_SCIENCE_RUNTIME={loadBatch,reconcile,batches:Object.freeze({...batches})};
  reconcile();addEventListener('popstate',reconcile);addEventListener('kv:rendered',reconcile)
})();
