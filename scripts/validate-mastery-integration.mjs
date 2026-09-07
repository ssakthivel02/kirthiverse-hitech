import fs from 'node:fs';
const need=(ok,msg)=>{if(!ok)throw new Error(msg)};
const read=p=>fs.readFileSync(p,'utf8');
const visual=read('visual-controller-v27.js');
const app=read('app.js');
const practice=read('practice-arena.js');
const mastery=read('mastery-constellation.js');

need(visual.includes("a.href='/mastery.html'"),'visual master missing direct Mastery link');
need(visual.includes("data-mastery-entry=\"v1\"")||visual.includes("s.dataset.masteryEntry='v1'"),'Home/Progress mastery evidence card missing');
need(visual.includes("masteryConstellationDirectLink:true"),'Mastery direct-link runtime contract missing');
need(visual.includes("masteryHomeProgressCard:true"),'Home/Progress integration contract missing');
need(visual.includes('@media(max-width:720px)'),'Mastery integration mobile rule missing');
need(visual.includes('prefers-reduced-motion:reduce'),'Mastery integration reduced-motion rule missing');
need(visual.includes(':focus-visible'),'Mastery integration visible focus rule missing');
need(!app.includes('/mastery.html'),'app.js should remain untouched by Mastery integration');
need(practice.includes('href="/mastery.html"'),'Practice Arena must link to Mastery Constellation');
need(mastery.includes('href="/practice.html"'),'Mastery Constellation must link to Practice Arena');
need(!visual.includes("a.dataset.link='';a.innerHTML='✧ <span>Mastery</span>'"),'Mastery navigation must bypass SPA data-link routing');

console.log('MASTERY_INTEGRATION_CONTRACT_PASS: additive visual-controller integration, bidirectional Practice/Mastery links, mobile/focus/reduced-motion contracts');
