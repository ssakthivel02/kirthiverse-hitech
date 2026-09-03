(()=>{
  const BUILD='HITECH-2026-09-03-08';
  const L=window.KV_LESSONS||[];
  const A=window.KV_ASSESSMENTS||[];
  const progressKey='kirthiverse.hitech.static.progress.v2';
  const prefsKey='kirthiverse.hitech.planner.v8';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=l=>l?.title||l?.subtopic||l?.topic||'Learning mission';
  const loadProgress=()=>{try{return JSON.parse(localStorage.getItem(progressKey)||'{"started":[],"completed":[],"agePath":"all"}')}catch{return{started:[],completed:[],agePath:'all'}}};
  const loadPrefs=()=>{try{return JSON.parse(localStorage.getItem(prefsKey)||'{"goal":5,"baseline":null,"largeText":false,"highContrast":false,"reduceMotion":false}')}catch{return{goal:5,baseline:null,largeText:false,highContrast:false,reduceMotion:false}}};
  const savePrefs=p=>localStorage.setItem(prefsKey,JSON.stringify(p));
  const href=id=>'/lesson/'+encodeURIComponent(id);
  let injecting=false,lastRoute='';
  function assessmentPrompt(a){return typeof a?.questionActivity==='string'?a.questionActivity:(a?.questionActivity?.prompt||a?.prompt||'Verified practice activity');}
  function applyPrefs(){const p=loadPrefs();document.documentElement.classList.toggle('kv-large-text',!!p.largeText);document.documentElement.classList.toggle('kv-high-contrast',!!p.highContrast);document.documentElement.classList.toggle('kv-reduce-motion',!!p.reduceMotion);}
  function setGoal(n){const p=loadPrefs(),pr=loadProgress();p.goal=n;p.baseline=(pr.completed||[]).length;savePrefs(p);refresh(true);}
  function togglePref(k){const p=loadPrefs();p[k]=!p[k];savePrefs(p);applyPrefs();refresh(true);}
  function buildPlanner(){
    const p=loadPrefs(),pr=loadProgress();
    const done=(pr.completed||[]).length;
    const baseline=p.baseline==null?done:p.baseline;
    const gained=Math.max(0,done-baseline);
    const goal=Math.max(1,p.goal||5);
    const pct=Math.min(100,Math.round(gained/goal*100));
    const started=(pr.started||[]).map(id=>L.find(x=>x.id===id)).filter(Boolean);
    const recent=started.slice(-2).reverse();
    const next=L.find(l=>!(pr.completed||[]).includes(l.id));
    return `<section class="planner-v8" data-v8><div class="planner-head"><div><span>LOCAL LEARNING PLANNER // ${BUILD}</span><h2>Plan a focused learning rhythm.</h2></div><p>No account. No cloud profile. Goals stay in this browser.</p></div><div class="planner-grid-v8"><article class="goal-card-v8"><div class="goal-top-v8"><strong>Weekly mission target</strong><div class="goal-select-v8">${[3,5,7].map(n=>`<button data-goal-v8="${n}" class="${goal===n?'active':''}">${n} missions</button>`).join('')}</div></div><div class="goal-meter-v8" style="--goal:${pct}%"><i></i></div><div class="goal-meta-v8"><span>${gained} completed since goal started</span><span>${pct}% of target</span></div></article><article class="continuity-v8"><small>RETURN-USER CONTINUITY</small><h3>Keep momentum without pressure.</h3><p>Resume canonical lessons you already opened, or continue to the next unfinished mission.</p>${recent.map((l,i)=>`<div class="continuity-row-v8"><div><small>${i===0?'MOST RECENT':'RECENT'}</small><b>${esc(title(l))}</b></div><a href="${href(l.id)}" data-link>↗</a></div>`).join('')}${next?`<div class="continuity-row-v8"><div><small>NEXT UNFINISHED</small><b>${esc(title(next))}</b></div><a href="${href(next.id)}" data-link>→</a></div>`:''}</article></div></section>`;
  }
  function buildChallenge(){const p=loadProgress(),seed=(p.completed||[]).length+(p.started||[]).length,cards=[];for(let i=0;i<A.length&&cards.length<3;i++){const a=A[(i*7+seed)%A.length];if(a&&!cards.includes(a))cards.push(a)}if(!cards.length)return '';return `<section class="challenge-v8" data-v8><div class="challenge-top-v8"><div><span class="eyebrow">CANONICAL CHALLENGE DECK</span><h2>Test your thinking with verified material.</h2></div><p>Every card comes directly from the existing assessment corpus. Reveal guidance when ready; KirthiVerse does not invent extra questions.</p></div><div class="challenge-deck-v8">${cards.map((a,i)=>`<article class="challenge-card-v8"><small>CHALLENGE ${String(i+1).padStart(2,'0')} · ${esc((a.assessmentType||'practice').replaceAll('_',' '))}</small><h3>${esc(assessmentPrompt(a))}</h3><details><summary>Reveal verified guidance</summary><div class="challenge-answer-v8"><b>${esc(a.correctAnswer||'Verified answer available')}</b>${a.explanation?`<p>${esc(a.explanation)}</p>`:''}</div></details></article>`).join('')}</div></section>`;}
  function buildA11y(){const p=loadPrefs();return `<section class="a11y-v8" data-v8><div><span class="eyebrow">ACCESSIBILITY CONTROL DECK</span><h2>Shape the interface to the learner.</h2><p>These preferences are stored locally and affect presentation only; they do not alter canonical lesson or assessment content.</p></div><div class="a11y-controls-v8"><button data-pref-v8="largeText" class="${p.largeText?'active':''}">A+ Larger text</button><button data-pref-v8="highContrast" class="${p.highContrast?'active':''}">◐ High contrast</button><button data-pref-v8="reduceMotion" class="${p.reduceMotion?'active':''}">◇ Reduce motion</button></div></section>`}
  function bind(){document.querySelectorAll('[data-goal-v8]').forEach(b=>b.onclick=()=>setGoal(Number(b.dataset.goalV8)));document.querySelectorAll('[data-pref-v8]').forEach(b=>b.onclick=()=>togglePref(b.dataset.prefV8));document.querySelectorAll('[data-v8] [data-link]').forEach(a=>{if(a.dataset.v8Bound)return;a.dataset.v8Bound='1';a.addEventListener('click',e=>{e.preventDefault();history.pushState({},'',a.getAttribute('href'));window.dispatchEvent(new PopStateEvent('popstate'));})});}
  function inject(force=false){if(injecting)return;const route=location.pathname;const existing=document.querySelector('[data-v8]');if(!force&&existing&&route===lastRoute){bind();return;}injecting=true;try{document.querySelectorAll('[data-v8]').forEach(n=>n.remove());const home=document.querySelector('.home-page');if(home){const anchor=home.querySelector('.metric-deck')||home.querySelector('.metrics');if(anchor)anchor.insertAdjacentHTML('afterend',buildPlanner()+buildChallenge()+buildA11y());}else{const page=document.querySelector('.page');if(page)page.insertAdjacentHTML('beforeend',buildA11y());}lastRoute=route;bind();}finally{injecting=false;}}
  function refresh(force=false){applyPrefs();requestAnimationFrame(()=>inject(force));}
  let scheduled=false;const schedule=()=>{if(injecting||scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;inject(false)});};
  const app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:false});
  addEventListener('popstate',()=>refresh(true));addEventListener('storage',()=>refresh(true));refresh(true);
})();