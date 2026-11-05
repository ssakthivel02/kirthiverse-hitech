import { test, expect } from '@playwright/test';

const CH = [
  [1, 'questions-variables-fair-tests', 'Exploring the Investigative World of Science'],
  [2, 'microscope-and-cells', 'The Invisible Living World'],
  [3, 'health-and-balanced-diet', 'Health: The Ultimate Treasure'],
  [4, 'magnetic-effect-of-current', 'Electricity: Magnetic and Heating Effects'],
  [5, 'types-of-forces', 'Exploring Forces'],
  [6, 'pressure-in-solids-liquids-air', 'Pressure, Winds, Storms, and Cyclones'],
  [7, 'particles-of-matter', 'Particulate Nature of Matter'],
  [8, 'elements-and-compounds', 'Elements, Compounds, and Mixtures'],
  [9, 'solutions-and-solubility', 'Solutes, Solvents, and Solutions'],
  [10, 'reflection-and-mirrors', 'Light: Mirrors and Lenses'],
  [11, 'day-month-year-and-seasons', 'Keeping Time with the Skies'],
  [12, 'ecosystems-and-food-chains', 'How Nature Works in Harmony'],
  [13, 'earth-structure-and-atmosphere', 'Life Sustaining Planet'],
];

for (const [chapter, slug, title] of CH) {
  const lessonId = `science.cbse8.curiosity.ch${chapter}.${slug}.v1`;
  test(`Class 8 Science chapter ${chapter} direct deep link loads its lesson and assessments`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const response = await page.goto(`/lesson/${lessonId}`);
    expect(response?.status()).toBe(200);
    await page.waitForFunction(
      (id) => document.documentElement.dataset.class8Science === 'ready'
        && window.KV_LESSONS?.some((x) => x.id === id)
        && window.KV_ASSESSMENTS?.filter((x) => x.lessonId === id).length === 5,
      lessonId,
    );
    expect(new URL(page.url()).pathname).toBe(`/lesson/${lessonId}`);
    // The page renders the lesson title; the NCERT chapter title lives in the lesson record (chapterTitle).
    const lesson = await page.evaluate((id) => {
      const x = window.KV_LESSONS.find((l) => l.id === id);
      return { title: x.title, chapterTitle: x.chapterTitle };
    }, lessonId);
    expect(lesson.chapterTitle).toContain(title);
    await expect(page.locator('main')).toContainText(lesson.title);
    expect(errors).toEqual([]);
  });
}

test('Class 8 Science registers 25 lessons and 125 stable assessments', async ({ page }) => {
  await page.goto('/lesson/science.cbse8.curiosity.ch1.questions-variables-fair-tests.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class8Science === 'ready');
  const summary = await page.evaluate(() => {
    const lessons = window.KV_LESSONS.filter((x) => /^science\.cbse8\.curiosity\.ch\d+\./.test(x.id));
    const assessments = window.KV_ASSESSMENTS.filter((x) => /^KV-CBSE8-SCI-\d{4}$/.test(x.stableAssessmentId || ''));
    const ids = assessments.map((x) => x.stableAssessmentId).sort();
    return { lessons: lessons.length, assessments: assessments.length, first: ids[0], last: ids[ids.length - 1], unique: new Set(ids).size };
  });
  expect(summary).toEqual({ lessons: 25, assessments: 125, first: 'KV-CBSE8-SCI-0001', last: 'KV-CBSE8-SCI-0125', unique: 125 });
});

test('Class 8 Science learner can check a typed answer and gets feedback', async ({ page }) => {
  await page.goto('/lesson/science.cbse8.curiosity.ch1.questions-variables-fair-tests.v1');
  await page.waitForFunction(() => document.documentElement.dataset.class8Science === 'ready');
  const answer = page.locator('#lc-answer');
  await expect(answer).toBeVisible();
  await answer.fill('wrong guess');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.locator('main')).toContainText('Not quite');
});

test('Class 8 Science appears on the Science world and links back to it', async ({ page }) => {
  await page.goto('/world/science');
  await page.waitForFunction(() => document.documentElement.dataset.class8Science === 'ready');
  const link = page.locator('a[href="/lesson/science.cbse8.curiosity.ch5.types-of-forces.v1"]');
  await expect(link.first()).toBeVisible();
  await link.first().click();
  await expect(page.locator('main')).toContainText('Exploring Forces');
  await expect(page.getByRole('link', { name: /Back to Science/ })).toBeVisible();
});
