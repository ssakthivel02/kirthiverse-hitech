import fs from 'node:fs';import vm from 'node:vm';
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('data/class7-social-science-unit-map-v1.js','utf8'),sandbox);
const m=sandbox.window.KV_CLASS7_SOCIAL_SCIENCE_UNIT_MAP;const fail=x=>{throw Error(x)};
if(!m)fail('Class 7 Social Science unit map missing');
if(m.classLevel!==7||m.subject!=='Social Science'||m.board!=='CBSE'||m.curriculumSession!=='2026-27'||m.status!=='SOURCE_VERIFIED')fail('unit-map identity mismatch');
if(m.sources.length!==2)fail('expected two official parts');
const want={1:'https://ncert.nic.in/textbook/pdf/gees1ps.pdf',2:'https://ncert.nic.in/textbook/pdf/gees2ps.pdf'};
for(const s of m.sources){if(s.authority!=='NCERT'||s.url!==want[s.part]||s.rightsStatus!=='NCERT_ALL_RIGHTS_RESERVED_METADATA_ONLY'||!s.isbn||!s.edition)fail(`source provenance mismatch: part ${s.part}`)}
const expected={1:['Geographical Diversity of India','Understanding the Weather','Climates of India','New Beginnings: Cities and States','The Rise of Empires','The Age of Reorganisation','The Gupta Era: An Age of Tireless Creativity','How the Land Becomes Sacred','From the Rulers to the Ruled: Types of Governments','The Constitution of India: An Introduction','From Barter to Money','Understanding Markets'],2:['The Story of Indian Farming','India and Her Neighbours','Empires and Kingdoms: 6th to 10th Centuries','Turning Tides: 11th and 12th Centuries','India, a Home to Many','The State, the Government, and You','Infrastructure: Engine of India’s Development','Banks and the Magic of Finance']};
if(m.units.length!==20)fail('expected twenty verified chapters');
let i=0;for(const part of [1,2])for(let c=0;c<expected[part].length;c++){const u=m.units[i++];if(u.part!==part||u.chapter!==c+1||u.title!==expected[part][c]||u.status!=='SOURCE_VERIFIED')fail(`part ${part} chapter ${c+1} metadata mismatch`)}
for(const flag of ['metadataOnly','originalKikiTeachingRequired','originalAssessmentsRequired','lessonPublicationRequiresQA'])if(m.contentBoundary[flag]!==true)fail(`content boundary disabled: ${flag}`);
for(const flag of ['textbookProseCopied','textbookExercisesCopied'])if(m.contentBoundary[flag]!==false)fail(`copyright boundary violated: ${flag}`);
console.log('CLASS7_SOCIAL_SCIENCE_VERIFIED_UNIT_MAP_PASS');
