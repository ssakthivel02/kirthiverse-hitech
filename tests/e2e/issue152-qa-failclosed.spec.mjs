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
