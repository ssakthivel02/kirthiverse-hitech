/* KirthiVerse visual controller v27 — consolidated shell + page decoration */
(()=>{
  const C='MANUS-VISUAL-MASTER-05',ROOT=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
  ROOT.dataset.visualMaster=C;
  let overlay=document.querySelector('.vm-route-transition'),timer=0;
  if(!overlay){overlay=document.createElement('div');overlay.className='vm-route-transition';overlay.setAttribute('aria-hidden','true');overlay.innerHTML='<i></i><strong>KirthiVerse</strong><span>Opening the next page</span>';document.body.appendChild(overlay)}
  const route=()=>location.pathname==='/'?'home':location.pathname.split('/').filter(Boolean)[0]||'home';
  function transition(){if(reduce.matches)return;clearTimeout(timer);overlay.classList.add('is-active');timer=setTimeout(()=>overlay.classList.remove('is-active'),180)}
  function addProfileNav(){const nav=document.querySelector('.topbar nav');if(!nav||nav.querySelector('.vm-nav-profile'))return;const a=document.createElement('a');a.href='/profile';a.className='vm-nav-profile';a.dataset.link='';a.innerHTML='◎ <span>Profile</span>';nav.appendChild(a)}
  function normalizeShell(){const brand=document.querySelector('.brand small');if(brand)brand.textContent='EDITORIAL LEARNING UNIVERSE';const label=document.querySelector('.hero .system-label');if(label)label.innerHTML='<span></span>KIRTHIVERSE · VISUAL MASTER';const footer=document.querySelector('footer span:first-child');if(footer)footer.textContent='KIRTHIVERSE // VISUAL MASTER';ROOT.dataset.shellIdentity='visual-master';ROOT.dataset.visualCandidate=C;document.body.dataset.route=route();addProfileNav()}
  function focusRoute(){const main=document.querySelector('main');if(!main)return;main.setAttribute('tabindex','-1');requestAnimationFrame(()=>main.focus({preventScroll:true}))}
  document.addEventListener('click',e=>{const a=e.target.closest('a[data-link]');if(a&&(a.getAttribute('href')||'').startsWith('/'))transition()},true);
  addEventListener('popstate',()=>{transition();focusRoute()});
  addEventListener('kv:rendered',()=>{normalizeShell();focusRoute()});
  normalizeShell();
  window.KV_VISUAL_MASTER={candidate:C,version:'v27',source:'owner-provided Manus current-state handover',manusRuntime:false,shellIdentity:'visual-master',routeFocusManaged:true,pendingAssets:['kirthiverse-mark_28bda5f0.png','kirthiverse-hero_15ccac10.png','kirthiverse-worlds_d4d17287.png']};
  window.KV_VISUAL_PAGES={candidate:C,version:'v27',profileNavUsesDataLink:true,routeDataset:true,routeFocusManaged:true,localOnly:true,manusRuntime:false};
})();
