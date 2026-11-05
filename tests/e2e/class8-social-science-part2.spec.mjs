import { test, expect } from '@playwright/test';

const PART2 = [
  [1, 'oceans-currents-and-trenches', 'World Geography'],
  [2, 'reform-congress-and-the-partition-of-bengal', 'Long Road to Independence'],
  [3, 'stupas-caves-water-and-temples', 'Indian Architecture'],
  [4, 'law-justice-and-court-system', 'Role of the Judiciary'],
  [5, 'citizen-and-fundamental-rights', 'Citizenship'],
  [6, 'demography-and-population-change', 'Dynamics of Population'],
  [7, 'cities-density-and-economy', 'Urban Landscape'],
  [8, 'bhakti-sufism-music-painting-and-gardens', 'Cultural Currents'],
];

for (const [chapter, slug, title] of PART2) {
  const lessonId = `social-science.cbse8.exploring-society.p2ch${chapter}.${slug}.v1`;
  test(`Class 8 Social Science Part 2 chapter ${chapter} direct deep link loads its lessons and assessments`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const response = await page.goto(`/lesson/${lessonId}`);
    expect(response?.status()).toBe(200);
    await page.waitForFunction(
      (id) => document.documentElement.dataset.class8SocialSciencePart2 === 'ready'
        && window.KV_LESSONS?.some((x) => x.id === id)
        && window.KV_ASSESSMENTS?.filter((x) => x.lessonId === id).length === 5,
      lessonId,
    );
    expect(new URL(page.url()).pathname).toBe(`/lesson/${lessonId}`);
    await expect(page.locator('main')).toContainText(title);
    expect(errors).toEqual([]);
  });
}

test('Class 8 Social Science Part 2 registers 16 lessons and 80 stable assessments without loading Part 1 on a Part 2 route', async ({ page }) => {
  await page.goto('/lesson/social-science.cbse8.exploring-society.p2ch1.oceans-currents-and-trenches.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class8SocialSciencePart2 === 'ready');
  const summary = await page.evaluate(() => {
    const lessons = window.KV_LESSONS.filter((x) => /^social-science\.cbse8\.exploring-society\.p2ch\d+\./.test(x.id));
    const assessments = window.KV_ASSESSMENTS.filter((x) => /\.p2ch\d+\./.test(x.lessonId || '') && /^KV-CBSE8-SOC-\d{4}$/.test(x.stableAssessmentId || ''));
    const ids = assessments.map((x) => x.stableAssessmentId).sort();
    return { lessons: lessons.length, assessments: assessments.length, first: ids[0], last: ids[ids.length - 1], unique: new Set(ids).size, part1Loaded: window.KV_LESSONS.some((x) => /\.p1ch\d+\./.test(x.id)) };
  });
  expect(summary).toEqual({ lessons: 16, assessments: 80, first: 'KV-CBSE8-SOC-0071', last: 'KV-CBSE8-SOC-0150', unique: 80, part1Loaded: false });
});

test('Class 8 Social Science Part 2 learner can check a typed answer and gets feedback', async ({ page }) => {
  await page.goto('/lesson/social-science.cbse8.exploring-society.p2ch1.oceans-currents-and-trenches.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class8SocialSciencePart2 === 'ready');
  const answer = page.locator('#lc-answer');
  await expect(answer).toBeVisible();
  await answer.fill('Pacific');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.locator('main')).toContainText('Correct');
});

test('Class 8 Social Science Part 2 appears on the Geography and History worlds and links back', async ({ page }) => {
  for (const [world, href, heading, back] of [
    ['geography', '/lesson/social-science.cbse8.exploring-society.p2ch6.demography-and-population-change.v1', 'Dynamics of Population', /Back to Geography/],
    ['history', '/lesson/social-science.cbse8.exploring-society.p2ch2.reform-congress-and-the-partition-of-bengal.v1', 'Long Road to Independence', /Back to History/],
  ]) {
    await page.goto(`/world/${world}`);
    await page.waitForFunction(() => document.documentElement.dataset.class8SocialSciencePart1 === 'ready' && document.documentElement.dataset.class8SocialSciencePart2 === 'ready');
    const link = page.locator(`a[href="${href}"]`);
    await expect(link.first()).toBeVisible();
    await link.first().click();
    await expect(page.locator('main')).toContainText(heading);
    await expect(page.getByRole('link', { name: back })).toBeVisible();
  }
});
