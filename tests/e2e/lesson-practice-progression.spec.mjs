import { test, expect } from '@playwright/test';

const LESSON='/lesson/math.cbse7.ganita-prakash.p2ch1.congruent-figures-correspondence.v1';

test('practice cycles between authored assessment questions and updates prompt',async({page})=>{
  await page.goto(LESSON);
  const root=page.locator('[data-lesson-practice="v2"]');
  await expect(root).toBeVisible();
  const prompt=page.locator('.lesson-content .assessment h3');
  const first=await prompt.textContent();
  await expect(root).toContainText('Question 1 of');
  await root.getByRole('button',{name:'Next'}).click();
  await expect(root).toContainText('Question 2 of');
  expect(await prompt.textContent()).not.toEqual(first);
  await root.getByRole('button',{name:'Previous'}).click();
  await expect(root).toContainText('Question 1 of');
  expect(await prompt.textContent()).toEqual(first);
});

test('correct multiple choice answer accepted by option letter and stored under stable assessment ID',async({page})=>{
  await page.goto(LESSON);
  const root=page.locator('[data-lesson-practice="v2"]');
  await expect(root).toBeVisible();
  const data=await page.evaluate(()=>{
    const lessonId=decodeURIComponent(location.pathname.split('/')[2]||'');
    const questions=window.KV_ASSESSMENTS.filter(a=>a.lessonId===lessonId&&a.correctAnswer);
    const index=questions.findIndex(a=>Array.isArray(a.options)&&a.options.length>0);
    const a=questions[index],correctIndex=a.options.findIndex(o=>String(o).toLowerCase().trim().replace(/^[a-z][).:-]\s*/i,'')===String(a.correctAnswer).toLowerCase().trim());
    return {index,letter:String.fromCharCode(65+correctIndex),id:a.stableAssessmentId};
  });
  expect(data.index).toBeGreaterThanOrEqual(0);expect(data.letter).toMatch(/^[A-D]$/);
  for(let i=0;i<data.index;i++)await root.getByRole('button',{name:'Next'}).click();
  await root.locator('#lc-answer').fill(data.letter);
  await root.locator('#lc-form button[type=submit]').click();
  await expect(root.locator('#lc-status')).toContainText('Correct');
  const stored=await page.evaluate(id=>JSON.parse(localStorage.getItem('kirthiverse.hitech.lessoncheck.v1'))?.[id],decodeURIComponent(new URL(page.url()).pathname.split('/')[2]));
  expect(stored.correct).toBe(true);
  expect(stored.questions[data.id].verifiedCorrect).toBe(true);
});

test('question progression retains local state after navigation and reload',async({page})=>{
  await page.goto(LESSON);
  const root=page.locator('[data-lesson-practice="v2"]');
  await expect(root).toBeVisible();
  const lessonId=decodeURIComponent(new URL(page.url()).pathname.split('/')[2]);
  const attempts=()=>page.evaluate(id=>JSON.parse(localStorage.getItem('kirthiverse.hitech.lessoncheck.v1')||'{}')?.[id]?.attempts||0,lessonId);
  await root.locator('#lc-answer').fill('intentionally wrong answer');
  await root.locator('#lc-form button[type=submit]').click();
  await expect.poll(attempts).toBe(1);
  await root.getByRole('button',{name:'Next'}).click();
  await expect(root).toContainText('Question 2 of');
  await root.locator('#lc-answer').fill('another intentionally wrong answer');
  await root.locator('#lc-form button[type=submit]').click();
  await expect.poll(attempts).toBe(2);
  const stateBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('kirthiverse.hitech.lessoncheck.v1')));
  await page.reload();await expect(page.locator('[data-lesson-practice="v2"]')).toBeVisible();
  const stateAfter=await page.evaluate(()=>JSON.parse(localStorage.getItem('kirthiverse.hitech.lessoncheck.v1')));
  expect(stateAfter).toEqual(stateBefore);
  const id=decodeURIComponent(new URL(page.url()).pathname.split('/')[2]);
  expect(stateAfter[id].attempts).toBe(2);
  expect(Object.keys(stateAfter[id].questions).length).toBe(2);
});

test('open-ended response is self-rated and never recorded as automatically verified',async({page})=>{
  await page.goto(LESSON);
  await page.waitForSelector('[data-lesson-practice="v2"]');
  const id=decodeURIComponent(new URL(page.url()).pathname.split('/')[2]);
  await page.evaluate(lessonId=>{
    const a=window.KV_ASSESSMENTS.find(x=>x.lessonId===lessonId);
    a.assessmentType='open_ended';
    a.correctAnswer='A considered example supported with evidence and personal explanation.';
    localStorage.removeItem('kirthiverse.hitech.lessoncheck.v1');
    document.querySelector('.assessment').removeAttribute('data-check-injected');
    document.querySelector('[data-lesson-practice]').remove();
    window.dispatchEvent(new Event('kv:rendered'));
  },id);
  const root=page.locator('[data-lesson-practice="v2"]');
  await expect(root).toBeVisible();
  await expect(root.locator('#lc-form button[type=submit]')).toHaveText('Compare answer');
  await root.locator('#lc-answer').fill('A considered response');
  await root.locator('#lc-form button[type=submit]').click();
  await expect(root).toContainText('self-reflection');
  await root.getByRole('button',{name:'I understand'}).click();
  const record=await page.evaluate(lessonId=>JSON.parse(localStorage.getItem('kirthiverse.hitech.lessoncheck.v1'))?.[lessonId],id);
  expect(record.correct).toBe(false);
  const values=Object.values(record.questions);
  expect(values[0].verifiedCorrect).toBe(false);
  expect(values[0].selfRating).toBe('understood');
});
