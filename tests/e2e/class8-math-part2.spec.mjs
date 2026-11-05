import { test, expect } from '@playwright/test';

const PART2 = [
  [1, 'profit-loss-and-discount', 'Profit, Loss and Discount'],
  [2, 'pythagoras-theorem', 'Sides of a Right Triangle'],
  [3, 'pie-charts', 'Pie Charts'],
  [4, 'solids-faces-edges-vertices', 'Solids, Faces, Edges and Vertices'],
  [5, 'mean-as-fair-share', 'The Mean as a Fair Share'],
  [6, 'forming-equations', 'Forming and Solving Equations from Situations'],
  [7, 'area-triangle-parallelogram', 'Triangles and Parallelograms'],
];

for (const [chapter, slug, title] of PART2) {
  const lessonId = `math.cbse8.ganita-prakash.p2ch${chapter}.${slug}.v1`;
  test(`Class 8 Maths Part II chapter ${chapter} direct deep link loads its lessons and assessments`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const response = await page.goto(`/lesson/${lessonId}`);
    expect(response?.status()).toBe(200);
    await page.waitForFunction(
      (id) => document.documentElement.dataset.class8MathPart2 === 'ready'
        && window.KV_LESSONS?.some((x) => x.id === id)
        && window.KV_ASSESSMENTS?.filter((x) => x.lessonId === id).length === 5,
      lessonId,
    );
    expect(new URL(page.url()).pathname).toBe(`/lesson/${lessonId}`);
    await expect(page.locator('main')).toContainText(title);
    expect(errors).toEqual([]);
  });
}

test('Class 8 Maths Part II registers 14 lessons and 70 stable assessments without touching Part I ids', async ({ page }) => {
  await page.goto('/lesson/math.cbse8.ganita-prakash.p2ch1.profit-loss-and-discount.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class8MathPart2 === 'ready');
  const summary = await page.evaluate(() => {
    const lessons = window.KV_LESSONS.filter((x) => /^math\.cbse8\.ganita-prakash\.p2ch\d+\./.test(x.id));
    const assessments = window.KV_ASSESSMENTS.filter((x) => /\.p2ch\d+\./.test(x.lessonId || '') && /^KV-CBSE8-MATH-\d{4}$/.test(x.stableAssessmentId || ''));
    const ids = assessments.map((x) => x.stableAssessmentId).sort();
    return { lessons: lessons.length, assessments: assessments.length, first: ids[0], last: ids[ids.length - 1], unique: new Set(ids).size, part1Loaded: window.KV_LESSONS.some((x) => x.id.startsWith('math.cbse8.ganita-prakash.ch')) };
  });
  expect(summary).toEqual({ lessons: 14, assessments: 70, first: 'KV-CBSE8-MATH-0071', last: 'KV-CBSE8-MATH-0140', unique: 70, part1Loaded: false });
});

test('Class 8 Maths Part II learner can check a typed answer and gets feedback', async ({ page }) => {
  await page.goto('/lesson/math.cbse8.ganita-prakash.p2ch1.profit-loss-and-discount.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class8MathPart2 === 'ready');
  const answer = page.locator('#lc-answer');
  await expect(answer).toBeVisible();
  await answer.fill('15');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.locator('main')).toContainText('Correct');
});

test('Class 8 Maths Part II appears on the Mathematics world and links back to it', async ({ page }) => {
  await page.goto('/world/mathematics');
  await page.waitForFunction(() => document.documentElement.dataset.class8MathPart1 === 'ready' && document.documentElement.dataset.class8MathPart2 === 'ready');
  const link = page.locator('a[href="/lesson/math.cbse8.ganita-prakash.p2ch2.pythagoras-theorem.v1"]');
  await expect(link.first()).toBeVisible();
  await link.first().click();
  await expect(page.locator('main')).toContainText('Sides of a Right Triangle');
  await expect(page.getByRole('link', { name: /Back to Mathematics/ })).toBeVisible();
});
