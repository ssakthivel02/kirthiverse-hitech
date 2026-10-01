import fs from 'node:fs';
const runtime=fs.readFileSync('class7-math-runtime-v1.js','utf8');
const required=[
  "1:{lesson:'data/class7-math-ch1.js',assessment:'data/class7-math-ch1-assessments.js'",
  "2:{lesson:'data/class7-math-ch2.js',assessment:'data/class7-math-ch2-assessments.js'",
  "math\\.cbse7\\.ganita-prakash\\.ch(\\d+)",
  "'/search','/practice','/practice-arena','/diagnostic'",
  "release-closure",
  "kv:class7-math-ready",
  "class7MathChapter${chapter}",
  "window.KV_CLASS7_MATH_RUNTIME"
];
for(const token of required)if(!runtime.includes(token))throw new Error(`Class 7 runtime factory contract missing: ${token}`);
for(const chapter of [1,2]){
  for(const suffix of ['', '-assessments']){
    const path=`data/class7-math-ch${chapter}${suffix}.js`;
    if(!fs.existsSync(path))throw new Error(`Missing runtime dataset: ${path}`);
  }
}
console.log('Class 7 Mathematics runtime factory contract PASS: Chapters 1–2 registered, route-deferred, practice/search/release surfaces supported.');