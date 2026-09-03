(()=>{
  const CANDIDATE='MANUS-VISUAL-MASTER-01';
  const ROOT=document.documentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  ROOT.dataset.visualMaster=CANDIDATE;

  let overlay=document.querySelector('.vm-route-transition');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.className='vm-route-transition';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<i></i><strong>KirthiVerse</strong><span>Opening the next page</span>';
    document.body.appendChild(overlay);
  }

  let timer=0;
  function transition(){
    if(reduce.matches)return;
    clearTimeout(timer);
    overlay.classList.add('is-active');
    timer=setTimeout(()=>overlay.classList.remove('is-active'),180);
  }

  document.addEventListener('click',e=>{
    const a=e.target.closest('a[data-link]');
    if(!a)return;
    const href=a.getAttribute('href')||'';
    if(!href.startsWith('/'))return;
    transition();
  },true);

  addEventListener('popstate',()=>{
    transition();
    requestAnimationFrame(()=>document.querySelector('main')?.focus?.({preventScroll:true}));
  });

  // Keep visual-state markers small and deterministic. No MutationObserver is added here.
  const applyRoute=()=>{
    document.body.dataset.route=location.pathname==='/'?'home':location.pathname.split('/').filter(Boolean)[0]||'home';
  };
  addEventListener('popstate',applyRoute);
  applyRoute();

  // Asset placeholders are deliberate until owner-approved originals arrive.
  window.KV_VISUAL_MASTER={
    candidate:CANDIDATE,
    source:'owner-provided Manus current-state handover',
    manusRuntime:false,
    pendingAssets:[
      'kirthiverse-mark_28bda5f0.png',
      'kirthiverse-hero_15ccac10.png',
      'kirthiverse-worlds_d4d17287.png'
    ]
  };
})();