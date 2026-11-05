import { test, expect } from '@playwright/test';

// Scope: Class 8 search is the widest lazy-loading route: 3 runtime loaders +
// 5 original lesson banks + 5 original assessment banks. The existing
// performance-security browser gate covers a Class 6 route, not this surface.
// This test must run before the Class 8 content PR is merged.
test('Class 8 search loads all five batches within the search route and incremental budgets', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto('/search', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await page.waitForFunction(() => {
    const d = document.documentElement.dataset;
    return d.class8MathPart1 === 'ready'
      && d.class8MathPart2 === 'ready'
      && d.class8Science === 'ready'
      && d.class8SocialSciencePart1 === 'ready'
      && d.class8SocialSciencePart2 === 'ready';
  }, null, { timeout: 30000 });

  const outcome = await page.evaluate(() => {
    const lessons = (window.KV_LESSONS || []).filter(x => /\.cbse8\./.test(x.id || ''));
    const assessments = (window.KV_ASSESSMENTS || []).filter(x => /^(?:KV-CBSE8-)/.test(x.stableAssessmentId || ''));
    const requests = performance.getEntriesByType('resource');
    const assets = requests.filter(x => /\.(?:js|css)(?:\?|$)/i.test(new URL(x.name).pathname + new URL(x.name).search));
    const class8Assets = assets.filter(x => /\/(?:class8-(?:math|science|social-science)-runtime-v1\.js|data\/class8-(?:math|science|social-science)-.*\.js)$/.test(new URL(x.name).pathname));
    const foreign = requests.map(x => new URL(x.name).origin)
      .filter(origin => ![location.origin, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'].includes(origin));
    return {
      lessonCount: lessons.length,
      assessmentCount: assessments.length,
      uniqueLessons: new Set(lessons.map(x => x.id)).size,
      uniqueAssessments: new Set(assessments.map(x => x.stableAssessmentId)).size,
      jsCssRequests: assets.length,
      class8JsRequests: class8Assets.length,
      unexpectedOrigins: [...new Set(foreign)]
    };
  });
  expect(outcome.lessonCount).toBe(83);
  expect(outcome.assessmentCount).toBe(415);
  expect(outcome.uniqueLessons).toBe(83);
  expect(outcome.uniqueAssessments).toBe(415);
  // The existing 48-request performance check measures a CORE LESSON, not /search.
  // The full /search integration was measured at 81 requests in the 5-browser
  // CI failure. Hold this route-specific ceiling, and prevent Class 8 from
  // exceeding its justified 3 runtimes + 10 lesson/assessment scripts.
  // This is a measured NON-REGRESSION budget, not a performance endorsement.
  expect(outcome.class8JsRequests, 'Class 8 incremental script requests').toBeLessThanOrEqual(13);
  expect(outcome.jsCssRequests, 'Measured Class 8 /search route JS/CSS ceiling').toBeLessThanOrEqual(81);
  expect(outcome.unexpectedOrigins).toEqual([]);
  expect(errors).toEqual([]);
});

test('Class 8 loaders are not fetched on an unrelated static route', async ({ page }) => {
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).not.toBeEmpty();
  const class8Requests = await page.evaluate(() => performance.getEntriesByType('resource')
    .map(x => new URL(x.name).pathname)
    .filter(path => /\/(?:class8-(?:math|science|social-science)-runtime-v1\.js|data\/class8-(?:math|science|social-science)-.*\.(?:js))$/.test(path)));
  expect(class8Requests).toEqual([]);
});
