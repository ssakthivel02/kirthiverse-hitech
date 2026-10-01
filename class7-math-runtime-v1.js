/* KirthiVerse Class 7 Mathematics runtime v1 — data-driven chapter loader.
   Keeps chapter datasets route-deferred and provides one extension point for Chapters 1–8. */
(()=>{
  const batchLesson='data/class7-math-ch3-8-lessons.js',batchAssessment='data/class7-math-ch3-8-assessments.js',batchVersion='CBSE7-MATH-CH3-8-1';
  const chapters={
    1:{lesson:'data/class7-math-ch1.js',assessment:'data/class7-math-ch1-assessments.js',version:'CBSE7-MATH-CH1-1'},
    2:{lesson:'data/class7-math-ch2.js',assessment:'data/class7-math-ch2-assessments.js',version:'CBSE7-MATH-CH2-1'},
    3:{lesson:batchLesson,assessment:batchAssessment,version:batchVersion},
    4:{lesson:batchLesson,assessment:batchAssessment,version:batchVersion},
    5:{lesson:batchLesson,assessment:batchAssessment,version:batchVersion},
    6:{lesson:batchLesson,assessment:batchAssessment,version:batchVersion},
    7:{lesson:batchLesson,assessment:batchAssessment,version:batchVersion},
    8:{lesson:batchLesson,assessment:batchAssessment,version:batchVersion}
  };
  const loaded=new Set(),loading=new Map(),assetPromises=new Map();
  const relevantSurface=()=>['/search','/practice','/practice-arena','/diagnostic'].includes(location.pathname)||new URLSearchParams(location.search).has('release-closure');
  const chapterFromRoute=()=>{const m=location.pathname.match(/^\/lesson\/math\.cbse7\.ganita-prakash\.ch(\d+)\./);return m?Number(m[1]):null};
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
  async function loadChapter(chapter){
    const cfg=chapters[chapter];if(!cfg||loaded.has(chapter))return;
    if(loading.has(chapter))return loading.get(chapter);
    document.documentElement.dataset.class7Math='loading';
    const work=(async()=>{try{
      await inject(`class7-math-ch${chapter}-lessons`,cfg.lesson,cfg.version);
      await inject(`class7-math-ch${chapter}-assessments`,cfg.assessment,cfg.version);
      if(chapter>=3){for(let c=3;c<=8;c++){loaded.add(c);document.documentElement.dataset[`class7MathChapter${c}`]='ready'}}else{loaded.add(chapter);document.documentElement.dataset[`class7MathChapter${chapter}`]='ready'}
      document.documentElement.dataset.class7Math='ready';
      dispatchEvent(new PopStateEvent('popstate'));dispatchEvent(new CustomEvent('kv:class7-math-ready',{detail:{classLevel:7,subject:'Mathematics',chapter,localOnly:true}}));
    }catch(error){document.documentElement.dataset.class7Math='load-error';document.documentElement.dataset[`class7MathChapter${chapter}`]='load-error';console.error('[KirthiVerse] Class 7 Mathematics load failed',error)}})();
    loading.set(chapter,work);await work;loading.delete(chapter)
  }
  function reconcile(){const direct=chapterFromRoute();if(direct)loadChapter(direct);if(relevantSurface())for(const chapter of Object.keys(chapters))loadChapter(Number(chapter))}
  window.KV_CLASS7_MATH_RUNTIME={loadChapter,reconcile,chapters:Object.freeze({...chapters})};
  reconcile();addEventListener('popstate',reconcile);addEventListener('kv:rendered',reconcile)
})();