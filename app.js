(()=>{
  const BUILD='HITECH-2026-09-03-02';
  const worlds=[
    {id:'mathematics',name:'Mathematics',icon:'∑',lab:'Quantum Number Lab',desc:'Numbers, patterns and reasoning',signal:'logic'},
    {id:'science',name:'Science',icon:'✦',lab:'Discovery Reactor',desc:'Observe, test and explain',signal:'discovery'},
    {id:'english',name:'English',icon:'Aa',lab:'Story Signal',desc:'Read, write and communicate',signal:'language'},
    {id:'tamil',name:'Tamil',icon:'அ',lab:'Tamil Constellation',desc:'தமிழுடன் கற்று வளருங்கள்',signal:'தமிழ்'},
    {id:'coding-ai',name:'Coding & AI',icon:'</>',lab:'Code Horizon',desc:'Logic, algorithms and AI literacy',signal:'compute'},
    {id:'geography',name:'Geography',icon:'⌖',lab:'Planet Atlas',desc:'Places, people and systems',signal:'world'},
    {id:'history',name:'History',icon:'⌛',lab:'Time Portal',desc:'Evidence and change over time',signal:'time'},
    {id:'music-rhythm',name:'Music & Rhythm',icon:'♫',lab:'Sound Lab',desc:'Listen, create and find patterns',signal:'sound'},
    {id:'art-design',name:'Art & Design',icon:'◌',lab:'Creative Studio',desc:'Observe, compose and design',signal:'create'},
    {id:'general-knowledge',name:'General Knowledge',icon:'?',lab:'Wonder Grid',desc:'Connect ideas across the world',signal:'connect'},
    {id:'life-skills',name:'Life Skills',icon:'＋',lab:'Life Systems',desc:'Practical choices and confidence',signal:'life'}
  ];
  const L=window.KV_LESSONS||[];
  const A=window.KV_ASSESSMENTS||[];
  const key='kirthiverse.hitech.static.progress.v2';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=l=>l?.title||l?.subtopic||l?.topic||'Learning mission';
  const obj=l=>l?.learningObjective||l?.description||l?.content||'Verified learning activity';
  const state=()=>{try{return JSON.parse(localStorage.getItem(key)||'{"started":[],"completed":[],"agePath":"all"}')}catch{return{started:[],completed:[],agePath:'all'}}};
  const save=s=>localStorage.setItem(key,JSON.stringify(s));
  function wid(s=''){
    const x=String(s).toLowerCase();
    if(x.includes('math'))return'mathematics';
    if(x.includes('sci'))return'science';
    if(x.includes('engl'))return'english';
    if(x.includes('tamil')||x.includes('தமிழ்'))return'tamil';
    if(x.includes('comput')||x.includes('cod')||x.includes('ai'))return'coding-ai';
    if(x.includes('geog'))return'geography';
    if(x.includes('hist'))return'history';
    if(x.includes('music'))return'music-rhythm';
    if(x.includes('art')||x.includes('design'))return'art-design';
    if(x.includes('life'))return'life-skills';
    return'general-knowledge';
  }
  L.forEach(x=>x.worldId=x.worldId||wid(x.subject));
  const link=(href,html,cls='')=>`<a href="${href}" data-link class="${cls}">${html}</a>`;
  const worldBy=id=>worlds.find(w=>w.id===id);
  const assessmentsFor=id=>A.filter(a=>a.lessonId===id);
  const completedSet=()=>new Set(state().completed||[]);

  function shell(content){
    return `<div class="app">
      <div class="ambient-grid"></div><div class="aurora a1"></div><div class="aurora a2"></div><div class="scanline"></div>
      <header class="topbar">
        ${link('/','<span class="brand-orb"><i>K</i></span><span><b>KirthiVerse</b><small>FUTURE CLASSROOM OS</small></span>','brand')}
        <nav>${link('/','⌂ <span>Home</span>')}${link('/worlds','◫ <span>Universes</span>')}${link('/search','⌕ <span>Search</span>')}${link('/progress','◌ <span>Progress</span>')}</nav>
        <div class="system-pill"><span class="pulse"></span><b>LEARNING CORE</b><small>ONLINE</small></div>
      </header>
      <main>${content}</main>
      <footer><span>KV // ${BUILD}</span><span>${L.length} lessons · ${A.length} assessments · ${worlds.length} universes · local-first</span></footer>
    </div>`;
  }

  function agePathCards(){
    const paths=[
      ['3–6','EARLY EXPLORER','Playful foundations','spark'],
      ['7–10','SKILL BUILDER','Core knowledge + confidence','orbit'],
      ['11–13','DEEP THINKER','Reasoning + independent practice','vector'],
      ['14–16','FUTURE READY','Advanced concepts + applied thinking','nova']
    ];
    return `<section class="age-console"><div class="section-head compact"><div><span>AGE-ADAPTIVE ENTRY</span><h2>Choose a learning trajectory.</h2></div><p>One verified corpus. Different ways to enter it.</p></div><div class="age-paths">${paths.map((p,i)=>`<button class="age-card" data-age="${p[0]}"><span class="age-index">0${i+1}</span><small>${p[3].toUpperCase()}</small><strong>${p[0]}</strong><h3>${p[1]}</h3><p>${p[2]}</p><i>Enter path →</i></button>`).join('')}</div></section>`;
  }

  function home(){
    const p=state();
    const done=new Set(p.completed||[]);
    const next=L.find(l=>!done.has(l.id))||L[0];
    const nextW=worldBy(next?.worldId)||worlds[0];
    return `<div class="page home-page">
      <section class="hero hero-v2">
        <div class="hero-copy">
          <div class="system-label"><span></span>KIRTHIVERSE LEARNING OS · BUILD ${BUILD}</div>
          <h1>Enter the classroom<br><em>of the future.</em></h1>
          <p class="hero-lead">An immersive learning universe for ages 3–16 — eleven connected subject worlds, verified lessons, local progress and zero noisy social feeds.</p>
          <div class="actions">${next?link('/lesson/'+next.id,'Launch next mission <b>↗</b>','primary'):link('/worlds','Enter learning universes','primary')}${link('/worlds','Explore universe map','secondary')}</div>
          <div class="hero-signals"><span><i>11</i> connected universes</span><span><i>${L.length}</i> canonical lessons</span><span><i>${A.length}</i> verified assessments</span></div>
        </div>
        <div class="command-orbit" aria-label="Interactive learning universe">
          <div class="orbit-hud hud-a"><small>NEXT MISSION</small><b>${esc(title(next))}</b><span>${esc(nextW.name)}</span></div>
          <div class="orbit-hud hud-b"><small>PRIVACY MODE</small><b>LOCAL-FIRST</b><span>No child cloud profile required</span></div>
          <div class="core-v2"><div class="core-glow"></div><span>K</span><small>KNOWLEDGE CORE</small><i>${Math.round(done.size/Math.max(L.length,1)*100)}%</i></div>
          <div class="orbit o1"></div><div class="orbit o2"></div><div class="orbit o3"></div>
          ${worlds.slice(0,8).map((w,i)=>link('/world/'+w.id,`<b>${w.icon}</b><span>${w.name}</span>`,`node n${i+1}`)).join('')}
          <div class="radar-line"></div>
        </div>
      </section>
      <section class="metric-deck"><article><small>SYSTEM 01</small><strong>${worlds.length}</strong><span>Learning universes</span></article><article><small>SYSTEM 02</small><strong>${L.length}</strong><span>Canonical lessons</span></article><article><small>SYSTEM 03</small><strong>${A.length}</strong><span>Verified assessments</span></article><article><small>SYSTEM 04</small><strong>3–16</strong><span>Age-adaptive journey</span></article></section>
      ${agePathCards()}
      <section class="section universe-section"><div class="section-head"><div><span>UNIVERSE NAVIGATION</span><h2>Eleven worlds. One connected learning system.</h2></div>${link('/worlds','Open full universe map →','text-link')}</div><div class="world-cards premium">${worlds.slice(0,6).map((w,i)=>{const n=L.filter(l=>l.worldId===w.id).length;return link('/world/'+w.id,`<div class="world-top"><span class="world-code">U-${String(i+1).padStart(2,'0')}</span><span class="signal">${w.signal}</span></div><div class="world-symbol">${w.icon}</div><small>${w.lab}</small><h3>${w.name}</h3><p>${w.desc}</p><div class="world-foot"><span>${n} verified lessons</span><b>↗</b></div>`,'world-card');}).join('')}</div></section>
      ${next?`<section class="mission mission-v2"><div class="mission-index">NEXT<br><b>01</b></div><div><span class="kicker">RECOMMENDED CONTINUATION</span><h2>${esc(title(next))}</h2><p>${esc(obj(next))}</p><small>${esc(nextW.lab)} · ${esc(next.ageBand||'Age guide')}</small></div>${link('/lesson/'+next.id,'Start mission →','primary')}</section>`:''}
    </div>`;
  }

  function worldsPage(){
    return `<div class="page"><div class="page-title"><span>UNIVERSE DIRECTORY // 11 DOMAINS</span><h1>Learning universes</h1><p>Each universe is a focused environment built from the verified KirthiVerse corpus. Choose a domain and enter its lesson missions.</p></div><div class="world-list world-list-v2">${worlds.map((w,i)=>{const ls=L.filter(l=>l.worldId===w.id);return link('/world/'+w.id,`<span class="world-num">${String(i+1).padStart(2,'0')}</span><span class="world-bigicon">${w.icon}</span><div><small>${w.lab}</small><h2>${w.name}</h2><p>${w.desc}</p></div><div class="world-stats"><b>${ls.length}</b><small>LESSONS</small></div><span class="arrow">↗</span>`,'world-row');}).join('')}</div></div>`;
  }

  function worldPage(id){
    const w=worldBy(id); if(!w)return home();
    const ls=L.filter(l=>l.worldId===id);
    const done=completedSet();
    return `<div class="page">${link('/worlds','← Return to universe map','back')}<section class="world-hero2"><div class="world-bigicon xl">${w.icon}</div><div><span>LEARNING UNIVERSE · ${w.lab}</span><h1>${w.name}</h1><p>${w.desc}</p><div class="world-signal"><i></i> ${w.signal.toUpperCase()} SIGNAL ACTIVE</div></div><strong>${ls.length}<small>VERIFIED LESSONS</small></strong></section><div class="lesson-grid">${ls.map((l,i)=>link('/lesson/'+l.id,`<span class="lesson-no">${String(i+1).padStart(2,'0')}</span><div><small>${esc(l.ageBand||'AGE GUIDE')} ${done.has(l.id)?'· COMPLETE':''}</small><h3>${esc(title(l))}</h3><p>${esc(obj(l))}</p></div><span class="arrow">${done.has(l.id)?'✓':'↗'}</span>`,'lesson-tile'+(done.has(l.id)?' complete-tile':''))).join('')}</div></div>`;
  }

  function lessonPage(id){
    const l=L.find(x=>x.id===id); if(!l)return home();
    const s=state(); if(!s.started.includes(id)){s.started.push(id);save(s)}
    const aa=assessmentsFor(id); const a=aa[0]; const w=worldBy(l.worldId)||worlds[0]; const isDone=s.completed.includes(id);
    const core=typeof l.content==='string'?l.content:(l.description||'Work through this concept carefully and explain it in your own words.');
    const worked=typeof l.workedExample==='string'?l.workedExample:(typeof l.example==='string'?l.example:'Build an example, explain each step, then check whether your conclusion still holds.');
    return `<div class="page lesson">${link('/world/'+l.worldId,'← Back to '+esc(w.name),'back')}<div class="lesson-head lesson-head-v2"><div><span>MISSION // ${esc(l.ageBand||'AGE GUIDE')} // ${esc(w.lab)}</span><h1>${esc(title(l))}</h1><p>${esc(obj(l))}</p><div class="lesson-tags"><span>${esc(l.subject||w.name)}</span><span>${esc(l.difficulty||'Adaptive')}</span><span>${aa.length} verified activit${aa.length===1?'y':'ies'}</span></div></div><div class="mission-badge"><small>MISSION STATUS</small><b>${isDone?'✓':'LIVE'}</b><span>${isDone?'COMPLETED':'IN PROGRESS'}</span></div></div><div class="lesson-layout"><article class="lesson-content"><section><label>01 // LEARNING OBJECTIVE</label><h2>${esc(l.learningObjective||obj(l))}</h2></section><section><label>02 // CORE EXPLANATION</label><p>${esc(core)}</p></section><section class="glass-card worked-card"><label>03 // WORKED THINKING</label><div class="idea"><span>✦</span><p>${esc(worked)}</p></div></section><section><label>04 // VERIFIED PRACTICE</label>${a?`<div class="assessment"><small>${esc((a.assessmentType||'practice').replaceAll('_',' ').toUpperCase())}</small><h3>${esc(typeof a.questionActivity==='string'?a.questionActivity:(a.questionActivity?.prompt||'Practice activity'))}</h3><details><summary class="secondary">Reveal verified guidance</summary><div class="answer"><span>✓</span><div><b>${esc(a.correctAnswer||'Verified answer available')}</b><p>${esc(a.explanation||'Review the lesson reasoning.')}</p></div></div></details><p class="count">${aa.length} canonical assessment record${aa.length===1?'':'s'} attached to this lesson.</p></div>`:'<div class="empty-assessment"><span>◇</span><p>No canonical assessment is attached to this lesson. KirthiVerse does not fabricate one.</p></div>'}</section><button class="primary complete" id="complete" ${isDone?'disabled':''}>${isDone?'Mission complete ✓':'Mark mission complete'}</button></article><aside><div class="glass-card mission-data"><small>MISSION TELEMETRY</small><dl><div><dt>Universe</dt><dd>${esc(w.name)}</dd></div><div><dt>Age band</dt><dd>${esc(l.ageBand||'Guide pending')}</dd></div><div><dt>Difficulty</dt><dd>${esc(l.difficulty||'Adaptive')}</dd></div><div><dt>Assessments</dt><dd>${aa.length}</dd></div><div><dt>Privacy</dt><dd>Local</dd></div></dl></div></aside></div></div>`;
  }

  function searchPage(){
    return `<div class="page"><div class="page-title"><span>KNOWLEDGE NAVIGATOR</span><h1>Search the learning universe</h1><p>Search across the canonical lesson corpus by subject, topic, age guide or learning objective.</p></div><div class="search-console"><div class="searchbox"><span>⌕</span><input id="q" autofocus autocomplete="off" placeholder="Search concepts, subjects, lessons…"><kbd>LIVE</kbd></div><div class="quick-search">${['Math','Science','Tamil','Coding','History','Life Skills'].map(x=>`<button data-query="${x}">${x}</button>`).join('')}</div></div><div id="results" class="results"></div></div>`;
  }

  function progressPage(){
    const s=state(),pct=Math.round((s.completed?.length||0)/Math.max(L.length,1)*100);
    const explored=(s.started||[]).length;
    return `<div class="page"><div class="page-title"><span>LOCAL LEARNING SIGNAL</span><h1>Your progress constellation</h1><p>This progress is stored in this browser only. No remote child profile is required.</p></div><section class="progress-hero"><div class="progress-ring" style="--p:${pct*3.6}deg"><b>${pct}%</b><small>COMPLETE</small></div><div class="progress-copy"><span>LEARNING SIGNAL</span><h2>${s.completed.length} missions completed</h2><p>${explored} lessons explored · ${Math.max(L.length-s.completed.length,0)} missions still available</p><div class="progress-bar"><i style="width:${pct}%"></i></div></div></section><div class="results">${(s.started||[]).slice().reverse().slice(0,30).map(id=>{const l=L.find(x=>x.id===id);return l?link('/lesson/'+id,`<div><small>${s.completed.includes(id)?'MISSION COMPLETE':'MISSION IN PROGRESS'}</small><h3>${esc(title(l))}</h3><p>${esc(l.subject||l.worldId)}</p></div><span>${s.completed.includes(id)?'✓':'↗'}</span>`):''}).join('')||'<div class="empty-state"><span>◇</span><h3>No local learning signal yet.</h3><p>Open a lesson mission to begin your progress constellation.</p></div>'}</div></div>`;
  }

  function render(){
    const path=location.pathname;
    const view=path==='/'?home():path==='/worlds'?worldsPage():path==='/search'?searchPage():path==='/progress'?progressPage():path.startsWith('/world/')?worldPage(decodeURIComponent(path.split('/')[2]||'')):path.startsWith('/lesson/')?lessonPage(decodeURIComponent(path.split('/')[2]||'')):home();
    document.getElementById('app').innerHTML=shell(view); bind(); window.scrollTo({top:0,behavior:'instant'});
  }

  function bind(){
    document.querySelectorAll('[data-link]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();history.pushState({},'',a.getAttribute('href'));render()}));
    document.querySelectorAll('[data-age]').forEach(b=>b.addEventListener('click',()=>{const s=state();s.agePath=b.dataset.age;save(s);history.pushState({},'','/worlds');render()}));
    const q=document.getElementById('q');
    const paint=()=>{if(!q)return;const term=q.value.trim().toLowerCase();const r=term?L.filter(l=>JSON.stringify(l).toLowerCase().includes(term)).slice(0,50):[];document.getElementById('results').innerHTML=r.length?r.map(l=>link('/lesson/'+l.id,`<div><small>${esc(l.subject||l.worldId)} · ${esc(l.ageBand||'age guide')}</small><h3>${esc(title(l))}</h3><p>${esc(obj(l))}</p></div><span>↗</span>`)).join(''):(term?'<div class="empty-state"><span>⌕</span><h3>No verified lesson match.</h3><p>Try another subject, concept or age guide.</p></div>':'');document.querySelectorAll('#results [data-link]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();history.pushState({},'',a.getAttribute('href'));render()}));};
    if(q)q.addEventListener('input',paint);
    document.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>{if(q){q.value=b.dataset.query;paint();q.focus();}}));
    const c=document.getElementById('complete'); if(c&&!c.disabled)c.addEventListener('click',()=>{const id=decodeURIComponent(location.pathname.split('/')[2]||'');const s=state();if(!s.completed.includes(id))s.completed.push(id);save(s);c.textContent='Mission complete ✓';c.disabled=true;});
  }

  addEventListener('popstate',render); render();
})();