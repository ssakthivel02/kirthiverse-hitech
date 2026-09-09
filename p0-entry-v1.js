/* KirthiVerse P0 entry points v4 — adds Diagnostic / Speed Lab / Parent Space to the top nav,
   loads Educator Pilot + Pilot Metrics + Pilot Launch Readiness modules, and adds funding-readiness entry cards.
   Does not modify app.js. */
(()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function loadAddon({tag,css,js,version}){
    if(css&&!document.querySelector(`link[data-${tag}]`)){const l=document.createElement('link');l.rel='stylesheet';l.href=`/${css}?v=${version}`;l.setAttribute(`data-${tag}`,'style');document.head.appendChild(l);}
    if(js&&!document.querySelector(`script[data-${tag}]`)){const s=document.createElement('script');s.async=false;s.src=`/${js}?v=${version}`;s.setAttribute(`data-${tag}`,'script');document.body.appendChild(s);}
  }
  function loadEducatorPilot(){loadAddon({tag:'ep-pilot',css:'educator-pilot-v1.css',js:'educator-pilot-v1.js',version:'EDUCATOR-PILOT-1'})}
  function loadPilotMetrics(){loadAddon({tag:'pm-pilot',css:'pilot-metrics-v1.css',js:'pilot-metrics-v1.js',version:'PILOT-METRICS-1'})}
  function loadPilotLaunch(){loadAddon({tag:'pl-pilot',css:'pilot-launch-v1.css',js:'pilot-launch-v1.js',version:'PILOT-LAUNCH-1'})}

  function addNavLinks(){
    const nav=document.querySelector('.topbar nav'); if(!nav)return;
    const links=[['/diagnostic','◈','Diagnostic'],['/speedlab','⚡','Speed Lab'],['/parent','⚿','Parent Space']];
    for(const [href,icon,label] of links){
      let a=nav.querySelector(`a[href="${href}"]`);
      if(!a){a=document.createElement('a');a.href=href;a.dataset.link='';a.className='vm-nav-p0';a.innerHTML=`${icon} <span>${label}</span>`;nav.appendChild(a);}
      a.setAttribute('aria-label',label);a.setAttribute('title',label);if(location.pathname===href)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    }
  }

  function addHomePanel(){
    if(location.pathname!=='/')return;
    const main=document.querySelector('main');if(!main||main.querySelector('.p0-panel'))return;
    const rec=window.KV_MASTERY?.recommend?.(),section=document.createElement('section');section.className='p0-panel section';section.setAttribute('aria-labelledby','p0-learning-loop-title');
    section.innerHTML=`<div class="section-head"><div><span>P0 LEARNING LOOP</span><h2 id="p0-learning-loop-title">Start today's maths session.</h2></div></div><div class="p0-cards">
      <a class="p0-card" data-link href="/diagnostic"><b>1</b><h3>Maths Diagnostic</h3><p>Find your starting point.</p></a>
      <a class="p0-card" data-link href="/speedlab"><b>2</b><h3>Quick Skills</h3><p>Fast fluency practice.</p></a>
      ${rec?`<a class="p0-card" data-link href="/lesson/${encodeURIComponent(rec.lesson.id)}"><b>3</b><h3>${esc(window.KV_MASTERY.title(rec.lesson))}</h3><p>${esc(rec.reason)}</p></a>`:''}
      <a class="p0-card" data-link href="/parent"><b>◈</b><h3>Parent Space</h3><p>Progress dashboard &amp; controls.</p></a>
      <a class="p0-card" data-link href="/educator"><b>▦</b><h3>Educator Pilot</h3><p>Local roster, assignments &amp; evidence.</p></a>
      <a class="p0-card" data-link href="/weekly-report"><b>▥</b><h3>Weekly Report</h3><p>Real local pilot activity from this point forward.</p></a>
      <a class="p0-card" data-link href="/pilot-readiness"><b>✓</b><h3>Pilot Readiness</h3><p>Adult acknowledgement, start/end, evidence &amp; local data controls.</p></a>
    </div>`;
    const hero=main.querySelector('.hero');if(hero&&hero.parentNode)hero.parentNode.insertBefore(section,hero.nextSibling);else main.prepend(section);
  }

  loadEducatorPilot();loadPilotMetrics();loadPilotLaunch();
  addEventListener('kv:rendered',()=>{addNavLinks();addHomePanel();});addNavLinks();addHomePanel();
})();