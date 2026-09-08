/* KirthiVerse Lesson Answer Check v1 — injected on /lesson/:id, same DOM-injection technique
   already used by visual-controller-v27.js for the lesson confidence widget. Adds a real
   auto-graded "Check my answer" step before the existing reveal-guidance details, and hides
   hint/worked-guidance until either the parent's assistance toggle allows it or the learner
   has made an attempt. Feeds the mastery engine via kirthiverse.hitech.lessoncheck.v1. */
(()=>{
  const KEY='kirthiverse.hitech.lessoncheck.v1';
  const A=window.KV_ASSESSMENTS||[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s??'').trim().toLowerCase().replace(/[^\p{L}\p{N}.\-]/gu,'');
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
  const write=v=>localStorage.setItem(KEY,JSON.stringify(v));
  const assistanceEnabled=()=>window.KV_ASSISTANCE_ENABLED?window.KV_ASSISTANCE_ENABLED():true;

  function inject(){
    if(!location.pathname.startsWith('/lesson/'))return;
    const article=document.querySelector('.lesson-content'); if(!article)return;
    const assessmentBlock=article.querySelector('.assessment'); if(!assessmentBlock)return; // no canonical assessment on this lesson
    if(assessmentBlock.dataset.checkInjected)return;
    assessmentBlock.dataset.checkInjected='1';

    const id=decodeURIComponent(location.pathname.split('/')[2]||'');
    const a=A.find(x=>x.lessonId===id); if(!a||!a.correctAnswer)return;
    const store=read();
    const rec=store[id]||{attempts:0,correct:false};

    const details=assessmentBlock.querySelector('details');
    if(details&&!assistanceEnabled()&&rec.attempts===0) details.style.display='none';

    const box=document.createElement('div');
    box.className='lc-box';
    box.innerHTML=`<label>CHECK YOUR ANSWER</label><form id="lc-form"><input id="lc-answer" aria-label="Your answer" autocomplete="off" placeholder="Type your answer"><button class="primary" type="submit">Check</button></form><p id="lc-status" role="status" aria-live="polite">${rec.attempts?(rec.correct?'You checked this and got it right ✓':`You've made ${rec.attempts} attempt${rec.attempts===1?'':'s'} — keep going or reveal guidance below.`):'One attempt is saved as a private signal; try before revealing guidance.'}</p>`;
    assessmentBlock.insertBefore(box,details||null);

    box.querySelector('#lc-form').addEventListener('submit',e=>{
      e.preventDefault();
      const val=document.getElementById('lc-answer').value;
      const correct=norm(val)===norm(a.correctAnswer);
      const cur=read();
      const prev=cur[id]||{attempts:0,correct:false};
      const next={assessmentId:a.stableAssessmentId||a.id||a.assessmentId,attempts:prev.attempts+1,correct:correct||prev.correct,lastAnswer:val,at:new Date().toISOString()};
      cur[id]=next; write(cur);
      const status=document.getElementById('lc-status');
      status.textContent=correct?'Correct ✓ — nice work.':(next.attempts>=2?'Not quite — here is the verified guidance below.':'Not quite — try once more, or open the guidance below.');
      if(details&&(correct||next.attempts>=2||assistanceEnabled())) details.style.display='';
      dispatchEvent(new CustomEvent('kv:lessoncheck',{detail:{lessonId:id,correct,attempts:next.attempts}}));
    });
  }

  addEventListener('kv:rendered',()=>setTimeout(inject,0));
  addEventListener('kv:assistance',()=>{const d=document.querySelector('.lesson-content .assessment details');if(d&&assistanceEnabled())d.style.display='';});
  window.KV_LESSON_CHECK_RUNTIME={version:'v1',route:'/lesson/:id',localOnly:true,storageKey:KEY};
})();
