/* KirthiVerse Educator Pilot Console v1 — route /educator
   Funding-readiness prototype only. This is NOT a school account, MIS/SIS, cloud roster or teacher authentication.
   It is deliberately local-only and requires the Parent Space session to be unlocked first.
   Learners are aliases. Only the current device-linked learner can have automatic evidence; other roster aliases show
   honest "no device evidence" states. No manual grades, fake completion, email, school ID or cloud child data. */
(()=>{
  const STATE_KEY='kirthiverse.hitech.educator.pilot.v1';
  const PARENT_UNLOCK_KEY='kirthiverse.hitech.parentgate.unlocked.v1';
  const PARENT_GATE_KEY='kirthiverse.hitech.parentgate.v1';
  const PROFILE_KEY='kirthiverse.hitech.profile.local.v2';
  const PROGRESS_KEY='kirthiverse.hitech.static.progress.v2';
  const L=window.KV_LESSONS||[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return structuredClone?structuredClone(f):JSON.parse(JSON.stringify(f))}};
  const now=()=>new Date().toISOString();
  const uid=prefix=>`${prefix}_${Date.now()}_${crypto.randomUUID?.().slice(0,8)||Math.random().toString(36).slice(2,10)}`;
  const localUnlocked=()=>sessionStorage.getItem(PARENT_UNLOCK_KEY)==='1';
  const gate=()=>read(PARENT_GATE_KEY,{});
  const profile=()=>read(PROFILE_KEY,{displayName:'Local learner'});
  const progress=()=>read(PROGRESS_KEY,{started:[],completed:[]});
  const lessonTitle=l=>window.KV_MASTERY?.title?.(l)||l?.title||l?.topic||l?.id||'Lesson';

  function freshState(){
    const g=gate(),p=profile();
    return {version:1,className:'Pilot class',createdAt:now(),learners:[{id:'local-device-learner',alias:String(g.childName||p.displayName||'Local learner').slice(0,30),linkedLocal:true,createdAt:now()}],assignments:[]};
  }
  function state(){
    const s=read(STATE_KEY,null)||freshState();
    if(!Array.isArray(s.learners))s.learners=[];
    if(!s.learners.some(x=>x.linkedLocal))s.learners.unshift(freshState().learners[0]);
    if(!Array.isArray(s.assignments))s.assignments=[];
    return s;
  }
  function save(s){localStorage.setItem(STATE_KEY,JSON.stringify(s));}
  function evidenceFor(learner,lessonId){
    if(!learner?.linkedLocal)return {state:'unlinked',label:'No device evidence'};
    const p=progress(),completed=new Set(p.completed||[]),started=new Set(p.started||[]);
    if(completed.has(lessonId))return {state:'completed',label:'Completed'};
    if(started.has(lessonId))return {state:'started',label:'Started'};
    return {state:'none',label:'No evidence yet'};
  }
  function assignmentStats(s){
    let evidenceRows=0,completedRows=0;
    for(const a of s.assignments)for(const id of a.assignedTo||[]){const learner=s.learners.find(x=>x.id===id),e=evidenceFor(learner,a.lessonId);if(e.state!=='unlinked')evidenceRows++;if(e.state==='completed')completedRows++;}
    return {evidenceRows,completedRows};
  }

  function lockedView(){return `<div class="page ep-page"><div class="page-title"><span>EDUCATOR PILOT // LOCAL ONLY</span><h1>Unlock Parent Space first</h1><p>This pilot console is intentionally behind the same on-device grown-up check. It is not teacher authentication or a school account.</p></div><a class="primary" data-link href="/parent">Open Parent Space →</a></div>`;}

  function lessonOptions(){
    return [...L].sort((a,b)=>String(a.subject||'').localeCompare(String(b.subject||''))||lessonTitle(a).localeCompare(lessonTitle(b))).map(l=>`<option value="${esc(l.id)}">${esc(l.subject||'Learning')} — ${esc(lessonTitle(l))}</option>`).join('');
  }

  function dashboardView(){
    const s=state(),stats=assignmentStats(s),mastery=window.KV_MASTERY?.summary?.()||{counts:{},total:0},rec=window.KV_MASTERY?.recommend?.();
    const secure=mastery.counts?.secure||0,developing=mastery.counts?.developing||0,practising=mastery.counts?.practising||0;
    return `<div class="page ep-page"><div class="page-title"><span>EDUCATOR PILOT // ON-DEVICE EVIDENCE</span><h1>${esc(s.className)}</h1><p>Prototype class planning for a controlled pilot. Roster names are aliases. Only the learner linked to this device can show automatic progress evidence; every other learner stays explicitly unlinked until real school identity/consent architecture exists.</p></div>

      <section class="ep-grid" aria-label="Pilot summary">
        <article class="glass-card"><small class="kicker">ROSTER ALIASES</small><h2>${s.learners.length}</h2><p>${s.learners.filter(x=>x.linkedLocal).length} linked to real on-device learning evidence.</p></article>
        <article class="glass-card"><small class="kicker">ASSIGNMENTS</small><h2>${s.assignments.length}</h2><p>Created from the canonical KirthiVerse lesson corpus.</p></article>
        <article class="glass-card"><small class="kicker">VERIFIED COMPLETIONS</small><h2>${stats.completedRows}</h2><p>From local completion evidence only; no manual grades are invented.</p></article>
        <article class="glass-card"><small class="kicker">LOCAL MASTERY SIGNALS</small><h2>${secure}</h2><p>${developing} developing · ${practising} practising.</p></article>
      </section>

      <section class="ep-grid ep-grid-two">
        <article class="glass-card"><small class="kicker">CLASS SETUP</small>
          <form id="ep-class-form" class="ep-form"><label>Class display name<input id="ep-class-name" maxlength="40" value="${esc(s.className)}" aria-label="Class display name"></label><button type="submit">Save class name</button></form>
          <h3>Roster</h3><ul class="ep-roster">${s.learners.map(l=>`<li><span><b>${esc(l.alias)}</b><small>${l.linkedLocal?'Linked local learner':'Alias only — no device evidence'}</small></span>${l.linkedLocal?'<span class="ep-chip">LOCAL EVIDENCE</span>':`<button data-remove-learner="${esc(l.id)}" aria-label="Remove ${esc(l.alias)}">Remove</button>`}</li>`).join('')}</ul>
          <form id="ep-learner-form" class="ep-form ep-inline"><label>Add learner alias<input id="ep-learner-alias" maxlength="30" placeholder="Alias only" aria-label="Learner alias"></label><button type="submit">Add alias</button></form>
          <p class="ep-note">No learner email, school identifier, date of birth or real-world identity is collected here.</p>
        </article>

        <article class="glass-card"><small class="kicker">CREATE ASSIGNMENT</small>
          <form id="ep-assignment-form" class="ep-form"><label>Canonical lesson<select id="ep-lesson" aria-label="Canonical lesson">${lessonOptions()}</select></label><fieldset><legend>Assign to</legend>${s.learners.map(l=>`<label class="ep-check"><input type="checkbox" name="ep-learner" value="${esc(l.id)}" ${l.linkedLocal?'checked':''}> ${esc(l.alias)}${l.linkedLocal?' (linked)':''}</label>`).join('')}</fieldset><label>Optional due date<input id="ep-due" type="date" aria-label="Optional due date"></label><button type="submit">Create assignment</button></form>
          <p id="ep-assignment-status" class="ep-note" role="status" aria-live="polite"></p>
        </article>
      </section>

      <section class="glass-card"><div class="ep-section-head"><div><small class="kicker">ASSIGNMENT EVIDENCE</small><h2>What is actually known</h2></div></div>
        ${s.assignments.length?`<div class="ep-table-wrap"><table class="ep-table"><thead><tr><th>Lesson</th><th>Learner</th><th>Status</th><th>Due</th><th></th></tr></thead><tbody>${s.assignments.flatMap(a=>{const l=L.find(x=>x.id===a.lessonId);return (a.assignedTo||[]).map(id=>{const learner=s.learners.find(x=>x.id===id)||{alias:'Removed learner'},e=evidenceFor(learner,a.lessonId);return `<tr><td><a data-link href="/lesson/${encodeURIComponent(a.lessonId)}">${esc(lessonTitle(l)||a.lessonId)}</a></td><td>${esc(learner.alias)}</td><td><span class="ep-status ep-${e.state}">${esc(e.label)}</span></td><td>${esc(a.dueDate||'—')}</td><td><button data-remove-assignment="${esc(a.id)}" aria-label="Remove assignment">Remove</button></td></tr>`})}).join('')}</tbody></table></div>`:'<p class="ep-note">No assignments yet. Create one above; no sample completion data will be fabricated.</p>'}
      </section>

      <section class="ep-grid ep-grid-two">
        <article class="glass-card"><small class="kicker">DETERMINISTIC INTERVENTION</small>${rec?`<h3>${esc(lessonTitle(rec.lesson))}</h3><p>${esc(rec.reason)}</p><a class="primary" data-link href="/lesson/${encodeURIComponent(rec.lesson.id)}">Open recommended lesson →</a>`:'<p class="ep-note">No local recommendation is available yet.</p>'}<p class="ep-note">This recommendation applies only to the linked local learner. It is not presented as class-wide analytics.</p></article>
        <article class="glass-card"><small class="kicker">PILOT CONTROLS</small><div class="ep-actions"><button id="ep-export">Export pilot plan</button><button id="ep-reset">Reset educator pilot data</button><a class="primary" data-link href="/parent">Parent Space →</a></div><p class="ep-note">Export contains class aliases, assignment plan and derived non-secret evidence states only. Parent PIN data is never included.</p></article>
      </section>
    </div>`;
  }

  function exportPilot(){
    const s=state();
    const payload={schema:'kirthiverse.hitech.educator-pilot.v1',exportedAt:now(),localOnly:true,notSchoolAccount:true,className:s.className,learners:s.learners.map(({id,alias,linkedLocal})=>({id,alias,linkedLocal})),assignments:s.assignments.map(a=>({...a,evidence:(a.assignedTo||[]).map(id=>{const learner=s.learners.find(x=>x.id===id);return {learnerId:id,state:evidenceFor(learner,a.lessonId).state}})}))};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kirthiverse-educator-pilot.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  }

  function bind(){
    document.getElementById('ep-class-form')?.addEventListener('submit',e=>{e.preventDefault();const s=state(),name=document.getElementById('ep-class-name').value.trim();if(name){s.className=name.slice(0,40);save(s);render();}});
    document.getElementById('ep-learner-form')?.addEventListener('submit',e=>{e.preventDefault();const s=state(),alias=document.getElementById('ep-learner-alias').value.trim();if(!alias)return;s.learners.push({id:uid('learner'),alias:alias.slice(0,30),linkedLocal:false,createdAt:now()});save(s);render();});
    document.querySelectorAll('[data-remove-learner]').forEach(b=>b.addEventListener('click',()=>{const s=state(),id=b.dataset.removeLearner;s.learners=s.learners.filter(x=>x.id!==id);s.assignments=s.assignments.map(a=>({...a,assignedTo:(a.assignedTo||[]).filter(x=>x!==id)})).filter(a=>a.assignedTo.length);save(s);render();}));
    document.getElementById('ep-assignment-form')?.addEventListener('submit',e=>{e.preventDefault();const s=state(),lessonId=document.getElementById('ep-lesson').value,dueDate=document.getElementById('ep-due').value||null,assignedTo=[...document.querySelectorAll('input[name="ep-learner"]:checked')].map(x=>x.value),status=document.getElementById('ep-assignment-status');if(!lessonId||!L.some(x=>x.id===lessonId)){status.textContent='Choose a canonical lesson.';return;}if(!assignedTo.length){status.textContent='Select at least one learner alias.';return;}s.assignments.unshift({id:uid('assignment'),lessonId,assignedTo,dueDate,createdAt:now()});save(s);render();});
    document.querySelectorAll('[data-remove-assignment]').forEach(b=>b.addEventListener('click',()=>{const s=state();s.assignments=s.assignments.filter(x=>x.id!==b.dataset.removeAssignment);save(s);render();}));
    document.getElementById('ep-export')?.addEventListener('click',exportPilot);
    document.getElementById('ep-reset')?.addEventListener('click',()=>{if(confirm('Reset local educator pilot roster and assignments? Learning progress is not deleted.')){localStorage.removeItem(STATE_KEY);render();}});
  }

  function addNav(){
    const nav=document.querySelector('.topbar nav');if(!nav)return;let a=nav.querySelector('a[href="/educator"]');if(!a){a=document.createElement('a');a.href='/educator';a.dataset.link='';a.className='vm-nav-p0';a.innerHTML='▦ <span>Educator</span>';nav.appendChild(a);}a.setAttribute('aria-label','Educator Pilot');a.setAttribute('title','Educator Pilot');if(location.pathname==='/educator')a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  }
  function render(){
    addNav();if(location.pathname!=='/educator')return;const main=document.querySelector('main');if(!main)return;main.innerHTML=localUnlocked()?dashboardView():lockedView();if(localUnlocked())bind();
  }
  addEventListener('kv:rendered',render);render();
})();
