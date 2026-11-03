import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Regression for issue #139: the shared lesson template used dark-theme colours (cyan #61e8ff, #9bb3c5, #6f8ca1)
// on the light paper theme, giving 1.36:1 to 2.78:1. WCAG AA needs 4.5:1 for normal text.
// Scans run in the desktop and mobile projects of playwright.config.mjs. Only the color-contrast rule is asserted here;
// this is not a claim that the pages pass every accessibility rule (active-master.spec.mjs covers the core routes).

const LESSONS = [
  'math.number.place-value.base10.age6-8.l1', // legacy base corpus
  'science.cbse6.curiosity.ch1.observation-questions.v1',
  'math.cbse6.ganita-prakash.patterns.number-patterns.v1',
  'social-science.cbse6.exploring-society.ch1.maps-components.v1',
  'math.cbse7.ganita-prakash.ch1.place-value-estimation.v1',
];

const contrastFailures = async (page) => {
  const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  return results.violations.flatMap((v) => v.nodes.map((n) => {
    const d = n.any[0]?.data || {};
    return `${n.target.join(' ')} | ${d.fgColor} on ${d.bgColor} | ${d.contrastRatio}:1`;
  }));
};

const openLesson = async (page, id) => {
  const response = await page.goto(`/lesson/${id}`);
  expect(response?.status()).toBe(200);
  await page.locator('.lesson-head').waitFor();
  await page.waitForLoadState('networkidle');
};

for (const id of LESSONS) {
  test(`lesson ${id} has no colour-contrast failures in any answer state`, async ({ page }) => {
    await openLesson(page, id);
    expect(await contrastFailures(page), 'initial state').toEqual([]);

    await page.locator('details > summary').first().click();
    expect(await contrastFailures(page), 'guidance revealed').toEqual([]);

    const answer = page.locator('#lc-answer');
    if (await answer.count()) {
      await answer.fill('zzzz');
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await expect(page.locator('[data-c-status]')).not.toHaveText('');
      expect(await contrastFailures(page), 'wrong answer').toEqual([]);

      const correct = await page.evaluate((lessonId) => {
        const a = (window.KV_ASSESSMENTS || []).find((x) => x.lessonId === lessonId);
        return a ? String(a.correctAnswer) : null;
      }, id);
      if (correct) {
        await answer.fill(correct);
        await page.getByRole('button', { name: 'Check', exact: true }).click();
        expect(await contrastFailures(page), 'answer checked again').toEqual([]);
      }
    }
  });
}

test('the five elements named in issue #139 are present and meet WCAG AA contrast', async ({ page }) => {
  await openLesson(page, 'science.cbse6.curiosity.ch1.observation-questions.v1');
  // Guards against a false pass if the template changes and the elements disappear.
  const SELECTORS = [
    '.lesson-head > div:nth-child(1) > span',
    '.mission-data > small',
    'section[data-confidence="v1"] > p:nth-child(3)',
    'p[data-c-status]',
    '.count',
  ];
  for (const selector of SELECTORS) await expect(page.locator(selector).first(), selector).toBeVisible();
  expect(await contrastFailures(page)).toEqual([]);
});
