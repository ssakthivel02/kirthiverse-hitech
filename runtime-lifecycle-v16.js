(()=>{
  const CANDIDATE='MANUS-VISUAL-MASTER-05';
  let seq=0;
  let scheduled=false;

  function emit(reason='render'){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      seq++;
      window.dispatchEvent(new CustomEvent('kv:rendered',{detail:{reason,sequence:seq,path:location.pathname,candidate:CANDIDATE}}));
    });
  }

  addEventListener('popstate',()=>emit('router-popstate'));
  addEventListener('storage',e=>{
    if(String(e.key||'').startsWith('kirthiverse.'))emit('storage');
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>emit('initial-render'),{once:true});
  }else{
    emit('initial-render');
  }

  window.KV_RUNTIME_LIFECYCLE={
    candidate:CANDIDATE,
    source:'router-popstate-after-app-render',
    observerScope:'none',
    navigationGuessing:false,
    emit,
    get sequence(){return seq},
    get observerActive(){return false}
  };
})();