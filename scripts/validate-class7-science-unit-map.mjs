import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('data/class7-science-unit-map-v1.js','utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(source,sandbox);
const m=sandbox.window.KV_CLASS7_SCIENCE_UNIT_MAP;
if(!m)throw Error('Class 7 Science unit map missing');
if(m.classLevel!==7||m.subject!=='Science'||m.board!=='CBSE'||m.curriculumSession!=='2026-27')throw Error('unit-map identity mismatch');
if(m.status!=='SOURCE_VERIFIED'||m.source.authority!=='NCERT'||m.source.edition!=='Reprint 2026-27')throw Error('source provenance mismatch');
if(m.source.title!=='Curiosity — Textbook of Science for Grade 7'||m.source.isbn!=='978-93-5729-039-5')throw Error('book identity mismatch');
if(m.source.url!=='https://ncert.nic.in/textbook/pdf/gecu1ps.pdf')throw Error('authoritative source URL mismatch');
if(m.source.rightsStatus!=='NCERT_ALL_RIGHTS_RESERVED_METADATA_ONLY')throw Error('rights boundary missing');
const expected=['The Ever-Evolving World of Science','Exploring Substances: Acidic, Basic, and Neutral','Electricity: Circuits and their Components','The World of Metals and Non-metals','Changes Around Us: Physical and Chemical','Adolescence: A Stage of Growth and Change','Heat Transfer in Nature','Measurement of Time and Motion','Life Processes in Animals','Life Processes in Plants','Light: Shadows and Reflections','Earth, Moon, and the Sun'];
if(m.units.length!==expected.length)throw Error('expected twelve verified Science chapters');
for(let i=0;i<expected.length;i++){const u=m.units[i];if(u.chapter!==i+1||u.title!==expected[i]||u.status!=='SOURCE_VERIFIED')throw Error(`chapter ${i+1} metadata mismatch`)}
if(m.units[0].evaluative!==false)throw Error('chapter 1 non-evaluative boundary missing');
for(const flag of ['metadataOnly','originalKikiTeachingRequired','originalAssessmentsRequired','lessonPublicationRequiresQA'])if(m.contentBoundary[flag]!==true)throw Error(`content boundary disabled: ${flag}`);
for(const flag of ['textbookProseCopied','textbookExercisesCopied'])if(m.contentBoundary[flag]!==false)throw Error(`copyright boundary violated: ${flag}`);
console.log('CLASS7_SCIENCE_VERIFIED_UNIT_MAP_PASS');
