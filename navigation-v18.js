(()=>{
  const CANDIDATE='MANUS-VISUAL-MASTER-05';
  const PROGRESS_KEY='kirthiverse.hitech.static.progress.v2';
  const EXPERIENCE_KEY='kirthiverse.hitech.experience.v1';
  let navigations=0;

  function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return structuredClone(fallback)}}
  function write(key,value){localStorage.setItem(key,JSON.stringify(value))}

  function navigate(href,{replace=false}={}){
    if(!href)return false;
    const url=new URL(href,location.href);
    if(url.origin!==location.origin){location.href=url.href;return true}
    const next=url.pathname+url.search+url.hash;
    const current=location.pathname+location.search+location.hash;
    if(next===current&&!replace)return false;
    if(replace)history.replaceState({},'',next);else history.pushState({},'',next);
    navigations++;
    dispatchEvent(new PopStateEvent('popstate'));
    return true;
  }

  function selectAgePath(age){
    if(!age)return false;
    const progress=read(PROGRESS_KEY,{started:[],completed:[],agePath:'all'});
    progress.agePath=age;
    write(PROGRESS_KEY,progress);
    const experience=read(EXPERIENCE_KEY,{age:'all'});
    experience.age=age;
    write(EXPERIENCE_KEY,experience);
    const lower=Number((String(age).match(/\d+/)||[])[0]);
    const lessons=window.KV_LESSONS||[];
    const target=Number.isFinite(lower)?lessons.find(l=>(String(l.ageBand||'').match(/\d+/g)||[]).map(Number).some(n=>n===lower)):null;
    return navigate(target?'/lesson/'+encodeURIComponent(target.id):'/worlds');
  }

  document.addEventListener('click',e=>{
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;

    const ageControl=e.target.closest('[data-age]');
    if(ageControl){
      e.preventDefault();
      e.stopImmediatePropagation();
      selectAgePath(ageControl.dataset.age);
      return;
    }

    const anchor=e.target.closest('a[data-link]');
    if(anchor){
      if(anchor.target&&anchor.target!=='_self')return;
      e.preventDefault();
      e.stopImmediatePropagation();
      navigate(anchor.getAttribute('href'));
      return;
    }

    const control=e.target.closest('[data-studio-nav],[data-kv-nav]');
    if(control){
      const href=control.dataset.studioNav||control.dataset.kvNav;
      if(!href)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      navigate(href);
    }
  },true);

  window.KV_NAVIGATION={candidate:CANDIDATE,mode:'delegated-capture',agePathCentralized:true,navigate,selectAgePath,get count(){return navigations}};
})();