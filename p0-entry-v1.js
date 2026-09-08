/* KirthiVerse P0 entry points v1 — adds Diagnostic / Speed Lab / Parent Space to the top nav
   (same DOM-injection technique visual-controller-v27.js already uses for the Profile link)
   and a "Start here" panel on the home page. Does not modify app.js. */
(()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function addNavLinks(){
    const nav=document.querySelector('.topbar nav'); if(!nav)return;
    const links=[['/diagnostic','◈','Diagnostic'],['/speedlab','⚡','Speed Lab'],['/parent','⚿','Parent Space']];
    for(const [href,icon,label] of links){
      if(nav.querySelector(`a[href="${href}"]`))continue;
      const a=document.createElement('a'); a.href=href; a.dataset.link=''; a.className='vm-nav-p0';
      a.innerHTML=`${icon} <span>${label}</span>`;
      nav.appendChild(a);
    }
  }

  function addHomePanel(){
    if(location.pathname!=='/')return;
    const main=document.querySelector('main'); if(!main)return;
    if(main.querySelector('.p0-panel'))return;
    const rec=window.KV_MASTERY?.recommend?.();
    const section=document.createElement('section');
    section.className='p0-panel section';
    section.innerHTML=`<div class="section-head"><div><span>P0 LEARNING LOOP</span><h2>Start today's maths session.</h2></div></div>
      <div class="p0-cards">
        <a class="p0-card" data-link href="/diagnostic"><b>1</b><h3>Maths Diagnostic</h3><p>Find your starting point.</p></a>
        <a class="p0-card" data-link href="/speedlab"><b>2</b><h3>Quick Skills</h3><p>Fast fluency practice.</p></a>
        ${rec?`<a class="p0-card" data-link href="/lesson/${encodeURIComponent(rec.lesson.id)}"><b>3</b><h3>${esc(window.KV_MASTERY.title(rec.lesson))}</h3><p>${esc(rec.reason)}</p></a>`:''}
        <a class="p0-card" data-link href="/parent"><b>◈</b><h3>Parent Space</h3><p>Progress dashboard &amp; controls.</p></a>
      </div>`;
    const hero=main.querySelector('.hero'); if(hero&&hero.parentNode)hero.parentNode.insertBefore(section,hero.nextSibling); else main.prepend(section);
  }

  addEventListener('kv:rendered',()=>{ addNavLinks(); addHomePanel(); });
  addNavLinks(); addHomePanel();
})();
