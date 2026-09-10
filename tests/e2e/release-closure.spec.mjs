import { test, expect } from '@playwright/test';

const CLASS6_MATH_LESSON_ID = 'math.cbse6.ganita-prakash.patterns.number-patterns.v1';
const CLASS6_MATH_ASSESSMENT_IDS = [
  'KV-CBSE6-MATH-0001',
  'KV-CBSE6-MATH-0002',
  'KV-CBSE6-MATH-0003',
  'KV-CBSE6-MATH-0004',
  'KV-CBSE6-MATH-0005',
];

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
    lessonId => document.documentElement.dataset.class6MathPilot === 'ready' &&
      window.KV_LESSONS?.some(lesson => lesson.id === lessonId),
    CLASS6_MATH_LESSON_ID
  );

  const corpus = await page.evaluate(({ lessonId, assessmentIds }) => {
    const lessons = window.KV_LESSONS || [];
    const assessments = window.KV_ASSESSMENTS || [];
    const pilotLessons = lessons.filter(lesson => lesson.id === lessonId);
    const pilotAssessments = assessments.filter(assessment => assessmentIds.includes(assessment.stableAssessmentId));
    return {
      lessons: lessons.length,
      coreLessons: lessons.length - pilotLessons.length,
      pilotLessons: pilotLessons.length,
      assessments: assessments.length,
      coreAssessments: assessments.length - pilotAssessments.length,
      pilotAssessments: pilotAssessments.length,
      pilotState: document.documentElement.dataset.class6MathPilot,
      footer: document.querySelector('footer')?.innerText || '',
      runtime: document.querySelector('meta[name="kv-runtime-generation"]')?.content,
    };
  }, { lessonId: CLASS6_MATH_LESSON_ID, assessmentIds: CLASS6_MATH_ASSESSMENT_IDS });

  // The canonical CORE-RUNTIME-V30 corpus remains intact. The controlled
  // Class 6 pilot is additive and must be evidenced separately rather than
  // silently changing the core baseline contract.
  expect(corpus.coreLessons).toBe(135);
  expect(corpus.pilotLessons).toBe(1);
  expect(corpus.lessons).toBe(136);
  expect(corpus.coreAssessments).toBe(72);
  expect(corpus.pilotAssessments).toBe(5);
  expect(corpus.assessments).toBe(77);
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
