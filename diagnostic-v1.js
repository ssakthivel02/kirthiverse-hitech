/* KirthiVerse Maths Diagnostic v1 — route /diagnostic
   Auto-graded, drawn only from the verified mathematics assessment corpus (no fabricated questions).
   Local-only. Establishes a starting-level signal: accuracy, per-topic strengths/weaknesses,
   response time, and a recommended next activity via the mastery engine. */
(()=>{
  const KEY='kirthiverse.hitech.diagnostic.v1';
  const L=window.KV_LESSONS||[];
  const A=window.KV_ASSESSMENTS||[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s??'').trim().toLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
  const lessonById=new Map(L.map(l=>[l.id,l]));

  function buildQuestionSet(){
    const lessonIsMaths=id=>{const l=lessonById.get(id);return l&&(l.worldId==='mathematics'||String(l.subject||'').toLowerCase().includes('math'))};
    const pool=A.filter(a=>a.lessonId&&lessonIsMaths(a.lessonId)&&a.questionActivity&&a.correctAnswer);
    const byTopic=new Map();
    for(const a of pool){
      const l=lessonById.get(a.lessonId);
      const topic=(l&&(l.topic||l.subtopic))||'general';
      if(!byTopic.has(topic))byTopic.set(topic,[]);
      byTopic.get(topic).push(a);
    }
    const topics=[...byTopic.keys()];
    const picked=[];
    for(const t of topics){
      const arr=byTopic.get(t);
      picked.push(arr[Math.floor(Math.random()*arr.length)]);
      if(picked.length>=10)break;
    }
    // top up to at least 6 questions if few topics exist
    if(picked.length<Math.min(6,pool.length)){
      for(const a of pool){ if(picked.length>=Math.min(10,pool.length))break; if(!picked.includes(a))picked.push(a); }
    }
    return picked.map(a=>({a,l:lessonById.get(a.lessonId),topic:(lessonById.get(a.lessonId)?.topic)||(lessonById.get(a.lessonId)?.subtopic)||'general'}));
  }

  let session=null; // {questions, index, answers:[], startedAt, qStartedAt}

  function start(){
    const questions=buildQuestionSet();
    session={questions,index:0,answers:[],startedAt:Date.now(),qStartedAt:Date.now()};
    render();
  }

  function submit(value){
    if(!session)return;
    const q=session.questions[session.index];
    const correct=norm(value)===norm(q.a.correctAnswer);
    session.answers.push({assessmentId:q.a.stableAssessmentId||q.a.id||q.a.assessmentId,lessonId:q.a.lessonId,topic:q.topic,correct,timeMs:Date.now()-session.qStartedAt,given:value});
    session.index++;
    session.qStartedAt=Date.now();
    if(session.index>=session.questions.length) finish(); else render();
  }

  function finish(){
    const answers=session.answers;
    const total=answers.length;
    const correct=answers.filter(a=>a.correct).length;
    const byTopic={};
    for(const a of answers){ byTopic[a.topic]=byTopic[a.topic]||{correct:0,total:0}; byTopic[a.topic].total++; if(a.correct)byTopic[a.topic].correct++; }
    const weakTopics=Object.entries(byTopic).filter(([,v])=>v.correct/v.total<0.6).map(([k])=>k);
    const strongTopics=Object.entries(byTopic).filter(([,v])=>v.correct/v.total>=0.8).map(([k])=>k);
    const avgResponseMs=Math.round(answers.reduce((s,a)=>s+a.timeMs,0)/Math.max(1,total));
    const record={completedAt:new Date().toISOString(),totalQuestions:total,correct,overallAccuracy:total?Math.round(correct/total*100):0,byTopic,weakTopics,strongTopics,avgResponseMs,answers};
    localStorage.setItem(KEY,JSON.stringify(record));
    session=null;
    render();
  }

  function loadResult(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}

  function questionView(){
    const q=session.questions[session.index];
    const pct=Math.round(session.index/session.questions.length*100);
    return `<section class="dg-session"><header><a href="/" data-link>← Home</a><div><b>${session.index+1}/${session.questions.length}</b><span>${pct}%</span></div></header>
      <div class="dg-progress"><i style="width:${pct}%"></i></div>
      <article><span class="dg-kicker">MATHS DIAGNOSTIC // ${esc(q.topic.toUpperCase())}</span><h1>${esc(typeof q.a.questionActivity==='string'?q.a.questionActivity:(q.a.questionActivity?.prompt||'Question'))}</h1>
      <p class="dg-note">Type your answer. Each question is asked once — this finds your starting point, it is not a test to pass or fail.</p>
      <form id="dg-form"><input id="dg-answer" aria-label="Your answer" autocomplete="off" autofocus placeholder="Your answer"><button class="primary" type="submit">Submit</button></form>
      </article></section>`;
  }

  function resultView(r){
    const rec=window.KV_MASTERY?.recommend?.();
    return `<div class="page dg-page"><div class="page-title"><span>DIAGNOSTIC RESULT // LOCAL ONLY</span><h1>Your starting-point signal</h1><p>Based on ${r.totalQuestions} verified mathematics question${r.totalQuestions===1?'':'s'}, answered on this device.</p></div>
      <section class="dg-summary"><article><b>${r.overallAccuracy}%</b><span>Overall accuracy</span></article><article><b>${r.correct}/${r.totalQuestions}</b><span>Correct</span></article><article><b>${Math.round(r.avgResponseMs/1000)}s</b><span>Avg. response time</span></article></section>
      <div class="dg-grid">
        <section class="glass-card"><h2>Strengths</h2>${r.strongTopics.length?`<ul>${r.strongTopics.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:'<p class="dg-note">No topic reached 80% yet — that is normal for a first diagnostic.</p>'}</section>
        <section class="glass-card"><h2>Needs practice</h2>${r.weakTopics.length?`<ul>${r.weakTopics.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:'<p class="dg-note">No weak topics detected in this diagnostic.</p>'}</section>
      </div>
      ${rec?`<section class="dg-next"><small>RECOMMENDED NEXT</small><h2>${esc(rec.lesson?window.KV_MASTERY.title(rec.lesson):'')}</h2><p>${esc(rec.reason)}</p><div class="dg-actions">${rec.lesson?`<a class="primary" data-link href="/lesson/${encodeURIComponent(rec.lesson.id)}">Start this lesson →</a>`:''}<a data-link href="/speedlab">Try Quick Skills →</a></div></section>`:''}
      <p class="dg-note">Retake any time — this signal updates only on this device.</p>
      <button class="primary" id="dg-retake">Retake diagnostic</button>
      </div>`;
  }

  function startView(){
    const usable=buildQuestionSet();
    if(!usable.length)return `<div class="page dg-page"><div class="page-title"><span>MATHS DIAGNOSTIC</span><h1>Diagnostic unavailable</h1><p>No verified mathematics assessment records are available. KirthiVerse will not fabricate diagnostic questions.</p></div></div>`;
    return `<div class="page dg-page"><div class="page-title"><span>MATHS DIAGNOSTIC // LOCAL-FIRST</span><h1>Let's find your starting point.</h1><p>${usable.length} short questions drawn from the verified KirthiVerse mathematics corpus. No pressure — this only helps pick what to learn next.</p></div><button class="primary" id="dg-start">Start diagnostic →</button></div>`;
  }

  function render(){
    if(location.pathname!=='/diagnostic')return;
    const main=document.querySelector('main'); if(!main)return;
    if(session){ main.innerHTML=`<div class="page dg-page">${questionView()}</div>`; bindQuestion(); return; }
    const result=loadResult();
    main.innerHTML=result?resultView(result):startView();
    document.getElementById('dg-start')?.addEventListener('click',start);
    document.getElementById('dg-retake')?.addEventListener('click',start);
  }
  function bindQuestion(){
    const form=document.getElementById('dg-form');
    form?.addEventListener('submit',e=>{e.preventDefault();const v=document.getElementById('dg-answer').value;submit(v)});
  }

  addEventListener('kv:rendered',render);
  render();
  window.KV_DIAGNOSTIC_RUNTIME={version:'v1',route:'/diagnostic',localOnly:true,storageKey:KEY,fabricatesQuestions:false};
})();
