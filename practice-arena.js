(()=>{
  'use strict';
  const A=window.KV_ASSESSMENTS||[];
  const L=window.KV_LESSONS||[];
  const KEY='kirthiverse.hitech.practice.v1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lessonBy=id=>L.find(l=>l.id===id)||{};
  const title=l=>l.title||l.subtopic||l.topic||'Learning mission';
  const prompt=a=>typeof a.questionActivity==='string'?a.questionActivity:(a.questionActivity?.prompt||'Verified practice activity');
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
  const save=s=>localStorage.setItem(KEY,JSON.stringify(s));
  const state=Object.assign({history:[],retryIds:[],best:0,streak:0,lastDay:'',calm:true,minutes:5,index:0,queue:[],correct:0,attempted:0},load());

  function usable(){return A.filter(a=>a&&a.lessonId&&prompt(a)&&a.correctAnswer);}
  function uid(a,i){return a.id||a.assessmentId||`${a.lessonId}:${i}`;}
  function shuffled(xs){return xs.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);}
  function buildQueue(minutes){
    const pool=usable();
    const retry=new Set(state.retryIds||[]);
    const priority=pool.filter((a,i)=>retry.has(uid(a,i)));
    const fresh=pool.filter((a,i)=>!retry.has(uid(a,i)));
    const target=minutes===3?4:minutes===10?10:7;
    return [...shuffled(priority),...shuffled(fresh)].slice(0,Math.min(target,pool.length)).map((a,i)=>({id:uid(a,i),a}));
  }
  function start(minutes){
    state.minutes=minutes; state.index=0; state.correct=0; state.attempted=0; state.queue=buildQueue(minutes); save(state); render();
  }
  function record(result){
    const item=state.queue[state.index]; if(!item)return;
    state.attempted++;
    if(result==='got-it'){
      state.correct++;
      state.retryIds=(state.retryIds||[]).filter(id=>id!==item.id);
    }else if(!state.retryIds.includes(item.id)) state.retryIds.push(item.id);
    state.history.push({id:item.id,lessonId:item.a.lessonId,result,at:new Date().toISOString()});
    state.history=state.history.slice(-200);
    state.index++;
    if(state.index>=state.queue.length) finish(); else {save(state);render();}
  }
  function finish(){
    const score=state.attempted?Math.round(state.correct/state.attempted*100):0;
    state.best=Math.max(state.best||0,score);
    const today=new Date().toISOString().slice(0,10);
    if(state.lastDay!==today){state.streak=(state.streak||0)+1;state.lastDay=today;}
    save(state);
    document.getElementById('arena').innerHTML=`<section class="pa-finish"><span class="pa-kiki">KIKI // MISSION COMPLETE</span><h1>${score}% confidence signal</h1><p>You marked ${state.correct} of ${state.attempted} activities as understood. Items marked “Try again” stay in your private retry queue.</p><p lang="ta">மீண்டும் முயற்சி என்று குறித்தவை உங்கள் சாதனத்தில் மட்டும் சேமிக்கப்பட்டு அடுத்த பயிற்சியில் முன்னுரிமை பெறும்.</p><div class="pa-stats"><b>Best ${state.best}%</b><b>Private streak ${state.streak}</b><b>Retry queue ${state.retryIds.length}</b></div><div class="pa-actions"><button data-start="${state.minutes}">Practice again</button><a href="/">Return home</a></div></section>`;
    bind();
  }
  function render(){
    const root=document.getElementById('arena'); if(!root)return;
    if(!usable().length){root.innerHTML='<section class="pa-empty"><h1>Practice Arena</h1><p>No canonical assessment records are available. KirthiVerse will not fabricate practice content.</p><a href="/">Return home</a></section>';return;}
    if(!state.queue.length||state.index>=state.queue.length){
      root.innerHTML=`<section class="pa-hero"><span>KIKI PRACTICE ARENA // LOCAL-FIRST</span><h1>Short practice. Clear feedback. No pressure.</h1><p>Choose a mission length. Kiki prioritises items you previously marked for retry, then draws only from the verified KirthiVerse assessment corpus.</p><p lang="ta">குறுகிய பயிற்சி. தெளிவான பின்னூட்டம். அழுத்தமின்றி கற்றல்.</p><div class="pa-modes"><button data-start="3">3 min <small>Quick spark</small></button><button data-start="5">5 min <small>Core mission</small></button><button data-start="10">10 min <small>Deep practice</small></button></div><label class="pa-calm"><input id="calm" type="checkbox" ${state.calm?'checked':''}> Calm Mode <small>no countdown pressure</small></label><div class="pa-stats"><b>${usable().length} verified activities</b><b>${state.retryIds.length} retry signals</b><b>Local device only</b></div></section>`;
      bind(); return;
    }
    const item=state.queue[state.index], a=item.a, l=lessonBy(a.lessonId);
    const pct=Math.round(state.index/state.queue.length*100);
    root.innerHTML=`<section class="pa-session"><header><a href="/">← Home</a><div><b>${state.index+1}/${state.queue.length}</b><span>${pct}%</span></div></header><div class="pa-progress"><i style="width:${pct}%"></i></div><article><span class="pa-kiki">KIKI // THINK FIRST</span><small>${esc(l.subject||'KirthiVerse')} · ${esc(l.ageBand||'age-adaptive')}</small><h1>${esc(prompt(a))}</h1><p class="pa-coach">Try it in your own words before revealing the verified guidance.</p><p class="pa-coach" lang="ta">சரிபார்க்கப்பட்ட விடையைப் பார்க்கும் முன், உங்கள் சொந்த முறையில் முயற்சி செய்யுங்கள்.</p><details><summary>Reveal verified guidance</summary><div class="pa-answer"><b>${esc(a.correctAnswer)}</b><p>${esc(a.explanation||'Review the lesson reasoning and compare it with your attempt.')}</p></div></details><div class="pa-rate"><p>How did that feel?</p><button data-rate="retry">Try again</button><button data-rate="got-it">Got it ✓</button></div></article><footer><span>${esc(title(l))}</span><span>${state.calm?'Calm Mode · timer hidden':`${state.minutes}-minute mission`}</span></footer></section>`;
    bind();
  }
  function bind(){
    document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start(Number(b.dataset.start)));
    document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>record(b.dataset.rate));
    const calm=document.getElementById('calm'); if(calm)calm.onchange=()=>{state.calm=calm.checked;save(state)};
  }
  addEventListener('DOMContentLoaded',render);
})();