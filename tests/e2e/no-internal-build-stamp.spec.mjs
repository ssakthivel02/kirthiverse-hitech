import { test, expect } from '@playwright/test';

// Learner-facing pages must not show internal build/provenance strings.
// Before this change learning-foundation-v19.js appended a fixed pill
// "KIRTHIVERSE // MANUS-VISUAL-MASTER-05 // <route>" (8px, no aria-hidden) to every route.
// It was visible (and exposed to assistive tech) at desktop/tablet widths and overlapped the Kiki card;
// on narrow screens CSS hid it, but the node still existed in the DOM.

const ROUTES = [
  '/',
  '/lesson/science.cbse6.curiosity.ch1.observation-questions.v1',
  '/lesson/math.number.place-value.base10.age6-8.l1',
  '/practice-arena',
];

for (const route of ROUTES) {
  test(`no internal build stamp on ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    // the stamp was (re)written on route changes, so give the runtime time to run
    await page.waitForTimeout(800);

    await expect(page.locator('.route-flare-v4')).toHaveCount(0);

    // visible text only (innerText skips <script>/<style> and display:none)
    const leaked = await page.evaluate(() => /MANUS-VISUAL-MASTER-\d+/i.test(document.body.innerText));
    expect(leaked, 'internal candidate id in visible page text').toBe(false);
  });
}

test('stamp does not reappear after in-app navigation', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.goto('/lesson/science.cbse6.curiosity.ch1.observation-questions.v1');
  await page.locator('.lesson-head').waitFor();
  await page.evaluate(() => { history.pushState({}, '', '/practice-arena'); window.dispatchEvent(new PopStateEvent('popstate')); });
  await page.waitForTimeout(800);
  await expect(page.locator('.route-flare-v4')).toHaveCount(0);
});
