/* KirthiVerse Lesson Practice Progression v2 — local-only, question-scoped.
   Keeps legacy per-lesson progress fields for mastery/parent compatibility.
   Self-rated long-form work is never claimed to be machine-verified correct. */
(()=>{
  const KEY='kirthiverse.hitech.lessoncheck.v1';
  const norm=s=>String(s??'').trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
  const read=()=>{try{const o=JSON.parse(localStorage.getItem(KEY)||'{}');return o&&typeof o==='object'?o:{}}catch{return{}}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}};
  const assistanceEnabled=()=>window.KV_ASSISTANCE_ENABLED?window.KV_ASSISTANCE_ENABLED():true;
  const qid=(a,i)=>String(a.stableAssessmentId||a.id||a.assessmentId||('question-'+i));
  const question=a=>typeof a.questionActivity==='string'?a.questionActivity:String(a.questionActivity?.prompt||'');
  const openEnded=a=>/open.?ended|reflection|essay|project|discussion|creative|extended.?response/i.test(String(a.assessmentType||''))||String(a.correctAnswer||'').length>140;
  const optionText=s=>String(s||'').replace(/^\s*[A-Z][).:\-]\s*/i,'').trim();
  function matchesAnswer(a,raw){
    const answer=norm(a.correctAnswer),candidate=norm(raw);
    if(!answer||!candidate)return false;
    if(candidate===answer)return true;
    const opts=Array.isArray(a.options)?a.options:[];
    const index=opts.findIndex((o,i)=>norm(optionText(o))===answer||norm(o)===answer||((/^[a-d]$/i.test(String(a.correctAnswer||'').trim()))&&String(a.correctAnswer).trim().toLowerCase()===String.fromCharCode(97+i)));
    if(index<0)return false;
    return candidate===String.fromCharCode(97+index)||candidate===norm(opts[index])||candidate===norm(optionText(opts[index]));
  }
  function inject(){
    if(!/^\/lesson\/[^/]+/.test(location.pathname))return;
    const article=document.querySelector('.lesson-content');
    const block=article?.querySelector('.assessment');
    if(!block||block.dataset.checkInjected)return;
    const id=decodeURIComponent(location.pathname.split('/')[2]||'');
    const questions=(window.KV_ASSESSMENTS||[]).filter(a=>a.lessonId===id&&a.correctAnswer);
    if(!questions.length)return;
    block.dataset.checkInjected='1';
    const details=block.querySelector('details'),prompt=block.querySelector('h3'),type=block.querySelector('small'),count=block.querySelector('.count');
    let index=0;
    const box=document.createElement('div');box.className='lc-box';box.setAttribute('data-lesson-practice','v2');
    const title=document.createElement('label');title.textContent='CHECK YOUR ANSWER';box.appendChild(title);
    const progress=document.createElement('p');progress.setAttribute('aria-live','polite');box.appendChild(progress);
    const form=document.createElement('form');form.id='lc-form';
    const answer=document.createElement('input');answer.id='lc-answer';answer.setAttribute('aria-label','Your answer');answer.autocomplete='off';answer.placeholder='Type your answer';form.appendChild(answer);
    const submit=document.createElement('button');submit.type='submit';submit.className='primary';submit.textContent='Check';form.appendChild(submit);box.appendChild(form);
    const status=document.createElement('p');status.id='lc-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');box.appendChild(status);
    const self=document.createElement('div');self.hidden=true;
    const selfLabel=document.createElement('p');selfLabel.textContent='Compare your response with the model answer. This is self-reflection, not automatic grading.';self.appendChild(selfLabel);
    for(const [value,label] of [['understood','I understand'],['review','I need more practice']]){
      const button=document.createElement('button');button.type='button';button.textContent=label;
      button.addEventListener('click',()=>{const data=read(),old=data[id]||{},q=questions[index],key=qid(q,index),entries={...(old.questions||{})};entries[key]={...(entries[key]||{}),selfRating:value,verifiedCorrect:false};data[id]={...old,questions:entries,assessmentId:key,correct:!!old.correct};write(data);status.textContent='Reflection saved locally — not marked as a verified correct answer.';self.hidden=true;dispatchEvent(new CustomEvent('kv:lessoncheck',{detail:{lessonId:id,correct:false,selfRated:true,assessmentId:key}}));});
      self.appendChild(button);
    }
    box.appendChild(self);
    const nav=document.createElement('div');nav.className='lc-navigation';
    const previous=document.createElement('button');previous.type='button';previous.textContent='Previous';
    const next=document.createElement('button');next.type='button';next.textContent='Next';
    nav.append(previous,next);box.appendChild(nav);
    block.insertBefore(box,details||null);
    function render(){
      const q=questions[index],old=read()[id]||{},prior=(old.questions||{})[qid(q,index)]||{};
      if(prompt)prompt.textContent=question(q);
      if(type)type.textContent=String(q.assessmentType||'practice').replaceAll('_',' ').toUpperCase();
      if(count)count.textContent=String(questions.length)+' canonical assessment records attached to this lesson.';
      if(details){const b=details.querySelector('.answer b'),p=details.querySelector('.answer p');if(b)b.textContent=String(q.correctAnswer);if(p)p.textContent=String(q.explanation||'Review the lesson reasoning.');details.open=false;details.style.display=(assistanceEnabled()||prior.attempts>0)?'':'none';}
      progress.textContent='Question '+(index+1)+' of '+questions.length;
      answer.value='';answer.placeholder=Array.isArray(q.options)&&q.options.length?'Type an option letter or answer':'Type your answer';
      answer.setAttribute('aria-label','Answer to question '+(index+1));
      status.textContent=prior.attempts?(prior.verifiedCorrect?'Previously checked correct ✓':'Previous attempt saved; review or try again.'):'Answer this question to see feedback.';
      submit.textContent=openEnded(q)?'Compare answer':'Check';
      self.hidden=true;previous.disabled=index===0;next.disabled=index===questions.length-1;
    }
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const q=questions[index],val=answer.value.trim();if(!val){status.textContent='Please enter an answer first.';return;}
      const isOpen=openEnded(q),correct=!isOpen&&matchesAnswer(q,val);
      const data=read(),old=data[id]||{},key=qid(q,index),entries={...(old.questions||{})},prior=entries[key]||{};
      const attempts=(prior.attempts||0)+1;
      entries[key]={...prior,attempts,verifiedCorrect:correct||!!prior.verifiedCorrect,lastAnswer:val,at:new Date().toISOString()};
      data[id]={...old,questions:entries,assessmentId:key,attempts:(old.attempts||0)+1,correct:!!old.correct||correct,lastAnswer:val,at:new Date().toISOString()};
      write(data);
      if(isOpen){status.textContent='Model answer available below. Compare it with your response and self-rate.';self.hidden=false;}
      else status.textContent=correct?'Correct ✓ — nice work.':(attempts>=2?'Not quite — review the guidance below.':'Not quite — try again.');
      if(details&&(correct||isOpen||attempts>=2||assistanceEnabled()))details.style.display='';
      dispatchEvent(new CustomEvent('kv:lessoncheck',{detail:{lessonId:id,correct,attempts:data[id].attempts,assessmentId:key,mode:isOpen?'self-review':'auto-check'}}));
    });
    previous.addEventListener('click',()=>{if(index>0){index--;render()}});
    next.addEventListener('click',()=>{if(index<questions.length-1){index++;render()}});
    render();
  }
  addEventListener('kv:rendered',()=>setTimeout(inject,0));
  addEventListener('kv:assistance',()=>{const block=document.querySelector('.lesson-content .assessment');if(block){const d=block.querySelector('details');if(d&&assistanceEnabled())d.style.display='';}});
  window.KV_LESSON_CHECK_RUNTIME={version:'v2',route:'/lesson/:id',localOnly:true,storageKey:KEY,questionProgression:true};
})();

/* Class 7 Mathematics runtime bootstrap bridge.
   The generic loader is fetched only where Class 7 content can be requested. This preserves
   the global release/performance request budget while keeping Chapters 1+ data-driven. */
(()=>{
  const relevant=()=>/^\/lesson\/math\.cbse7\.ganita-prakash\.(?:p2)?ch\d+\./.test(location.pathname)||['/search','/practice','/practice-arena','/diagnostic'].includes(location.pathname)||new URLSearchParams(location.search).has('release-closure');
  function ensureRuntime(){
    if(!relevant()||window.KV_CLASS7_MATH_RUNTIME||document.querySelector('script[data-class7-math-runtime]'))return;
    const s=document.createElement('script');s.async=false;s.src='/class7-math-runtime-v1.js?v=CBSE7-MATH-RUNTIME-1';s.setAttribute('data-class7-math-runtime','script');document.body.appendChild(s);
  }
  ensureRuntime();addEventListener('popstate',ensureRuntime);addEventListener('kv:rendered',ensureRuntime);
})();

/* Class 7 Social Science runtime bootstrap bridge.
   Same request-budget rule as the Mathematics bridge: the loader is fetched only where Class 7 Social Science can be requested. */
(()=>{
  const relevant=()=>/^\/lesson\/social-science\.cbse7\.exploring-society\./.test(location.pathname)||['/search','/practice','/practice-arena','/diagnostic'].includes(location.pathname)||new URLSearchParams(location.search).has('release-closure');
  function ensureRuntime(){
    if(!relevant()||window.KV_CLASS7_SOCIAL_SCIENCE_RUNTIME||document.querySelector('script[data-class7-social-science-runtime]'))return;
    const s=document.createElement('script');s.async=false;s.src='/class7-social-science-runtime-v1.js?v=CBSE7-SOC-RUNTIME-2';s.setAttribute('data-class7-social-science-runtime','script');document.body.appendChild(s);
  }
  ensureRuntime();addEventListener('popstate',ensureRuntime);addEventListener('kv:rendered',ensureRuntime);
})();
