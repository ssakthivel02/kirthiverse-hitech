import fs from 'node:fs';import vm from 'node:vm';
const sandbox={window:{KV_LESSONS:[],KV_ASSESSMENTS:[]}};vm.createContext(sandbox);
for(const p of ['data/class7-science-ch2-5-lessons.js','data/class7-science-ch2-5-assessments.js'])vm.runInContext(fs.readFileSync(p,'utf8'),sandbox);
const L=sandbox.window.KV_LESSONS,A=sandbox.window.KV_ASSESSMENTS;
if(L.length!==8)throw Error(`expected 8 lessons, got ${L.length}`);
if(A.length!==20)throw Error(`expected 20 assessments, got ${A.length}`);
const ids=new Set(L.map(x=>x.id));if(ids.size!==L.length)throw Error('duplicate lesson id');
const aids=new Set(A.map(x=>x.stableAssessmentId));if(aids.size!==A.length)throw Error('duplicate assessment id');
for(const l of L){if(l.subject!=='Science'||l.classLevel!==7||l.board!=='CBSE'||l.book!=='Curiosity')throw Error(`lesson identity mismatch: ${l.id}`);if(![2,3,4,5].includes(l.chapter))throw Error(`chapter out of batch: ${l.id}`);if(!l.kikiTeaching?.objective||!l.kikiTeaching?.misconceptionCheck||!l.remediation?.strategy)throw Error(`teaching/remediation incomplete: ${l.id}`);if(l.rightsStatus!=='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION')throw Error(`rights boundary missing: ${l.id}`)}
const counts={};for(const a of A){if(!ids.has(a.lessonId))throw Error(`orphan assessment: ${a.stableAssessmentId}`);counts[a.lessonId]=(counts[a.lessonId]||0)+1;if(a.rightsStatus!=='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION')throw Error(`assessment rights boundary missing: ${a.stableAssessmentId}`)}
for(const id of ids)if((counts[id]||0)<2)throw Error(`insufficient assessment coverage: ${id}`);
const combined=fs.readFileSync('data/class7-science-ch2-5-lessons.js','utf8')+fs.readFileSync('data/class7-science-ch2-5-assessments.js','utf8');
for(const bad of ['copy the textbook','NCERT exercise','answer key from NCERT'])if(combined.toLowerCase().includes(bad.toLowerCase()))throw Error(`copyright-risk phrase: ${bad}`);
console.log('CLASS7_SCIENCE_CH2_5_CORPUS_PASS');
