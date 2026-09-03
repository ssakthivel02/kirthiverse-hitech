(()=>{
  const BUILD='MANUS-VISUAL-MASTER-05';
  const app=document.getElementById('app');
  let seq=0;
  let scheduled=false;
  let observer=null;

  function emit(reason='render'){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      seq++;
      window.dispatchEvent(new CustomEvent('kv:rendered',{detail:{reason,sequence:seq,path:location.pathname,candidate:BUILD}}));
    });
  }

  if(app){
    observer=new MutationObserver(records=>{
      if(records.some(r=>r.type==='childList'))emit('app-render');
    });
    observer.observe(app,{childList:true,subtree:false});
  }

  addEventListener('storage',e=>{
    if(String(e.key||'').startsWith('kirthiverse.'))emit('storage');
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>emit('dom-ready'),{once:true});
  }else{
    emit('initial');
  }

  window.KV_RUNTIME_LIFECYCLE={
    candidate:BUILD,
    source:'app-root-childlist',
    observerScope:'#app childList only',
    emit,
    get sequence(){return seq},
    get observerActive(){return !!observer}
  };
})();