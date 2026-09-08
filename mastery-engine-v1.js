/* KirthiVerse Mastery Engine v1 — local-only evidence rollup + deterministic recommendation.
   Adapted from the unmerged mastery-constellation prototype (feat/mastery-constellation-v1) and
   extended to read the P0 diagnostic, speed lab and in-lesson answer-check signals.
   No network calls. No fabricated evidence: a lesson with no local signal is "not-explored". */
(()=>{
  const L=window.KV_LESSONS||[];
  const A=window.KV_ASSESSMENTS||[];
  const PROGRESS_KEY='kirthiverse.hitech.static.progress.v2';
  const CONFIDENCE_KEY='kirthiverse.hitech.confidence.v1';
  const PRACTICE_KEY='kirthiverse.hitech.practice.v1';
  const LESSONCHECK_KEY='kirthiverse.hitech.lessoncheck.v1';
  const DIAGNOSTIC_KEY='kirthiverse.hitech.diagnostic.v1';
  const SPEEDLAB_KEY='kirthiverse.hitech.speedlab.v1';

  const WORLDS=[['mathematics','Mathematics','∑'],['science','Science','✦'],['english','English','Aa'],['tamil','Tamil','அ'],['coding-ai','Coding & AI','</>'],['geography','Geography','⌖'],['history','History','⌛'],['music-rhythm','Music & Rhythm','♫'],['art-design','Art & Design','◌'],['general-knowledge','General Knowledge','?'],['life-skills','Life Skills','＋']];

  const read=(k,f)=>{try{return Object.assign(structuredClone?structuredClone(f):JSON.parse(JSON.stringify(f)),JSON.parse(localStorage.getItem(k)||'{}'))}catch{return structuredClone?structuredClone(f):JSON.parse(JSON.stringify(f))}};

  function worldId(subject=''){
    const x=String(subject).toLowerCase();
    if(x.includes('math'))return'mathematics'; if(x.includes('sci'))return'science'; if(x.includes('engl'))return'english';
    if(x.includes('tamil')||x.includes('தமிழ்'))return'tamil'; if(x.includes('comput')||x.includes('cod')||x.includes('ai'))return'coding-ai';
    if(x.includes('geog'))return'geography'; if(x.includes('hist'))return'history'; if(x.includes('music'))return'music-rhythm';
    if(x.includes('art')||x.includes('design'))return'art-design'; if(x.includes('life'))return'life-skills';
    return'general-knowledge';
  }
  L.forEach(l=>{l.worldId=l.worldId||worldId(l.subject)});
  const title=l=>l?.title||l?.subtopic||l?.topic||'Learning mission';
  const assessmentsFor=id=>A.filter(a=>a.lessonId===id);
  const uid=(a,i)=>a.stableAssessmentId||a.id||a.assessmentId||`${a.lessonId}:${i}`;

  function state(){
    const progress=read(PROGRESS_KEY,{started:[],completed:[],agePath:'all'});
    const confidence=read(CONFIDENCE_KEY,{});
    const practice=read(PRACTICE_KEY,{retryIds:[],history:[]});
    const lessonCheck=read(LESSONCHECK_KEY,{});
    const diagnostic=read(DIAGNOSTIC_KEY,null);
    const speedlab=read(SPEEDLAB_KEY,{history:[],levelBySkill:{},bestByKey:{}});
    return {progress,confidence,practice,lessonCheck,diagnostic,speedlab};
  }

  function evidence(){
    const {progress,confidence,practice,lessonCheck}=state();
    const started=new Set(progress.started||[]),completed=new Set(progress.completed||[]);
    const retryIds=new Set(practice.retryIds||[]);
    const assessmentById=new Map(A.map((a,i)=>[uid(a,i),a]));
    const retryLessons=new Set([...retryIds].map(id=>assessmentById.get(id)?.lessonId).filter(Boolean));
    const positiveByLesson={};
    for(const h of practice.history||[]) if(h?.result==='got-it'&&h.lessonId) positiveByLesson[h.lessonId]=(positiveByLesson[h.lessonId]||0)+1;

    return L.map(l=>{
      const id=l.id;
      const conf=confidence[id]?.value||'';
      const check=lessonCheck[id]||null;
      const retry=retryLessons.has(id);
      const positive=positiveByLesson[id]||0;
      let out;
      if(retry||conf==='practice'||(check&&!check.correct&&check.attempts>=2)){
        out={state:'practising',label:'Practising',why:retry?'Retry evidence exists for this lesson.':(check&&!check.correct?'Your last checked answer for this lesson needed another attempt.':'Your latest confidence signal says more practice.')};
      } else if((completed.has(id)&&conf==='confident')||(check&&check.correct)||(positive>=2&&!retry)){
        out={state:'secure',label:'Secure signal',why:check&&check.correct?'You checked an answer for this lesson and got it right.':(completed.has(id)&&conf==='confident'?'You completed this lesson and marked your confidence as confident.':'You have repeated positive practice evidence with no active retry.')};
      } else if(completed.has(id)||conf==='getting'){
        out={state:'developing',label:'Developing',why:completed.has(id)?'You marked this lesson complete.':'Your latest confidence signal says you are getting it.'};
      } else if(started.has(id)){
        out={state:'exploring',label:'Exploring',why:'You started this lesson but have not marked it complete.'};
      } else {
        out={state:'not-explored',label:'Not explored',why:'No local learning evidence exists for this lesson yet.'};
      }
      return {lesson:l,...out};
    });
  }

  function counts(rows){const out={'not-explored':0,exploring:0,practising:0,developing:0,secure:0};rows.forEach(r=>out[r.state]++);return out}

  function summary(){
    const rows=evidence();
    const byWorld=WORLDS.map(w=>{
      const rows_w=rows.filter(r=>r.lesson.worldId===w[0]);
      return {id:w[0],name:w[1],icon:w[2],total:rows_w.length,counts:counts(rows_w)};
    });
    return {total:rows.length,counts:counts(rows),byWorld,rows};
  }

  /* Deterministic recommendation: diagnostic weak topics > speed lab weak ops > mastery gap, mathematics-first for the P0 flow. */
  function recommend(){
    const {diagnostic,speedlab,progress}=state();
    const completed=new Set(progress.completed||[]);
    const mathsLessons=L.filter(l=>l.worldId==='mathematics');

    if(diagnostic&&Array.isArray(diagnostic.weakTopics)&&diagnostic.weakTopics.length){
      for(const topic of diagnostic.weakTopics){
        const candidate=mathsLessons.find(l=>!completed.has(l.id)&&String(l.topic||'').toLowerCase()===String(topic).toLowerCase());
        if(candidate)return {lesson:candidate,reason:`Your diagnostic showed this topic (${topic}) needs more practice.`};
      }
    }
    if(speedlab&&Array.isArray(speedlab.weakOps)&&speedlab.weakOps.length){
      const opWords={addition:['add'],subtraction:['subtract','minus'],multiplication:['multiply','times','product'],division:['divide','division']};
      for(const op of speedlab.weakOps){
        const words=opWords[op]||[op];
        const candidate=mathsLessons.find(l=>!completed.has(l.id)&&words.some(w=>String(l.topic||'').toLowerCase().includes(w)||String(l.subtopic||'').toLowerCase().includes(w)));
        if(candidate)return {lesson:candidate,reason:`Quick Skills shows ${op} fluency needs more reps.`};
      }
    }
    const rows=evidence().filter(r=>r.lesson.worldId==='mathematics');
    const order=['practising','exploring','developing','not-explored'];
    for(const s of order){
      const hit=rows.find(r=>r.state===s);
      if(hit)return {lesson:hit.lesson,reason:hit.why};
    }
    const fallback=mathsLessons[0]||L[0];
    return fallback?{lesson:fallback,reason:'A good place to begin your maths learning loop.'}:null;
  }

  window.KV_MASTERY={version:'v1',localOnly:true,worlds:WORLDS,evidence,summary,recommend,state,title,assessmentsFor,worldId};
})();
