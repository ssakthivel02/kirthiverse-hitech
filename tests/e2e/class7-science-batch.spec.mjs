import { test, expect } from '@playwright/test';

const SCIENCE_IDS=[
  'science.cbse7.curiosity.ch2.acids-bases-indicators.v1','science.cbse7.curiosity.ch2.neutralisation-evidence.v1',
  'science.cbse7.curiosity.ch3.closed-circuits.v1','science.cbse7.curiosity.ch3.components-conductors.v1',
  'science.cbse7.curiosity.ch4.properties-evidence.v1','science.cbse7.curiosity.ch4.uses-properties.v1',
  'science.cbse7.curiosity.ch5.physical-chemical-evidence.v1','science.cbse7.curiosity.ch5.change-investigation.v1'
];
const ASSESSMENT_IDS=Array.from({length:20},(_,i)=>'KV-CBSE7-SCI-'+String(i+1).padStart(4,'0'));

async function waitForRuntime(page){
  await page.waitForFunction(()=>Boolean(window.KV_NAVIGATION&&window.KV_APP_RUNTIME&&window.KV_PROFILE_RUNTIME));
  await expect(page.locator('main')).toBeVisible();
}

test('Class 7 Science Chapters 2-5 release surface loads complete batch',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('/?release-closure=science');expect(response?.status()).toBe(200);await waitForRuntime(page);
  await page.waitForFunction(()=>[2,3,4,5].every(ch=>document.documentElement.dataset['class7ScienceChapter'+ch]==='ready'));
  const corpus=await page.evaluate(({ids,aids})=>{
    const lessons=window.KV_LESSONS||[],assessments=window.KV_ASSESSMENTS||[];
    const l=lessons.filter(x=>ids.includes(x.id)),a=assessments.filter(x=>aids.includes(x.stableAssessmentId));
    return {l:l.length,a:a.length,lessonIds:l.map(x=>x.id).sort(),assessmentIds:a.map(x=>x.stableAssessmentId).sort(),rights:l.map(x=>x.rightsStatus),assessmentRights:a.map(x=>x.rightsStatus)};
  },{ids:SCIENCE_IDS,aids:ASSESSMENT_IDS});
  expect(corpus.l).toBe(8);expect(corpus.a).toBe(20);
  expect(corpus.lessonIds).toEqual([...SCIENCE_IDS].sort());expect(corpus.assessmentIds).toEqual([...ASSESSMENT_IDS].sort());
  expect(corpus.rights.every(x=>x==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION')).toBe(true);
  expect(corpus.assessmentRights.every(x=>x==='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION')).toBe(true);
  expect(errors).toEqual([]);
});

for(const [chapter,lessonId,title] of [
  [2,'science.cbse7.curiosity.ch2.acids-bases-indicators.v1','Acids, Bases and Indicators'],
  [3,'science.cbse7.curiosity.ch3.closed-circuits.v1','Electric Circuits and Complete Paths'],
  [5,'science.cbse7.curiosity.ch5.physical-chemical-evidence.v1','Physical and Chemical Changes']
]){
  test('Class 7 Science Chapter '+chapter+' direct deep link loads batch runtime',async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto('/lesson/'+lessonId);expect(response?.status()).toBe(200);await waitForRuntime(page);
    await page.waitForFunction(({chapter,id})=>document.documentElement.dataset['class7ScienceChapter'+chapter]==='ready'&&window.KV_LESSONS?.some(x=>x.id===id)&&window.KV_ASSESSMENTS?.some(x=>x.lessonId===id),{chapter,id:lessonId});
    await expect(page.locator('main')).toContainText(title);expect(errors).toEqual([]);
  });
}
