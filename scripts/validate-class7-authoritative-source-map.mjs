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
const expected={Mathematics:{state:'SOURCE_VERIFIED_UNIT_MAP_COMPLETE',unitMap:'data/class7-math-unit-map-v1.js'},Science:{state:'SOURCE_VERIFIED_UNIT_MAP_COMPLETE',unitMap:'data/class7-science-unit-map-v1.js'},'Social Science':{state:'SOURCE_VERIFIED_UNIT_MAP_PENDING'}};
for(const [subject,e] of Object.entries(expected)){const x=s.subjects[subject];if(!x||x.state!==e.state)throw Error(`${subject} state invalid`);if(e.unitMap&&x.unitMap!==e.unitMap)throw Error(`${subject} unit-map reference invalid`);if(!x.sourceRefs.length||x.sourceRefs.some(id=>!ids.has(id)))throw Error(`${subject} source refs invalid`)}
for(const flag of ['officialDomainsOnly','unitTitlesRequireDirectOfficialEvidence','lessonAuthoringBlockedUntilUnitMapVerified','noTextbookExerciseReproduction','noCoverageClaim'])if(s.evidencePolicy[flag]!==true)throw Error(`evidence policy disabled: ${flag}`);
for(const subject of Object.values(m.subjects))if(subject.units.length!==0)throw Error('manifest units remain intentionally empty; verified unit maps are separate contracts');
console.log('CLASS7_AUTHORITATIVE_SOURCE_MAP_PASS');
