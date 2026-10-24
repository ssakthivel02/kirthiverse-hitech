import { test, expect } from '@playwright/test';

const PART1 = [
  [1, 'landforms-and-regions', 'India’s Landforms and Regions'],
  [2, 'elements-and-instruments', 'Reading the Weather'],
  [3, 'climate-and-monsoon', 'Climate, Seasons and the Monsoon'],
  [4, 'settlement-to-city', 'From Settlements to Cities and States'],
  [5, 'empire-and-administration', 'How Empires Grow and Govern'],
  [6, 'regional-powers-and-networks', 'Regional Powers and Changing Networks'],
  [7, 'arts-literature-and-learning', 'Creative Work in the Gupta Era'],
  [8, 'sacred-landscapes', 'Sacred Landscapes and Meaning'],
  [9, 'forms-of-government', 'Monarchy, Republic and Democratic Government'],
  [10, 'constitution-purpose', 'Why a Constitution Matters'],
  [11, 'barter-and-exchange', 'Barter, Needs and the Search for a Common Medium'],
  [12, 'buyers-sellers-and-price', 'Buyers, Sellers and How Prices Form'],
];

for (const [chapter, slug, title] of PART1) {
  const lessonId = `social-science.cbse7.exploring-society.p1ch${chapter}.${slug}.v1`;
  test(`Class 7 Social Science Part 1 chapter ${chapter} opens as a learner lesson`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(`/lesson/${lessonId}`);
    expect(response?.status()).toBe(200);
    await page.waitForFunction(id => document.documentElement.dataset.class7SocialSciencePart1 === 'ready'
      && window.KV_LESSONS?.some(x => x.id === id)
      && window.KV_ASSESSMENTS?.filter(x => x.lessonId === id).length === 5, lessonId);
    expect(new URL(page.url()).pathname).toBe(`/lesson/${lessonId}`);
    await expect(page.locator('main')).toContainText(title);
    await expect(page.locator('a.back')).toHaveAttribute('href', '/world/geography');
    expect(errors).toEqual([]);
  });
}

test('Class 7 Social Science Part 1 learner can check a typed response', async ({ page }) => {
  await page.goto('/lesson/social-science.cbse7.exploring-society.p1ch1.landforms-and-regions.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class7SocialSciencePart1 === 'ready');
  await page.locator('#lc-answer').fill('legend');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.locator('main')).toContainText('Correct');
});

test('Class 7 Social Science Part 1 registers 24 lessons and 120 distinct stable assessments', async ({ page }) => {
  await page.goto('/lesson/social-science.cbse7.exploring-society.p1ch1.landforms-and-regions.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class7SocialSciencePart1 === 'ready');
  const summary = await page.evaluate(() => {
    const lessons = window.KV_LESSONS.filter(x => x.id?.includes('social-science.cbse7.exploring-society.p1ch'));
    const assessments = window.KV_ASSESSMENTS.filter(x => /^KV-CBSE7-SOC-0(0(8[1-9]|9\d)|1\d\d|20\d)$/.test(x.stableAssessmentId || ''));
    const ids = assessments.map(x => x.stableAssessmentId).sort();
    return { lessons: lessons.length, assessments: assessments.length, first: ids[0], last: ids.at(-1), unique: new Set(ids).size, worlds: [...new Set(lessons.map(x => x.worldId))] };
  });
  expect(summary).toEqual({ lessons: 24, assessments: 120, first: 'KV-CBSE7-SOC-0081', last: 'KV-CBSE7-SOC-0200', unique: 120, worlds: ['geography'] });
});
