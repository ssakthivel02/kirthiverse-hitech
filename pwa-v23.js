/* KirthiVerse PWA bootstrap v23 — local-first controlled preview */
(()=>{
  const CANDIDATE='MANUS-VISUAL-MASTER-05',VERSION='v23';
  const state={candidate:CANDIDATE,version:VERSION,supported:'serviceWorker' in navigator,registered:false,controlled:!!navigator.serviceWorker?.controller,offlineCapable:false,registrationScope:null,error:null};
  window.KV_PWA=state;
  const emit=()=>window.dispatchEvent(new CustomEvent('kv:pwa',{detail:{...state}}));
  if(!state.supported){emit();return}
  navigator.serviceWorker.register('/sw-v23.js',{scope:'/',updateViaCache:'none'}).then(reg=>{
    state.registered=true;state.registrationScope=reg.scope;state.controlled=!!navigator.serviceWorker.controller;state.offlineCapable=true;emit();
    reg.update().catch(()=>{});
  }).catch(error=>{state.error=String(error?.message||error);emit()});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{state.controlled=true;state.offlineCapable=true;emit()});
  addEventListener('online',emit);addEventListener('offline',emit);
})();
