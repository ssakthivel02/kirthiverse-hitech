/* KirthiVerse local learner profile v24 — no account, no cloud child profile */
(()=>{
  const C='MANUS-VISUAL-MASTER-05',VERSION='v24';
  const PROFILE_KEY='kirthiverse.hitech.profile.local.v2';
  const LEGACY_PROFILE_KEY='kirthiverse.hitech.profile.local.v1';
  const PROGRESS_KEY='kirthiverse.hitech.static.progress.v2';
  const EXPERIENCE_KEY='kirthiverse.hitech.experience.v1';
  const WORLDS=[['mathematics','Mathematics'],['science','Science'],['english','English'],['tamil','Tamil'],['coding-ai','Coding & AI'],['geography','Geography'],['history','History'],['music-rhythm','Music & Rhythm'],['art-design','Art & Design'],['general-knowledge','General Knowledge'],['life-skills','Life Skills']];
  const L=window.KV_LESSONS||[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return structuredClone?structuredClone(f):JSON.parse(JSON.stringify(f))}};
  const defaults={displayName:'Learner',agePath:'all',language:'English + Tamil',preferredWorlds:[],sessionGoal:20};
  function profile(){
    const current=localStorage.getItem(PROFILE_KEY);
    if(current)return read(PROFILE_KEY,defaults);
    const legacy=read(LEGACY_PROFILE_KEY,null);
    if(legacy){const migrated={...defaults,...legacy};localStorage.setItem(PROFILE_KEY,JSON.stringify(migrated));return migrated}
    return {...defaults};
  }
  const progress=()=>read(PROGRESS_KEY,{started:[],completed:[],agePath:'all'});
  const title=l=>l?.title||l?.subtopic||l?.topic||'Learning mission';
  const byId=new Map(L.map(l=>[String(l.id),l]));
  const worldName=id=>WORLDS.find(w=>w[0]===id)?.[1]||id;
  function nextMission(p,s){
    const preferred=new Set(p.preferredWorlds||[]),done=new Set(s.completed||[]);
    return L.find(l=>preferred.size&&preferred.has(l.worldId)&&!done.has(l.id))||L.find(l=>!done.has(l.id))||L[0];
  }
  function downloadBackup(){
    const payload={schema:'kirthiverse.local-learner-backup.v1',exportedAt:new Date().toISOString(),profile:profile(),progress:progress(),experience:read(EXPERIENCE_KEY,{age:'all'})};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='kirthiverse-local-backup.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  }
  function render(){
    if(location.pathname!=='/profile')return;
    const main=document.querySelector('main');if(!main)return;
    const p=profile(),s=progress(),done=(s.completed||[]).length,started=(s.started||[]).length,pct=Math.round(done/Math.max(1,L.length)*100),next=nextMission(p,s),preferred=(p.preferredWorlds||[]);
    main.innerHTML=`<div class="page vm-profile" data-profile-runtime="v24">
      <div class="page-title"><span>PRIVATE LEARNER SPACE // LOCAL ONLY</span><h1>${esc(p.displayName||'Learner')}'s learning space</h1><p>Personalise KirthiVerse on this device. No account, advertising identity, remote child profile or social graph is created.</p></div>
      <div class="vm-profile-grid">
        <section class="vm-profile-card">
          <span class="kicker">LEARNER PREFERENCES</span><h2>Shape the local learning journey.</h2><p class="vm-note">Age path, language and favourite learning worlds are stored only in this browser.</p>
          <div class="vm-field"><label for="vm-name">DISPLAY NAME</label><input id="vm-name" maxlength="40" value="${esc(p.displayName||'Learner')}"></div>
          <div class="vm-field"><label for="vm-age">ACTIVE AGE PATH</label><select id="vm-age"><option value="all">All ages / open exploration</option>${['3–6','7–10','11–13','14–16'].map(x=>`<option value="${x}" ${p.agePath===x?'selected':''}>${x}</option>`).join('')}</select></div>
          <div class="vm-field"><label for="vm-language">LANGUAGE EXPERIENCE</label><select id="vm-language">${['English + Tamil','English','Tamil'].map(x=>`<option ${p.language===x?'selected':''}>${x}</option>`).join('')}</select></div>
          <div class="vm-field"><label for="vm-session">FOCUS SESSION TARGET</label><select id="vm-session">${[10,15,20,30,45].map(n=>`<option value="${n}" ${Number(p.sessionGoal)===n?'selected':''}>${n} minutes</option>`).join('')}</select></div>
          <div class="vm-field"><label>FAVOURITE LEARNING WORLDS · UP TO 3</label><div class="quick-search" id="vm-worlds">${WORLDS.map(([id,name])=>`<button type="button" data-world="${id}" aria-pressed="${preferred.includes(id)}" class="${preferred.includes(id)?'active':''}">${name}</button>`).join('')}</div></div>
          <div class="vm-profile-actions"><button class="save" id="vm-save-profile">Save locally</button><button id="vm-export-profile">Export local backup</button><button id="vm-clear-profile">Reset profile only</button></div>
          <p class="vm-note" id="vm-profile-status" role="status" aria-live="polite">Learning progress is stored separately and is never erased by “Reset profile only”.</p>
        </section>
        <aside class="vm-profile-card accent">
          <span class="kicker">PERSONALISED LEARNING SIGNAL</span><h2>${pct}% journey complete</h2><p>${done} completed missions · ${started} explored lessons · ${Math.max(0,L.length-done)} missions available.</p>
          <div class="vm-profile-stats"><div><b>${done}</b><span>COMPLETE</span></div><div><b>${started}</b><span>EXPLORED</span></div><div><b>${preferred.length}</b><span>FAVOURITES</span></div></div>
          ${next?`<div style="margin-top:24px;padding:20px;border-radius:18px;background:rgba(255,255,255,.12)"><small style="letter-spacing:.12em">NEXT LOCAL RECOMMENDATION</small><h3 style="margin:8px 0">${esc(title(next))}</h3><p>${esc(worldName(next.worldId))} · ${esc(next.ageBand||'age guide')}</p><button id="vm-continue" style="min-height:42px;border:0;border-radius:999px;padding:0 16px;font-weight:800">Continue learning ↗</button></div>`:''}
          <p class="vm-note">Recommendation logic uses only this browser's progress and selected favourite worlds. It does not transmit learner behaviour to a remote profile.</p>
        </aside>
      </div>
    </div>`;
    const worldBox=document.getElementById('vm-worlds');
    worldBox?.addEventListener('click',e=>{const b=e.target.closest('[data-world]');if(!b)return;const on=b.getAttribute('aria-pressed')==='true';if(!on&&worldBox.querySelectorAll('[aria-pressed="true"]').length>=3){document.getElementById('vm-profile-status').textContent='Choose up to three favourite learning worlds.';return}b.setAttribute('aria-pressed',String(!on));b.classList.toggle('active',!on)});
    document.getElementById('vm-save-profile')?.addEventListener('click',()=>{
      const selected=[...document.querySelectorAll('#vm-worlds [aria-pressed="true"]')].map(b=>b.dataset.world);
      const nextProfile={displayName:document.getElementById('vm-name').value.trim()||'Learner',agePath:document.getElementById('vm-age').value,language:document.getElementById('vm-language').value,preferredWorlds:selected.slice(0,3),sessionGoal:Number(document.getElementById('vm-session').value)||20};
      localStorage.setItem(PROFILE_KEY,JSON.stringify(nextProfile));
      const ps=progress();ps.agePath=nextProfile.agePath;localStorage.setItem(PROGRESS_KEY,JSON.stringify(ps));
      const ex=read(EXPERIENCE_KEY,{age:'all'});ex.age=nextProfile.agePath;localStorage.setItem(EXPERIENCE_KEY,JSON.stringify(ex));
      const status=document.getElementById('vm-profile-status');if(status)status.textContent='Saved locally ✓ Age path is synchronised across the learner experience.';
      window.dispatchEvent(new CustomEvent('kv:profile',{detail:{version:VERSION,localOnly:true}}));
    });
    document.getElementById('vm-export-profile')?.addEventListener('click',downloadBackup);
    document.getElementById('vm-clear-profile')?.addEventListener('click',()=>{localStorage.removeItem(PROFILE_KEY);localStorage.removeItem(LEGACY_PROFILE_KEY);render()});
    document.getElementById('vm-continue')?.addEventListener('click',()=>next&&window.KV_NAVIGATION?.navigate('/lesson/'+encodeURIComponent(next.id)));
  }
  addEventListener('kv:rendered',render);
  addEventListener('storage',e=>{if([PROFILE_KEY,LEGACY_PROFILE_KEY,PROGRESS_KEY,EXPERIENCE_KEY].includes(e.key))render()});
  render();
  window.KV_PROFILE_RUNTIME={candidate:C,version:VERSION,route:'/profile',localOnly:true,profileKey:PROFILE_KEY,progressKey:PROGRESS_KEY,experienceKey:EXPERIENCE_KEY,maxPreferredWorlds:3,backupExport:true,agePathSynchronized:true};
})();
