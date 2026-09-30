import fs from 'node:fs';

const targets = [
  'tests/class6-math-completion-audit.test.mjs',
  'tests/class6-social-science-ch9.test.mjs',
  'scripts/educator-pilot-browser-qa.mjs',
  'scripts/pilot-metrics-browser-qa.mjs',
  'scripts/pilot-readiness-browser-qa.mjs',
  'scripts/pilot-run-browser-qa.mjs'
];

for (const path of targets) {
  const before = fs.readFileSync(path, 'utf8');
  const after = before
    .replaceAll('kirthiverse-preview-v45', 'kirthiverse-preview-v49')
    .replaceAll('kirthiverse-preview-v48', 'kirthiverse-preview-v49')
    .replaceAll('MANUS-VISUAL-MASTER-05-PWA-48', 'MANUS-VISUAL-MASTER-05-PWA-49')
    .replaceAll('v48 cache', 'v49 cache');
  if (after === before) throw new Error(`No active-generation compatibility token found in ${path}`);
  fs.writeFileSync(path, after);
}
