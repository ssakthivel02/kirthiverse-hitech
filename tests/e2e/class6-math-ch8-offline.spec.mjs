import { test, expect } from '@playwright/test';

const LESSON='math.cbse6.ganita-prakash.ch8.construct-squares-rectangles.v1';

test('Chapter 8 Mathematics lesson remains usable through the PWA with origin network unavailable',async({page,context})=>{
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto('/?ch8-offline=prime',{waitUntil:'domcontentloaded'});expect(response?.status()).toBe(200);
  await page.waitForFunction(()=>Boolean(window.KV_NAVIGATION&&window.KV_PWA&&document.documentElement.dataset.class6MathPilot==='ready'));
  await page.evaluate(()=>navigator.serviceWorker?.ready);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller&&window.KV_NAVIGATION&&document.documentElement.dataset.class6MathPilot==='ready'));
  const cached=await page.evaluate(async()=>{const c=await caches.open('kirthiverse-preview-v45');const required=['/p0-entry-v1.js','/data/class6-math-ch2.js','/data/class6-math-ch8-assessments.js'];const out={};for(const u of required)out[u]=Boolean(await c.match(u));return out;});
  expect(cached['/p0-entry-v1.js']).toBe(true);expect(cached['/data/class6-math-ch2.js']).toBe(true);expect(cached['/data/class6-math-ch8-assessments.js']).toBe(true);
  await context.setOffline(true);
  await page.evaluate(id=>window.KV_NAVIGATION.navigate('/lesson/'+id),LESSON);
  await page.waitForFunction(id=>location.pathname===`/lesson/${id}`&&Boolean(document.querySelector('main'))&&Boolean(document.getElementById('complete')),LESSON);
  await expect(page.locator('main')).toContainText('Construct Squares and Rectangles');
  await page.goto('/lesson/'+LESSON,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(id=>location.pathname===`/lesson/${id}`&&Boolean(document.getElementById('complete')),LESSON);
  await expect(page.locator('main')).toContainText('Playing with Constructions');
  expect(pageErrors,`uncaught browser exceptions: ${pageErrors.join(' | ')}`).toEqual([]);
});