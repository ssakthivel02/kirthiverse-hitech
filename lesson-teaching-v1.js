/* KirthiVerse lesson teaching panel v1.
   Renders the already-authored per-lesson kikiTeaching + remediation data (163 lessons, Classes 6-7) on the lesson page,
   which previously never displayed it. Loaded only on /lesson/:id routes by learning-foundation-v19.js; never on the
   release-closure audit URL. All text is set with textContent (no innerHTML). Learner-facing items are native <details>,
   so they work with keyboard and screen readers; parent/teacher guidance (remediation) is in its own collapsed section. */
(()=>{
  if(window.KV_LESSON_TEACHING)return;
  const audit=()=>/[?&]release-closure=/.test(location.search);
  const ROUTE=/^\/lesson\/([^/]+)$/;
  const T={
    title:['Kiki’s guide for this lesson','இந்தப் பாடத்திற்கான கிகியின் வழிகாட்டி'],
    before:['Before you start','தொடங்குவதற்கு முன்'],
    picture:['Picture it','மனதில் படமாகப் பார்'],
    watch:['Watch out for this','இதில் கவனம்'],
    recap:['In one line','ஒரே வரியில்'],
    adult:['For a parent or teacher','பெற்றோர் அல்லது ஆசிரியருக்கு'],
    watchFor:['Look for','கவனிக்க'],
    try:['Try this','இதை முயற்சிக்கவும்'],
    done:['You will know they have got it when','புரிந்துவிட்டது என்பதற்கான அடையாளம்'],
    activity:['Activity to do together','சேர்ந்து செய்ய ஒரு செயல்'],
    safety:['Safety','பாதுகாப்பு'],
    review:['Content review','உள்ளடக்க மதிப்பாய்வு']
  };
  const showTamil=()=>{try{const p=JSON.parse(localStorage.getItem('kirthiverse.hitech.profile.local.v2')||'{}');return /tamil/i.test(String(p.language||'English + Tamil'))}catch{return true}};
  const str=v=>typeof v==='string'&&v.trim()?v.trim():'';
  function el(tag,attrs,text){const e=document.createElement(tag);for(const k in(attrs||{}))e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;return e}
  function label(key,tag,attrs){const e=el(tag,attrs,T[key][0]);if(showTamil()){const ta=el('span',{lang:'ta','class':'kv-teach-ta'},' · '+T[key][1]);e.appendChild(ta)}return e}
  function item(key,text){if(!text)return null;const d=el('details');d.appendChild(label(key,'summary'));d.appendChild(el('p',{},text));return d}
  function adultLine(key,text){if(!text)return null;const p=el('p');const b=label(key,'b');p.appendChild(b);p.appendChild(el('span',{},' '+text));return p}
  function build(lesson){
    if(!lesson||typeof lesson!=='object')return null;
    const k=lesson.kikiTeaching&&typeof lesson.kikiTeaching==='object'?lesson.kikiTeaching:null;
    const r=lesson.remediation&&typeof lesson.remediation==='object'?lesson.remediation:null;
    if(!k&&!r)return null;
    const sec=el('section',{'class':'kv-teach','data-kiki-teaching':'v1','aria-labelledby':'kv-teach-h'});
    sec.appendChild(el('label',{},'KIKI // GUIDE'));
    const h=label('title','h2',{id:'kv-teach-h'});sec.appendChild(h);
    /* Lessons whose shelf renders its own safety note (Future Doctor) are skipped here to avoid a duplicate notice. */
    const ownSafety=/^science\.futuredoctor\./.test(String(lesson.id||''));
    const safety=str(lesson.safetyNote);
    if(safety&&!ownSafety){const a=el('aside',{role:'note','data-kv-safety':''});a.appendChild(label('safety','b'));a.appendChild(el('p',{},safety));sec.appendChild(a)}
    const review=str(lesson.reviewStatus);
    if(review&&!ownSafety){const p=el('p',{'class':'kv-teach-review','data-kv-review':''});p.appendChild(label('review','b'));p.appendChild(el('span',{},': '+review));sec.appendChild(p)}
    if(k){
      const intro=str(k.intro);if(intro)sec.appendChild(el('p',{'class':'kv-teach-intro'},intro));
      for(const [key,field] of [['before','priorKnowledge'],['picture','visualIdea'],['watch','misconceptionCheck'],['recap','recap']]){const d=item(key,str(k[field]));if(d)sec.appendChild(d)}
    }
    const parent=k?str(k.parentPrompt):'',trigger=r?str(r.trigger):'',strategy=r?str(r.strategy):'',mastery=r?str(r.masteryEvidence):'';
    if(parent||trigger||strategy||mastery){
      const d=el('details',{'class':'kv-teach-adult'});d.appendChild(label('adult','summary'));
      for(const l of [adultLine('activity',parent),adultLine('watchFor',trigger),adultLine('try',strategy),adultLine('done',mastery)])if(l)d.appendChild(l);
      sec.appendChild(d)
    }
    return sec.children.length>2?sec:null
  }
  function ensureStyle(){
    if(document.querySelector('style[data-kv-teach-style]'))return;
    const st=el('style',{'data-kv-teach-style':''});
    st.textContent='.kv-teach{margin:0}.kv-teach>label{display:block;color:var(--vm-blue,#426C78)}.kv-teach h2{margin:4px 0 12px}.kv-teach-ta{font-weight:400}.lesson-content>.kv-teach>p.kv-teach-intro{margin:0 0 12px;color:var(--vm-ink-soft,#50605B);line-height:1.55}.kv-teach details{margin:8px 0;border:1px solid #b9c9c9;border-radius:12px;background:#fff;color:var(--vm-ink,#1F2A2B)}.kv-teach summary{cursor:pointer;padding:12px 14px;min-height:24px;font-weight:600;border-radius:12px}.kv-teach summary:focus-visible{outline:3px solid #1d4f5f;outline-offset:2px}.kv-teach details>p,.kv-teach details>div{margin:0;padding:0 14px 12px;line-height:1.55}.kv-teach-adult p{margin:0 0 10px;padding:0 14px}.kv-teach-adult p:last-child{padding-bottom:12px}.kv-teach-adult p b{display:block}.kv-teach aside{margin:0 0 12px;padding:12px 14px;border:2px solid #7a4b00;border-radius:12px;background:#fff4d6;color:#2b1b00}.kv-teach aside p{margin:6px 0 0}.lesson-content>.kv-teach>p.kv-teach-review{margin:0 0 12px;color:var(--vm-ink-soft,#50605B)}';
    document.head.appendChild(st)
  }
  function inject(){
    if(audit())return;
    let id;try{const m=ROUTE.exec(decodeURIComponent(location.pathname));id=m&&m[1]}catch{return}
    if(!id)return;
    const host=document.querySelector('.lesson-content');if(!host||host.querySelector('[data-kiki-teaching]'))return;
    const lesson=(window.KV_LESSONS||[]).find(x=>x.id===id);const sec=build(lesson);if(!sec)return;
    ensureStyle();
    const anchor=host.querySelector('.worked-card');
    if(anchor)anchor.after(sec);else host.insertBefore(sec,host.querySelector('#complete'))
  }
  addEventListener('kv:rendered',()=>setTimeout(inject,0));addEventListener('popstate',()=>setTimeout(inject,50));
  window.KV_LESSON_TEACHING={version:'v1',build,inject};
  inject();
})();