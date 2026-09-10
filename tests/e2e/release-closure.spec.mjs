import { test, expect } from '@playwright/test';

const CLASS6_MATH_LESSON_IDS = [
  'math.cbse6.ganita-prakash.patterns.number-patterns.v1',
  'math.cbse6.ganita-prakash.patterns.shape-patterns.v1',
  'math.cbse6.ganita-prakash.patterns.everyday-patterns.v1',
];
const CLASS6_MATH_ASSESSMENT_IDS = Array.from({length:15},(_,i)=>`KV-CBSE6-MATH-${String(i+1).padStart(4,'0')}`);

async function waitForRuntime(page) {
  await page.waitForFunction(() => Boolean(
    window.KV_NAVIGATION &&
    window.KV_APP_RUNTIME &&
    window.KV_PROFILE_RUNTIME
  ));
  await expect(page.locator('main')).toBeVisible();
}

test('ACTIVE MASTER release surface preserves canonical corpus and local-first identity boundaries', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  const response = await page.goto('/?release-closure=1');
  expect(response?.status()).toBe(200);
  await waitForRuntime(page);
  await page.waitForFunction(
    lessonIds => document.documentElement.dataset.class6MathPilot === 'ready' &&
      lessonIds.every(lessonId => window.KV_LESSONS?.some(lesson => lesson.id === lessonId)),
    CLASS6_MATH_LESSON_IDS
  );

  const corpus = await page.evaluate(({ lessonIds, assessmentIds }) => {
    const lessons = window.KV_LESSONS || [];
    const assessments = window.KV_ASSESSMENTS || [];
    const pilotLessons = lessons.filter(lesson => lessonIds.includes(lesson.id));
    const pilotAssessments = assessments.filter(assessment => assessmentIds.includes(assessment.stableAssessmentId));
    return {
      lessons: lessons.length,
      coreLessons: lessons.length - pilotLessons.length,
      pilotLessons: pilotLessons.length,
      pilotTopicIds: [...new Set(pilotLessons.map(lesson=>lesson.topicId))],
      assessments: assessments.length,
      coreAssessments: assessments.length - pilotAssessments.length,
      pilotAssessments: pilotAssessments.length,
      pilotState: document.documentElement.dataset.class6MathPilot,
      footer: document.querySelector('footer')?.innerText || '',
      runtime: document.querySelector('meta[name="kv-runtime-generation"]')?.content,
    };
  }, { lessonIds: CLASS6_MATH_LESSON_IDS, assessmentIds: CLASS6_MATH_ASSESSMENT_IDS });

  // CORE-RUNTIME-V30 stays invariant. Controlled curriculum slices are additive
  // and evidenced independently so curriculum growth cannot conceal core drift.
  expect(corpus.coreLessons).toBe(135);
  expect(corpus.pilotLessons).toBe(3);
  expect(corpus.pilotTopicIds).toHaveLength(3);
  expect(corpus.lessons).toBe(138);
  expect(corpus.coreAssessments).toBe(72);
  expect(corpus.pilotAssessments).toBe(15);
  expect(corpus.assessments).toBe(87);
  expect(corpus.pilotState).toBe('ready');
  expect(corpus.footer).toContain('11 universes');
  expect(corpus.runtime).toBe('CORE-RUNTIME-V30');

  await page.evaluate(() => window.KV_NAVIGATION.navigate('/profile'));
  await page.waitForFunction(() =>
    location.pathname === '/profile' &&
    Boolean(document.querySelector('[data-role-experience="v1"]')) &&
    Boolean(document.querySelector('[data-claim-prep="v1"]'))
  );

  const identity = await page.evaluate(() => ({
    roles: document.querySelectorAll('[data-role]').length,
    roleSurfaces: document.querySelectorAll('[data-role-experience="v1"]').length,
    claimPreparation: document.querySelectorAll('[data-claim-prep="v1"]').length,
    localOnly: window.KV_PROFILE_RUNTIME?.localOnly,
    cloudIdentity: window.KV_PROFILE_RUNTIME?.cloudIdentity,
    silentUpload: window.KV_PROFILE_RUNTIME?.silentUpload,
    accountCreation: window.KV_PROFILE_RUNTIME?.accountCreation,
    dataDeletion: window.KV_PROFILE_RUNTIME?.dataDeletion,
    body: document.querySelector('main')?.innerText || '',
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
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  const response = await page.goto('/profile?release-closure=direct');
  expect(response?.status()).toBe(200);
  await waitForRuntime(page);
  expect(new URL(page.url()).pathname).toBe('/profile');
  await expect(page.locator('[data-profile-runtime="v26"]')).toBeVisible();
  await expect(page.locator('[data-role="parent"]')).toContainText('Future verified');
  await expect(page.locator('[data-role="teacher"]')).toContainText('Future authorised');
  await expect(page.locator('[data-role="school"]')).toContainText('Future authorised');
  expect(pageErrors, `uncaught browser exceptions: ${pageErrors.join(' | ')}`).toEqual([]);
});
