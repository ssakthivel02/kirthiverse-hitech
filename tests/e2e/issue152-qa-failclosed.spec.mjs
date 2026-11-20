import { test, expect } from '@playwright/test';

const LESSON='math.number.place-value.base10.age6-8.l1';
const CHECK='kirthiverse.hitech.lessoncheck.v1';
const PILOT='kirthiverse.hitech.pilot.metrics.v1';

test('Issue #152: unflagged runtime preserves legacy on-device Secure heuristic',async({page})=>{
  await page.addInitScript(({lesson,key})=>{
    localStorage.setItem(key,JSON.stringify({[lesson]:{correct:true,attempts:3}}));
  },{lesson:LESSON,key:CHECK});
  await page.goto('/lesson/'+LESSON);
  await page.waitForFunction((id)=>window.KV_MASTERY?.summary?.().rows.some(r=>r.lesson.id===id),LESSON);
  const result=await page.evaluate(id=>window.KV_MASTERY.summary().rows.find(r=>r.lesson.id===id)?.state,LESSON);
  expect(result).toBe('secure');
});

test('Issue #152: dual QA flags with missing provider withhold Secure and pilot metrics',async({page})=>{
  await page.addInitScript(({lesson,key})=>{
    window.KV_ISSUE152_MASTERY_ENABLED=true;
    window.KV_ISSUE152_QA_CONTEXT=true;
    localStorage.setItem(key,JSON.stringify({[lesson]:{correct:true,attempts:3}}));
  },{lesson:LESSON,key:CHECK});
  await page.goto('/lesson/'+LESSON);
  await page.waitForFunction((id)=>window.KV_MASTERY?.summary?.().rows.some(r=>r.lesson.id===id),LESSON);
  // Pilot metrics is route-lazy. Load the real module explicitly under both QA flags.
  await page.addScriptTag({url:'/pilot-metrics-v1.js?v=ISSUE152-QA-NO-EXPORT'});
  await page.waitForFunction(()=>Boolean(window.KV_PILOT_METRICS));
  const outcome=await page.evaluate(({id,pilotKey})=>{
    const row=window.KV_MASTERY.summary().rows.find(x=>x.lesson.id===id);
    return {
      rowState:row.state,
      secure:window.KV_MASTERY.summary().counts.secure,
      reason:String(row.why),
      pilotSummary:window.KV_PILOT_METRICS?.summary?.(),
      pilotStorage:localStorage.getItem(pilotKey)
    };
  },{id:LESSON,pilotKey:PILOT});
  expect(outcome.rowState).not.toBe('secure');
  expect(outcome.secure).toBe(0);
  expect(outcome.reason).toContain('No verified reasoning');
  expect(outcome.pilotSummary).toBeNull();
  expect(outcome.pilotStorage).toBeNull();
});

test('Issue #152: one missing flag stays in unmodified v1 mode',async({page})=>{
  await page.addInitScript(({lesson,key})=>{
    window.KV_ISSUE152_MASTERY_ENABLED=true;
    window.KV_ISSUE152_QA_CONTEXT=false;
    localStorage.setItem(key,JSON.stringify({[lesson]:{correct:true,attempts:2}}));
  },{lesson:LESSON,key:CHECK});
  await page.goto('/lesson/'+LESSON);
  await page.waitForFunction((id)=>window.KV_MASTERY?.summary?.().rows.some(r=>r.lesson.id===id),LESSON);
  const state=await page.evaluate(id=>window.KV_MASTERY.summary().rows.find(x=>x.lesson.id===id)?.state,LESSON);
  expect(state).toBe('secure');
});

for(const getter of ['provider','schema','method']){
  test(`Issue #152: throwing ${getter} getter returns safe QA evidence`,async({page})=>{
    await page.addInitScript(({getter,lesson,key})=>{
      window.KV_ISSUE152_MASTERY_ENABLED=true;
      window.KV_ISSUE152_QA_CONTEXT=true;
      localStorage.setItem(key,JSON.stringify({[lesson]:{correct:true,attempts:3}}));
      const fail=()=>{throw new Error('QA fixture getter failure')};
      if(getter==='provider')Object.defineProperty(window,'KV_ISSUE152_MASTERY_PROJECTION',{get:fail});
      else{
        const provider={schema:'kirthiverse.issue152.mastery-projection.v2',projectMastery:()=>null};
        Object.defineProperty(provider,getter==='schema'?'schema':'projectMastery',{get:fail});
        window.KV_ISSUE152_MASTERY_PROJECTION=provider;
      }
    },{getter,lesson:LESSON,key:CHECK});
    await page.goto('/lesson/'+LESSON);
    await page.waitForFunction(()=>Boolean(window.KV_MASTERY));
    const result=await page.evaluate(()=>window.KV_MASTERY.summary());
    expect(result.counts.secure).toBe(0);
    expect(result.rows.find(r=>r.lesson.id===LESSON).why).toContain('provider exception');
  });
}

test('Issue #152: valid synthetic provider is consumed without rewriting history',async({page})=>{
  await page.addInitScript(({lesson,key})=>{
    window.KV_ISSUE152_MASTERY_ENABLED=true;
    window.KV_ISSUE152_QA_CONTEXT=true;
    localStorage.setItem(key,JSON.stringify({[lesson]:{correct:true,attempts:3}}));
    window.KV_ISSUE152_MASTERY_PROJECTION={schema:'kirthiverse.issue152.mastery-projection.v2',projectMastery:({lessons})=>({
      schema:'kirthiverse.issue152.mastery-projection.v2',
      metricDefinition:'issue152-proposed-not-comparable-to-legacy-secure',storageMutated:false,
      restrictions:{legacyMasterySnapshotsComparable:false,mayReplacePilotV1Snapshots:false,mayBackfillHistoricalEvents:false},
      counts:{'not-explored':0,exploring:0,practising:0,developing:lessons.length,secure:0},
      rows:lessons.map(l=>({lessonId:l.id,signal:'developing',evidence:{reasoningMasteryVerified:false},why:'Synthetic QA provider; not educational signoff.'}))
    })};
  },{lesson:LESSON,key:CHECK});
  await page.goto('/lesson/'+LESSON);
  await page.waitForFunction(()=>Boolean(window.KV_MASTERY));
  const result=await page.evaluate(key=>({summary:window.KV_MASTERY.summary(),history:localStorage.getItem(key)}),CHECK);
  expect(result.summary.rows.every(r=>r.state==='developing')).toBe(true);
  expect(result.summary.rows.every(r=>r.why==='Synthetic QA provider; not educational signoff.')).toBe(true);
  expect(result.summary.counts.secure).toBe(0);
  expect(JSON.parse(result.history)).toEqual({[LESSON]:{correct:true,attempts:3}});
});

test('Issue #152: unverified Secure provider is capped at Developing without rewriting history',async({page})=>{
  await page.addInitScript(({lesson,key})=>{
    window.KV_ISSUE152_MASTERY_ENABLED=true;
    window.KV_ISSUE152_QA_CONTEXT=true;
    localStorage.setItem(key,JSON.stringify({[lesson]:{correct:true,attempts:3}}));
    window.KV_ISSUE152_MASTERY_PROJECTION={schema:'kirthiverse.issue152.mastery-projection.v2',projectMastery:({lessons})=>({
      schema:'kirthiverse.issue152.mastery-projection.v2',
      metricDefinition:'issue152-proposed-not-comparable-to-legacy-secure',storageMutated:false,
      restrictions:{legacyMasterySnapshotsComparable:false,mayReplacePilotV1Snapshots:false,mayBackfillHistoricalEvents:false},
      counts:{'not-explored':0,exploring:0,practising:0,developing:0,secure:lessons.length},
      rows:lessons.map(l=>({lessonId:l.id,signal:'secure',evidence:{reasoningMasteryVerified:false},why:'Synthetic QA provider; not educational signoff.'}))
    })};
  },{lesson:LESSON,key:CHECK});
  await page.goto('/lesson/'+LESSON);
  await page.waitForFunction(()=>Boolean(window.KV_MASTERY));
  const result=await page.evaluate(key=>({summary:window.KV_MASTERY.summary(),history:localStorage.getItem(key)}),CHECK);
  expect(result.summary.rows.every(r=>r.state==='developing')).toBe(true);
  expect(result.summary.rows.every(r=>r.why.includes('No verified reasoning'))).toBe(true);
  expect(result.summary.counts.developing).toBe(result.summary.rows.length);
  expect(result.summary.counts.secure).toBe(0);
  expect(JSON.parse(result.history)).toEqual({[LESSON]:{correct:true,attempts:3}});
});

for(const attack of ['input-mutation','storage-write']){
  test(`Issue #152: ${attack} cannot supply trusted provider evidence`,async({page})=>{
    await page.addInitScript(({attack,lesson,key})=>{
      window.KV_ISSUE152_MASTERY_ENABLED=true;
      window.KV_ISSUE152_QA_CONTEXT=true;
      localStorage.setItem(key,JSON.stringify({[lesson]:{correct:true,attempts:3}}));
      let invoked=false;
      window.KV_ISSUE152_MASTERY_PROJECTION={schema:'kirthiverse.issue152.mastery-projection.v2',projectMastery:function(input){
        'use strict';
        if(attack==='input-mutation'){
          const writes=[()=>{input.lessons[0].title='CORRUPTED'},()=>input.lessons.push({id:'fake'}),
            ()=>{input.assessments[0].correctAnswer='CORRUPTED'},()=>{input.lessonCheck[lesson].correct=false},
            ()=>input.progress.completed.push(lesson),()=>{input.confidence.fake={value:'confident'}},
            ()=>input.practice.history.push({lessonId:lesson,result:'got-it'})];
          window.__issue152BlockedWrites=writes.map(write=>{try{write();return false}catch{return true}});
        }else if(!invoked){
          // Deliberately write synthetic history, then lie in the returned metadata.
          localStorage.setItem(key,JSON.stringify({[lesson]:{correct:false,attempts:99}}));
          invoked=true;
        }
        return {schema:'kirthiverse.issue152.mastery-projection.v2',
          metricDefinition:'issue152-proposed-not-comparable-to-legacy-secure',storageMutated:false,
          restrictions:{legacyMasterySnapshotsComparable:false,mayReplacePilotV1Snapshots:false,mayBackfillHistoricalEvents:false},
          counts:{'not-explored':0,exploring:0,practising:0,developing:input.lessons.length,secure:0},
          rows:input.lessons.map(l=>({lessonId:l.id,signal:'developing',evidence:{reasoningMasteryVerified:false},why:'ATTACKER OUTPUT'}))};
      }};
    },{attack,lesson:LESSON,key:CHECK});
    await page.goto('/lesson/'+LESSON);
    await page.waitForFunction(()=>Boolean(window.KV_MASTERY));
    const result=await page.evaluate(({key})=>({first:window.KV_MASTERY.summary(),second:window.KV_MASTERY.summary(),
      history:localStorage.getItem(key),blocked:window.__issue152BlockedWrites,
      corruptLesson:window.KV_LESSONS.some(l=>l.title==='CORRUPTED'||l.id==='fake'),
      corruptAnswer:window.KV_ASSESSMENTS.some(a=>a.correctAnswer==='CORRUPTED')}),{key:CHECK});
    expect(result.first.counts.secure).toBe(0);
    expect(result.second.counts.secure).toBe(0);
    if(attack==='input-mutation'){
      expect(result.blocked).toEqual(Array(7).fill(true));
      expect(result.corruptLesson).toBe(false);
      expect(result.corruptAnswer).toBe(false);
      expect(JSON.parse(result.history)).toEqual({[LESSON]:{correct:true,attempts:3}});
    }else{
      expect(result.first.rows.every(r=>r.why.includes('persisted history changed'))).toBe(true);
      expect(result.second.rows.every(r=>r.why.includes('persisted history changed'))).toBe(true);
      // Detection is not a sandbox or rollback: direct browser writes remain possible.
      expect(JSON.parse(result.history)).toEqual({[LESSON]:{correct:false,attempts:99}});
    }
  });
}
