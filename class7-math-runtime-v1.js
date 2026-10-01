/* KirthiVerse Class 7 Mathematics runtime v1 — data-driven chapter loader.
   Keeps chapter datasets route-deferred and provides one extension point for Chapters 1–8. */
(()=>{
  const chapters={
    1:{lesson:'data/class7-math-ch1.js',assessment:'data/class7-math-ch1-assessments.js',version:'CBSE7-MATH-CH1-1'},
    2:{lesson:'data/class7-math-ch2.js',assessment:'data/class7-math-ch2-assessments.js',version:'CBSE7-MATH-CH2-1'}
  };
  const loaded=new Set(),loading=new Map();
  const relevantSurface=()=>['/search','/practice','/practice-arena','/diagnostic'].includes(location.pathname)||new URLSearchParams(location.search).has('release-closure');
  const chapterFromRoute=()=>{const m=location.pathname.match(/^\/lesson\/math\.cbse7\.ganita-prakash\.ch(\d+)\./);return m?Number(m[1]):null};
  const inject=(tag,src,version)=>new Promise((resolve,reject)=>{
    const existing=document.querySelector(`script[data-${tag}]`);
    if(existing){if(existing.dataset.loadFailed==='true')reject(new Error(`${tag} previously failed`));else resolve();return}
    const s=document.createElement('script');s.async=false;s.src=`/${src}?v=${version}`;s.setAttribute(`data-${tag}`,'script');
    s.addEventListener('load',resolve,{once:true});s.addEventListener('error',()=>{s.dataset.loadFailed='true';reject(new Error(`Failed to load ${src}`))},{once:true});document.body.appendChild(s)
  });
  async function loadChapter(chapter){
    const cfg=chapters[chapter];if(!cfg||loaded.has(chapter))return;
    if(loading.has(chapter))return loading.get(chapter);
    document.documentElement.dataset.class7Math='loading';
    const work=(async()=>{try{
      await inject(`class7-math-ch${chapter}-lessons`,cfg.lesson,cfg.version);
      await inject(`class7-math-ch${chapter}-assessments`,cfg.assessment,cfg.version);
      loaded.add(chapter);document.documentElement.dataset.class7Math='ready';document.documentElement.dataset[`class7MathChapter${chapter}`]='ready';
      dispatchEvent(new PopStateEvent('popstate'));dispatchEvent(new CustomEvent('kv:class7-math-ready',{detail:{classLevel:7,subject:'Mathematics',chapter,localOnly:true}}));
    }catch(error){document.documentElement.dataset.class7Math='load-error';document.documentElement.dataset[`class7MathChapter${chapter}`]='load-error';console.error('[KirthiVerse] Class 7 Mathematics load failed',error)}})();
    loading.set(chapter,work);await work;loading.delete(chapter)
  }
  function reconcile(){const direct=chapterFromRoute();if(direct)loadChapter(direct);if(relevantSurface())for(const chapter of Object.keys(chapters))loadChapter(Number(chapter))}
  window.KV_CLASS7_MATH_RUNTIME={loadChapter,reconcile,chapters:Object.freeze({...chapters})};
  reconcile();addEventListener('popstate',reconcile);addEventListener('kv:rendered',reconcile)
})();