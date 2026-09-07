import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const canonicalLesson = 'math.number.place-value.base10.age6-8.l1'

function captureRuntimeErrors(page) {
  const errors = []
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
  })
  return errors
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }))
  expect(overflow.scroll, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.viewport + 2)
}

test('home, bilingual shell and navigation are healthy', async ({ page }) => {
  const errors = captureRuntimeErrors(page)
  await page.goto('/')
  await expect(page.locator('main')).toBeVisible()
  await expect(page.getByText('KirthiVerse', { exact: true }).first()).toBeVisible()
  await expect(page.locator('header nav a[href="/practice"]')).toBeVisible()
  await expect(page.locator('header nav a[href="/worlds"]')).toBeVisible()
  await expect(page.locator('body')).toContainText(/[஀-௿]/)
  await expectNoHorizontalOverflow(page)
  expect(errors).toEqual([])
})

test('direct lesson deep link survives reload and keeps Kiki local-only', async ({ page }) => {
  const errors = captureRuntimeErrors(page)
  await page.goto(`/lesson/${canonicalLesson}`)
  await expect(page.locator('main')).toBeVisible()
  await expect(page.locator('.lesson-content label', { hasText: '01 // LEARNING OBJECTIVE' })).toBeVisible()
  await expect(page.locator('.lesson-content label', { hasText: '04 // VERIFIED PRACTICE' })).toBeVisible()
  await expect(page.locator('[data-teacher="v2"]')).toHaveCount(1)
  await expect(page.locator('[data-teacher-message]')).toContainText('I’m Kiki, your KirthiVerse guide')
  await page.reload()
  await expect(page.locator('[data-teacher="v2"]')).toHaveCount(1)
  await expect(page).toHaveURL(new RegExp(`/lesson/${canonicalLesson}`))
  const privacy = await page.evaluate(() => window.KV_TEACHER_RUNTIME)
  expect(privacy?.name).toBe('Kiki')
  expect(privacy?.localOnly).toBe(true)
  expect(privacy?.camera).toBe(false)
  expect(privacy?.microphone).toBe(false)
  expect(privacy?.recording).toBe(false)
  expect(errors).toEqual([])
})

test('Kiki Practice Arena completes a private adaptive practice loop', async ({ page }) => {
  const errors = captureRuntimeErrors(page)
  await page.goto('/practice')
  await expect(page.getByRole('heading', { name: /Short missions\. Real understanding/i })).toBeVisible()
  await expect(page.getByText(/No public leaderboard\. No ads\. No chat\./i)).toBeVisible()
  await expect(page.locator('#practice-calm')).toBeChecked()

  await page.locator('[data-practice-start="3"]').click()
  await expect(page.locator('.assessment').filter({ has: page.locator('[data-practice-result]') })).toBeVisible()
  await expect(page.locator('#practice-status')).toContainText('Calm Mode')
  await expect(page.locator('#practice-answer summary')).toBeVisible()
  await page.locator('#practice-answer summary').click()
  await expect(page.locator('#practice-answer .answer')).toBeVisible()

  const lessonId = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('kirthiverse.hitech.practice.v1'))
    const assessmentIndex = state.active.indexes[state.active.index]
    return window.KV_ASSESSMENTS[assessmentIndex].lessonId
  })

  await page.locator('[data-practice-result="practice"]').click()
  const confidence = await page.evaluate(id => JSON.parse(localStorage.getItem('kirthiverse.hitech.confidence.v1'))[id], lessonId)
  expect(confidence?.value).toBe('practice')

  await page.locator('[data-practice-end]').click()
  await expect(page.getByRole('heading', { name: /Short missions\. Real understanding/i })).toBeVisible()
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem('kirthiverse.hitech.practice.v1')).sessions.at(-1))
  expect(session.reviewed).toBeGreaterThanOrEqual(1)
  expect(session.needsPractice).toBeGreaterThanOrEqual(1)
  expect(session.endedEarly).toBe(true)

  await page.goto('/progress')
  await expect(page.locator('[data-practice-history="v1"]')).toBeVisible()
  expect(errors).toEqual([])
})

test('lesson completion persists locally and appears in progress', async ({ page }) => {
  const errors = captureRuntimeErrors(page)
  await page.goto(`/lesson/${canonicalLesson}`)
  const complete = page.locator('#complete')
  if (await complete.isEnabled()) await complete.click()
  const persisted = await page.evaluate(id => JSON.parse(localStorage.getItem('kirthiverse.hitech.static.progress.v2')).completed.includes(id), canonicalLesson)
  expect(persisted).toBe(true)
  await page.goto('/progress')
  await expect(page.getByText(/MISSION COMPLETE/i).first()).toBeVisible()
  expect(errors).toEqual([])
})

test('search returns canonical results without route breakage', async ({ page }) => {
  const errors = captureRuntimeErrors(page)
  await page.goto('/search')
  const input = page.locator('#q')
  await input.fill('Science')
  await expect(page.locator('#results a').first()).toBeVisible()
  await page.locator('#results a').first().click()
  await expect(page).toHaveURL(/\/lesson\//)
  await expect(page.locator('main')).toBeVisible()
  expect(errors).toEqual([])
})

test('critical routes have no serious or critical automated accessibility violations', async ({ page }) => {
  for (const route of ['/', '/worlds', '/practice', '/progress', `/lesson/${canonicalLesson}`]) {
    await page.goto(route)
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = result.violations.filter(v => ['serious', 'critical'].includes(v.impact))
    expect(blocking, `${route}: ${blocking.map(v => `${v.id}(${v.nodes.length})`).join(', ')}`).toEqual([])
  }
})

test('reduced-motion preference disables animated Kiki movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`/lesson/${canonicalLesson}`)
  const avatar = page.locator('.kt-avatar')
  await expect(avatar).toBeVisible()
  const animation = await avatar.evaluate(node => getComputedStyle(node).animationName)
  expect(animation).toBe('none')
})

test('mobile layout has no unintended horizontal overflow', async ({ page }) => {
  const viewport = page.viewportSize()
  test.skip(!viewport || viewport.width > 500, 'Mobile-only layout guard')
  for (const route of ['/', '/worlds', '/practice', '/progress', `/lesson/${canonicalLesson}`]) {
    await page.goto(route)
    await expectNoHorizontalOverflow(page)
  }
})
