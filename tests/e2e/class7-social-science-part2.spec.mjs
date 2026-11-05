import { test, expect } from '@playwright/test';

const PART2 = [
  [1, 'seasons-soil-water', 'Seasons, Soil and Water'],
  [2, 'land-neighbours', 'Land Neighbours'],
  [3, 'post-gupta-kingdoms-north', 'Harshavardhana and the Tripartite Struggle'],
  [4, 'northern-invasions-ghurids', 'Ghaznavids, Rajput Powers and the Ghurids'],
  [5, 'communities-arrive', 'Communities That Made India Home'],
  [6, 'state-government-republic', 'State, Government, Democracy and Republic'],
  [7, 'physical-infrastructure', 'Roads, Rails, Ports, Air Routes and Communications'],
  [8, 'banks-deposits-loans', 'Deposits, Loans and Compounding'],
];

for (const [chapter, slug, title] of PART2) {
  const lessonId = `social-science.cbse7.exploring-society.p2ch${chapter}.${slug}.v1`;
  test(`Class 7 Social Science Part 2 chapter ${chapter} direct deep link loads its lessons and assessments`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const response = await page.goto(`/lesson/${lessonId}`);
    expect(response?.status()).toBe(200);
    await page.waitForFunction(
      (id) => document.documentElement.dataset.class7SocialSciencePart2 === 'ready'
        && window.KV_LESSONS?.some((x) => x.id === id)
        && window.KV_ASSESSMENTS?.filter((x) => x.lessonId === id).length === 5,
      lessonId,
    );
    expect(new URL(page.url()).pathname).toBe(`/lesson/${lessonId}`);
    await expect(page.locator('main')).toContainText(title);
    expect(errors).toEqual([]);
  });
}

test('Class 7 Social Science Part 2 registers 16 lessons and 80 stable assessments', async ({ page }) => {
  await page.goto('/lesson/social-science.cbse7.exploring-society.p2ch1.seasons-soil-water.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class7SocialSciencePart2 === 'ready');
  const summary = await page.evaluate(() => {
    const lessons = window.KV_LESSONS.filter((x) => x.id.startsWith('social-science.cbse7.'));
    const assessments = window.KV_ASSESSMENTS.filter((x) => x.stableAssessmentId?.startsWith('KV-CBSE7-SOC-'));
    const ids = assessments.map((x) => x.stableAssessmentId).sort();
    return { lessons: lessons.length, assessments: assessments.length, first: ids[0], last: ids[ids.length - 1], unique: new Set(ids).size, worlds: [...new Set(lessons.map((x) => x.worldId))] };
  });
  expect(summary).toEqual({ lessons: 16, assessments: 80, first: 'KV-CBSE7-SOC-0001', last: 'KV-CBSE7-SOC-0080', unique: 80, worlds: ['geography'] });
});

test('Class 7 Social Science Part 2 learner can check a typed answer and gets feedback', async ({ page }) => {
  await page.goto('/lesson/social-science.cbse7.exploring-society.p2ch1.seasons-soil-water.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class7SocialSciencePart2 === 'ready');
  const answer = page.locator('#lc-answer');
  await expect(answer).toBeVisible();
  await answer.fill('kharif crops');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.locator('main')).toContainText('Correct');
});
