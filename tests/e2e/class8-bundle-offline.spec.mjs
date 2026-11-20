import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });
const CACHE='kirthiverse-preview-v50';
const science='science.cbse8.curiosity.ch1.questions-variables-fair-tests.v1';
const civics='social-science.cbse8.exploring-society.p1ch6.parliament-composition-and-lawmaking.v1';

for(const seedLegacy of [false,true]){
  test(`Class 8 corrected bundles work offline after ${seedLegacy?'legacy cache migration':'fresh installation'}`,async({page,context})=>{
    if(seedLegacy){
      await page.goto('/version.json');
      await page.evaluate(async()=>{
        const old=await caches.open('kirthiverse-preview-v49');
        for(const path of ['/data/class8-science-bundle-v1.js?v=CBSE8-SCI-1','/data/class8-social-science-part1-bundle-v1.js?v=CBSE8-SOC-P1-1'])
          await old.put(path,new Response('OLD UNCORRECTED BUNDLE',{headers:{'Content-Type':'application/javascript'}}));
      });
    }
    await page.goto('/');
    await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
    const cached=await page.evaluate(async name=>{
      const c=await caches.open(name);
      return {science:await (await c.match('/data/class8-science-bundle-v2.js')).text(),
        civics:await (await c.match('/data/class8-social-science-part1-bundle-v2.js')).text(),
        legacyCachePresent:(await caches.keys()).includes('kirthiverse-preview-v49')};
    },CACHE);
    expect(cached.science).toContain('ventilated shade');
    expect(cached.civics).toContain('within 14 days');
    expect(cached.science+cached.civics).not.toContain('OLD UNCORRECTED BUNDLE');
    expect(cached.legacyCachePresent).toBe(false);
    await context.setOffline(true);
    const legacy=await page.evaluate(async()=>Promise.all(['/data/class8-science-bundle-v1.js?v=OLD','/data/class8-social-science-part1-bundle-v1.js?v=OLD'].map(async u=>(await fetch(u)).text())));
    expect(legacy[0]).toContain('ventilated shade');
    expect(legacy[1]).toContain('within 14 days');
    await page.goto('/search');
    await page.waitForFunction(()=>{
      const d=document.documentElement.dataset;
      return d.class8MathPart1==='ready'&&d.class8MathPart2==='ready'&&d.class8Science==='ready'&&d.class8SocialSciencePart1==='ready'&&d.class8SocialSciencePart2==='ready';
    });
    expect(await page.evaluate(()=>({lessons:new Set(window.KV_LESSONS.filter(l=>/\.cbse8\./.test(l.id)).map(l=>l.id)).size,
      assessments:new Set(window.KV_ASSESSMENTS.filter(a=>/^KV-CBSE8-/.test(a.stableAssessmentId||'')).map(a=>a.stableAssessmentId)).size}))).toEqual({lessons:83,assessments:415});
    for(const [id,marker] of [[science,'ventilated shade'],[civics,'within 14 days']]){
      await page.goto('/lesson/'+id);
      await page.waitForFunction(()=>document.documentElement.dataset.class6MathPilot==='ready'&&document.documentElement.dataset.class6SciencePilot==='ready');
      await expect(page.locator('main')).toContainText(marker);
      const input=page.locator('#lc-answer');await expect(input).toBeVisible();
      const answer=await page.evaluate(id=>window.KV_ASSESSMENTS.find(a=>a.lessonId===id&&a.correctAnswer).correctAnswer,id);
      await input.fill(answer);
      await page.getByRole('button',{name:'Check',exact:true}).click();
      await expect(page.locator('#lc-status')).toContainText('Correct');
    }
  });
}
