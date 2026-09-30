import fs from 'node:fs';
import vm from 'node:vm';
const foundation=fs.readFileSync('data/curriculum-catalog-v1.js','utf8');
const source=fs.readFileSync('data/class7-curriculum-manifest-v1.js','utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(foundation,sandbox);vm.runInContext(source,sandbox);
const catalog=sandbox.window.KV_CURRICULUM_CATALOG;
const m=sandbox.window.KV_CLASS7_CURRICULUM_MANIFEST;
if(!catalog||!m)throw Error('curriculum foundation/manifest missing');
if(!catalog.expansionClasses.includes(7)||catalog.status[7]!=='FOUNDATION_ONLY')throw Error('Class 7 foundation boundary changed');
if(m.classLevel!==7||m.board!==catalog.board||m.curriculumSession!==catalog.curriculumSession)throw Error('Class 7 manifest identity mismatch');
if(m.status!=='MANIFEST_ONLY')throw Error('Class 7 must remain manifest-only');
const expected=['Mathematics','Science','Social Science'];
if(JSON.stringify(Object.keys(m.subjects))!==JSON.stringify(expected))throw Error('Class 7 subject contract mismatch');
for(const name of expected){const s=m.subjects[name];if(s.status!=='SOURCE_DISCOVERY_REQUIRED'||!Array.isArray(s.units)||s.units.length!==0)throw Error(`${name} must remain empty until authoritative source discovery`)}
for(const flag of ['authoritativeSourceRequired','sourceRefsRequired','rightsStatusRequired','noFabricatedChapterTitles','noTextbookExerciseReproduction','originalTeachingTextRequired'])if(m.sourcePolicy[flag]!==true)throw Error(`source policy disabled: ${flag}`);
if(m.qualification.publishRequires!=='QA_QUALIFIED'||m.qualification.coverageClaimRequiresAllUnitsQualified!==true)throw Error('qualification boundary weakened');
console.log('CLASS7_CURRICULUM_MANIFEST_PASS');