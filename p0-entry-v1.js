/* KirthiVerse P0 entry points v9 — core funding-readiness extensions + controlled Class 6 curriculum pilots.
   Loads Educator Pilot + Pilot Metrics + P4 Readiness + P5 Controlled Run modules without modifying app.js.
   Loads CBSE Class 6 Mathematics and Science slices additively into the existing lesson/assessment arrays.
   Migration history: CBSE6-SCI-CH7-1 used lazy ch(?:4|5|6|7); CBSE6-SCI-CH8-2 used lazy ch(?:3|4|5|6|7|8); CBSE6-SCI-CH9-1 used lazy ch(?:2|3|4|5|6|7|8|9). */
(()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function loadAddon({tag,css,js,version}){if(css&&!document.querySelector(`link[data-${tag}]`)){const l=document.createElement('link');l.rel='stylesheet';l.href=`/${css}?v=${version}`;l.setAttribute(`data-${tag}`,'style');document.head.appendChild(l)}if(js&&!document.querySelector(`script[data-${tag}]`)){const s=document.createElement('script');s.async=false;s.src=`/${js}?v=${version}`;s.setAttribute(`data-${tag}`,'script');document.body.appendChild(s)}}
  const loadEducatorPilot=()=>loadAddon({tag:'ep-pilot',css:'educator-pilot-v1.css',js:'educator-pilot-v1.js',version:'EDUCATOR-PILOT-1'});
  const loadPilotMetrics=()=>loadAddon({tag:'pm-pilot',css:'pilot-metrics-v1.css',js:'pilot-metrics-v1.js',version:'PILOT-METRICS-1'});
  const loadPilotReadiness=()=>loadAddon({tag:'pr-pilot',css:'pilot-readiness-v1.css',js:'pilot-readiness-v1.js',version:'PILOT-READINESS-1'});
  const loadPilotRun=()=>loadAddon({tag:'run-pilot',css:'pilot-run-v1.css',js:'pilot-run-v1.js',version:'PILOT-RUN-1'});
  function loadCurriculumPilot({datasetKey,subject,version,files}){
    let pending=files.length,failed=false;
    if(!pending){document.documentElement.dataset[datasetKey]='ready';return}
    const done=ok=>{if(!ok)failed=true;pending-=1;if(pending===0){if(failed){document.documentElement.dataset[datasetKey]='load-error';return}document.documentElement.dataset[datasetKey]='ready';dispatchEvent(new PopStateEvent('popstate'));dispatchEvent(new CustomEvent('kv:class6-pilot-ready',{detail:{subject,classLevel:6,localOnly:true}}))}};
    for(const [tag,src] of files){
      const existing=document.querySelector(`script[data-${tag}]`);
      if(existing){done(existing.dataset.loadFailed!=='true');continue}
      const s=document.createElement('script');s.async=false;s.src=`/${src}?v=${version}`;s.setAttribute(`data-${tag}`,'script');s.addEventListener('load',()=>done(true),{once:true});s.addEventListener('error',()=>{s.dataset.loadFailed='true';done(false)},{once:true});document.body.appendChild(s)
    }
  }
  const loadClass6MathPilot=()=>loadCurriculumPilot({datasetKey:'class6MathPilot',subject:'Mathematics',version:'CBSE6-MATH-PILOT-2',files:[['class6-math-lessons','data/class6-math-pilot.js'],['class6-math-assessments','data/class6-math-assessments.js']]});
  const deferredScienceAssessments=[['class6-science-ch2-assessments','data/class6-science-ch2-assessments.js'],['class6-science-ch3-assessments','data/class6-science-ch3-assessments.js'],['class6-science-ch4-assessments','data/class6-science-ch4-assessments.js'],['class6-science-ch5-assessments','data/class6-science-ch5-assessments.js'],['class6-science-ch6-assessments','data/class6-science-ch6-assessments.js'],['class6-science-ch7-assessments','data/class6-science-ch7-assessments.js'],['class6-science-ch8-assessments','data/class6-science-ch8-assessments.js'],['class6-science-ch9-assessments','data/class6-science-ch9-assessments.js'],['class6-science-ch10-assessments','data/class6-science-ch10-assessments.js']];
  const needsAllScienceAssessments=()=>new URLSearchParams(location.search).has('release-closure');
  const scienceBaseFiles=()=>[
    ['class6-science-ch1-lessons','data/class6-science-pilot.js'],['class6-science-ch1-assessments','data/class6-science-assessments.js'],
    ['class6-science-ch2-lessons','data/class6-science-ch2.js'],['class6-science-ch3-lessons','data/class6-science-ch3.js'],['class6-science-ch4-lessons','data/class6-science-ch4.js'],['class6-science-ch5-lessons','data/class6-science-ch5.js'],['class6-science-ch6-lessons','data/class6-science-ch6.js'],['class6-science-ch7-lessons','data/class6-science-ch7.js'],['class6-science-ch8-lessons','data/class6-science-ch8.js'],['class6-science-ch9-lessons','data/class6-science-ch9.js'],['class6-science-ch10-lessons','data/class6-science-ch10.js'],
    ...(needsAllScienceAssessments()?deferredScienceAssessments:[])
  ];
  const loadClass6SciencePilot=()=>loadCurriculumPilot({datasetKey:'class6SciencePilot',subject:'Science',version:'CBSE6-SCI-CH10-1',files:scienceBaseFiles()});
  let deferredScienceLoadStarted=false;
  function needsDeferredScienceAssessments(){
    const p=location.pathname;
    return needsAllScienceAssessments()||/^\/lesson\/science\.cbse6\.curiosity\.ch(?:2|3|4|5|6|7|8|9|10)\./.test(p)||['/practice','/practice-arena','/diagnostic'].includes(p);
  }
  function loadDeferredScienceAssessments(){
    if(deferredScienceLoadStarted||!needsDeferredScienceAssessments()||needsAllScienceAssessments())return;
    deferredScienceLoadStarted=true;
    loadCurriculumPilot({datasetKey:'class6ScienceDeferredAssessments',subject:'Science',version:'CBSE6-SCI-CH10-1-A',files:deferredScienceAssessments});
  }
  function addNavLinks(){const nav=document.querySelector('.topbar nav');if(!nav)return;const links=[['/diagnostic','◈','Diagnostic'],['/speedlab','⚡','Speed Lab'],['/parent','⚿','Parent Space']];for(const [href,icon,label] of links){let a=nav.querySelector(`a[href="${href}"]`);if(!a){a=document.createElement('a');a.href=href;a.dataset.link='';a.className='vm-nav-p0';a.innerHTML=`${icon} <span>${label}</span>`;nav.appendChild(a)}a.setAttribute('aria-label',label);a.setAttribute('title',label);if(location.pathname===href)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}}
  function addHomePanel(){if(location.pathname!=='/')return;const main=document.querySelector('main');if(!main||main.querySelector('.p0-panel'))return;const rec=window.KV_MASTERY?.recommend?.(),section=document.createElement('section');section.className='p0-panel section';section.setAttribute('aria-labelledby','p0-learning-loop-title');section.innerHTML=`<div class="section-head"><div><span>P0 LEARNING LOOP</span><h2 id="p0-learning-loop-title">Start today's maths session.</h2></div></div><div class="p0-cards"><a class="p0-card" data-link href="/diagnostic"><b>1</b><h3>Maths Diagnostic</h3><p>Find your starting point.</p></a><a class="p0-card" data-link href="/speedlab"><b>2</b><h3>Quick Skills</h3><p>Fast fluency practice.</p></a>${rec?`<a class="p0-card" data-link href="/lesson/${encodeURIComponent(rec.lesson.id)}"><b>3</b><h3>${esc(window.KV_MASTERY.title(rec.lesson))}</h3><p>${esc(rec.reason)}</p></a>`:''}<a class="p0-card" data-link href="/parent"><b>◈</b><h3>Parent Space</h3><p>Progress dashboard &amp; controls.</p></a><a class="p0-card" data-link href="/educator"><b>▦</b><h3>Educator Pilot</h3><p>Local roster, assignments &amp; evidence.</p></a><a class="p0-card" data-link href="/weekly-report"><b>▥</b><h3>Weekly Report</h3><p>Real local pilot activity from this point forward.</p></a><a class="p0-card" data-link href="/pilot-readiness"><b>✓</b><h3>Pilot Readiness</h3><p>P4 controlled launch prerequisites &amp; owner attestations.</p></a><a class="p0-card" data-link href="/pilot-run"><b>▶</b><h3>Controlled Pilot Run</h3><p>P5 can start only after P4 is READY.</p></a></div>`;const hero=main.querySelector('.hero');if(hero&&hero.parentNode)hero.parentNode.insertBefore(section,hero.nextSibling);else main.prepend(section)}
  loadEducatorPilot();loadPilotMetrics();loadPilotReadiness();loadPilotRun();loadClass6MathPilot();loadClass6SciencePilot();
  addEventListener('popstate',loadDeferredScienceAssessments);
  addEventListener('kv:rendered',()=>{loadDeferredScienceAssessments();addNavLinks();addHomePanel()});
  addNavLinks();addHomePanel();loadDeferredScienceAssessments();
})();