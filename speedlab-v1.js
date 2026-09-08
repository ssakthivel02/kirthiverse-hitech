/* KirthiVerse Quick Skills — Speed Lab v1 — route /speedlab
   Original fast maths-fluency drill (mechanism inspired by timed-recall practice apps in general;
   no branding, assets, text or UI copied from any specific product).
   Problems are generated on the device, not drawn from the lesson corpus — arithmetic facts are
   objectively checkable, so nothing here is "fabricated content" in the corpus sense. */
(()=>{
  const KEY='kirthiverse.hitech.speedlab.v1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const SKILLS=[['addition','Addition','+'],['subtraction','Subtraction','−'],['multiplication','Multiplication','×'],['division','Division','÷']];
  const DURATIONS=[[30,'30 seconds'],[60,'60 seconds'],[120,'2 minutes']];

  const load=()=>{try{return Object.assign({levelBySkill:{},bestByKey:{},history:[],weakOps:[]},JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return {levelBySkill:{},bestByKey:{},history:[],weakOps:[]}}};
  const save=s=>localStorage.setItem(KEY,JSON.stringify(s));

  function problem(skill,level){
    const cap=n=>Math.max(1,Math.min(12,n));
    let a,b,answer,text;
    if(skill==='addition'){const max=4+level*4;a=1+Math.floor(Math.random()*max);b=1+Math.floor(Math.random()*max);answer=a+b;text=`${a} + ${b}`;}
    else if(skill==='subtraction'){const max=4+level*4;a=1+Math.floor(Math.random()*max);b=1+Math.floor(Math.random()*a);answer=a-b;text=`${a} − ${b}`;}
    else if(skill==='multiplication'){const f=cap(2+level);a=1+Math.floor(Math.random()*f);b=1+Math.floor(Math.random()*f);answer=a*b;text=`${a} × ${b}`;}
    else {const f=cap(2+level);b=1+Math.floor(Math.random()*f);const q=1+Math.floor(Math.random()*f);a=b*q;answer=q;text=`${a} ÷ ${b}`;}
    return {text,answer:String(answer)};
  }

  let session=null; // {skill,duration,level,queue current item, attempted, correct, times[], deadline, timer, current}

  function startSession(skill,duration){
    const store=load();
    const level=store.levelBySkill[skill]||1;
    session={skill,duration,level,attempted:0,correct:0,times:[],startedAt:Date.now(),endsAt:Date.now()+duration*1000,current:null,streak:0};
    nextProblem();
    session.timer=setInterval(tick,250);
    render();
  }
  function nextProblem(){ session.current={...problem(session.skill,session.level),shownAt:Date.now()}; }
  function tick(){ if(!session)return; if(Date.now()>=session.endsAt){finish();return;} renderTimerOnly(); }

  function answer(value){
    if(!session||!session.current)return;
    const ok=String(value).trim()===session.current.answer;
    session.attempted++;
    session.times.push(Date.now()-session.current.shownAt);
    if(ok){ session.correct++; session.streak++; if(session.streak%4===0)session.level=Math.min(6,session.level+1); }
    else { session.streak=0; session.level=Math.max(1,session.level-1); }
    if(Date.now()>=session.endsAt){finish();return;}
    nextProblem();
    render(ok);
  }

  function finish(){
    clearInterval(session.timer);
    const store=load();
    const {skill,duration,attempted,correct,times,level}=session;
    const accuracy=attempted?Math.round(correct/attempted*100):0;
    const avgMs=times.length?Math.round(times.reduce((a,b)=>a+b,0)/times.length):0;
    const key=`${skill}:${duration}`;
    const prevBest=store.bestByKey[key];
    const isBest=!prevBest||correct>prevBest.correct;
    if(isBest)store.bestByKey[key]={correct,attempted,accuracy,at:new Date().toISOString()};
    store.levelBySkill[skill]=level;
    store.history.push({skill,duration,attempted,correct,accuracy,avgMs,at:new Date().toISOString()});
    store.history=store.history.slice(-100);
    // recompute weak ops from the last 3 sessions per skill
    const weak=[];
    for(const [id] of SKILLS){
      const recent=store.history.filter(h=>h.skill===id).slice(-3);
      if(recent.length&&recent.reduce((s,h)=>s+h.accuracy,0)/recent.length<70)weak.push(id);
    }
    store.weakOps=weak;
    save(store);
    const finished={skill,duration,attempted,correct,accuracy,avgMs,isBest,best:store.bestByKey[key]};
    session=null;
    render(null,finished);
  }

  function menuView(){
    const store=load();
    return `<div class="page sl-page"><div class="page-title"><span>QUICK SKILLS // SPEED LAB</span><h1>Fast maths. Clear feedback.</h1><p>Pick a skill and a mission length. Speed Lab adapts to how you're doing as you go.</p></div>
      <div class="sl-skills">${SKILLS.map(([id,name,sym])=>{
        const lvl=store.levelBySkill[id]||1;
        const best=DURATIONS.map(([d])=>store.bestByKey[`${id}:${d}`]).filter(Boolean).sort((a,b)=>b.correct-a.correct)[0];
        return `<article class="sl-skill" data-skill="${id}"><span class="sl-sym">${sym}</span><h2>${name}</h2><small>Level ${lvl}${best?` · Best ${best.correct} correct`:''}</small><div class="sl-durations">${DURATIONS.map(([d,label])=>`<button data-start="${id}:${d}">${label}</button>`).join('')}</div></article>`;
      }).join('')}</div>
      ${store.weakOps.length?`<p class="sl-note">Recent focus area${store.weakOps.length>1?'s':''}: ${store.weakOps.join(', ')}.</p>`:''}
      </div>`;
  }

  function sessionView(justAnswered){
    const timeLeft=Math.max(0,Math.ceil((session.endsAt-Date.now())/1000));
    return `<div class="page sl-page"><section class="sl-session ${justAnswered===true?'sl-flash-ok':justAnswered===false?'sl-flash-bad':''}">
      <header><a href="/speedlab" data-link>← Skills</a><b>${timeLeft}s</b><span>${session.correct}/${session.attempted} correct</span></header>
      <div class="sl-problem"><h1 id="sl-text">${esc(session.current.text)}</h1>
      <form id="sl-form"><input id="sl-answer" aria-label="Your answer" inputmode="numeric" autocomplete="off" autofocus placeholder="?"><button class="primary" type="submit">Go</button></form></div>
      <p class="sl-note">Level ${session.level} · streak ${session.streak}</p>
      </section></div>`;
  }

  function finishView(f){
    const store=load();
    const rec=window.KV_MASTERY?.recommend?.();
    return `<div class="page sl-page"><div class="page-title"><span>${f.skill.toUpperCase()} · ${f.duration}s // COMPLETE</span><h1>${f.accuracy}% accuracy</h1><p>${f.correct} correct out of ${f.attempted} attempted${f.isBest?' — new personal best!':''}. Average response time ${(f.avgMs/1000).toFixed(1)}s.</p></div>
      <div class="sl-actions"><button class="primary" data-start="${f.skill}:${f.duration}">Practice again</button><a data-link href="/speedlab">Choose another skill</a>${rec?`<a data-link href="/lesson/${encodeURIComponent(rec.lesson.id)}">Recommended lesson →</a>`:''}</div>
      </div>`;
  }

  function render(justAnswered,justFinished){
    if(location.pathname!=='/speedlab')return;
    const main=document.querySelector('main'); if(!main)return;
    if(justFinished){ main.innerHTML=finishView(justFinished); bind(); return; }
    if(session){ main.innerHTML=sessionView(justAnswered); bind(); const inp=document.getElementById('sl-answer'); inp&&inp.focus(); return; }
    main.innerHTML=menuView(); bind();
  }
  function renderTimerOnly(){
    if(location.pathname!=='/speedlab'||!session)return;
    const b=document.querySelector('.sl-session header b'); if(b)b.textContent=Math.max(0,Math.ceil((session.endsAt-Date.now())/1000))+'s';
  }
  function bind(){
    document.querySelectorAll('[data-start]').forEach(b=>b.addEventListener('click',()=>{const [skill,duration]=b.dataset.start.split(':');startSession(skill,Number(duration));}));
    const form=document.getElementById('sl-form');
    form?.addEventListener('submit',e=>{e.preventDefault();const v=document.getElementById('sl-answer').value;answer(v);});
  }

  addEventListener('kv:rendered',()=>{ if(location.pathname!=='/speedlab'&&session){clearInterval(session.timer);session=null;} render(); });
  render();
  window.KV_SPEEDLAB_RUNTIME={version:'v1',route:'/speedlab',localOnly:true,storageKey:KEY,skills:SKILLS.map(s=>s[0]),durations:DURATIONS.map(d=>d[0])};
})();
