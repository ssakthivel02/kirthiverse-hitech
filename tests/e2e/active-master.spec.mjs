import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const CORE_ROUTES = [
  '/',
  '/worlds',
  '/search',
  '/progress',
  '/profile',
  '/diagnostic',
  '/speedlab',
  '/parent',
];

async function waitForRuntime(page) {
  await page.waitForFunction(() => Boolean(window.KV_NAVIGATION));
  await expect(page.locator('main')).toBeVisible();
}

async function navigate(page, route) {
  await page.evaluate(path => window.KV_NAVIGATION.navigate(path), route);
  await page.waitForFunction(path => window.location.pathname === path, route);
  await expect(page.locator('main')).toBeVisible();
  await expect.poll(async () => (await page.locator('main').innerText()).trim().length).toBeGreaterThan(0);
}

async function assertNoHorizontalOverflow(page, route) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 4);
  expect(overflow, `horizontal overflow on ${route}`).toBe(false);
}

test('HI-TECH runtime identity and canonical routes render without browser exceptions', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/');
  await waitForRuntime(page);

  await expect(page.locator('meta[name="kv-runtime-generation"]')).toHaveAttribute('content', 'CORE-RUNTIME-V30');
  const loadedCore = await page.evaluate(() =>
    [...document.scripts].some(script => new URL(script.src, location.href).pathname === '/core-runtime-v30.js'),
  );
  expect(loadedCore).toBe(true);

  for (const route of CORE_ROUTES) {
    await navigate(page, route);
    await assertNoHorizontalOverflow(page, route);
  }

  expect(pageErrors, `uncaught browser exceptions: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('direct diagnostic deep link reload resolves through the current SPA entrypoint', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  const response = await page.goto('/diagnostic?cross-browser=1');
  expect(response?.status()).toBe(200);
  await waitForRuntime(page);
  expect(new URL(page.url()).pathname).toBe('/diagnostic');
  await expect.poll(async () => (await page.locator('main').innerText()).trim().length).toBeGreaterThan(0);
  await assertNoHorizontalOverflow(page, '/diagnostic');
  expect(pageErrors, `uncaught browser exceptions: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('serious and critical WCAG findings are blocked on representative routes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith('mobile-'), 'Desktop engines provide the release accessibility scan; mobile projects cover layout/route behavior.');

  for (const route of ['/', '/diagnostic', '/parent']) {
    await page.goto(route);
    await waitForRuntime(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const severe = results.violations.filter(item => ['serious', 'critical'].includes(item.impact));
    const summary = severe.map(item => ({
      id: item.id,
      impact: item.impact,
      nodes: item.nodes.map(node => ({
        target: node.target,
        html: node.html,
        failureSummary: node.failureSummary,
      })),
      help: item.help,
    }));
    expect(summary, `serious/critical accessibility findings on ${route}: ${JSON.stringify(summary)}`).toEqual([]);
  }
});
