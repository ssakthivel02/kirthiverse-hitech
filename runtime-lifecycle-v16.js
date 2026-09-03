(()=>{
  const CANDIDATE='MANUS-VISUAL-MASTER-05';
  let seq=0;
  let scheduled=false;

  function emit(reason='adapter'){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      seq++;
      window.dispatchEvent(new CustomEvent('kv:rendered',{detail:{reason,sequence:seq,path:location.pathname,candidate:CANDIDATE,source:'lifecycle-adapter'}}));
    });
  }

  addEventListener('storage',e=>{
    if(String(e.key||'').startsWith('kirthiverse.'))emit('storage');
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>emit('initial-render-adapter'),{once:true});
  }else{
    emit('initial-render-adapter');
  }

  window.KV_RUNTIME_LIFECYCLE={
    candidate:CANDIDATE,
    source:'router-popstate-after-app-render',
    mode:'app-render-authoritative',
    observerScope:'none',
    navigationGuessing:false,
    appRenderAuthoritative:true,
    popstateEmitter:false,
    emit,
    get sequence(){return seq},
    get observerActive(){return false}
  };
})();