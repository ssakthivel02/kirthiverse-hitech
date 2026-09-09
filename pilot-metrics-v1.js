/* KirthiVerse Pilot Metrics v1 — local-only longitudinal evidence for controlled pilots.
   Starts measuring only after this runtime is installed. Existing localStorage evidence is baselined, not backfilled.
   Active learning time is conservative: only /lesson, /diagnostic and /speedlab while visible and recently interactive.
   This is NOT tamper-evident analytics, institutional reporting, cloud telemetry or production research evidence. */
(()=>{
  const KEY='kirthiverse.hitech.pilot.metrics.v1';
  const PARENT_UNLOCK_KEY='kirthiverse.hitech.parentgate.unlocked.v1';
  const DIAGNOSTIC_KEY='kirthiverse.hitech.diagnostic.v1';
  const SPEEDLAB_KEY='kirthiverse.hitech.speedlab.v1';
  const LESSONCHECK_KEY='kirthiverse.hitech.lessoncheck.v1';
  const HEARTBEAT_MS=15000, RECENT_ACTIVITY_MS=60000, MAX_EVENTS=1200, MAX_SYNC_KEYS=400;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone=x=>JSON.parse(JSON.stringify(x));
  const read=(k,f)=>{try{const raw=localStorage.getItem(k);return raw===null?clone(f):JSON.parse(raw)}catch{return clone(f)}};
  const nowIso=()=>new Date().toISOString();
  const dayKey=(value=Date.now())=>{const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const learnerRoute=path=>path.startsWith('/lesson/')||path==='/diagnostic'||path==='/speedlab';
  const parentUnlocked=()=>sessionStorage.getItem(PARENT_UNLOCK_KEY)==='1';

  function blank(){return {schema:'kirthiverse.hitech.pilot-metrics.v1',trackingStartedAt:nowIso(),baselineEstablishedAt:null,events:[],days:{},synced:{diagnosticCompletedAt:null,speedlabKeys:[],lessonCheckKeys:[]},masterySnapshots:{}}}
  function state(){const s=read(KEY,null)||blank();if(!Array.isArray(s.events))s.events=[];if(!s.days||typeof s.days!=='object')s.days={};if(!s.synced||typeof s.synced!=='object')s.synced={diagnosticCompletedAt:null,speedlabKeys:[],lessonCheckKeys:[]};if(!Array.isArray(s.synced.speedlabKeys))s.synced.speedlabKeys=[];if(!Array.isArray(s.synced.lessonCheckKeys))s.synced.lessonCheckKeys=[];if(!s.masterySnapshots||typeof s.masterySnapshots!=='object')s.masterySnapshots={};return s}
  function save(s){s.events=s.events.slice(-MAX_EVENTS);s.synced.speedlabKeys=s.synced.speedlabKeys.slice(-MAX_SYNC_KEYS);s.synced.lessonCheckKeys=s.synced.lessonCheckKeys.slice(-MAX_SYNC_KEYS);localStorage.setItem(KEY,JSON.stringify(s))}

  function currentSourceKeys(){
    const diagnostic=read(DIAGNOSTIC_KEY,null),speed=read(SPEEDLAB_KEY,{history:[]}),checks=read(LESSONCHECK_KEY,{});
    const speedlabKeys=(speed.history||[]).map(h=>`${h.at||''}|${h.skill||''}|${h.duration||''}|${h.correct||''}|${h.accuracy||''}`);
    const lessonCheckKeys=Object.entries(checks||{}).filter(([,v])=>v?.at).map(([lessonId,v])=>`${lessonId}|${v.at}|${v.correct?'1':'0'}|${v.attempts||''}`);
    return {diagnosticCompletedAt:diagnostic?.completedAt||null,speedlabKeys,lessonCheckKeys};
  }
  function establishBaseline(){const s=state();if(s.baselineEstablishedAt)return s;const src=currentSourceKeys();s.baselineEstablishedAt=nowIso();s.synced={...src};save(s);return s}

  function record(type,details={},at=nowIso()){
    const s=state();s.events.push({id:uid(),type,at,day:dayKey(at),details:clone(details)});save(s);return s.events[s.events.length-1];
  }
  function addActiveSeconds(seconds){
    if(!Number.isFinite(seconds)||seconds<=0)return;const s=state(),k=dayKey();const d=s.days[k]||{activeSeconds:0,heartbeatCount:0};d.activeSeconds=Math.max(0,Number(d.activeSeconds||0))+seconds;d.heartbeatCount=Math.max(0,Number(d.heartbeatCount||0))+1;s.days[k]=d;save(s);
  }

  function syncExternalEvidence(){
    const s=establishBaseline(),diagnostic=read(DIAGNOSTIC_KEY,null),speed=read(SPEEDLAB_KEY,{history:[]}),checks=read(LESSONCHECK_KEY,{});
    if(diagnostic?.completedAt&&diagnostic.completedAt!==s.synced.diagnosticCompletedAt){
      record('diagnostic_completed',{accuracy:Number(diagnostic.overallAccuracy)||0,totalQuestions:Number(diagnostic.totalQuestions)||0,correct:Number(diagnostic.correct)||0},diagnostic.completedAt);
      const n=state();n.synced.diagnosticCompletedAt=diagnostic.completedAt;save(n);
    }
    let n=state(),seen=new Set(n.synced.speedlabKeys);
    for(const h of speed.history||[]){const key=`${h.at||''}|${h.skill||''}|${h.duration||''}|${h.correct||''}|${h.accuracy||''}`;if(!h?.at||seen.has(key))continue;record('quick_skills_session',{skill:String(h.skill||''),durationSeconds:Number(h.duration)||0,correct:Number(h.correct)||0,accuracy:Number(h.accuracy)||0},h.at);seen.add(key)}
    n=state();n.synced.speedlabKeys=[...seen];save(n);
    n=state();seen=new Set(n.synced.lessonCheckKeys);
    for(const [lessonId,v] of Object.entries(checks||{})){if(!v?.at)continue;const key=`${lessonId}|${v.at}|${v.correct?'1':'0'}|${v.attempts||''}`;if(seen.has(key))continue;record('answer_check',{lessonId,correct:Boolean(v.correct),attempts:Number(v.attempts)||0},v.at);seen.add(key)}
    n=state();n.synced.lessonCheckKeys=[...seen];save(n);
  }

  function snapshotMastery(){
    const summary=window.KV_MASTERY?.summary?.();if(!summary?.counts)return;const k=dayKey(),s=state(),counts={secure:Number(summary.counts.secure)||0,developing:Number(summary.counts.developing)||0,practising:Number(summary.counts.practising)||0,exploring:Number(summary.counts.exploring)||0,notExplored:Number(summary.counts['not-explored'])||0},at=nowIso();
    if(!s.masterySnapshots[k])s.masterySnapshots[k]={first:{at,counts},latest:{at,counts}};else s.masterySnapshots[k].latest={at,counts};save(s);
  }

  function lastDays(count=7,now=Date.now()){const out=[];const d=new Date(now);d.setHours(12,0,0,0);for(let i=count-1;i>=0;i--){const x=new Date(d);x.setDate(d.getDate()-i);out.push(dayKey(x))}return out}
  function weeklySummary(now=Date.now()){
    const s=state(),days=lastDays(7,now),daySet=new Set(days),events=s.events.filter(e=>daySet.has(e.day)),activeSeconds=days.reduce((sum,k)=>sum+Number(s.days[k]?.activeSeconds||0),0),activeDays=days.filter(k=>Number(s.days[k]?.activeSeconds||0)>0).length;
    const byType=t=>events.filter(e=>e.type===t),uniqueLessonStarts=new Set(byType('lesson_started').map(e=>e.details.lessonId).filter(Boolean)).size,uniqueLessonCompletions=new Set(byType('lesson_completed').map(e=>e.details.lessonId).filter(Boolean)).size;
    const snaps=days.map(k=>s.masterySnapshots[k]).filter(Boolean),first=snaps[0]?.first?.counts||null,last=snaps.at(-1)?.latest?.counts||null;
    const trackingStart=new Date(s.trackingStartedAt).getTime(),elapsed=Math.max(0,now-trackingStart),observationDays=Math.min(7,Math.max(1,Math.ceil(elapsed/86400000))),completeWindow=elapsed>=7*86400000;
    return {schema:'kirthiverse.hitech.weekly-summary.v1',generatedAt:new Date(now).toISOString(),trackingStartedAt:s.trackingStartedAt,observationDays,completeSevenDayWindow:completeWindow,days,activeSeconds,activeMinutes:Number((activeSeconds/60).toFixed(1)),activeDays,lessonStarts:byType('lesson_started').length,uniqueLessonsStarted:uniqueLessonStarts,lessonCompletions:byType('lesson_completed').length,uniqueLessonsCompleted:uniqueLessonCompletions,quickSkillsSessions:byType('quick_skills_session').length,diagnosticCompletions:byType('diagnostic_completed').length,answerChecks:byType('answer_check').length,mastery:{first,last,secureDelta:first&&last?last.secure-first.secure:null,developingDelta:first&&last?last.developing-first.developing:null},daily:days.map(k=>({day:k,activeSeconds:Number(s.days[k]?.activeSeconds||0),activeMinutes:Number((Number(s.days[k]?.activeSeconds||0)/60).toFixed(1)),events:events.filter(e=>e.day===k).length})),evidenceBoundary:{localOnly:true,networkTelemetry:false,tamperEvident:false,backfilledHistory:false,productionResearchEvidence:false}};
  }

  function reportView(){
    if(!parentUnlocked())return `<div class="page pm-page"><div class="page-title"><span>WEEKLY REPORT // PARENT GATE</span><h1>Unlock Parent Space first</h1><p>The weekly pilot report is local-only and requires the grown-up session to be unlocked.</p></div><a class="primary" data-link href="/parent">Open Parent Space →</a></div>`;
    const w=weeklySummary(),windowNote=w.completeSevenDayWindow?'Full seven-day observation window.':`Early pilot window: ${w.observationDays} day${w.observationDays===1?'':'s'} observed so far; do not interpret this as seven-day retention.`;
    return `<div class="page pm-page"><div class="page-title"><span>PILOT METRICS // LOCAL ONLY</span><h1>Weekly learning report</h1><p>${esc(windowNote)}</p></div>
      <section class="pm-grid"><article class="glass-card"><small class="kicker">ACTIVE LEARNING</small><h2>${w.activeMinutes} min</h2><p>Visible + recently interactive time on lesson, diagnostic and Speed Lab routes only.</p></article><article class="glass-card"><small class="kicker">ACTIVE DAYS</small><h2>${w.activeDays}</h2><p>Days with measured active learning time.</p></article><article class="glass-card"><small class="kicker">LESSONS</small><h2>${w.uniqueLessonsCompleted}/${w.uniqueLessonsStarted}</h2><p>Unique completed / started since this metric runtime began.</p></article><article class="glass-card"><small class="kicker">QUICK SKILLS</small><h2>${w.quickSkillsSessions}</h2><p>New timed practice sessions recorded in this observation window.</p></article></section>
      <section class="pm-grid pm-grid-two"><article class="glass-card"><small class="kicker">LEARNING SIGNALS</small><ul><li>Diagnostic completions: <b>${w.diagnosticCompletions}</b></li><li>Answer checks: <b>${w.answerChecks}</b></li><li>Secure mastery movement: <b>${w.mastery.secureDelta===null?'—':(w.mastery.secureDelta>=0?'+':'')+w.mastery.secureDelta}</b></li></ul><p class="pm-note">Mastery movement is shown only when snapshots exist within this measurement period.</p></article><article class="glass-card"><small class="kicker">EVIDENCE BOUNDARY</small><p>Metrics stay in this browser. They are not cloud analytics and are not tamper-evident. No historical activity is backfilled. Use this for controlled pilot learning, not as audited research evidence.</p><button id="pm-export">Export weekly evidence JSON</button></article></section>
      <section class="glass-card"><small class="kicker">DAILY OBSERVATION</small><div class="pm-days">${w.daily.map(d=>`<div><b>${esc(d.day)}</b><span>${d.activeMinutes} min</span><small>${d.events} event${d.events===1?'':'s'}</small></div>`).join('')}</div></section>
    </div>`;
  }

  function exportWeekly(){const payload={...weeklySummary(),exportedAt:nowIso(),claim:'LOCAL_PILOT_EVIDENCE_ONLY'};const text=JSON.stringify(payload,null,2),blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kirthiverse-weekly-pilot-evidence.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0)}
  function injectCards(){
    const w=weeklySummary();
    if(location.pathname==='/parent'&&parentUnlocked()){const main=document.querySelector('main'),anchor=document.querySelector('.pv-actions');if(main&&anchor&&!main.querySelector('.pm-parent-card')){const c=document.createElement('section');c.className='glass-card pm-parent-card';c.innerHTML=`<small class="kicker">WEEKLY PILOT EVIDENCE</small><h3>${w.activeMinutes} active min · ${w.activeDays} active day${w.activeDays===1?'':'s'}</h3><p>${w.completeSevenDayWindow?'Seven-day window available.':`Only ${w.observationDays} observation day${w.observationDays===1?'':'s'} so far.`}</p><a class="primary" data-link href="/weekly-report">Open weekly report →</a>`;anchor.closest('.glass-card')?.after(c)}}
    if(location.pathname==='/educator'&&parentUnlocked()){const main=document.querySelector('main');if(main&&!main.querySelector('.pm-educator-card')){const c=document.createElement('section');c.className='glass-card pm-educator-card';c.innerHTML=`<small class="kicker">LINKED LEARNER — WEEKLY PILOT</small><h3>${w.activeMinutes} active min · ${w.uniqueLessonsCompleted} lesson${w.uniqueLessonsCompleted===1?'':'s'} completed</h3><p>This summary applies only to the device-linked learner; it is not class-wide analytics.</p><a class="primary" data-link href="/weekly-report">View evidence →</a>`;main.appendChild(c)}}
  }

  let lastRoute=null,lastInteraction=Date.now();
  function observeRoute(){const path=location.pathname;if(path!==lastRoute){lastRoute=path;if(path.startsWith('/lesson/'))record('lesson_started',{lessonId:decodeURIComponent(path.slice('/lesson/'.length))})}}
  function bindActions(){const complete=document.getElementById('complete');if(complete&&!complete.dataset.pmTracked){complete.dataset.pmTracked='1';complete.addEventListener('click',()=>{if(location.pathname.startsWith('/lesson/'))record('lesson_completed',{lessonId:decodeURIComponent(location.pathname.slice('/lesson/'.length))})})}}
  function renderReport(){if(location.pathname!=='/weekly-report')return;const main=document.querySelector('main');if(!main)return;main.innerHTML=reportView();document.getElementById('pm-export')?.addEventListener('click',exportWeekly)}
  function cycle(){observeRoute();bindActions();syncExternalEvidence();snapshotMastery();renderReport();injectCards()}

  establishBaseline();snapshotMastery();
  for(const evt of ['pointerdown','keydown','touchstart','scroll'])addEventListener(evt,()=>{lastInteraction=Date.now()},{passive:true});
  setInterval(()=>{if(document.visibilityState==='visible'&&learnerRoute(location.pathname)&&Date.now()-lastInteraction<=RECENT_ACTIVITY_MS)addActiveSeconds(HEARTBEAT_MS/1000)},HEARTBEAT_MS);
  addEventListener('kv:rendered',()=>queueMicrotask(cycle));
  addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')lastInteraction=Date.now()});
  cycle();
  window.KV_PILOT_METRICS={version:'v1',localOnly:true,tamperEvident:false,backfillsHistory:false,activeRoutePolicy:'lesson+diagnostic+speedlab only',summary:weeklySummary,record,sync:syncExternalEvidence,trackingStartedAt:()=>state().trackingStartedAt};
})();
