/* KirthiVerse learner personalization v25 — local-only profile + home + Study Studio */
(()=>{
  const C='MANUS-VISUAL-MASTER-05',VERSION='v25';
  const PROFILE_KEY='kirthiverse.hitech.profile.local.v2';
  const LEGACY_PROFILE_KEY='kirthiverse.hitech.profile.local.v1';
  const PROGRESS_KEY='kirthiverse.hitech.static.progress.v2';
  const EXPERIENCE_KEY='kirthiverse.hitech.experience.v1';
  const WORLDS=[['mathematics','Mathematics'],['science','Science'],['english','English'],['tamil','Tamil'],['coding-ai','Coding & AI'],['geography','Geography'],['history','History'],['music-rhythm','Music & Rhythm'],['art-design','Art & Design'],['general-knowledge','General Knowledge'],['life-skills','Life Skills']];
  const L=window.KV_LESSONS||[];
  const defaults={displayName:'Learner',agePath:'all',language:'English + Tamil',preferredWorlds:[],sessionGoal:20};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return typeof structuredClone==='function'?structuredClone(f):JSON.parse(JSON.stringify(f))}};
  const title=l=>l?.title||l?.subtopic||l?.topic||'Learning mission';
  const worldName=id=>WORLDS.find(w=>w[0]===id)?.[1]||id||'Learning universe';
  function profile(){
    if(localStorage.getItem(PROFILE_KEY))return {...defaults,...read(PROFILE_KEY,defaults)};
    const legacy=read(LEGACY_PROFILE_KEY,null);
    if(legacy){const migrated={...defaults,...legacy};localStorage.setItem(PROFILE_KEY,JSON.stringify(migrated));return migrated}
    return {...defaults};
  }
  const progress=()=>read(PROGRESS_KEY,{started:[],completed:[],agePath:'all'});
  function ageRange(value){const n=String(value||'').match(/\d+/g)?.map(Number)||[];return n.length?[n[0],n[1]??n[0]]:null}
  function ageMatch(lesson,path){
    if(!path||path==='all')return true;
    const target=ageRange(path),lessonRange=ageRange(lesson?.ageBand||lesson?.age||'');
    if(!target||!lessonRange)return true;
    return lessonRange[0]<=target[1]&&lessonRange[1]>=target[0];
  }
  function recommendations(p,s){
    const done=new Set(s.completed||[]),preferred=new Set((p.preferredWorlds||[]).slice(0,3));
    const open=L.filter(l=>!done.has(l.id)),ageFit=open.filter(l=>ageMatch(l,p.agePath));
    const pool=ageFit.length?ageFit:open;
    const preferredFit=pool.filter(l=>preferred.has(l.worldId));
    const ordered=[...preferredFit,...pool.filter(l=>!preferred.has(l.worldId))];
    return [...new Map(ordered.map(l=>[l.id,l])).values()];
  }
  const nextMission=(p,s)=>recommendations(p,s)[0]||L[0];
  function downloadBackup(){
    const payload={schema:'kirthiverse.local-learner-backup.v1',exportedAt:new Date().toISOString(),profile:profile(),progress:progress(),experience:read(EXPERIENCE_KEY,{age:'all'})};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='kirthiverse-local-backup.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  }
  function renderProfile(){
    if(location.pathname!=='/profile')return;
    const main=document.querySelector('main');if(!main)return;
    const p=profile(),s=progress(),done=(s.completed||[]).length,started=(s.started||[]).length,pct=Math.round(done/Math.max(1,L.length)*100),next=nextMission(p,s),preferred=(p.preferredWorlds||[]);
    main.innerHTML=`<div class="page vm-profile" data-profile-runtime="v25">
      <div class="page-title"><span>PRIVATE LEARNER SPACE // LOCAL ONLY</span><h1>${esc(p.displayName||'Learner')}'s learning space</h1><p>Personalise KirthiVerse on this device. No account, advertising identity, remote child profile or social graph is created.</p></div>
      <div class="vm-profile-grid">
        <section class="vm-profile-card">
          <span class="kicker">LEARNER PREFERENCES</span><h2>Shape the local learning journey.</h2><p class="vm-note">Age path, language, focus target and favourite learning worlds are stored only in this browser.</p>
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
          <p class="vm-note">Recommendation logic uses only this browser's progress, age path and selected favourite worlds. It does not transmit learner behaviour to a remote profile.</p>
        </aside>
      </div>
    </div>`;
    const worldBox=document.getElementById('vm-worlds');
    worldBox?.addEventListener('click',e=>{const b=e.target.closest('[data-world]');if(!b)return;const on=b.getAttribute('aria-pressed')==='true';if(!on&&worldBox.querySelectorAll('[aria-pressed="true"]').length>=3){const s=document.getElementById('vm-profile-status');if(s)s.textContent='Choose up to three favourite learning worlds.';return}b.setAttribute('aria-pressed',String(!on));b.classList.toggle('active',!on)});
    document.getElementById('vm-save-profile')?.addEventListener('click',()=>{
      const selected=[...document.querySelectorAll('#vm-worlds [aria-pressed="true"]')].map(b=>b.dataset.world);
      const nextProfile={displayName:document.getElementById('vm-name').value.trim()||'Learner',agePath:document.getElementById('vm-age').value,language:document.getElementById('vm-language').value,preferredWorlds:selected.slice(0,3),sessionGoal:Number(document.getElementById('vm-session').value)||20};
      localStorage.setItem(PROFILE_KEY,JSON.stringify(nextProfile));
      const ps=progress();ps.agePath=nextProfile.agePath;localStorage.setItem(PROGRESS_KEY,JSON.stringify(ps));
      const ex=read(EXPERIENCE_KEY,{age:'all'});ex.age=nextProfile.agePath;localStorage.setItem(EXPERIENCE_KEY,JSON.stringify(ex));
      const status=document.getElementById('vm-profile-status');if(status)status.textContent='Saved locally ✓ Home, Study Studio and age path now use these preferences.';
      window.dispatchEvent(new CustomEvent('kv:profile',{detail:{version:VERSION,localOnly:true}}));
    });
    document.getElementById('vm-export-profile')?.addEventListener('click',downloadBackup);
    document.getElementById('vm-clear-profile')?.addEventListener('click',()=>{localStorage.removeItem(PROFILE_KEY);localStorage.removeItem(LEGACY_PROFILE_KEY);renderProfile()});
    document.getElementById('vm-continue')?.addEventListener('click',()=>next&&window.KV_NAVIGATION?.navigate('/lesson/'+encodeURIComponent(next.id)));
  }
  function decorateHome(){
    if(location.pathname!=='/')return;
    const page=document.querySelector('.home-page');if(!page)return;
    const p=profile(),s=progress(),next=nextMission(p,s),done=new Set(s.completed||[]),fav=(p.preferredWorlds||[]).slice(0,3),name=(p.displayName||'Learner').trim()||'Learner';
    const h1=page.querySelector('.hero-copy h1');if(h1&&name!=='Learner')h1.innerHTML=`Welcome back,<br><em>${esc(name)}.</em>`;
    const lead=page.querySelector('.hero-lead');if(lead)lead.textContent=`Your ${p.agePath==='all'?'open exploration':p.agePath+' age path'} is ready for a ${Number(p.sessionGoal)||20}-minute focus session. Recommendations stay on this device.`;
    const primary=page.querySelector('.hero-copy .actions a.primary');if(primary&&next){primary.href='/lesson/'+encodeURIComponent(next.id);primary.innerHTML='Continue personalised mission <b>↗</b>'}
    const hud=page.querySelector('.hud-a');if(hud&&next)hud.innerHTML=`<small>PERSONALISED NEXT</small><b>${esc(title(next))}</b><span>${esc(worldName(next.worldId))}</span>`;
    let panel=page.querySelector('[data-personal-home]');
    if(!panel){panel=document.createElement('section');panel.className='mission mission-v2';panel.dataset.personalHome='v25';const anchor=page.querySelector('.metric-deck');anchor?.insertAdjacentElement('afterend',panel)}
    if(panel)panel.innerHTML=`<div class="mission-index">YOU<br><b>${Math.round(done.size/Math.max(1,L.length)*100)}%</b></div><div><span class="kicker">LOCAL PERSONALISED LEARNING PLAN</span><h2>${next?esc(title(next)):'Explore a learning universe'}</h2><p>${p.agePath==='all'?'Open exploration':esc(p.agePath)+' age path'} · ${Number(p.sessionGoal)||20}-minute focus · ${fav.length?fav.map(worldName).map(esc).join(' · '):'choose favourite worlds in Profile'}</p><small>${esc(p.language||'English + Tamil')} · private on this browser</small></div>${next?`<a href="/lesson/${encodeURIComponent(next.id)}" data-link class="primary">Start focused session →</a>`:'<a href="/worlds" data-link class="primary">Explore universes →</a>'}`;
    window.KV_PERSONALIZATION_CONTEXT={candidate:C,version:VERSION,displayName:name,agePath:p.agePath,sessionGoal:Number(p.sessionGoal)||20,preferredWorlds:fav,nextLessonId:next?.id||null,localOnly:true};
  }
  function decorateStudio(){
    if(location.pathname!=='/'&&location.pathname!=='/progress')return;
    const studio=document.querySelector('.study-studio');if(!studio)return;
    const p=profile(),s=progress(),next=nextMission(p,s),name=(p.displayName||'Learner').trim()||'Learner';
    const heading=studio.querySelector('.studio-head h2');if(heading&&name!=='Learner')heading.textContent=`${name}'s Study Studio`;
    const state=studio.querySelector('.studio-state');if(state)state.textContent=`LOCAL · ${p.agePath==='all'?'OPEN PATH':p.agePath} · ${Number(p.sessionGoal)||20} MIN FOCUS`;
    const card=studio.querySelector('.continue-card');
    if(card&&next){const small=card.querySelector('small'),h4=card.querySelector('h4'),desc=card.querySelector('p'),button=card.querySelector('[data-studio-nav]');if(small)small.textContent='PERSONALISED NEXT MISSION';if(h4)h4.textContent=title(next);if(desc)desc.textContent=`${worldName(next.worldId)} · ${next.ageBand||'Age guide'}`;if(button)button.dataset.studioNav='/lesson/'+encodeURIComponent(next.id)}
  }
  function render(){renderProfile();decorateHome();decorateStudio()}
  addEventListener('kv:rendered',render);
  addEventListener('kv:profile',()=>{decorateHome();decorateStudio()});
  addEventListener('storage',e=>{if([PROFILE_KEY,LEGACY_PROFILE_KEY,PROGRESS_KEY,EXPERIENCE_KEY].includes(e.key))render()});
  window.KV_PROFILE_RUNTIME={candidate:C,version:'v25',route:'/profile',localOnly:true,profileKey:PROFILE_KEY,progressKey:PROGRESS_KEY,experienceKey:EXPERIENCE_KEY,maxPreferredWorlds:3,backupExport:true,agePathSynchronized:true,homePersonalization:true,studyStudioPersonalization:true,recommendationPolicy:'local-age-preference-progress'};
  render();
})();
