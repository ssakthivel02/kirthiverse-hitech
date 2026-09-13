import { test, expect } from '@playwright/test';

const LESSON='math.cbse6.ganita-prakash.ch8.construct-squares-rectangles.v1';

test('Chapter 8 Mathematics lesson renders through SPA and direct routes across supported browsers',async({page})=>{
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto('/?ch8-cross-browser=prime',{waitUntil:'domcontentloaded'});expect(response?.status()).toBe(200);
  await page.waitForFunction(()=>Boolean(window.KV_NAVIGATION&&document.documentElement.dataset.class6MathPilot==='ready'));

  await page.evaluate(id=>window.KV_NAVIGATION.navigate('/lesson/'+id),LESSON);
  await page.waitForFunction(id=>location.pathname===`/lesson/${id}`&&Boolean(document.querySelector('main'))&&Boolean(document.getElementById('complete')),LESSON);
  await expect(page.locator('main')).toContainText('Construct Squares and Rectangles');
  await expect(page.locator('main')).toContainText('Playing with Constructions');

  const direct=await page.goto('/lesson/'+LESSON,{waitUntil:'domcontentloaded'});expect(direct?.status()).toBe(200);
  await page.waitForFunction(id=>location.pathname===`/lesson/${id}`&&Boolean(document.querySelector('main'))&&Boolean(document.getElementById('complete')),LESSON);
  await expect(page.locator('main')).toContainText('Construct Squares and Rectangles');
  await expect(page.locator('main')).toContainText('Playing with Constructions');
  expect(pageErrors,`uncaught browser exceptions: ${pageErrors.join(' | ')}`).toEqual([]);
});
