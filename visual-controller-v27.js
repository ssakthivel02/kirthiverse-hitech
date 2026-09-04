/* KirthiVerse visual controller v27 — consolidated shell + page decoration */
(()=>{
  const C='MANUS-VISUAL-MASTER-05',ROOT=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),CK='kirthiverse.hitech.confidence.v1';
  ROOT.dataset.visualMaster=C;
  let overlay=document.querySelector('.vm-route-transition'),timer=0,focusPending=false;
  if(!overlay){overlay=document.createElement('div');overlay.className='vm-route-transition';overlay.setAttribute('aria-hidden','true');overlay.innerHTML='<i></i><strong>KirthiVerse</strong><span>Opening the next page</span>';document.body.appendChild(overlay)}
  const route=()=>location.pathname==='/'?'home':location.pathname.split('/').filter(Boolean)[0]||'home';
  function transition(){if(reduce.matches)return;clearTimeout(timer);overlay.classList.add('is-active');timer=setTimeout(()=>overlay.classList.remove('is-active'),180)}
  function addProfileNav(){const nav=document.querySelector('.topbar nav');if(!nav||nav.querySelector('.vm-nav-profile'))return;const a=document.createElement('a');a.href='/profile';a.className='vm-nav-profile';a.dataset.link='';a.innerHTML='◎ <span>Profile</span>';nav.appendChild(a)}
  function confidence(){
    if(!location.pathname.startsWith('/lesson/'))return;const host=document.querySelector('.lesson-content'),done=document.getElementById('complete');if(!host||!done||host.querySelector('[data-confidence]'))return;
    const id=decodeURIComponent(location.pathname.split('/')[2]||''),read=()=>{try{return JSON.parse(localStorage.getItem(CK)||'{}')}catch{return{}}},v=read()[id]?.value||'';
    const s=document.createElement('section');s.dataset.confidence='v1';s.className='glass-card';s.innerHTML='<label>05 // QUICK CONFIDENCE CHECK</label><h3>How does this lesson feel now?</h3><p>This private signal stays on this device and helps you reflect on what to revisit.</p><div class="quick-search" role="group" aria-label="Lesson confidence">'+[['practice','Need more practice'],['getting','Getting it'],['confident','Confident']].map(x=>`<button type="button" data-c="${x[0]}" aria-pressed="${v===x[0]}">${x[1]}</button>`).join('')+'</div><p data-c-status role="status" aria-live="polite">'+(v?'Saved locally.':'Choose one when you are ready.')+'</p>';
    done.insertAdjacentElement('beforebegin',s);s.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;const x=read();x[id]={value:b.dataset.c,updatedAt:new Date().toISOString()};localStorage.setItem(CK,JSON.stringify(x));s.querySelectorAll('[data-c]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));s.querySelector('[data-c-status]').textContent='Saved locally ✓';dispatchEvent(new CustomEvent('kv:confidence',{detail:{lessonId:id,value:b.dataset.c,localOnly:true}}))})
  }
  function normalizeShell(){const brand=document.querySelector('.brand small');if(brand)brand.textContent='EDITORIAL LEARNING UNIVERSE';const label=document.querySelector('.hero .system-label');if(label)label.innerHTML='<span></span>KIRTHIVERSE · VISUAL MASTER';const footer=document.querySelector('footer span:first-child');if(footer)footer.textContent='KIRTHIVERSE // VISUAL MASTER';ROOT.dataset.shellIdentity='visual-master';ROOT.dataset.visualCandidate=C;ROOT.dataset.routeFocus='initial-preserved';document.body.dataset.route=route();addProfileNav();confidence()}
  function focusRoute(){const main=document.querySelector('main');if(!main)return;main.setAttribute('tabindex','-1');requestAnimationFrame(()=>{main.focus({preventScroll:true});ROOT.dataset.routeFocus='navigation-main'})}
  document.addEventListener('click',e=>{const a=e.target.closest('a[data-link]');if(a&&(a.getAttribute('href')||'').startsWith('/')){focusPending=true;transition()}},true);
  addEventListener('popstate',()=>{focusPending=true;transition()});
  addEventListener('kv:rendered',()=>{normalizeShell();if(focusPending){focusPending=false;focusRoute()}});
  normalizeShell();
  window.KV_CONFIDENCE_RUNTIME={candidate:C,version:'v1',storageKey:CK,localOnly:true,route:'/lesson/:id',values:['practice','getting','confident']};
  window.KV_VISUAL_MASTER={candidate:C,version:'v27',source:'owner-provided Manus current-state handover',manusRuntime:false,shellIdentity:'visual-master',routeFocusManaged:true,initialLoadFocusPreserved:true,focusAfterSpaNavigation:true,lessonConfidence:true,pendingAssets:['kirthiverse-mark_28bda5f0.png','kirthiverse-hero_15ccac10.png','kirthiverse-worlds_d4d17287.png']};
  window.KV_VISUAL_PAGES={candidate:C,version:'v27',profileNavUsesDataLink:true,routeDataset:true,routeFocusManaged:true,initialLoadFocusPreserved:true,lessonConfidence:true,localOnly:true,manusRuntime:false};
})();
