import fs from 'node:fs';import vm from 'node:vm';
const sandbox={window:{}};vm.createContext(sandbox);
for(const p of ['data/curriculum-catalog-v1.js','data/class7-curriculum-manifest-v1.js','data/class7-authoritative-source-map-v1.js'])vm.runInContext(fs.readFileSync(p,'utf8'),sandbox);
const c=sandbox.window.KV_CURRICULUM_CATALOG,m=sandbox.window.KV_CLASS7_CURRICULUM_MANIFEST,s=sandbox.window.KV_CLASS7_AUTHORITATIVE_SOURCE_MAP;
if(!c||!m||!s)throw Error('Class 7 curriculum contracts missing');
if(s.classLevel!==7||s.curriculumSession!==c.curriculumSession)throw Error('source-map identity mismatch');
if(s.status!=='SOURCE_REGISTRY_VERIFIED')throw Error('source registry status mismatch');
const ids=new Set(s.authorities.map(x=>x.id));
if(ids.size!==s.authorities.length)throw Error('duplicate authority id');
for(const a of s.authorities){const u=new URL(a.url);if(!['ncert.nic.in','www.ncert.nic.in','cbseacademic.nic.in'].includes(u.hostname))throw Error(`non-authoritative host: ${u.hostname}`)}
for(const subject of ['Mathematics','Science','Social Science']){const x=s.subjects[subject];if(!x||x.state!=='SOURCE_VERIFIED_UNIT_MAP_PENDING')throw Error(`${subject} state invalid`);if(!x.sourceRefs.length||x.sourceRefs.some(id=>!ids.has(id)))throw Error(`${subject} source refs invalid`)}
for(const flag of ['officialDomainsOnly','unitTitlesRequireDirectOfficialEvidence','lessonAuthoringBlockedUntilUnitMapVerified','noTextbookExerciseReproduction','noCoverageClaim'])if(s.evidencePolicy[flag]!==true)throw Error(`evidence policy disabled: ${flag}`);
for(const subject of Object.values(m.subjects))if(subject.units.length!==0)throw Error('manifest units must remain empty in source-registry slice');
console.log('CLASS7_AUTHORITATIVE_SOURCE_MAP_PASS');