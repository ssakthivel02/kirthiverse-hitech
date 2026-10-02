/* KirthiVerse Class 7 Science runtime v1 — data-driven chapter loader. */
(()=>{
  const batchLesson='data/class7-science-ch2-5-lessons.js',batchAssessment='data/class7-science-ch2-5-assessments.js',batchVersion='CBSE7-SCI-CH2-5-1';
  const chapters={1:null,2:{lesson:batchLesson,assessment:batchAssessment,version:batchVersion},3:{lesson:batchLesson,assessment:batchAssessment,version:batchVersion},4:{lesson:batchLesson,assessment:batchAssessment,version:batchVersion},5:{lesson:batchLesson,assessment:batchAssessment,version:batchVersion}};
  const loaded=new Set(),loading=new Map(),assetPromises=new Map();
  const relevantSurface=()=>['/search','/practice','/practice-arena','/diagnostic'].includes(location.pathname)||new URLSearchParams(location.search).has('release-closure');
  const chapterFromRoute=()=>{const m=location.pathname.match(/^\/lesson\/science\.cbse7\.curiosity\.ch(\d+)\./);return m?Number(m[1]):null};
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
  async function loadChapter(chapter){
    const cfg=chapters[chapter];if(!cfg||loaded.has(chapter))return;if(loading.has(chapter))return loading.get(chapter);
    document.documentElement.dataset.class7Science='loading';
    const work=(async()=>{try{
      await inject('class7-science-ch'+chapter+'-lessons',cfg.lesson,cfg.version);
      await inject('class7-science-ch'+chapter+'-assessments',cfg.assessment,cfg.version);
      for(const c of [2,3,4,5]){loaded.add(c);document.documentElement.dataset['class7ScienceChapter'+c]='ready'}
      document.documentElement.dataset.class7Science='ready';
      dispatchEvent(new PopStateEvent('popstate'));dispatchEvent(new CustomEvent('kv:class7-science-ready',{detail:{classLevel:7,subject:'Science',chapter,localOnly:true}}))
    }catch(error){document.documentElement.dataset.class7Science='load-error';document.documentElement.dataset['class7ScienceChapter'+chapter]='load-error';console.error('[KirthiVerse] Class 7 Science load failed',error)}})();
    loading.set(chapter,work);await work;loading.delete(chapter)
  }
  function reconcile(){const direct=chapterFromRoute();if(direct)loadChapter(direct);if(relevantSurface())for(const chapter of [2,3,4,5])loadChapter(chapter)}
  window.KV_CLASS7_SCIENCE_RUNTIME={loadChapter,reconcile,chapters:Object.freeze({...chapters})};
  reconcile();addEventListener('popstate',reconcile);addEventListener('kv:rendered',reconcile)
})();
