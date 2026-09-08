/* KirthiVerse Parent Space v1 — route /parent
   Adult-owned, on-device control panel. This is NOT a cloud account or real authentication —
   it is a local PIN gate (kept out of a young child's reach) matching this repo's existing
   local-first, no-cloud-child-data architecture. Real cloud parent/child accounts remain
   deferred pending the auth/consent/privacy/security review already recorded in
   /identity/identity-architecture-v1.json — this build does not attempt to satisfy that gate. */
(()=>{
  const GATE_KEY='kirthiverse.hitech.parentgate.v1';
  const UNLOCK_KEY='kirthiverse.hitech.parentgate.unlocked.v1'; // sessionStorage
  const PROFILE_KEY='kirthiverse.hitech.profile.local.v2';
  const PROGRESS_KEY='kirthiverse.hitech.static.progress.v2';
  const CONFIDENCE_KEY='kirthiverse.hitech.confidence.v1';
  const DIAGNOSTIC_KEY='kirthiverse.hitech.diagnostic.v1';
  const SPEEDLAB_KEY='kirthiverse.hitech.speedlab.v1';
  const LESSONCHECK_KEY='kirthiverse.hitech.lessoncheck.v1';

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const readJSON=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};

  function gate(){ return readJSON(GATE_KEY,{pin:null,childName:'',assistanceEnabled:true,createdAt:null}); }
  function saveGate(g){ localStorage.setItem(GATE_KEY,JSON.stringify(g)); }
  function unlocked(){ return sessionStorage.getItem(UNLOCK_KEY)==='1'; }

  function setupView(){
    return `<div class="page pv-page"><div class="page-title"><span>PARENT SPACE // ON-DEVICE ONLY</span><h1>Set up a grown-up check</h1><p>This is a light, on-device PIN — not an online account — so a young child doesn't wander into settings. It stores nothing off this device and does not create a cloud child profile.</p></div>
      <form id="pv-setup" class="pv-form"><label>Child's display name<input id="pv-child" aria-label="Child's display name" maxlength="30" placeholder="e.g. Kiki"></label><label>Set a 4-digit PIN<input id="pv-pin" aria-label="Set a 4-digit PIN" inputmode="numeric" maxlength="4" pattern="[0-9]{4}"></label><button class="primary" type="submit">Create Parent Space</button></form>
      </div>`;
  }
  function lockView(){
    return `<div class="page pv-page"><div class="page-title"><span>PARENT SPACE</span><h1>Enter PIN</h1><p>Grown-up check — enter the 4-digit PIN to view the dashboard.</p></div>
      <form id="pv-unlock" class="pv-form"><input id="pv-pin-try" aria-label="Enter PIN" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" autofocus><button class="primary" type="submit">Unlock</button></form>
      <p class="pv-note" id="pv-lock-status" role="status" aria-live="polite"></p>
      </div>`;
  }

  function collect(){
    const profile=readJSON(PROFILE_KEY,{displayName:'Learner'});
    const progress=readJSON(PROGRESS_KEY,{started:[],completed:[],agePath:'all'});
    const confidence=readJSON(CONFIDENCE_KEY,{});
    const diagnostic=readJSON(DIAGNOSTIC_KEY,null);
    const speedlab=readJSON(SPEEDLAB_KEY,{history:[],bestByKey:{},levelBySkill:{}});
    const lessonCheck=readJSON(LESSONCHECK_KEY,{});
    const g=gate();
    const summary=window.KV_MASTERY?.summary?.()||{total:0,counts:{},byWorld:[]};
    const rec=window.KV_MASTERY?.recommend?.();

    const activity=[];
    for(const [lessonId,c] of Object.entries(confidence)) if(c?.updatedAt) activity.push({at:c.updatedAt,label:`Confidence signal set on a lesson (${c.value})`});
    for(const [lessonId,c] of Object.entries(lessonCheck)) if(c?.at) activity.push({at:c.at,label:`Checked an answer — ${c.correct?'correct':'needs another look'}`});
    for(const h of speedlab.history||[]) activity.push({at:h.at,label:`Quick Skills: ${h.skill} (${h.duration}s) — ${h.accuracy}% accuracy`});
    if(diagnostic?.completedAt) activity.push({at:diagnostic.completedAt,label:`Diagnostic completed — ${diagnostic.overallAccuracy}% accuracy`});
    const recentActivity=activity.filter(a=>a.at).sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,10);

    const weakAreas=new Set([...(diagnostic?.weakTopics||[]),...(speedlab.weakOps||[])]);
    const strongAreas=new Set(diagnostic?.strongTopics||[]);
    const speedlabBests=Object.entries(speedlab.bestByKey||{});
    const sessionsLogged=(speedlab.history||[]).length+Object.keys(lessonCheck).length+(diagnostic?1:0);

    return {profile,g,summary,rec,recentActivity,weakAreas:[...weakAreas],strongAreas:[...strongAreas],diagnostic,speedlab,speedlabBests,sessionsLogged};
  }

  function dashboardView(){
    const d=collect();
    return `<div class="page pv-page"><div class="page-title"><span>PARENT SPACE // ${esc(d.g.childName||d.profile.displayName||'Learner')}</span><h1>Progress dashboard</h1><p>Everything below is computed from evidence stored on this device only. Nothing here is fabricated — a blank section means no evidence exists yet.</p></div>

    <section class="pv-grid">
      <article class="glass-card"><small class="kicker">MASTERY SIGNAL</small><h2>${d.summary.total?Math.round(((d.summary.counts.secure||0)+(d.summary.counts.developing||0))/d.summary.total*100)+'%':'—'}</h2><p>${d.summary.counts.secure||0} secure · ${d.summary.counts.developing||0} developing · ${d.summary.counts.practising||0} practising · ${d.summary.counts['not-explored']||0} not explored</p></article>
      <article class="glass-card"><small class="kicker">DIAGNOSTIC</small>${d.diagnostic?`<h2>${d.diagnostic.overallAccuracy}%</h2><p>${d.diagnostic.correct}/${d.diagnostic.totalQuestions} correct · <a data-link href="/diagnostic">Retake →</a></p>`:`<h2>Not taken yet</h2><p><a data-link href="/diagnostic">Start the maths diagnostic →</a></p>`}</article>
      <article class="glass-card"><small class="kicker">QUICK SKILLS</small>${d.speedlabBests.length?`<ul>${d.speedlabBests.slice(0,4).map(([k,v])=>`<li>${esc(k.replace(':',' · '))}s: ${v.correct} correct (${v.accuracy}%)</li>`).join('')}</ul>`:`<h2>Not played yet</h2><p><a data-link href="/speedlab">Open Speed Lab →</a></p>`}</article>
      <article class="glass-card"><small class="kicker">ACTIVITY LOGGED</small><h2>${d.sessionsLogged}</h2><p>diagnostic + practice + Quick Skills sessions on this device. Session-length timing isn't tracked in this build, so this is a count, not minutes.</p></article>
    </section>

    <section class="pv-grid">
      <article class="glass-card"><small class="kicker">STRONG AREAS</small>${d.strongAreas.length?`<ul>${d.strongAreas.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>`:'<p class="pv-note">Not enough evidence yet.</p>'}</article>
      <article class="glass-card"><small class="kicker">WEAK AREAS</small>${d.weakAreas.length?`<ul>${d.weakAreas.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>`:'<p class="pv-note">No weak areas detected yet.</p>'}</article>
      <article class="glass-card"><small class="kicker">RECOMMENDED NEXT</small>${d.rec?`<h3>${esc(window.KV_MASTERY.title(d.rec.lesson))}</h3><p>${esc(d.rec.reason)}</p><a class="primary" data-link href="/lesson/${encodeURIComponent(d.rec.lesson.id)}">Open →</a>`:'<p class="pv-note">No recommendation available yet.</p>'}</article>
    </section>

    <section class="glass-card"><small class="kicker">RECENT ACTIVITY</small>${d.recentActivity.length?`<ul class="pv-activity">${d.recentActivity.map(a=>`<li><b>${new Date(a.at).toLocaleString()}</b> ${esc(a.label)}</li>`).join('')}</ul>`:'<p class="pv-note">No timestamped activity yet.</p>'}</section>

    <section class="glass-card"><small class="kicker">ASSISTANCE &amp; CONTROLS</small>
      <p class="pv-note">This build has no live AI tutor. This toggle controls whether hint text and worked-guidance are shown to the learner before they answer a lesson check — a bounded, deterministic stand-in for a future AI-tutor gate.</p>
      <label class="pv-toggle"><input type="checkbox" id="pv-assist" ${d.g.assistanceEnabled?'checked':''}> Show hints &amp; worked guidance before answering</label>
      <div class="pv-actions"><button id="pv-export">Export local backup</button><button id="pv-reset-learning">Reset learning data</button><button id="pv-lock">Lock Parent Space</button></div>
      <p class="pv-note">No real child name, email, school, or cloud account is collected here. Data lives only in this browser.</p>
    </section>
    </div>`;
  }

  function exportBackup(){
    const payload={schema:'kirthiverse.hitech.p0-backup.v1',exportedAt:new Date().toISOString(),...collect()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='kirthiverse-parent-backup.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  }

  function render(){
    if(location.pathname!=='/parent')return;
    const main=document.querySelector('main'); if(!main)return;
    const g=gate();
    if(!g.pin){ main.innerHTML=setupView(); bindSetup(); return; }
    if(!unlocked()){ main.innerHTML=lockView(); bindLock(); return; }
    main.innerHTML=dashboardView(); bindDashboard();
  }

  function bindSetup(){
    document.getElementById('pv-setup')?.addEventListener('submit',e=>{
      e.preventDefault();
      const child=document.getElementById('pv-child').value.trim();
      const pin=document.getElementById('pv-pin').value.trim();
      if(!/^[0-9]{4}$/.test(pin)){alert('Enter a 4-digit PIN.');return;}
      saveGate({pin,childName:child,assistanceEnabled:true,createdAt:new Date().toISOString()});
      sessionStorage.setItem(UNLOCK_KEY,'1');
      render();
    });
  }
  function bindLock(){
    document.getElementById('pv-unlock')?.addEventListener('submit',e=>{
      e.preventDefault();
      const try_=document.getElementById('pv-pin-try').value.trim();
      if(try_===gate().pin){ sessionStorage.setItem(UNLOCK_KEY,'1'); render(); }
      else { document.getElementById('pv-lock-status').textContent='Incorrect PIN.'; }
    });
  }
  function bindDashboard(){
    document.getElementById('pv-assist')?.addEventListener('change',e=>{const g=gate();g.assistanceEnabled=e.target.checked;saveGate(g);dispatchEvent(new CustomEvent('kv:assistance',{detail:{enabled:g.assistanceEnabled}}));});
    document.getElementById('pv-export')?.addEventListener('click',exportBackup);
    document.getElementById('pv-lock')?.addEventListener('click',()=>{sessionStorage.removeItem(UNLOCK_KEY);render();});
    document.getElementById('pv-reset-learning')?.addEventListener('click',()=>{
      if(!confirm('Reset all local learning data (progress, confidence, diagnostic, Quick Skills, lesson checks)? This cannot be undone.'))return;
      [PROGRESS_KEY,CONFIDENCE_KEY,DIAGNOSTIC_KEY,SPEEDLAB_KEY,LESSONCHECK_KEY].forEach(k=>localStorage.removeItem(k));
      render();
    });
  }

  window.KV_ASSISTANCE_ENABLED=()=>gate().assistanceEnabled!==false;

  addEventListener('kv:rendered',render);
  render();
  window.KV_PARENT_RUNTIME={version:'v1',route:'/parent',localOnly:true,cloudAccount:false,realAuthentication:false,storageKey:GATE_KEY};
})();
