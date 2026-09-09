/* KirthiVerse P0 entry points v2 — adds Diagnostic / Speed Lab / Parent Space to the top nav,
   loads the additive Educator Pilot module, and adds a "Start here" panel on the home page.
   Does not modify app.js. */
(()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function loadEducatorPilot(){
    if(!document.querySelector('link[data-ep-pilot]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/educator-pilot-v1.css?v=EDUCATOR-PILOT-1';l.dataset.epPilot='style';document.head.appendChild(l);}
    if(!document.querySelector('script[data-ep-pilot]')){const s=document.createElement('script');s.src='/educator-pilot-v1.js?v=EDUCATOR-PILOT-1';s.dataset.epPilot='script';s.defer=true;document.body.appendChild(s);}
  }

  function addNavLinks(){
    const nav=document.querySelector('.topbar nav'); if(!nav)return;
    const links=[['/diagnostic','◈','Diagnostic'],['/speedlab','⚡','Speed Lab'],['/parent','⚿','Parent Space']];
    for(const [href,icon,label] of links){
      let a=nav.querySelector(`a[href="${href}"]`);
      if(!a){
        a=document.createElement('a'); a.href=href; a.dataset.link=''; a.className='vm-nav-p0';
        a.innerHTML=`${icon} <span>${label}</span>`;
        nav.appendChild(a);
      }
      a.setAttribute('aria-label',label);
      a.setAttribute('title',label);
      if(location.pathname===href)a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    }
  }

  function addHomePanel(){
    if(location.pathname!=='/')return;
    const main=document.querySelector('main'); if(!main)return;
    if(main.querySelector('.p0-panel'))return;
    const rec=window.KV_MASTERY?.recommend?.();
    const section=document.createElement('section');
    section.className='p0-panel section';
    section.setAttribute('aria-labelledby','p0-learning-loop-title');
    section.innerHTML=`<div class="section-head"><div><span>P0 LEARNING LOOP</span><h2 id="p0-learning-loop-title">Start today's maths session.</h2></div></div>
      <div class="p0-cards">
        <a class="p0-card" data-link href="/diagnostic"><b>1</b><h3>Maths Diagnostic</h3><p>Find your starting point.</p></a>
        <a class="p0-card" data-link href="/speedlab"><b>2</b><h3>Quick Skills</h3><p>Fast fluency practice.</p></a>
        ${rec?`<a class="p0-card" data-link href="/lesson/${encodeURIComponent(rec.lesson.id)}"><b>3</b><h3>${esc(window.KV_MASTERY.title(rec.lesson))}</h3><p>${esc(rec.reason)}</p></a>`:''}
        <a class="p0-card" data-link href="/parent"><b>◈</b><h3>Parent Space</h3><p>Progress dashboard &amp; controls.</p></a>
        <a class="p0-card" data-link href="/educator"><b>▦</b><h3>Educator Pilot</h3><p>Local roster, assignments &amp; evidence.</p></a>
      </div>`;
    const hero=main.querySelector('.hero'); if(hero&&hero.parentNode)hero.parentNode.insertBefore(section,hero.nextSibling); else main.prepend(section);
  }

  loadEducatorPilot();
  addEventListener('kv:rendered',()=>{ addNavLinks(); addHomePanel(); });
  addNavLinks(); addHomePanel();
})();
