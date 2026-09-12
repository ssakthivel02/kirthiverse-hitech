import { test, expect } from '@playwright/test';

const CLASS6_MATH_LESSON_IDS = [
  'math.cbse6.ganita-prakash.patterns.number-patterns.v1',
  'math.cbse6.ganita-prakash.patterns.shape-patterns.v1',
  'math.cbse6.ganita-prakash.patterns.everyday-patterns.v1',
  'math.cbse6.ganita-prakash.ch2.geometry-primitives.v1',
  'math.cbse6.ganita-prakash.ch2.angle-compare-classify.v1',
  'math.cbse6.ganita-prakash.ch2.measure-draw-angles.v1',
  'math.cbse6.ganita-prakash.ch3.number-relations-line.v1',
  'math.cbse6.ganita-prakash.ch3.digit-processes.v1',
  'math.cbse6.ganita-prakash.ch3.mental-pattern-estimation.v1',
  'math.cbse6.ganita-prakash.ch4.collect-organise-frequency.v1',
  'math.cbse6.ganita-prakash.ch4.pictographs-keys.v1',
  'math.cbse6.ganita-prakash.ch4.bar-graphs-scale.v1',
];
const CLASS6_SCIENCE_LESSON_IDS = [
  'science.cbse6.curiosity.ch1.observation-questions.v1',
  'science.cbse6.curiosity.ch1.fair-investigations.v1',
  'science.cbse6.curiosity.ch1.evidence-conclusions.v1',
  'science.cbse6.curiosity.ch2.diversity-observation.v1',
  'science.cbse6.curiosity.ch2.classification-keys.v1',
  'science.cbse6.curiosity.ch2.habitats-adaptations.v1',
  'science.cbse6.curiosity.ch3.food-diversity-nutrients.v1',
  'science.cbse6.curiosity.ch3.balanced-meals-routines.v1',
  'science.cbse6.curiosity.ch3.food-information-hygiene.v1',
  'science.cbse6.curiosity.ch4.magnetic-materials-evidence.v1',
  'science.cbse6.curiosity.ch4.poles-attraction-repulsion.v1',
  'science.cbse6.curiosity.ch4.compass-direction-safe-investigation.v1',
  'science.cbse6.curiosity.ch5.standard-units-measurement.v1',
  'science.cbse6.curiosity.ch5.curved-length-estimation.v1',
  'science.cbse6.curiosity.ch5.motion-reference-types.v1',
  'science.cbse6.curiosity.ch6.objects-materials-classification.v1',
  'science.cbse6.curiosity.ch6.observable-properties.v1',
  'science.cbse6.curiosity.ch6.water-properties-choice.v1',
  'science.cbse6.curiosity.ch7.temperature-sensation-evidence.v1',
  'science.cbse6.curiosity.ch7.celsius-scale-reading.v1',
  'science.cbse6.curiosity.ch7.safe-measurement-recording.v1',
  'science.cbse6.curiosity.ch8.states-properties.v1',
  'science.cbse6.curiosity.ch8.state-changes.v1',
  'science.cbse6.curiosity.ch8.evaporation-condensation-cycle.v1',
  'science.cbse6.curiosity.ch9.separation-properties.v1',
  'science.cbse6.curiosity.ch9.mechanical-separation.v1',
  'science.cbse6.curiosity.ch9.evaporative-multistep-separation.v1',
  'science.cbse6.curiosity.ch10.living-characteristics-evidence.v1',
  'science.cbse6.curiosity.ch10.germination-plant-growth.v1',
  'science.cbse6.curiosity.ch10.life-cycles.v1',
  'science.cbse6.curiosity.ch11.air-water-sun.v1',
  'science.cbse6.curiosity.ch11.forests-soil-rocks-minerals.v1',
  'science.cbse6.curiosity.ch11.renewable-nonrenewable-resources.v1',
  'science.cbse6.curiosity.ch12.stars-constellations-night-sky.v1',
  'science.cbse6.curiosity.ch12.solar-system.v1',
  'science.cbse6.curiosity.ch12.milky-way-universe-scale.v1',
];
const CLASS6_MATH_ASSESSMENT_IDS = Array.from({length:60},(_,i)=>`KV-CBSE6-MATH-${String(i+1).padStart(4,'0')}`);
const CLASS6_SCIENCE_ASSESSMENT_IDS = Array.from({length:180},(_,i)=>`KV-CBSE6-SCI-${String(i+1).padStart(4,'0')}`);

async function waitForRuntime(page) {
  await page.waitForFunction(() => Boolean(window.KV_NAVIGATION && window.KV_APP_RUNTIME && window.KV_PROFILE_RUNTIME));
  await expect(page.locator('main')).toBeVisible();
}

test('ACTIVE MASTER release surface preserves canonical corpus and local-first identity boundaries', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const response = await page.goto('/?release-closure=1');
  expect(response?.status()).toBe(200);
  await waitForRuntime(page);
  await page.waitForFunction(
    ({mathIds,scienceIds}) =>
      document.documentElement.dataset.class6MathPilot === 'ready' &&
      document.documentElement.dataset.class6SciencePilot === 'ready' &&
      [...mathIds,...scienceIds].every(id => window.KV_LESSONS?.some(lesson => lesson.id === id)),
    {mathIds:CLASS6_MATH_LESSON_IDS,scienceIds:CLASS6_SCIENCE_LESSON_IDS}
  );

  const corpus = await page.evaluate(({mathLessonIds,scienceLessonIds,mathAssessmentIds,scienceAssessmentIds}) => {
    const lessons=window.KV_LESSONS||[], assessments=window.KV_ASSESSMENTS||[];
    const mathLessons=lessons.filter(x=>mathLessonIds.includes(x.id));
    const scienceLessons=lessons.filter(x=>scienceLessonIds.includes(x.id));
    const mathAssessments=assessments.filter(x=>mathAssessmentIds.includes(x.stableAssessmentId));
    const scienceAssessments=assessments.filter(x=>scienceAssessmentIds.includes(x.stableAssessmentId));
    return {
      lessons:lessons.length,
      coreLessons:lessons.length-mathLessons.length-scienceLessons.length,
      mathLessons:mathLessons.length,
      scienceLessons:scienceLessons.length,
      mathTopicIds:[...new Set(mathLessons.map(x=>x.topicId))],
      scienceTopicIds:[...new Set(scienceLessons.map(x=>x.topicId))],
      assessments:assessments.length,
      coreAssessments:assessments.length-mathAssessments.length-scienceAssessments.length,
      mathAssessments:mathAssessments.length,
      scienceAssessments:scienceAssessments.length,
      mathState:document.documentElement.dataset.class6MathPilot,
      scienceState:document.documentElement.dataset.class6SciencePilot,
      footer:document.querySelector('footer')?.innerText||'',
      runtime:document.querySelector('meta[name="kv-runtime-generation"]')?.content,
    };
  },{mathLessonIds:CLASS6_MATH_LESSON_IDS,scienceLessonIds:CLASS6_SCIENCE_LESSON_IDS,mathAssessmentIds:CLASS6_MATH_ASSESSMENT_IDS,scienceAssessmentIds:CLASS6_SCIENCE_ASSESSMENT_IDS});

  expect(corpus.coreLessons).toBe(135);
  expect(corpus.mathLessons).toBe(12);
  expect(corpus.scienceLessons).toBe(36);
  expect(corpus.mathTopicIds).toHaveLength(12);
  expect(corpus.scienceTopicIds).toHaveLength(36);
  expect(corpus.lessons).toBe(183);
  expect(corpus.coreAssessments).toBe(72);
  expect(corpus.mathAssessments).toBe(60);
  expect(corpus.scienceAssessments).toBe(180);
  expect(corpus.assessments).toBe(312);
  expect(corpus.mathState).toBe('ready');
  expect(corpus.scienceState).toBe('ready');
  expect(corpus.footer).toContain('11 universes');
  expect(corpus.runtime).toBe('CORE-RUNTIME-V30');

  await page.evaluate(() => window.KV_NAVIGATION.navigate('/profile'));
  await page.waitForFunction(() => location.pathname === '/profile' && Boolean(document.querySelector('[data-role-experience="v1"]')) && Boolean(document.querySelector('[data-claim-prep="v1"]')));
  const identity = await page.evaluate(() => ({
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
  await page.evaluate(() => window.KV_NAVIGATION.navigate('/educator'));
  await page.waitForFunction(() => location.pathname === '/educator');
  await expect(page.locator('main')).toContainText('Unlock Parent Space first');
  await expect(page.locator('main')).toContainText('It is not teacher authentication or a school account.');
  expect(pageErrors, `uncaught browser exceptions: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('direct profile deep link resolves through the current SPA without converting future roles into accounts', async ({ page }) => {
  const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
  const response=await page.goto('/profile?release-closure=direct');
  expect(response?.status()).toBe(200);
  await waitForRuntime(page);
  expect(new URL(page.url()).pathname).toBe('/profile');
  await expect(page.locator('[data-profile-runtime="v26"]')).toBeVisible();
  await expect(page.locator('[data-role="parent"]')).toContainText('Future verified');
  await expect(page.locator('[data-role="teacher"]')).toContainText('Future authorised');
  await expect(page.locator('[data-role="school"]')).toContainText('Future authorised');
  expect(pageErrors, `uncaught browser exceptions: ${pageErrors.join(' | ')}`).toEqual([]);
});
