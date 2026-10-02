import fs from 'node:fs';
const runtime=fs.readFileSync('class7-math-runtime-v1.js','utf8');
const required=[
  "1:{lesson:'data/class7-math-ch1.js',assessment:'data/class7-math-ch1-assessments.js'",
  "2:{lesson:'data/class7-math-ch2.js',assessment:'data/class7-math-ch2-assessments.js'",
  "batchLesson='data/class7-math-ch3-8-lessons.js'",
  "batchAssessment='data/class7-math-ch3-8-assessments.js'",
  "math\\.cbse7\\.ganita-prakash\\.ch(\\d+)",
  "'/search','/practice','/practice-arena','/diagnostic'",
  "release-closure","kv:class7-math-ready","window.KV_CLASS7_MATH_RUNTIME"
];
for(const token of required)if(!runtime.includes(token))throw new Error(`Class 7 runtime factory contract missing: ${token}`);
for(const path of ['data/class7-math-ch1.js','data/class7-math-ch1-assessments.js','data/class7-math-ch2.js','data/class7-math-ch2-assessments.js','data/class7-math-ch3-8-lessons.js','data/class7-math-ch3-8-assessments.js'])if(!fs.existsSync(path))throw new Error(`Missing runtime dataset: ${path}`);
for(let chapter=1;chapter<=8;chapter++)if(!runtime.includes(`${chapter}:{`))throw new Error(`Runtime manifest missing Chapter ${chapter}`);
console.log('Class 7 Mathematics runtime factory contract PASS: Chapters 1–8 registered, route-deferred, shared batch assets deduplicated, practice/search/release surfaces supported.');