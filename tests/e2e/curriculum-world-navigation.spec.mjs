import { test, expect } from '@playwright/test';

const CASES = [
  { world: 'mathematics', label: 'Mathematics', dataset: 'class6MathPilot', prefix: 'math.cbse6.ganita-prakash.' },
  { world: 'science', label: 'Science', dataset: 'class6SciencePilot', prefix: 'science.cbse6.curiosity.' }
];

for (const item of CASES) {
  test(`lazy-loaded Class 6 ${item.label} lessons appear in their world and return there`, async ({ page }) => {
    await page.goto(`/world/${item.world}`);
    await page.waitForFunction(({ dataset, prefix }) =>
      document.documentElement.dataset[dataset] === 'ready' &&
      window.KV_LESSONS?.some(lesson => lesson.id.startsWith(prefix)),
      { dataset: item.dataset, prefix: item.prefix }
    );

    const lessonId = await page.evaluate(prefix =>
      window.KV_LESSONS.find(lesson => lesson.id.startsWith(prefix) && lesson.worldId)?.id,
      item.prefix
    );
    expect(lessonId).toBeTruthy();
    await expect(page.locator(`a[href="/lesson/${lessonId}"]`).first()).toBeVisible();

    await page.goto(`/lesson/${lessonId}`);
    const backLink = page.locator('a.back');
    await expect(backLink).toHaveAttribute('href', `/world/${item.world}`);
    await expect(backLink).toContainText(`Back to ${item.label}`);
  });
}
