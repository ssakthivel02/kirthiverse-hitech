(()=>{
  const CANDIDATE='MANUS-VISUAL-MASTER-05';
  function addProfileNav(){
    const nav=document.querySelector('.topbar nav');
    if(!nav||nav.querySelector('.vm-nav-profile'))return;
    const a=document.createElement('a');
    a.href='/profile';
    a.className='vm-nav-profile';
    a.dataset.link='';
    a.innerHTML='◎ <span>Profile</span>';
    nav.appendChild(a);
  }
  function markRoute(){
    document.body.dataset.route=location.pathname==='/'?'home':location.pathname.split('/').filter(Boolean)[0]||'home';
  }
  function enhance(){
    markRoute();
    addProfileNav();
    document.documentElement.dataset.visualCandidate=CANDIDATE;
  }
  addEventListener('kv:rendered',enhance);
  enhance();
  window.KV_VISUAL_PAGES={candidate:CANDIDATE,profileNavUsesDataLink:true,localOnly:true,manusRuntime:false};
})();