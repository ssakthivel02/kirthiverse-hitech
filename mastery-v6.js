(()=>{
  const BUILD='HITECH-2026-09-03-06';
  const L=window.KV_LESSONS||[];
  const A=window.KV_ASSESSMENTS||[];
  const progressKey='kirthiverse.hitech.static.progress.v2';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=l=>l?.title||l?.subtopic||l?.topic||'Learning mission';
  const readState=()=>{try{return JSON.parse(localStorage.getItem(progressKey)||'{"started":[],"completed":[],"agePath":"all"}')}catch{return{started:[],completed:[],agePath:'all'}}};
  function worldId(subject=''){
    const x=String(subject).toLowerCase();
    if(x.includes('math'))return'mathematics'; if(x.includes('sci'))return'science'; if(x.includes('engl'))return'english'; if(x.includes('tamil')||x.includes('தமிழ்'))return'tamil'; if(x.includes('comput')||x.includes('cod')||x.includes('ai'))return'coding-ai'; if(x.includes('geog'))return'geography'; if(x.includes('hist'))return'history'; if(x.includes('music'))return'music-rhythm'; if(x.includes('art')||x.includes('design'))return'art-design'; if(x.includes('life'))return'life-skills'; return'general-knowledge';
  }
  const worlds=[['mathematics','Mathematics'],['science','Science'],['english','English'],['tamil','Tamil'],['coding-ai','Coding & AI'],['geography','Geography'],['history','History'],['music-rhythm','Music & Rhythm'],['art-design','Art & Design'],['general-knowledge','General Knowledge'],['life-skills','Life Skills']];
  L.forEach(l=>{if(!l.worldId)l.worldId=worldId(l.subject)});

  function mountLessonConsole(){
    if(!location.pathname.startsWith('/lesson/'))return;
    if(document.querySelector('[data-v6-lesson]'))return;
    const id=decodeURIComponent(location.pathname.split('/')[2]||'');
    const lesson=L.find(x=>String(x.id)===id); if(!lesson)return;
    const assessments=A.filter(a=>String(a.lessonId)===id);
    const host=document.querySelector('.lesson-content'); if(!host)return;
    const shell=document.createElement('section'); shell.className='mastery-shell'; shell.dataset.v6Lesson='true';
    shell.innerHTML=`<div class="mastery-head"><div><small>MISSION CONSOLE // BUILD ${BUILD}</small><h3>Learn → Think → Practice → Complete</h3></div><div class="mastery-status"><i></i>${assessments.length} canonical assessment${assessments.length===1?'':'s'} linked</div></div><div class="mission-sequence"><div class="mission-step active"><b>01</b><strong>Understand</strong><span>Read the canonical learning objective and core explanation.</span></div><div class="mission-step"><b>02</b><strong>Reason</strong><span>Work through the example and explain the logic.</span></div><div class="mission-step"><b>03</b><strong>Verify</strong><span>Use only the attached canonical assessment records.</span></div><div class="mission-step"><b>04</b><strong>Complete</strong><span>Mark the mission complete when the concept is secure.</span></div></div>`;
    host.prepend(shell);
    if(assessments.length)mountAssessmentConsole(host,assessments);
  }

  function promptOf(a){return typeof a.questionActivity==='string'?a.questionActivity:(a.questionActivity?.prompt||a.question||'Canonical practice activity')}
  function mountAssessmentConsole(host,arr){
    if(document.querySelector('[data-v6-assessment]'))return;
    const wrap=document.createElement('section'); wrap.className='assessment-console'; wrap.dataset.v6Assessment='true';
    let index=0;
    const render=()=>{
      const a=arr[index];
      const type=String(a.assessmentType||'practice').replaceAll('_',' ').toUpperCase();
      wrap.innerHTML=`<div class="assessment-console-head"><div><small>CANONICAL ASSESSMENT DECK</small><h3>Verified practice sequence</h3></div><div class="assessment-count"><b>${index+1}</b> / ${arr.length}</div></div><div class="assessment-stage"><div class="assessment-meta"><span>${esc(type)}</span><span>VERIFIED RECORD</span></div><h4>${esc(promptOf(a))}</h4><button class="assessment-reveal" type="button"><span>Reveal verified guidance</span><b>＋</b></button><div class="assessment-guidance"><b>${esc(a.correctAnswer||'Verified answer available')}</b><p>${esc(a.explanation||'Review the lesson reasoning and compare it with the verified answer.')}</p></div><div class="assessment-controls"><button class="assess-prev" ${index===0?'disabled':''}>← Previous</button><div class="assessment-dots">${arr.map((_,i)=>`<i class="${i===index?'on':''}"></i>`).join('')}</div><button class="assess-next" ${index===arr.length-1?'disabled':''}>Next →</button></div></div>`;
      wrap.querySelector('.assessment-reveal')?.addEventListener('click',()=>{const g=wrap.querySelector('.assessment-guidance');g?.classList.toggle('open');const b=wrap.querySelector('.assessment-reveal b');if(b)b.textContent=g?.classList.contains('open')?'−':'＋'});
      wrap.querySelector('.assess-prev')?.addEventListener('click',()=>{if(index>0){index--;render()}});
      wrap.querySelector('.assess-next')?.addEventListener('click',()=>{if(index<arr.length-1){index++;render()}});
    };
    render(); host.appendChild(wrap);
  }

  function mountProgressMastery(){
    if(location.pathname!='/progress')return;
    if(document.querySelector('[data-v6-mastery]'))return;
    const page=document.querySelector('.page'); if(!page)return;
    const st=readState(),done=new Set(st.completed||[]);
    const block=document.createElement('section'); block.className='universe-mastery'; block.dataset.v6Mastery='true';
    block.innerHTML=`<small>UNIVERSE MASTERY MATRIX</small><h2>Progress by learning universe</h2><div class="mastery-grid">${worlds.map(([id,name])=>{const lessons=L.filter(l=>l.worldId===id),complete=lessons.filter(l=>done.has(l.id)).length,pct=lessons.length?Math.round(complete/lessons.length*100):0;return `<article class="mastery-card"><div class="mastery-card-top"><h3>${esc(name)}</h3><b>${pct}%</b></div><div class="mastery-track"><i style="width:${pct}%"></i></div><p>${complete} of ${lessons.length} canonical lessons completed locally</p></article>`}).join('')}</div>`;
    page.appendChild(block);
  }

  function mountDeviceRail(){
    if(document.querySelector('[data-v6-device]'))return;
    if(!document.querySelector('.page'))return;
    const rail=document.createElement('div');rail.className='device-rail';rail.dataset.v6Device='true';rail.setAttribute('aria-label','Reading density controls');
    rail.innerHTML='<button data-density="focus">Focus view</button><button data-density="balanced" class="active">Balanced</button><button data-density="compact">Compact</button>';
    rail.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;document.body.dataset.density=b.dataset.density;rail.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));localStorage.setItem('kirthiverse.hitech.density',b.dataset.density)});
    document.querySelector('main')?.appendChild(rail);
    const saved=localStorage.getItem('kirthiverse.hitech.density');if(saved){document.body.dataset.density=saved;rail.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.density===saved))}
  }

  function applyDensity(){
    if(document.getElementById('kv-v6-density'))return;
    const style=document.createElement('style');style.id='kv-v6-density';style.textContent='body[data-density="focus"] .page{max-width:1050px}body[data-density="focus"] .lesson-layout{grid-template-columns:minmax(0,1fr)}body[data-density="focus"] .lesson-layout aside{display:none}body[data-density="compact"] .lesson-tile{padding:15px}body[data-density="compact"] .lesson-content>section{padding:18px 0}body[data-density="compact"] .world-row{padding-top:18px;padding-bottom:18px}';document.head.appendChild(style);
  }

  function mount(){applyDensity();mountLessonConsole();mountProgressMastery();mountDeviceRail()}
  addEventListener('kv:rendered',()=>requestAnimationFrame(mount));
  addEventListener('popstate',()=>setTimeout(mount,0));
  addEventListener('storage',e=>{if(e.key===progressKey)setTimeout(mount,0)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();