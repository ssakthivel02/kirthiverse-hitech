#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const tool = path.join(root, 'scripts/external-review-handoff-integrity.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kv-p11b-'));
const docs = path.join(tmp, 'docs');
fs.mkdirSync(docs);

const required = [
  'P11A_EXTERNAL_REVIEW_EXECUTION_PACK.md',
  'EXTERNAL_PILOT_REVIEW_PACK.md',
  'PILOT_PARTICIPANT_INFORMATION_DRAFT.md',
  'PILOT_DATA_MINIMISATION_RETENTION_DRAFT.md',
  'PILOT_INCIDENT_ESCALATION_DRAFT.md',
  'PILOT_STOPPING_CRITERIA_DRAFT.md',
  'PILOT_METRICS_PROTOCOL_DRAFT.md',
  'PILOT_SPECIALIST_REVIEW_CHECKLIST.md',
  'PILOT_APPROVAL_REGISTER_TEMPLATE.md',
  'P11A_UK_OFFICIAL_REFERENCE_GUIDE.md'
];
for (const name of required) fs.writeFileSync(path.join(docs, name), `fixture:${name}\n`);

const scope = {
  schema: 'kirthiverse.p11a.pilot-scope-freeze.v1',
  template: false,
  pilotReference: 'KV-PILOT-TEST-001',
  scopeVersion: 'scope-v1',
  ownerRole: 'Pilot owner',
  jurisdiction: 'England, UK',
  organisationContext: 'Parent-controlled test fixture',
  ageBand: '7–10',
  subject: 'Mathematics',
  durationWeeks: 2,
  cohortCeiling: 5,
  supervisionModel: 'Adult supervised',
  deviceModel: 'Managed browser device',
  dataModel: 'Local-first non-identifying aliases only',
  liveAIEnabled: false,
  cloudChildIdentityEnabled: false,
  externalServices: [],
  materialChangeRequiresReReview: true,
  ownerAcknowledgements: {
    scopeIsAccurate: true,
    noParticipantPIIInRecord: true,
    noUnreviewedFeatureExpansion: true,
    externalReviewStillRequired: true,
    notProductionReadiness: true
  }
};
const scopePath = path.join(tmp, 'scope.json');
fs.writeFileSync(scopePath, JSON.stringify(scope, null, 2) + '\n');
const manifestPath = path.join(tmp, 'manifest.json');

const run = args => spawnSync(process.execPath, [tool, ...args], { cwd: root, encoding: 'utf8' });
const parse = r => JSON.parse(r.stdout);

const created = run(['create', scopePath, '--document-root', docs, '--output', manifestPath]);
assert.equal(created.status, 0, created.stderr || created.stdout);
const manifest = parse(created);
assert.equal(manifest.status, 'EXTERNAL_REVIEW_HANDOFF_INTEGRITY_READY');
assert.equal(manifest.scope.pilotReference, scope.pilotReference);
assert.equal(manifest.scope.scopeVersion, scope.scopeVersion);
assert.equal(manifest.documents.length, required.length);
assert.match(manifest.bundleSha256, /^[a-f0-9]{64}$/);
assert.equal(manifest.claimGates.canSendExactBundleToExternalReviewer, true);
assert.equal(manifest.claimGates.canStartParticipantPilot, false);
assert.equal(manifest.claimGates.canClaimProductionReadiness, false);

const verified = run(['verify', manifestPath, scopePath, '--document-root', docs]);
assert.equal(verified.status, 0, verified.stderr || verified.stdout);
assert.equal(parse(verified).status, 'EXACT_EXTERNAL_REVIEW_HANDOFF_MATCH');

fs.appendFileSync(path.join(docs, 'PILOT_METRICS_PROTOCOL_DRAFT.md'), 'drift\n');
const drift = run(['verify', manifestPath, scopePath, '--document-root', docs]);
assert.equal(drift.status, 1);
const driftReport = parse(drift);
assert.equal(driftReport.status, 'HOLD');
assert.ok(driftReport.errors.some(e => e.code === 'DOCUMENT_HASH_MISMATCH' && e.path === 'PILOT_METRICS_PROTOCOL_DRAFT.md'));
assert.equal(driftReport.claimGates.canStartParticipantPilot, false);

fs.writeFileSync(path.join(docs, 'PILOT_METRICS_PROTOCOL_DRAFT.md'), 'fixture:PILOT_METRICS_PROTOCOL_DRAFT.md\n');
const changedScope = { ...scope, durationWeeks: 3 };
fs.writeFileSync(scopePath, JSON.stringify(changedScope, null, 2) + '\n');
const scopeDrift = run(['verify', manifestPath, scopePath, '--document-root', docs]);
assert.equal(scopeDrift.status, 1);
assert.ok(parse(scopeDrift).errors.some(e => e.code === 'SCOPE_HASH_MISMATCH'));

const invalidScope = { ...scope, liveAIEnabled: true };
fs.writeFileSync(scopePath, JSON.stringify(invalidScope, null, 2) + '\n');
const invalid = run(['create', scopePath, '--document-root', docs]);
assert.equal(invalid.status, 1);
const invalidReport = parse(invalid);
assert.equal(invalidReport.status, 'HOLD');
assert.ok(invalidReport.errors.some(e => e.code === 'SCOPE_NOT_STRUCTURALLY_FROZEN'));
assert.equal(invalidReport.claimGates.canSendExactBundleToExternalReviewer, false);

fs.rmSync(tmp, { recursive: true, force: true });
console.log('P11B_HANDOFF_INTEGRITY_TEST_PASS');
