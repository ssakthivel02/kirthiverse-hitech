import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const arena = read('practice-arena-v1.js');
const css = read('practice-arena-v1.css');
const shell = read('index.html');
const sw = read('sw-v30.js');

const requiredRuntime = [
  "const ROUTE='/practice-arena'",
  'localOnly:true',
  'canonicalOnly:true',
  'confidenceNotMastery:true',
  'stableAssessmentId',
  'retryIds',
  'slice(-199)',
  'No fallback question was fabricated'
];
for (const token of requiredRuntime) {
  if (!arena.includes(token)) throw new Error(`Practice Arena runtime contract missing: ${token}`);
}

for (const forbidden of ['XMLHttpRequest', 'WebSocket', 'sendBeacon', 'getUserMedia', 'MediaRecorder']) {
  if (arena.includes(forbidden)) throw new Error(`Forbidden Practice Arena capability: ${forbidden}`);
}

if (!css.includes('prefers-reduced-motion:reduce') || !css.includes('min-height:44px') || !css.includes(':focus-visible')) {
  throw new Error('Practice Arena accessibility CSS contract missing');
}

const shellWired = shell.includes('/practice-arena-v1.js') && shell.includes('/practice-arena-v1.css');
const pwaWired = sw.includes('/practice-arena-v1.js') && sw.includes('/practice-arena-v1.css');
const currentCache = /kirthiverse-preview-v(\d+)/.exec(sw)?.[1] ?? null;

console.log(JSON.stringify({
  runtimeContract: 'PASS',
  accessibilityContract: 'PASS',
  shellWired,
  pwaWired,
  currentCache,
  integrationReady: shellWired && pwaWired
}, null, 2));

if (!shellWired || !pwaWired) {
  console.error('PRACTICE_ARENA_INTEGRATION_HOLD: runtime is qualified but current shell/PWA wiring is intentionally incomplete.');
  process.exitCode = 2;
} else {
  console.log('PRACTICE_ARENA_INTEGRATION_READY');
}
