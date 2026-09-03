(()=>{
  const CANDIDATE='MANUS-VISUAL-MASTER-05';
  const checks=[];
  const add=(name,pass,detail,critical=true)=>checks.push({name,pass:!!pass,detail,critical});
  const L=window.KV_LESSONS||[],A=window.KV_ASSESSMENTS||[],uniq=x=>new Set(x).size===x.length;
  add('Candidate marker',document.documentElement.dataset.visualCandidate===CANDIDATE,document.documentElement.dataset.visualCandidate||'missing');
  add('Shared runtime lifecycle',window.KV_RUNTIME_LIFECYCLE?.candidate===CANDIDATE,window.KV_RUNTIME_LIFECYCLE?.candidate||'missing');
  add('Experience event lifecycle',window.KV_EXPERIENCE_LIFECYCLE==='kv:rendered',window.KV_EXPERIENCE_LIFECYCLE||'missing');
  add('Intelligence event lifecycle',window.KV_INTELLIGENCE_LIFECYCLE==='kv:rendered',window.KV_INTELLIGENCE_LIFECYCLE||'missing');
  add('Cockpit event lifecycle',window.KV_COCKPIT_LIFECYCLE==='kv:rendered',window.KV_COCKPIT_LIFECYCLE||'missing');
  add('Canonical lessons',L.length===135,`${L.length}/135`);add('Canonical assessments',A.length===72,`${A.length}/72`);
  add('Unique lesson IDs',uniq(L.map(x=>x.id)),`${new Set(L.map(x=>x.id)).size}/${L.length}`);add('Unique assessment IDs',uniq(A.map(x=>x.id)),`${new Set(A.map(x=>x.id)).size}/${A.length}`);
  add('Profile route controller',!!window.KV_VISUAL_PAGES,'local-only profile route');add('Visual master controller',!!window.KV_VISUAL_MASTER,'visual donor layer');
  add('Manus runtime absent',!document.documentElement.innerHTML.match(/__manus__|manus-storage|vite-plugin-manus-runtime/i),'DOM scan');
  add('Local storage',(()=>{try{const k='kv.preview.test';localStorage.setItem(k,'1');const ok=localStorage.getItem(k)==='1';localStorage.removeItem(k);return ok}catch{return false}})(),'write/read/delete');
  add('History API',!!history?.pushState,'SPA navigation');add('Tamil corpus',L.some(x=>/[\u0B80-\u0BFF]/.test(JSON.stringify(x))),'Unicode sample');
  add('Reduced motion capability',!!matchMedia('(prefers-reduced-motion: reduce)'),'media query',false);add('Minimum viewport signal',innerWidth>=320,`${innerWidth}x${innerHeight}`);
  const pass=checks.filter(x=>x.critical).every(x=>x.pass);window.KV_VISUAL_PREVIEW_GATE={candidate:CANDIDATE,verdict:pass?'PREVIEW_READY':'HOLD',checks,manualRequired:true,productionAllowed:false};console.info('[KirthiVerse visual preview gate]',window.KV_VISUAL_PREVIEW_GATE);
})();