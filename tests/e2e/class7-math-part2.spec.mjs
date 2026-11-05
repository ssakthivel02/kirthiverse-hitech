import { test, expect } from '@playwright/test';

const PART2 = [
  [1, 'congruent-figures-correspondence', 'Congruent Figures and Correspondence'],
  [2, 'integer-add-subtract', 'Adding and Subtracting'],
  [3, 'prime-factors-and-hcf', 'Prime Factorisation and HCF'],
  [4, 'decimal-multiplication', 'Multiplying Decimals'],
  [5, 'mean-median-outliers', 'Mean, Median and Outliers'],
  [6, 'bisectors-perpendiculars-parallels', 'Bisectors, Perpendiculars and Parallels'],
  [7, 'equations-and-balance', 'Equations as Balance'],
];

for (const [chapter, slug, title] of PART2) {
  const lessonId = `math.cbse7.ganita-prakash.p2ch${chapter}.${slug}.v1`;
  test(`Class 7 Maths Part II chapter ${chapter} direct deep link loads its lessons and assessments`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const response = await page.goto(`/lesson/${lessonId}`);
    expect(response?.status()).toBe(200);
    await page.waitForFunction(
      (id) => document.documentElement.dataset.class7MathPart2 === 'ready'
        && window.KV_LESSONS?.some((x) => x.id === id)
        && window.KV_ASSESSMENTS?.filter((x) => x.lessonId === id).length === 5,
      lessonId,
    );
    expect(new URL(page.url()).pathname).toBe(`/lesson/${lessonId}`);
    await expect(page.locator('main')).toContainText(title);
    expect(errors).toEqual([]);
  });
}

test('Class 7 Maths Part II registers 14 lessons and 70 stable assessments without touching Part I ids', async ({ page }) => {
  await page.goto('/lesson/math.cbse7.ganita-prakash.p2ch1.congruent-figures-correspondence.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class7MathPart2 === 'ready');
  const summary = await page.evaluate(() => {
    const lessons = window.KV_LESSONS.filter((x) => /\.p2ch\d+\./.test(x.id));
    const assessments = window.KV_ASSESSMENTS.filter((x) => /\.p2ch\d+\./.test(x.lessonId));
    const ids = assessments.map((x) => x.stableAssessmentId).sort();
    return { lessons: lessons.length, assessments: assessments.length, first: ids[0], last: ids[ids.length - 1], unique: new Set(ids).size };
  });
  expect(summary).toEqual({ lessons: 14, assessments: 70, first: 'KV-CBSE7-MATH-0081', last: 'KV-CBSE7-MATH-0150', unique: 70 });
});

test('Class 7 Maths Part II learner can check a typed answer and gets feedback', async ({ page }) => {
  await page.goto('/lesson/math.cbse7.ganita-prakash.p2ch7.equations-and-balance.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class7MathPart2 === 'ready');
  const answer = page.locator('#lc-answer');
  await expect(answer).toBeVisible();
  await answer.fill('6');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.locator('main')).toContainText('Correct');
});
