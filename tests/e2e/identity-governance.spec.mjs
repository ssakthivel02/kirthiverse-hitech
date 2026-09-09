import { test, expect } from '@playwright/test';

const PROFILE_KEY = 'kirthiverse.hitech.profile.local.v2';

async function waitForIdentityRuntime(page) {
  await page.waitForFunction(() => Boolean(
    window.KV_NAVIGATION &&
    window.KV_PROFILE_RUNTIME &&
    window.KV_APP_RUNTIME
  ));
}

async function storageSnapshot(page) {
  return page.evaluate(() => ({
    local: Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
      .filter(Boolean)
      .sort()
      .map(key => [key, localStorage.getItem(key)]),
    session: Array.from({ length: sessionStorage.length }, (_, i) => sessionStorage.key(i))
      .filter(Boolean)
      .sort()
      .map(key => [key, sessionStorage.getItem(key)]),
  }));
}

function assertAllowedOrigins(urls, baseURL) {
  const allowed = new Set([
    new URL(baseURL).origin,
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]);
  const unexpected = [...new Set(urls.map(url => new URL(url).origin).filter(origin => !allowed.has(origin)))];
  expect(unexpected, `unexpected identity-surface origins: ${unexpected.join(', ')}`).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('profile roles are local/future-authorised and passive browsing does not mutate identity state', async ({ page, baseURL }) => {
  const pageErrors = [];
  const requests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => requests.push(request.url()));

  const response = await page.goto('/profile?identity-governance=1');
  expect(response?.status()).toBe(200);
  await waitForIdentityRuntime(page);

  await page.evaluate(({ key }) => {
    localStorage.setItem(key, JSON.stringify({
      displayName: 'QA Learner',
      agePath: '7–10',
      language: 'English + Tamil',
      preferredWorlds: ['tamil'],
      sessionGoal: 20,
    }));
    window.KV_NAVIGATION.navigate('/profile');
  }, { key: PROFILE_KEY });

  await page.waitForFunction(() =>
    location.pathname === '/profile' &&
    Boolean(document.querySelector('[data-profile-runtime="v26"]')) &&
    document.querySelector('#vm-name')?.value === 'QA Learner'
  );

  const runtime = await page.evaluate(() => ({
    localOnly: window.KV_PROFILE_RUNTIME?.localOnly,
    cloudIdentity: window.KV_PROFILE_RUNTIME?.cloudIdentity,
    silentUpload: window.KV_PROFILE_RUNTIME?.silentUpload,
    accountCreation: window.KV_PROFILE_RUNTIME?.accountCreation,
    dataDeletion: window.KV_PROFILE_RUNTIME?.dataDeletion,
    roles: window.KV_PROFILE_RUNTIME?.roles,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(runtime.localOnly).toBe(true);
  expect(runtime.cloudIdentity).toBe(false);
  expect(runtime.silentUpload).toBe(false);
  expect(runtime.accountCreation).toBe(false);
  expect(runtime.dataDeletion).toBe(false);
  expect(runtime.roles).toEqual(['learner', 'parent_guardian', 'student', 'teacher', 'school_admin']);
  expect(runtime.reducedMotion).toBe(true);
  expect(runtime.scrollWidth).toBeLessThanOrEqual(runtime.clientWidth + 2);

  await expect(page.locator('[data-role-experience="v1"]')).toHaveCount(1);
  await expect(page.locator('[data-claim-prep="v1"]')).toHaveCount(1);
  await expect(page.locator('[data-role]')).toHaveCount(5);
  await expect(page.locator('[data-role="parent"]')).toContainText('Future verified');
  await expect(page.locator('[data-role="teacher"]')).toContainText('Future authorised');
  await expect(page.locator('[data-role="school"]')).toContainText('Future authorised');
  await expect(page.locator('main')).toContainText('No upload · no account · no deletion · no silent migration now.');

  const before = await storageSnapshot(page);
  await page.locator('[data-role="parent"] summary').click();
  await page.locator('#kv-protection').click();
  await expect(page.locator('#kv-protection-details')).toHaveAttribute('open', '');
  const after = await storageSnapshot(page);
  expect(after).toEqual(before);

  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement);
  expect(focused).toBe(true);

  assertAllowedOrigins(requests, baseURL);
  expect(pageErrors, `uncaught identity page errors: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('educator route remains parent-gated local-only and does not create identity state while locked', async ({ page, baseURL }) => {
  const pageErrors = [];
  const requests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => requests.push(request.url()));

  const response = await page.goto('/educator?identity-governance=locked');
  expect(response?.status()).toBe(200);
  await waitForIdentityRuntime(page);
  await page.waitForFunction(() => location.pathname === '/educator');
  await expect(page.locator('main')).toContainText('Unlock Parent Space first');
  await expect(page.locator('main')).toContainText('It is not teacher authentication or a school account.');

  const before = await storageSnapshot(page);
  await expect(page.locator('a[href="/parent"]')).toBeVisible();
  const after = await storageSnapshot(page);
  expect(after).toEqual(before);

  const viewport = await page.evaluate(() => ({
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(viewport.reducedMotion).toBe(true);
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth + 2);

  assertAllowedOrigins(requests, baseURL);
  expect(pageErrors, `uncaught educator identity-boundary errors: ${pageErrors.join(' | ')}`).toEqual([]);
});
