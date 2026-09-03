(()=>{
  const CANDIDATE='MANUS-VISUAL-MASTER-05';
  let navigations=0;
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
  document.addEventListener('click',e=>{
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
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
  window.KV_NAVIGATION={candidate:CANDIDATE,mode:'delegated-capture',navigate,get count(){return navigations}};
})();