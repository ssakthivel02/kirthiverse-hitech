import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('data/class7-math-unit-map-v1.js','utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(source,sandbox);
const m=sandbox.window.KV_CLASS7_MATH_UNIT_MAP;
if(!m)throw Error('Class 7 Mathematics unit map missing');
if(m.classLevel!==7||m.subject!=='Mathematics'||m.board!=='CBSE'||m.curriculumSession!=='2026-27')throw Error('unit-map identity mismatch');
if(m.status!=='SOURCE_VERIFIED'||m.source.authority!=='NCERT'||m.source.edition!=='Reprint 2026-27')throw Error('source provenance mismatch');
if(m.source.url!=='https://ncert.nic.in/textbook/pdf/gegp1ps.pdf')throw Error('authoritative source URL mismatch');
if(m.source.rightsStatus!=='NCERT_ALL_RIGHTS_RESERVED_METADATA_ONLY')throw Error('rights boundary missing');
const expected=['Large Numbers Around Us','Arithmetic Expressions','A Peek Beyond the Point','Expressions using Letter-Numbers','Parallel and Intersecting Lines','Number Play','A Tale of Three Intersecting Lines','Working with Fractions'];
if(m.units.length!==expected.length)throw Error('expected eight verified Part I chapters');
for(let i=0;i<expected.length;i++){const u=m.units[i];if(u.chapter!==i+1||u.title!==expected[i]||u.status!=='SOURCE_VERIFIED')throw Error(`chapter ${i+1} metadata mismatch`)}
for(const flag of ['metadataOnly','originalKikiTeachingRequired','originalAssessmentsRequired','lessonPublicationRequiresQA'])if(m.contentBoundary[flag]!==true)throw Error(`content boundary disabled: ${flag}`);
for(const flag of ['textbookProseCopied','textbookExercisesCopied'])if(m.contentBoundary[flag]!==false)throw Error(`copyright boundary violated: ${flag}`);
console.log('CLASS7_MATH_VERIFIED_UNIT_MAP_PASS');