/* Class 8 Social Science runtime bootstrap bridge. Loads the route-deferred runtime on Class 8 Social Science lessons, the Geography/History worlds and search only. */
(()=>{
  const relevant=()=>/^\/lesson\/social-science\.cbse8\.exploring-society\./.test(location.pathname)||['/world/geography','/world/history','/search'].includes(location.pathname);
  function ensureRuntime(){ if(!relevant()||window.KV_CLASS8_SOCIAL_SCIENCE_RUNTIME||document.querySelector('script[data-class8-social-science-runtime]'))return;
    const s=document.createElement('script');s.async=false;s.src='/class8-social-science-runtime-v1.js?v=CBSE8-SOC-RUNTIME-1';s.setAttribute('data-class8-social-science-runtime','script');document.body.appendChild(s); }
  ensureRuntime();addEventListener('popstate',ensureRuntime);addEventListener('kv:rendered',ensureRuntime);
})();
/* Class 8 Mathematics runtime bootstrap bridge.
   Same request-budget rule as the Class 7 bridges: the loader is fetched only on Class 8 Mathematics lesson routes, the Mathematics world and search. */
(()=>{
  const relevant=()=>/^\/lesson\/math\.cbse8\.ganita-prakash\.(?:p2)?ch\d+\./.test(location.pathname)||['/world/mathematics','/search'].includes(location.pathname);
  function ensureRuntime(){
    if(!relevant()||window.KV_CLASS8_MATH_RUNTIME||document.querySelector('script[data-class8-math-runtime]'))return;
    const s=document.createElement('script');s.async=false;s.src='/class8-math-runtime-v1.js?v=CBSE8-MATH-RUNTIME-1';s.setAttribute('data-class8-math-runtime','script');document.body.appendChild(s);
  }
  ensureRuntime();addEventListener('popstate',ensureRuntime);addEventListener('kv:rendered',ensureRuntime);
})();
/* Class 8 Science runtime bootstrap bridge.
   The loader is fetched only on Class 8 Science lesson routes, the Science world and search, so unrelated surfaces keep their request budget. */
(()=>{
  const relevant=()=>/^\/lesson\/science\.cbse8\.curiosity\.ch\d+\./.test(location.pathname)||['/world/science','/search'].includes(location.pathname);
  function ensureRuntime(){
    if(!relevant()||window.KV_CLASS8_SCIENCE_RUNTIME||document.querySelector('script[data-class8-science-runtime]'))return;
    const s=document.createElement('script');s.async=false;s.src='/class8-science-runtime-v1.js?v=CBSE8-SCI-RUNTIME-1';s.setAttribute('data-class8-science-runtime','script');document.body.appendChild(s);
  }
  ensureRuntime();addEventListener('popstate',ensureRuntime);addEventListener('kv:rendered',ensureRuntime);
})();

