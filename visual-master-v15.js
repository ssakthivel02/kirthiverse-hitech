(()=>{
  const CANDIDATE='MANUS-VISUAL-MASTER-05';
  const ROOT=document.documentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  ROOT.dataset.visualMaster=CANDIDATE;
  let overlay=document.querySelector('.vm-route-transition');
  if(!overlay){overlay=document.createElement('div');overlay.className='vm-route-transition';overlay.setAttribute('aria-hidden','true');overlay.innerHTML='<i></i><strong>KirthiVerse</strong><span>Opening the next page</span>';document.body.appendChild(overlay)}
  let timer=0;
  function transition(){
    if(reduce.matches)return;
    clearTimeout(timer);
    overlay.classList.add('is-active');
    timer=setTimeout(()=>overlay.classList.remove('is-active'),180);
  }
  function normalizeShell(){
    const brandSubtitle=document.querySelector('.brand small');
    if(brandSubtitle)brandSubtitle.textContent='EDITORIAL LEARNING UNIVERSE';
    const systemLabel=document.querySelector('.hero .system-label');
    if(systemLabel)systemLabel.innerHTML='<span></span>KIRTHIVERSE · VISUAL MASTER';
    const footerBuild=document.querySelector('footer span:first-child');
    if(footerBuild)footerBuild.textContent='KIRTHIVERSE // VISUAL MASTER';
    document.documentElement.dataset.shellIdentity='visual-master';
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[data-link]');
    if(!a)return;
    const href=a.getAttribute('href')||'';
    if(href.startsWith('/'))transition();
  },true);
  addEventListener('popstate',()=>{
    transition();
    requestAnimationFrame(()=>document.querySelector('main')?.focus?.({preventScroll:true}));
  });
  const applyRoute=()=>{
    document.body.dataset.route=location.pathname==='/'?'home':location.pathname.split('/').filter(Boolean)[0]||'home';
    normalizeShell();
  };
  addEventListener('kv:rendered',applyRoute);
  applyRoute();
  window.KV_VISUAL_MASTER={candidate:CANDIDATE,source:'owner-provided Manus current-state handover',manusRuntime:false,shellIdentity:'visual-master',pendingAssets:['kirthiverse-mark_28bda5f0.png','kirthiverse-hero_15ccac10.png','kirthiverse-worlds_d4d17287.png']};
})();