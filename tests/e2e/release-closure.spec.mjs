import { test, expect } from '@playwright/test';

const CLASS6_MATH_PREFIX='math.cbse6.ganita-prakash.';
const CLASS6_SCIENCE_PREFIX='science.cbse6.curiosity.';
const CLASS6_SOCIAL_PREFIX='social-science.cbse6.exploring-society.';
const CLASS7_MATH_LESSON_IDS=[
  'math.cbse7.ganita-prakash.ch1.place-value-estimation.v1',
  'math.cbse7.ganita-prakash.ch1.operations-reasoning.v1',
];
const CLASS7_MATH_ASSESSMENT_IDS=Array.from({length:10},(_,i)=>`KV-CBSE7-MATH-${String(i+1).padStart(4,'0')}`);

async function waitForRuntime(page){
  await page.waitForFunction(()=>Boolean(window.KV_NAVIGATION&&window.KV_APP_RUNTIME&&window.KV_PROFILE_RUNTIME));
  await expect(page.locator('main')).toBeVisible();
}

test('ACTIVE MASTER release surface preserves canonical corpus and local-first identity boundaries',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  const response=await page.goto('/?release-closure=1');
  expect(response?.status()).toBe(200);
  await waitForRuntime(page);
  await page.waitForFunction(({class7Ids})=>
    document.documentElement.dataset.class6MathPilot==='ready'&&
    document.documentElement.dataset.class6SciencePilot==='ready'&&
    document.documentElement.dataset.class6SocialSciencePilot==='ready'&&
    document.documentElement.dataset.class7MathChapter1==='ready'&&
    class7Ids.every(id=>window.KV_LESSONS?.some(lesson=>lesson.id===id)),
    {class7Ids:CLASS7_MATH_LESSON_IDS}
  );

  const corpus=await page.evaluate(({class7LessonIds,class7AssessmentIds})=>{
    const lessons=window.KV_LESSONS||[];
    const assessments=window.KV_ASSESSMENTS||[];
    const class6Math=lessons.filter(x=>x.id?.startsWith('math.cbse6.ganita-prakash.'));
    const class6Science=lessons.filter(x=>x.id?.startsWith('science.cbse6.curiosity.'));
    const class6Social=lessons.filter(x=>x.id?.startsWith('social-science.cbse6.exploring-society.'));
    const class7Math=lessons.filter(x=>class7LessonIds.includes(x.id));
    const class6MathAssessments=assessments.filter(x=>/^KV-CBSE6-MATH-\d{4}$/.test(x.stableAssessmentId||''));
    const class6ScienceAssessments=assessments.filter(x=>/^KV-CBSE6-SCI-\d{4}$/.test(x.stableAssessmentId||''));
    const class6SocialAssessments=assessments.filter(x=>/^KV-CBSE6-SOC-\d{4}$/.test(x.stableAssessmentId||''));
    const class7MathAssessments=assessments.filter(x=>class7AssessmentIds.includes(x.stableAssessmentId));
    return {
      lessons:lessons.length,
      assessments:assessments.length,
      legacyCoreLessons:lessons.length-class6Math.length-class6Science.length-class6Social.length-class7Math.length,
      legacyCoreAssessments:assessments.length-class6MathAssessments.length-class6ScienceAssessments.length-class6SocialAssessments.length-class7MathAssessments.length,
      class6Math:class6Math.length,class6Science:class6Science.length,class6Social:class6Social.length,
      class6MathAssessments:class6MathAssessments.length,class6ScienceAssessments:class6ScienceAssessments.length,class6SocialAssessments:class6SocialAssessments.length,
      class7Math:class7Math.length,class7MathAssessments:class7MathAssessments.length,
      class7LessonIds:class7Math.map(x=>x.id).sort(),
      class7AssessmentIds:class7MathAssessments.map(x=>x.stableAssessmentId).sort(),
      class7Rights:class7Math.map(x=>x.rightsStatus),
      class7State:document.documentElement.dataset.class7MathChapter1,
      mathState:document.documentElement.dataset.class6MathPilot,
      scienceState:document.documentElement.dataset.class6SciencePilot,
      socialState:document.documentElement.dataset.class6SocialSciencePilot,
      footer:document.querySelector('footer')?.innerText||'',
      runtime:document.querySelector('meta[name="kv-runtime-generation"]')?.content,
    };
  },{class7LessonIds:CLASS7_MATH_LESSON_IDS,class7AssessmentIds:CLASS7_MATH_ASSESSMENT_IDS});

  // Preserve the previously-qualified Class 6 and legacy corpus exactly.
  expect(corpus.legacyCoreLessons).toBe(135);
  expect(corpus.class6Math).toBe(30);
  expect(corpus.class6Science).toBe(36);
  expect(corpus.class6Social).toBe(35);
  expect(corpus.legacyCoreAssessments).toBe(72);
  expect(corpus.class6MathAssessments).toBe(150);
  expect(corpus.class6ScienceAssessments).toBe(180);
  expect(corpus.class6SocialAssessments).toBe(175);

  // Qualify the new Class 7 slice explicitly instead of absorbing it into "core" totals.
  expect(corpus.class7Math).toBe(2);
  expect(corpus.class7MathAssessments).toBe(10);
  expect(corpus.class7LessonIds).toEqual([...CLASS7_MATH_LESSON_IDS].sort());
  expect(corpus.class7AssessmentIds).toEqual([...CLASS7_MATH_ASSESSMENT_IDS].sort());
  expect(corpus.class7Rights.every(x=>x==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION')).toBe(true);
  expect(corpus.class7State).toBe('ready');

  expect(corpus.lessons).toBe(238);
  expect(corpus.assessments).toBe(587);
  expect(corpus.mathState).toBe('ready');
  expect(corpus.scienceState).toBe('ready');
  expect(corpus.socialState).toBe('ready');
  expect(corpus.footer).toContain('11 universes');
  expect(corpus.runtime).toBe('CORE-RUNTIME-V30');

  await page.evaluate(()=>window.KV_NAVIGATION.navigate('/profile'));
  await page.waitForFunction(()=>location.pathname==='/profile'&&Boolean(document.querySelector('[data-role-experience="v1"]'))&&Boolean(document.querySelector('[data-claim-prep="v1"]')));
  const identity=await page.evaluate(()=>({
    roles:document.querySelectorAll('[data-role]').length,
    roleSurfaces:document.querySelectorAll('[data-role-experience="v1"]').length,
    claimPreparation:document.querySelectorAll('[data-claim-prep="v1"]').length,
    localOnly:window.KV_PROFILE_RUNTIME?.localOnly,
    cloudIdentity:window.KV_PROFILE_RUNTIME?.cloudIdentity,
    silentUpload:window.KV_PROFILE_RUNTIME?.silentUpload,
    accountCreation:window.KV_PROFILE_RUNTIME?.accountCreation,
    dataDeletion:window.KV_PROFILE_RUNTIME?.dataDeletion,
    body:document.querySelector('main')?.innerText||'',
  }));
  expect(identity.roles).toBe(5);
  expect(identity.roleSurfaces).toBe(1);
  expect(identity.claimPreparation).toBe(1);
  expect(identity.localOnly).toBe(true);
  expect(identity.cloudIdentity).toBe(false);
  expect(identity.silentUpload).toBe(false);
  expect(identity.accountCreation).toBe(false);
  expect(identity.dataDeletion).toBe(false);
  expect(identity.body).toContain('No remote child profile or advertising identity is created.');
  expect(identity.body).toContain('No upload · no account · no deletion · no silent migration now.');

  await expect(page.locator('a[href="/educator"]')).toBeAttached();
  await page.evaluate(()=>window.KV_NAVIGATION.navigate('/educator'));
  await page.waitForFunction(()=>location.pathname==='/educator');
  await expect(page.locator('main')).toContainText('Unlock Parent Space first');
  await expect(page.locator('main')).toContainText('It is not teacher authentication or a school account.');
  expect(pageErrors,`uncaught browser exceptions: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('direct profile deep link resolves through the current SPA without converting future roles into accounts',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  const response=await page.goto('/profile?release-closure=direct');
  expect(response?.status()).toBe(200);
  await waitForRuntime(page);
  expect(new URL(page.url()).pathname).toBe('/profile');
  await expect(page.locator('[data-profile-runtime="v26"]')).toBeVisible();
  await expect(page.locator('[data-role="parent"]')).toContainText('Future verified');
  await expect(page.locator('[data-role="teacher"]')).toContainText('Future authorised');
  await expect(page.locator('[data-role="school"]')).toContainText('Future authorised');
  expect(pageErrors,`uncaught browser exceptions: ${pageErrors.join(' | ')}`).toEqual([]);
});