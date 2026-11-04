import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The authored kikiTeaching/remediation fields must be visible only where the lesson has them.
// Synthetic browser state only; no actual learner data.
const WITH_DATA = [
  'science.cbse6.curiosity.ch1.observation-questions.v1',
  'math.cbse6.ganita-prakash.ch10.integers-number-line.v1',
  'social-science.cbse6.exploring-society.ch7.buddhism-jainism.v1',
  'math.cbse7.ganita-prakash.ch1.place-value-estimation.v1',
  'science.cbse7.curiosity.ch6.hormones-health.v1',
];
const openLesson = async (page, id, lang = 'English') => {
  await page.addInitScript((language) => localStorage.setItem('kirthiverse.hitech.profile.local.v2', JSON.stringify({language})), lang);
  const response = await page.goto(`/lesson/${id}`);
  expect(response?.status()).toBe(200);
  await page.locator('.lesson-head').waitFor();
  await page.waitForLoadState('networkidle');
};
for (const id of WITH_DATA) {
  test(`Kiki panel contains the authored guidance for ${id}`, async ({page}) => {
    await openLesson(page, id);
    const panel = page.locator('[data-kiki-teaching="v1"]');
    await expect(panel).toHaveCount(1);
    const authored = await page.evaluate((lessonId) => {
      const lesson = window.KV_LESSONS.find((l) => l.id === lessonId);
      return {intro: lesson.kikiTeaching.intro, recap: lesson.kikiTeaching.recap, trigger: lesson.remediation.trigger};
    }, id);
    await expect(panel.locator('.kv-teach-intro')).toHaveText(authored.intro);
    const details = panel.locator('details');
    expect(await details.count()).toBeGreaterThan(1);
    await details.nth(3).locator('summary').click();
    await expect(details.nth(3)).toContainText(authored.recap);
    await details.last().locator('summary').click();
    await expect(details.last()).toContainText(authored.trigger);
  });
}
test('Tamil preference supplies bilingual headings without claiming translated lessons', async ({page}) => {
  await openLesson(page, WITH_DATA[0], 'English + Tamil');
  const panel = page.locator('[data-kiki-teaching]');
  await expect(panel.locator('[lang="ta"]').first()).toBeVisible();
  await expect(panel.getByText('இந்தப் பாடத்திற்கான கிகியின் வழிகாட்டி')).toBeVisible();
});
test('no Kiki teaching panel appears on a lesson without authored teaching', async ({page}) => {
  await openLesson(page, 'math.number.place-value.base10.age6-8.l1');
  await expect(page.locator('[data-kiki-teaching]')).toHaveCount(0);
});
test('panel is absent from unrelated routes and release audit', async ({page}) => {
  await page.goto('/worlds');
  await page.waitForLoadState('networkidle');
  expect(await page.locator('script[data-kiki-teaching-runtime]').count()).toBe(0);
  await page.goto('/?release-closure=1');
  await page.waitForLoadState('networkidle');
  expect(await page.locator('[data-kiki-teaching]').count()).toBe(0);
});
test('lesson panel passes focused accessibility scan', async ({page}) => {
  await openLesson(page, WITH_DATA[0]);
  const panel = page.locator('[data-kiki-teaching]');
  await expect(panel).toBeVisible();
  const res = await new AxeBuilder({page}).include('[data-kiki-teaching]').analyze();
  expect(res.violations).toEqual([]);
});
test('Kiki panel uses safe text nodes for author guidance', async ({page}) => {
  await openLesson(page, WITH_DATA[0]);
  const safe = await page.evaluate(() => {
    const b = window.KV_LESSON_TEACHING.build({
      id:'synthetic.test',
      kikiTeaching:{intro:'<img src=x onerror=alert(1)>',priorKnowledge:'<script>evil()</script>'},
      remediation:{trigger:'<svg onload=alert(1)>'}
    });
    return {html:b.outerHTML, text:b.textContent};
  });
  expect(safe.text).toContain('<img src=x onerror=alert(1)>');
  expect(safe.html).not.toContain('<img src=x onerror=');
  expect(safe.html).not.toContain('<script>evil()');
});
