import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const batches = [
  ['math-part1', 'class8-math-runtime-v1.js'],
  ['math-part2', 'class8-math-runtime-v1.js'],
  ['science', 'class8-science-runtime-v1.js'],
  ['social-science-part1', 'class8-social-science-runtime-v1.js'],
  ['social-science-part2', 'class8-social-science-runtime-v1.js'],
];
let sourceBytes = 0;
for (const [name, runtime] of batches) {
  const prefix = 'data/class8-' + name;
  const lesson = readFileSync(prefix + '-lessons.js', 'utf8');
  const assessments = readFileSync(prefix + '-assessments.js', 'utf8');
  const bundle = readFileSync(prefix + '-bundle-v1.js', 'utf8');
  const expected = lesson.replace(/\n*$/, '\n') + assessments.replace(/^\n*/, '');
  assert.equal(bundle, expected, name + ': bundle must contain byte-exact original source bodies in order');
  const loader = readFileSync(runtime, 'utf8');
  const ref = prefix + '-bundle-v1.js';
  assert.equal(loader.split(ref).length - 1, 2, name + ': both lesson/assessment config slots must share one bundle');
  sourceBytes += Buffer.byteLength(bundle);
  console.log('CLASS8_BUNDLE_EQUIVALENCE_PASS', name, createHash('sha256').update(bundle).digest('hex').slice(0,16));
}
console.log('CLASS8_BUNDLES_PASS batches=5 original_pairs=5 retained_originals=10 bytes=' + sourceBytes);
