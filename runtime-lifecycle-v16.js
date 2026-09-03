(()=>{
  const BUILD='MANUS-VISUAL-MASTER-05';
  let seq=0;
  let scheduled=false;
  function emit(reason='render'){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      seq++;
      window.dispatchEvent(new CustomEvent('kv:rendered',{detail:{reason,sequence:seq,path:location.pathname,candidate:BUILD}}));
    });
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[data-link],[data-studio-nav],[data-vm-profile]');
    if(a)setTimeout(()=>emit('navigation'),0);
  },true);
  addEventListener('popstate',()=>setTimeout(()=>emit('popstate'),0));
  addEventListener('storage',e=>{if(String(e.key||'').startsWith('kirthiverse.'))emit('storage')});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>emit('dom-ready'),{once:true});else emit('initial');
  window.KV_RUNTIME_LIFECYCLE={candidate:BUILD,emit,get sequence(){return seq}};
})();