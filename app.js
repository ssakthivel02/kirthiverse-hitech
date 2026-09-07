(()=>{
  const BUILD=window.KV_BUILD||'HITECH-2026-09-03-14';
  const CANDIDATE='MANUS-VISUAL-MASTER-05';
  let renderSeq=0,practiceTick=null;
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
  const practiceKey='kirthiverse.hitech.practice.v1';
  const confidenceKey='kirthiverse.hitech.confidence.v1';
  const masteryKey='kirthiverse.hitech.mastery.evidence.v1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  const title=l=>l?.title||l?.subtopic||l?.topic||'Learning mission';
  const obj=l=>l?.learningObjective||l?.description||l?.content||'Verified learning activity';
  const state=()=>{try{return JSON.parse(localStorage.getItem(key)||'{"started":[],"completed":[],"agePath":"all"}')}catch{return{started:[],completed:[],agePath:'all'}}};
  const save=s=>localStorage.setItem(key,JSON.stringify(s));
  const practiceState=()=>{try{const x=JSON.parse(localStorage.getItem(practiceKey)||'{"sessions":[],"lastMode":{"minutes":5,"calm":true},"active":null}');return{sessions:Array.isArray(x.sessions)?x.sessions:[],lastMode:x.lastMode||{minutes:5,calm:true},active:x.active||null}}catch{return{sessions:[],lastMode:{minutes:5,calm:true},active:null}}};
  const savePractice=s=>localStorage.setItem(practiceKey,JSON.stringify(s));
  const masteryState=()=>{try{const x=JSON.parse(localStorage.getItem(masteryKey)||'{"events":[],"lessons":{}}');return{events:Array.isArray(x.events)?x.events:[],lessons:x.lessons&&typeof x.lessons==='object'?x.lessons:{}}}catch{return{events:[],lessons:{}}}};
  const saveMastery=s=>localStorage.setItem(masteryKey,JSON.stringify(s));
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
  const assessmentPrompt=a=>typeof a?.questionActivity==='string'?a.questionActivity:(a?.questionActivity?.prompt||a?.prompt||'Verified practice activity');
  function recordPracticeEvidence(qa,result){
    if(!qa?.lessonId||!qa?.stableAssessmentId)return;
    const m=masteryState(),signal=result==='practice'?'revisit':'secure',now=Date.now(),prev=m.lessons[qa.lessonId]||{secure:0,revisit:0,assessmentIds:[]};
    prev[signal]=(prev[signal]||0)+1;prev.lastSignal=signal;prev.lastAt=now;prev.assessmentIds=[...new Set([...(prev.assessmentIds||[]),qa.stableAssessmentId])].slice(-12);
    m.lessons[qa.lessonId]=prev;
    m.events=[...m.events,{assessmentId:qa.stableAssessmentId,lessonId:qa.lessonId,signal,recordedAt:now,source:'practice-self-report'}].slice(-200);
    saveMastery(m);
    dispatchEvent(new CustomEvent('kv:mastery-evidence',{detail:{version:'v1',localOnly:true,lessonId:qa.lessonId,assessmentId:qa.stableAssessmentId,signal,source:'practice-self-report'}}));
  }

  function shell(content){
    return `<div class="app">
      <div class="ambient-grid"></div><div class="aurora a1"></div><div class="aurora a2"></div><div class="scanline"></div>
      <header class="topbar">
        ${link('/','<span class="brand-orb"><i>K</i></span><span><b>KirthiVerse</b><small>EDITORIAL LEARNING UNIVERSE</small></span>','brand')}
        <nav>${link('/','⌂ <span>Home</span>')}${link('/worlds','◫ <span>Universes</span>')}${link('/practice','✦ <span>Practice</span>')}${link('/search','⌕ <span>Search</span>')}${link('/progress','◌ <span>Progress</span>')}</nav>
        <div class="system-pill"><span class="pulse"></span><b>LEARNING CORE</b><small>ONLINE</small></div>
      </header>
      <main>${content}</main>
      <footer><span>KIRTHIVERSE // VISUAL MASTER</span><span>${L.length} lessons · ${A.length} assessments · ${worlds.length} universes · local-first</span></footer>
    </div>`;
  }

  function agePathCards(){
    const paths=[['3–6','EARLY EXPLORER','Playful foundations','spark'],['7–10','SKILL BUILDER','Core knowledge + confidence','orbit'],['11–13','DEEP THINKER','Reasoning + independent practice','vector'],['14–16','FUTURE READY','Advanced concepts + applied thinking','nova']];
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
          <div class="system-label"><span></span>KIRTHIVERSE · VISUAL MASTER</div>
          <h1>Enter the classroom<br><em>of the future.</em></h1>
          <p class="hero-lead">An immersive learning universe for ages 3–16 — eleven connected subject worlds, verified lessons, local progress and zero noisy social feeds.</p>
          <div class="actions">${next?link('/lesson/'+next.id,'Launch next mission <b>↗</b>','primary'):link('/worlds','Enter learning universes','primary')}${link('/practice','Practice with Kiki ✦','secondary')}</div>
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
      <section class="mission mission-v2"><div class="mission-index">KIKI<br><b>✦</b></div><div><span class="kicker">PRIVATE ADAPTIVE PRACTICE</span><h2>Kiki Practice Arena</h2><p>Choose a short mission, revisit verified questions and privately tell Kiki what feels secure or needs more practice.</p><small>Calm Mode · bilingual coaching · no public leaderboard · local-only</small></div>${link('/practice','Enter Practice Arena →','primary')}</section>
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
    return `<div class="page lesson">${link('/world/'+l.worldId,'← Back to '+esc(w.name),'back')}<div class="lesson-head lesson-head-v2"><div><span>MISSION // ${esc(l.ageBand||'AGE GUIDE')} // ${esc(w.lab)}</span><h1>${esc(title(l))}</h1><p>${esc(obj(l))}</p><div class="lesson-tags"><span>${esc(l.subject||w.name)}</span><span>${esc(l.difficulty||'Adaptive')}</span><span>${aa.length} verified activit${aa.length===1?'y':'ies'}</span></div></div><div class="mission-badge"><small>MISSION STATUS</small><b>${isDone?'✓':'LIVE'}</b><span>${isDone?'COMPLETED':'IN PROGRESS'}</span></div></div><div class="lesson-layout"><article class="lesson-content"><section><label>01 // LEARNING OBJECTIVE</label><h2>${esc(l.learningObjective||obj(l))}</h2></section><section><label>02 // CORE EXPLANATION</label><p>${esc(core)}</p></section><section class="glass-card worked-card"><label>03 // WORKED THINKING</label><div class="idea"><span>✦</span><p>${esc(worked)}</p></div></section><section><label>04 // VERIFIED PRACTICE</label>${a?`<div class="assessment"><small>${esc((a.assessmentType||'practice').replaceAll('_',' ').toUpperCase())}</small><h3>${esc(assessmentPrompt(a))}</h3><details><summary class="secondary">Reveal verified guidance</summary><div class="answer"><span>✓</span><div><b>${esc(a.correctAnswer||'Verified answer available')}</b><p>${esc(a.explanation||'Review the lesson reasoning.')}</p></div></div></details><p class="count">${aa.length} canonical assessment record${aa.length===1?'':'s'} attached to this lesson.</p></div>`:'<div class="empty-assessment"><span>◇</span><p>No canonical assessment is attached to this lesson. KirthiVerse does not fabricate one.</p></div>'}</section><button class="primary complete" id="complete" ${isDone?'disabled':''}>${isDone?'Mission complete ✓':'Mark mission complete'}</button></article><aside><div class="glass-card mission-data"><small>MISSION TELEMETRY</small><dl><div><dt>Universe</dt><dd>${esc(w.name)}</dd></div><div><dt>Age band</dt><dd>${esc(l.ageBand||'Guide pending')}</dd></div><div><dt>Difficulty</dt><dd>${esc(l.difficulty||'Adaptive')}</dd></div><div><dt>Assessments</dt><dd>${aa.length}</dd></div><div><dt>Privacy</dt><dd>Local</dd></div></dl></div></aside></div></div>`;
  }

  function searchPage(){
    return `<div class="page"><div class="page-title"><span>KNOWLEDGE NAVIGATOR</span><h1>Search the learning universe</h1><p>Search across the canonical lesson corpus by subject, topic, age guide or learning objective.</p></div><div class="search-console"><div class="searchbox"><span>⌕</span><input id="q" autofocus autocomplete="off" placeholder="Search concepts, subjects, lessons…"><kbd>LIVE</kbd></div><div class="quick-search">${['Math','Science','Tamil','Coding','History','Life Skills'].map(x=>`<button data-query="${x}">${x}</button>`).join('')}</div></div><div id="results" class="results"></div></div>`;
  }

function worldSignalMap(){
  const s=state(),me=masteryState(),started=new Set(s.started||[]),completed=new Set(s.completed||[]);
  return worlds.map(w=>{
    const ls=L.filter(l=>l.worldId===w.id),ids=new Set(ls.map(l=>l.id));
    let secure=0,revisit=0,evidenceLessons=0,lastAt=0;
    for(const [id,v] of Object.entries(me.lessons||{}))if(ids.has(id)){
      evidenceLessons++;secure+=v.secure||0;revisit+=v.revisit||0;lastAt=Math.max(lastAt,v.lastAt||0);
    }
    return {...w,total:ls.length,explored:ls.filter(l=>started.has(l.id)).length,completed:ls.filter(l=>completed.has(l.id)).length,evidenceLessons,secure,revisit,lastAt};
  });
}

function progressPage(){
  const s=state(),pct=Math.round((s.completed?.length||0)/Math.max(L.length,1)*100);
  const explored=(s.started||[]).length;
  const ps=practiceState(),last=ps.sessions.at(-1),me=masteryState(),evidence=Object.entries(me.lessons),secure=evidence.reduce((n,[,v])=>n+(v.secure||0),0),revisit=evidence.reduce((n,[,v])=>n+(v.revisit||0),0),revisitLesson=evidence.filter(([,v])=>(v.revisit||0)>(v.secure||0)).sort((a,b)=>(b[1].lastAt||0)-(a[1].lastAt||0))[0]?.[0],revisitItem=L.find(x=>x.id===revisitLesson);
  const worldSignals=worldSignalMap(),recommendedWorld=worldSignals.slice().sort((a,b)=>{
    const need=x=>(x.revisit-x.secure)*20+(x.explored-x.completed)*4+(x.total-x.explored)+(x.lastAt?1:0);
    return need(b)-need(a);
  })[0],recommendWhy=recommendedWorld?(recommendedWorld.revisit>recommendedWorld.secure?'more revisit signals than secure signals':recommendedWorld.explored>recommendedWorld.completed?'explored lessons are still in progress':'verified lessons remain unexplored'):'';
  const worldRows=worldSignals.map((w,i)=>{
    const strength=w.revisit>w.secure?'REVISIT SIGNAL':w.secure>0?'SECURE SIGNAL':w.explored>0?'IN PROGRESS':'READY TO EXPLORE';
    return link('/world/'+w.id,`<span class="world-num">${String(i+1).padStart(2,'0')}</span><span class="world-bigicon">${w.icon}</span><div><small>${strength} · ${w.evidenceLessons} lesson${w.evidenceLessons===1?'':'s'} with practice evidence</small><h2>${w.name}</h2><p>${w.explored}/${w.total} explored · ${w.completed} completed · ${w.secure} secure · ${w.revisit} revisit</p><div class="progress-bar"><i style="width:${Math.round(w.completed/Math.max(w.total,1)*100)}%"></i></div></div><div class="world-stats"><b>${w.completed}/${w.total}</b><small>COMPLETE</small></div><span class="arrow">↗</span>`,'world-row');
  }).join('');
  return `<div class="page"><div class="page-title"><span>LOCAL LEARNING SIGNAL</span><h1>Your progress constellation</h1><p>This progress is stored in this browser only. No remote child profile is required.</p></div><section class="progress-hero"><div class="progress-ring" style="--p:${pct*3.6}deg"><b>${pct}%</b><small>COMPLETE</small></div><div class="progress-copy"><span>LEARNING SIGNAL</span><h2>${s.completed.length} missions completed</h2><p>${explored} lessons explored · ${Math.max(L.length-s.completed.length,0)} missions still available</p><div class="progress-bar"><i style="width:${pct}%"></i></div></div></section><section class="mission mission-v2"><div class="mission-index">PRACTICE<br><b>${ps.sessions.length}</b></div><div><span class="kicker">KIKI PRACTICE ARENA // LOCAL ONLY</span><h2>${last?`${last.reviewed} checks in your last mission`:'Build confidence with a short verified practice mission'}</h2><p>${last?`${last.gotIt} felt secure · ${last.needsPractice} marked for more practice.`:'Kiki prioritises concepts you have marked “Need more practice”, then unfinished verified lessons.'}</p></div>${link('/practice',ps.active?'Resume practice →':'Start practice →','primary')}</section><section class="glass-card worked-card" data-mastery-evidence="v1"><label>CONFIDENCE EVIDENCE // SELF-REPORTED</label><h2>${evidence.length} lessons with practice evidence</h2><p>${secure} secure signal${secure===1?'':'s'} · ${revisit} revisit signal${revisit===1?'':'s'}. These are learner self-reports after viewing canonical guidance; they are not exam scores and do not create an automatic mastery claim.</p>${revisitItem?`<p><b>Suggested revisit:</b> ${esc(title(revisitItem))}</p>${link('/lesson/'+revisitItem.id,'Review this lesson →','text-link')}`:'<p>No revisit signal is currently stronger than the secure signal for a lesson.</p>'}</section><section class="section universe-section" data-world-constellation="v1"><div class="section-head"><div><span>MASTERY CONSTELLATION // 11 WORLDS</span><h2>See where your learning signals are forming.</h2></div><p>Explored and completed counts come from local lesson progress. Secure and revisit counts are self-reported Practice Arena signals — never automatic mastery scores.</p></div>${recommendedWorld?`<section class="mission mission-v2"><div class="mission-index">NEXT<br><b>${recommendedWorld.icon}</b></div><div><span class="kicker">EXPLAINABLE WORLD RECOMMENDATION</span><h2>${esc(recommendedWorld.name)}</h2><p>Kiki suggests this world because ${esc(recommendWhy)}. This is a transparent local recommendation, not a grade or ranking.</p><small>${recommendedWorld.explored}/${recommendedWorld.total} explored · ${recommendedWorld.completed} completed · ${recommendedWorld.secure} secure · ${recommendedWorld.revisit} revisit</small></div>${link('/world/'+recommendedWorld.id,'Open this world →','primary')}</section>`:''}<div class="world-list world-list-v2" data-world-signal-count="${worldSignals.length}">${worldRows}</div><p class="count">No public leaderboard · no comparison with other children · no cloud learner identity · local-only evidence.</p></section><div class="results">${(s.started||[]).slice().reverse().slice(0,30).map(id=>{const l=L.find(x=>x.id===id);return l?link('/lesson/'+id,`<div><small>${s.completed.includes(id)?'MISSION COMPLETE':'MISSION IN PROGRESS'}</small><h3>${esc(title(l))}</h3><p>${esc(l.subject||l.worldId)}</p></div><span>${s.completed.includes(id)?'✓':'↗'}</span>`):''}).join('')||'<div class="empty-state"><span>◇</span><h3>No local learning signal yet.</h3><p>Open a lesson mission to begin your progress constellation.</p></div>'}</div></div>`;
}

  function confidenceState(){try{return JSON.parse(localStorage.getItem(confidenceKey)||'{}')}catch{return{}}}
  function practicePool(){
    const conf=confidenceState(),done=completedSet(),valid=A.map((a,i)=>({a,i,l:L.find(x=>x.id===a.lessonId)})).filter(x=>x.l);
    return valid.sort((x,y)=>{const score=z=>(conf[z.l.id]?.value==='practice'?8:0)+(!done.has(z.l.id)?3:0)+(state().started.includes(z.l.id)?1:0);return score(y)-score(x)});
  }
  function startPractice(minutes,calm){
    const ps=practiceState(),pool=practicePool(),count=Math.min(pool.length,Math.max(4,minutes*2));
    const offset=pool.length?ps.sessions.length%pool.length:0,rotated=pool.slice(offset).concat(pool.slice(0,offset)).slice(0,count);
    ps.lastMode={minutes,calm}; ps.active={startedAt:Date.now(),lastResumeAt:Date.now(),elapsedMs:0,paused:false,minutes,calm,index:0,indexes:rotated.map(x=>x.i),reviewed:0,gotIt:0,needsPractice:0,lessonIds:[]}; savePractice(ps);
  }
  function elapsed(a){return (a.elapsedMs||0)+(a.paused||!a.lastResumeAt?0:Date.now()-a.lastResumeAt)}
  function finishPractice(endedEarly=false){
    const ps=practiceState(),a=ps.active;if(!a)return;
    const record={startedAt:a.startedAt,endedAt:Date.now(),minutes:a.minutes,calm:a.calm,elapsedMs:elapsed(a),reviewed:a.reviewed||0,gotIt:a.gotIt||0,needsPractice:a.needsPractice||0,lessonIds:[...new Set(a.lessonIds||[])],endedEarly};
    ps.sessions=[...(ps.sessions||[]),record].slice(-30);ps.active=null;savePractice(ps);
  }
  function practicePage(){
    const ps=practiceState(),a=ps.active;
    if(!a){const last=ps.sessions.at(-1);return `<div class="page"><div class="page-title"><span>KIKI PRACTICE ARENA // LOCAL ONLY</span><h1>Short missions. Real understanding.</h1><p>Kiki uses only canonical KirthiVerse assessments. Choose a gentle target, think first, reveal verified guidance, then privately mark what feels secure.</p></div><section class="progress-hero"><div class="progress-ring" style="--p:270deg"><b>✦</b><small>KIKI</small></div><div class="progress-copy"><span>SAFE PRACTICE</span><h2>No public leaderboard. No ads. No chat.</h2><p>Calm Mode removes the clock. Your session signal stays on this device.</p><div class="lesson-tags"><span>தமிழ் + English</span><span>Canonical questions</span><span>Private confidence evidence</span></div></div></section><section class="glass-card worked-card"><label>CHOOSE A PRACTICE TARGET</label><div class="actions"><button class="primary" data-practice-start="3">3 minutes</button><button class="primary" data-practice-start="5">5 minutes</button><button class="primary" data-practice-start="10">10 minutes</button></div><p><label><input type="checkbox" id="practice-calm" ${ps.lastMode?.calm!==false?'checked':''}> Calm Mode / அமைதியான பயிற்சி — hide time pressure</label></p><p>Kiki: “Try it yourself first. Then reveal the verified guidance. / முதலில் நீங்களே முயற்சி செய்யுங்கள்; பிறகு சரிபார்க்கப்பட்ட வழிகாட்டுதலைப் பாருங்கள்.”</p><p class="count">Your “Got it” and “Need more practice” choices are stored as private self-reported confidence evidence, not automatic correctness or mastery.</p>${last?`<p class="count">Last mission: ${last.reviewed} reviewed · ${last.gotIt} secure · ${last.needsPractice} revisit</p>`:''}</section></div>`;}
    const poolIndex=a.indexes?.[a.index],qa=Number.isInteger(poolIndex)?A[poolIndex]:null,l=qa?L.find(x=>x.id===qa.lessonId):null;
    if(!qa||!l){finishPractice();return practicePage()}
    const w=worldBy(l.worldId)||worlds[0],position=(a.index||0)+1,total=a.indexes.length;
    return `<div class="page lesson"><div class="page-title"><span>KIKI PRACTICE ARENA // ${a.calm?'CALM MODE':'FOCUS MODE'}</span><h1>${esc(title(l))}</h1><p>${esc(w.name)} · ${esc(l.ageBand||'Age guide')} · verified practice ${position}/${total}</p></div><section class="assessment"><small>${esc((qa.assessmentType||'practice').replaceAll('_',' ').toUpperCase())}</small><h2>${esc(assessmentPrompt(qa))}</h2><p>Kiki: Think first — there is no speed score here. / வேக மதிப்பெண் இல்லை; முதலில் சிந்தியுங்கள்.</p><details id="practice-answer"><summary class="secondary">Reveal verified guidance / வழிகாட்டுதலைக் காண்க</summary><div class="answer"><span>✓</span><div><b>${esc(qa.correctAnswer||'Verified answer available')}</b><p>${esc(qa.explanation||'Review the lesson reasoning.')}</p></div></div></details><div class="actions"><button class="primary" data-practice-result="gotit">Got it / புரிந்தது</button><button class="secondary" data-practice-result="practice">Need more practice / மேலும் பயிற்சி</button></div><p class="count" id="practice-status" role="status" aria-live="polite">${a.paused?'Paused / இடைநிறுத்தப்பட்டது':(a.calm?'Calm Mode — timer hidden':'Elapsed: 0:00')} · ${a.reviewed} reviewed</p><div class="actions"><button class="secondary" data-practice-pause>${a.paused?'Resume / தொடர்க':'Pause / இடைநிறுத்து'}</button><button class="secondary" data-practice-end>End mission / முடிக்க</button></div></section><section class="glass-card worked-card"><label>WHY THIS QUESTION?</label><p>${confidenceState()[l.id]?.value==='practice'?'You previously marked this lesson for more practice. / இந்தப் பாடத்திற்கு மேலும் பயிற்சி வேண்டும் என்று முன்பு குறித்துள்ளீர்கள்.':completedSet().has(l.id)?'This is a spaced confidence check from a completed lesson.':'This comes from an unfinished canonical lesson and can strengthen your next step.'}</p><p class="count">Your response is a private confidence signal, not an automatic mastery judgement.</p>${link('/lesson/'+l.id,'Open full lesson →','text-link')}</section></div>`;
  }

  function emitRendered(path){renderSeq++;window.dispatchEvent(new CustomEvent('kv:rendered',{detail:{reason:'app-render',sequence:renderSeq,path,candidate:CANDIDATE,source:'app'}}));}
  function render(){
    if(practiceTick){clearInterval(practiceTick);practiceTick=null}
    const path=location.pathname;
    const view=path==='/'?home():path==='/worlds'?worldsPage():path==='/practice'?practicePage():path==='/search'?searchPage():path==='/progress'?progressPage():path.startsWith('/world/')?worldPage(decodeURIComponent(path.split('/')[2]||'')):path.startsWith('/lesson/')?lessonPage(decodeURIComponent(path.split('/')[2]||'')):home();
    document.getElementById('app').innerHTML=shell(view);bind();window.scrollTo({top:0,behavior:'instant'});emitRendered(path);
  }

  function bind(){
    const q=document.getElementById('q');
    const paint=()=>{if(!q)return;const term=q.value.trim().toLowerCase();const r=term?L.filter(l=>JSON.stringify(l).toLowerCase().includes(term)).slice(0,50):[];document.getElementById('results').innerHTML=r.length?r.map(l=>link('/lesson/'+l.id,`<div><small>${esc(l.subject||l.worldId)} · ${esc(l.ageBand||'age guide')}</small><h3>${esc(title(l))}</h3><p>${esc(obj(l))}</p></div><span>↗</span>`)).join(''):(term?'<div class="empty-state"><span>⌕</span><h3>No verified lesson match.</h3><p>Try another subject, concept or age guide.</p></div>':'');};
    if(q)q.addEventListener('input',paint);
    document.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>{if(q){q.value=b.dataset.query;paint();q.focus();}}));
    const c=document.getElementById('complete');if(c&&!c.disabled)c.addEventListener('click',()=>{const id=decodeURIComponent(location.pathname.split('/')[2]||'');const s=state();if(!s.completed.includes(id))s.completed.push(id);save(s);c.textContent='Mission complete ✓';c.disabled=true;});
    document.querySelectorAll('[data-practice-start]').forEach(b=>b.addEventListener('click',()=>{startPractice(Number(b.dataset.practiceStart)||5,!!document.getElementById('practice-calm')?.checked);render();}));
    document.querySelector('[data-practice-pause]')?.addEventListener('click',()=>{const ps=practiceState(),a=ps.active;if(!a)return;if(a.paused){a.paused=false;a.lastResumeAt=Date.now()}else{a.elapsedMs=elapsed(a);a.paused=true;a.lastResumeAt=null}savePractice(ps);render();});
    document.querySelector('[data-practice-end]')?.addEventListener('click',()=>{finishPractice(true);render();});
    document.querySelectorAll('[data-practice-result]').forEach(b=>b.addEventListener('click',()=>{const ps=practiceState(),a=ps.active;if(!a||a.paused)return;const ai=a.indexes?.[a.index],qa=Number.isInteger(ai)?A[ai]:null;if(!qa)return;a.reviewed=(a.reviewed||0)+1;a.lessonIds=[...(a.lessonIds||[]),qa.lessonId];const cs=confidenceState();recordPracticeEvidence(qa,b.dataset.practiceResult);if(b.dataset.practiceResult==='practice'){a.needsPractice=(a.needsPractice||0)+1;cs[qa.lessonId]={...(cs[qa.lessonId]||{}),value:'practice',updatedAt:Date.now()};localStorage.setItem(confidenceKey,JSON.stringify(cs));}else{a.gotIt=(a.gotIt||0)+1;}a.index=(a.index||0)+1;savePractice(ps);if(a.index>=a.indexes.length)finishPractice(false);render();}));
    const ps=practiceState(),a=ps.active,status=document.getElementById('practice-status');if(a&&status&&!a.calm&&!a.paused){const tick=()=>{const ms=elapsed(a),sec=Math.floor(ms/1000),goal=a.minutes*60;status.textContent=`Elapsed: ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} · ${a.reviewed} reviewed${sec>=goal?' · Target reached — finish when ready':''}`};tick();practiceTick=setInterval(tick,1000);}
  }

  window.KV_APP_RUNTIME={candidate:CANDIDATE,version:'v24',navigation:'central-delegated',renderLifecycle:'authoritative-app-render',legacyPerLinkHandlers:false,legacyAgeHandlers:false,practiceArena:'v1-local-only',masteryEvidence:'v1-self-reported'};
  window.KV_MASTERY_EVIDENCE={candidate:CANDIDATE,version:'v1',localOnly:true,storageKey:masteryKey,source:'practice-self-report',automaticCorrectness:false,automaticMastery:false,maxEvents:200};
  addEventListener('popstate',render);render();
})();