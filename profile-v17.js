(()=>{
  const CANDIDATE='MANUS-VISUAL-MASTER-05';
  const PROFILE_KEY='kirthiverse.hitech.profile.local.v1';
  const PROGRESS_KEY='kirthiverse.hitech.static.progress.v2';
  const readJSON=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const profile=()=>readJSON(PROFILE_KEY,{displayName:'Learner',agePath:'all',language:'English + Tamil'});
  const progress=()=>readJSON(PROGRESS_KEY,{started:[],completed:[],agePath:'all'});

  function renderProfile(){
    if(location.pathname!=='/profile')return;
    const main=document.querySelector('main');
    if(!main)return;
    const p=profile(),s=progress(),L=window.KV_LESSONS||[];
    const done=(s.completed||[]).length,started=(s.started||[]).length,pct=Math.round(done/Math.max(1,L.length)*100);
    main.innerHTML=`<div class="page vm-profile" data-profile-runtime="v17"><div class="page-title"><span>LOCAL LEARNER SPACE</span><h1>Your KirthiVerse profile</h1><p>Personalise the learning experience on this device. No account, child cloud profile, advertising identity or remote social profile is created.</p></div><div class="vm-profile-grid"><section class="vm-profile-card"><span class="kicker">LEARNER PREFERENCES</span><h2>${esc(p.displayName||'Learner')}</h2><p class="vm-note">These settings stay in this browser and can be changed or cleared at any time.</p><div class="vm-field"><label for="vm-name">DISPLAY NAME</label><input id="vm-name" maxlength="40" value="${esc(p.displayName||'Learner')}"></div><div class="vm-field"><label for="vm-age">ACTIVE AGE PATH</label><select id="vm-age"><option value="all">All ages / open exploration</option>${['3–6','7–10','11–13','14–16'].map(x=>`<option value="${x}" ${p.agePath===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="vm-field"><label for="vm-language">LANGUAGE EXPERIENCE</label><select id="vm-language"><option ${p.language==='English + Tamil'?'selected':''}>English + Tamil</option><option ${p.language==='English'?'selected':''}>English</option><option ${p.language==='Tamil'?'selected':''}>Tamil</option></select></div><div class="vm-profile-actions"><button class="save" id="vm-save-profile">Save locally</button><button id="vm-clear-profile">Reset profile</button></div></section><aside class="vm-profile-card accent"><span class="kicker">LEARNING SIGNAL</span><h2>${pct}% journey complete</h2><p>${done} completed missions · ${started} explored lessons · ${Math.max(0,L.length-done)} missions available.</p><div class="vm-profile-stats"><div><b>${done}</b><span>COMPLETE</span></div><div><b>${started}</b><span>EXPLORED</span></div><div><b>${L.length}</b><span>CANONICAL</span></div></div><p class="vm-note">Progress and profile are separate local records. Clearing this profile does not erase lesson progress.</p></aside></div></div>`;
    const save=document.getElementById('vm-save-profile');
    if(save)save.onclick=()=>{
      const next={displayName:document.getElementById('vm-name').value.trim()||'Learner',agePath:document.getElementById('vm-age').value,language:document.getElementById('vm-language').value};
      localStorage.setItem(PROFILE_KEY,JSON.stringify(next));
      const ps=progress();ps.agePath=next.agePath;localStorage.setItem(PROGRESS_KEY,JSON.stringify(ps));
      save.textContent='Saved locally ✓';setTimeout(()=>{if(save.isConnected)save.textContent='Save locally'},1200);
    };
    const clear=document.getElementById('vm-clear-profile');
    if(clear)clear.onclick=()=>{localStorage.removeItem(PROFILE_KEY);renderProfile()};
  }

  function run(){renderProfile()}
  addEventListener('kv:rendered',run);
  addEventListener('storage',e=>{if(e.key===PROFILE_KEY||e.key===PROGRESS_KEY)run()});
  run();
  window.KV_PROFILE_RUNTIME={candidate:CANDIDATE,version:'v17',route:'/profile',localOnly:true,profileKey:PROFILE_KEY,progressKey:PROGRESS_KEY};
})();