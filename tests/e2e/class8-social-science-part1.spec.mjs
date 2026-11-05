import { test, expect } from '@playwright/test';

const PART1 = [
  [1, 'nature-becomes-a-resource', 'Natural Resources and Their Use', 'geography'],
  [2, 'delhi-sultanate-and-vijayanagara', 'Reshaping India', 'history'],
  [3, 'shivaji-and-maratha-power', 'The Rise of the Marathas', 'history'],
  [4, 'europeans-and-the-company', 'The Colonial Era in India', 'history'],
  [5, 'universal-franchise-and-election-commission', 'Universal Franchise', 'geography'],
  [6, 'parliament-composition-and-lawmaking', 'The Parliamentary System', 'geography'],
  [7, 'land-labour-and-human-capital', 'Factors of Production', 'geography'],
];

for (const [chapter, slug, title] of PART1) {
  const lessonId = `social-science.cbse8.exploring-society.p1ch${chapter}.${slug}.v1`;
  test(`Class 8 Social Science Part 1 chapter ${chapter} direct deep link loads its lessons and assessments`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const response = await page.goto(`/lesson/${lessonId}`);
    expect(response?.status()).toBe(200);
    await page.waitForFunction(
      (id) => document.documentElement.dataset.class8SocialSciencePart1 === 'ready'
        && window.KV_LESSONS?.some((x) => x.id === id)
        && window.KV_ASSESSMENTS?.filter((x) => x.lessonId === id).length === 5,
      lessonId,
    );
    expect(new URL(page.url()).pathname).toBe(`/lesson/${lessonId}`);
    await expect(page.locator('main')).toContainText(title);
    expect(errors).toEqual([]);
  });
}

test('Class 8 Social Science Part 1 registers 14 lessons and 70 stable assessments', async ({ page }) => {
  await page.goto('/lesson/social-science.cbse8.exploring-society.p1ch1.nature-becomes-a-resource.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class8SocialSciencePart1 === 'ready');
  const summary = await page.evaluate(() => {
    const lessons = window.KV_LESSONS.filter((x) => /^social-science\.cbse8\.exploring-society\.p1ch\d+\./.test(x.id));
    const assessments = window.KV_ASSESSMENTS.filter((x) => /^KV-CBSE8-SOC-\d{4}$/.test(x.stableAssessmentId || ''));
    const ids = assessments.map((x) => x.stableAssessmentId).sort();
    return { lessons: lessons.length, assessments: assessments.length, first: ids[0], last: ids[ids.length - 1], unique: new Set(ids).size };
  });
  expect(summary).toEqual({ lessons: 14, assessments: 70, first: 'KV-CBSE8-SOC-0001', last: 'KV-CBSE8-SOC-0070', unique: 70 });
});

test('Class 8 Social Science Part 1 learner can check a typed answer and gets feedback', async ({ page }) => {
  await page.goto('/lesson/social-science.cbse8.exploring-society.p1ch1.nature-becomes-a-resource.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class8SocialSciencePart1 === 'ready');
  const answer = page.locator('#lc-answer');
  await expect(answer).toBeVisible();
  await answer.fill('Energy');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.locator('main')).toContainText('Correct');
});

test('Class 8 Social Science Part 1 appears on the Geography and History worlds and links back', async ({ page }) => {
  for (const [world, href, heading, back] of [
    ['geography', '/lesson/social-science.cbse8.exploring-society.p1ch6.parliament-composition-and-lawmaking.v1', 'The Parliamentary System', /Back to Geography/],
    ['history', '/lesson/social-science.cbse8.exploring-society.p1ch3.shivaji-and-maratha-power.v1', 'The Rise of the Marathas', /Back to History/],
  ]) {
    await page.goto(`/world/${world}`);
    await page.waitForFunction(() => document.documentElement.dataset.class8SocialSciencePart1 === 'ready');
    const link = page.locator(`a[href="${href}"]`);
    await expect(link.first()).toBeVisible();
    await link.first().click();
    await expect(page.locator('main')).toContainText(heading);
    await expect(page.getByRole('link', { name: back })).toBeVisible();
  }
});
