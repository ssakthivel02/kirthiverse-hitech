import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('data/curriculum-catalog-v1.js','utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(source,sandbox);
const c=sandbox.window.KV_CURRICULUM_CATALOG;
if(!c)throw Error('KV_CURRICULUM_CATALOG missing');
if(c.schemaVersion!=='1.0.0'||c.board!=='CBSE')throw Error('catalog identity mismatch');
if(JSON.stringify(Array.from(c.supportedClasses))!==JSON.stringify([6]))throw Error('existing qualified class boundary changed');
if(JSON.stringify(Array.from(c.expansionClasses))!==JSON.stringify([7,8,9,10,11,12]))throw Error('class 7-12 expansion boundary incomplete');
for(const grade of c.expansionClasses){if(c.status[grade]!=='FOUNDATION_ONLY')throw Error(`Class ${grade} must remain foundation-only until content qualification`);if(!Array.isArray(c.subjects[grade])||!c.subjects[grade].length)throw Error(`Class ${grade} subject map missing`)}
for(const flag of ['canonicalOnly','noFabricatedCoverage','originalTeachingText','noTextbookExerciseReproduction','requireSourceRefs','requireRightsStatus','requireAssessmentQualification'])if(c.contentPolicy[flag]!==true)throw Error(`content policy disabled: ${flag}`);
for(const field of ['id','title','subject','topic','learningObjective','content','board','classLevel','curriculumSession','sourceRefs','rightsStatus','kikiTeaching','remediation'])if(!c.lessonContract.required.includes(field))throw Error(`lesson contract missing ${field}`);
for(const state of ['DRAFT','SOURCE_VERIFIED','ASSESSMENT_READY','QA_QUALIFIED'])if(!c.lessonContract.lifecycle.includes(state))throw Error(`lifecycle missing ${state}`);
console.log('CURRICULUM_EXPANSION_FOUNDATION_PASS');