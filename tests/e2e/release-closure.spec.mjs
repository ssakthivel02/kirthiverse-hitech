import { test, expect } from '@playwright/test';

const CLASS7_MATH_LESSON_IDS=[
  'math.cbse7.ganita-prakash.ch1.place-value-estimation.v1','math.cbse7.ganita-prakash.ch1.operations-reasoning.v1',
  'math.cbse7.ganita-prakash.ch2.expression-structure.v1','math.cbse7.ganita-prakash.ch2.evaluate-reason.v1',
  'math.cbse7.ganita-prakash.ch3.decimal-place-value.v1','math.cbse7.ganita-prakash.ch3.decimal-compare-operate.v1',
  'math.cbse7.ganita-prakash.ch4.variables-meaning.v1','math.cbse7.ganita-prakash.ch4.substitute-simplify.v1',
  'math.cbse7.ganita-prakash.ch5.line-relationships.v1','math.cbse7.ganita-prakash.ch5.angle-relations.v1',
  'math.cbse7.ganita-prakash.ch6.patterns-properties.v1','math.cbse7.ganita-prakash.ch6.strategies-invariants.v1',
  'math.cbse7.ganita-prakash.ch7.triangle-angle-structure.v1','math.cbse7.ganita-prakash.ch7.triangle-classify-reason.v1',
  'math.cbse7.ganita-prakash.ch8.fraction-operations.v1','math.cbse7.ganita-prakash.ch8.fraction-multiply-divide.v1'
];
const CLASS7_MATH_ASSESSMENT_IDS=Array.from({length:80},(_,i)=>`KV-CBSE7-MATH-${String(i+1).padStart(4,'0')}`);
const CLASS7_SCIENCE_LESSON_IDS=['science.cbse7.curiosity.ch2.acids-bases-indicators.v1','science.cbse7.curiosity.ch2.neutralisation-evidence.v1','science.cbse7.curiosity.ch3.closed-circuits.v1','science.cbse7.curiosity.ch3.components-conductors.v1','science.cbse7.curiosity.ch4.properties-evidence.v1','science.cbse7.curiosity.ch4.uses-properties.v1','science.cbse7.curiosity.ch5.physical-chemical-evidence.v1','science.cbse7.curiosity.ch5.change-investigation.v1'];
const CLASS7_SCIENCE_ASSESSMENT_IDS=Array.from({length:20},(_,i)=>`KV-CBSE7-SCI-${String(i+1).padStart(4,'0')}`);

async function waitForRuntime(page){await page.waitForFunction(()=>Boolean(window.KV_NAVIGATION&&window.KV_APP_RUNTIME&&window.KV_PROFILE_RUNTIME));await expect(page.locator('main')).toBeVisible();}

test('ACTIVE MASTER release surface preserves canonical corpus and complete Class 7 Mathematics',async({page})=>{
  const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
  const response=await page.goto('/?release-closure=1');expect(response?.status()).toBe(200);await waitForRuntime(page);
  await page.waitForFunction(({ids})=>document.documentElement.dataset.class6MathPilot==='ready'&&document.documentElement.dataset.class6SciencePilot==='ready'&&document.documentElement.dataset.class6SocialSciencePilot==='ready'&&[1,2,3,4,5,6,7,8].every(ch=>document.documentElement.dataset[`class7MathChapter${ch}`]==='ready')&&[2,3,4,5].every(ch=>document.documentElement.dataset[`class7ScienceChapter${ch}`]==='ready')&&ids.every(id=>window.KV_LESSONS?.some(x=>x.id===id)),{ids:CLASS7_MATH_LESSON_IDS});
  const corpus=await page.evaluate(({lessonIds,assessmentIds})=>{
    const lessons=window.KV_LESSONS||[],assessments=window.KV_ASSESSMENTS||[];
    const c6m=lessons.filter(x=>x.id?.startsWith('math.cbse6.ganita-prakash.')),c6s=lessons.filter(x=>x.id?.startsWith('science.cbse6.curiosity.')),c6soc=lessons.filter(x=>x.id?.startsWith('social-science.cbse6.exploring-society.')),c7=lessons.filter(x=>lessonIds.includes(x.id)),c7s=lessons.filter(x=>scienceLessonIds.includes(x.id));
    const a6m=assessments.filter(x=>/^KV-CBSE6-MATH-\d{4}$/.test(x.stableAssessmentId||'')),a6s=assessments.filter(x=>/^KV-CBSE6-SCI-\d{4}$/.test(x.stableAssessmentId||'')),a6soc=assessments.filter(x=>/^KV-CBSE6-SOC-\d{4}$/.test(x.stableAssessmentId||'')),a7=assessments.filter(x=>assessmentIds.includes(x.stableAssessmentId)),a7s=assessments.filter(x=>scienceAssessmentIds.includes(x.stableAssessmentId));
    return {lessons:lessons.length,assessments:assessments.length,legacyLessons:lessons.length-c6m.length-c6s.length-c6soc.length-c7.length-c7s.length,legacyAssessments:assessments.length-a6m.length-a6s.length-a6soc.length-a7.length-a7s.length,c6m:c6m.length,c6s:c6s.length,c6soc:c6soc.length,a6m:a6m.length,a6s:a6s.length,a6soc:a6soc.length,c7:c7.length,a7:a7.length,c7ids:c7.map(x=>x.id).sort(),a7ids:a7.map(x=>x.stableAssessmentId).sort(),c7s:c7s.length,a7s:a7s.length,c7sids:c7s.map(x=>x.id).sort(),a7sids:a7s.map(x=>x.stableAssessmentId).sort(),rights:c7.map(x=>x.rightsStatus),scienceRights:c7s.map(x=>x.rightsStatus),footer:document.querySelector('footer')?.innerText||'',runtime:document.querySelector('meta[name="kv-runtime-generation"]')?.content};
  },{lessonIds:CLASS7_MATH_LESSON_IDS,assessmentIds:CLASS7_MATH_ASSESSMENT_IDS,scienceLessonIds:CLASS7_SCIENCE_LESSON_IDS,scienceAssessmentIds:CLASS7_SCIENCE_ASSESSMENT_IDS});
  expect(corpus.legacyLessons).toBe(135);expect(corpus.legacyAssessments).toBe(72);expect(corpus.c6m).toBe(30);expect(corpus.c6s).toBe(36);expect(corpus.c6soc).toBe(35);expect(corpus.a6m).toBe(150);expect(corpus.a6s).toBe(180);expect(corpus.a6soc).toBe(175);
  expect(corpus.c7).toBe(16);expect(corpus.a7).toBe(80);expect(corpus.c7s).toBe(8);expect(corpus.a7s).toBe(20);expect(corpus.c7sids).toEqual([...CLASS7_SCIENCE_LESSON_IDS].sort());expect(corpus.a7sids).toEqual([...CLASS7_SCIENCE_ASSESSMENT_IDS].sort());expect(corpus.scienceRights.every(x=>x==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION')).toBe(true);expect(corpus.c7ids).toEqual([...CLASS7_MATH_LESSON_IDS].sort());expect(corpus.a7ids).toEqual([...CLASS7_MATH_ASSESSMENT_IDS].sort());expect(corpus.rights.every(x=>x==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION')).toBe(true);
  expect(corpus.lessons).toBe(260);expect(corpus.assessments).toBe(677);expect(corpus.footer).toContain('11 universes');expect(corpus.runtime).toBe('CORE-RUNTIME-V30');expect(pageErrors).toEqual([]);
});

for(const [chapter,lessonId,title] of [[3,'math.cbse7.ganita-prakash.ch3.decimal-place-value.v1','A Peek Beyond the Point'],[5,'math.cbse7.ganita-prakash.ch5.line-relationships.v1','Parallel and Intersecting Lines'],[8,'math.cbse7.ganita-prakash.ch8.fraction-multiply-divide.v1','Working with Fractions']]){
  test(`Class 7 Chapter ${chapter} direct deep link loads shared completion runtime`,async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));const response=await page.goto(`/lesson/${lessonId}`);expect(response?.status()).toBe(200);await waitForRuntime(page);await page.waitForFunction(({chapter,id})=>document.documentElement.dataset[`class7MathChapter${chapter}`]==='ready'&&window.KV_LESSONS?.some(x=>x.id===id)&&window.KV_ASSESSMENTS?.some(x=>x.lessonId===id),{chapter, id:lessonId});expect(new URL(page.url()).pathname).toBe(`/lesson/${lessonId}`);await expect(page.locator('main')).toContainText(title);expect(errors).toEqual([]);});
}

test('direct profile deep link preserves local-only future-role boundary',async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));const response=await page.goto('/profile?release-closure=direct');expect(response?.status()).toBe(200);await waitForRuntime(page);expect(new URL(page.url()).pathname).toBe('/profile');await expect(page.locator('[data-profile-runtime="v26"]')).toBeVisible();await expect(page.locator('[data-role="parent"]')).toContainText('Future verified');await expect(page.locator('[data-role="teacher"]')).toContainText('Future authorised');await expect(page.locator('[data-role="school"]')).toContainText('Future authorised');expect(errors).toEqual([]);});