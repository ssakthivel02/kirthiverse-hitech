#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const manifestPath = args[0];
const recordPath = args[1];
const outIndex = args.indexOf('--output');
const output = outIndex >= 0 ? args[outIndex + 1] : null;

if (!manifestPath || !recordPath) {
  console.error('Usage: node scripts/validate-review-handoff-provenance.mjs <p11b-manifest.json> <p10-record.json> [--output report.json]');
  process.exit(2);
}
if (outIndex >= 0 && !output) {
  console.error('--output requires a file path');
  process.exit(2);
}

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const hex64 = value => typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
const errors = [];
const add = (code, message, detail = {}) => errors.push({ code, message, ...detail });

function loadJson(file, code) {
  if (!fs.existsSync(file)) {
    add(`${code}_FILE_MISSING`, `${file} does not exist.`);
    return { raw: null, data: null };
  }
  const raw = fs.readFileSync(file);
  try {
    return { raw, data: JSON.parse(raw.toString('utf8')) };
  } catch {
    add(`${code}_JSON_INVALID`, `${file} is not valid JSON.`);
    return { raw, data: null };
  }
}

const handoff = loadJson(manifestPath, 'P11B_MANIFEST');
const approval = loadJson(recordPath, 'P10_RECORD');

if (handoff.data) {
  if (handoff.data.schema !== 'kirthiverse.p11b.external-review-handoff-integrity.v1') {
    add('P11B_SCHEMA_INVALID', 'Expected kirthiverse.p11b.external-review-handoff-integrity.v1.');
  }
  if (handoff.data.status !== 'EXTERNAL_REVIEW_HANDOFF_INTEGRITY_READY') {
    add('P11B_NOT_READY', 'Only a READY P11B handoff manifest may be linked to a later external reference set.');
  }
  if (!hex64(handoff.data.bundleSha256)) {
    add('P11B_BUNDLE_DIGEST_INVALID', 'P11B bundleSha256 must be a 64-character SHA-256 digest.');
  }
  if (!handoff.data.scope?.pilotReference || !handoff.data.scope?.scopeVersion) {
    add('P11B_SCOPE_IDENTITY_MISSING', 'P11B manifest must contain pilotReference and scopeVersion.');
  }
}

let p10Report = null;
if (approval.data) {
  const run = spawnSync(process.execPath, ['scripts/validate-external-pilot-approval.mjs', recordPath], { encoding: 'utf8' });
  try { p10Report = JSON.parse(run.stdout || '{}'); } catch {}
  if (run.status !== 0 || p10Report?.status !== 'STRUCTURALLY_COMPLETE_EXTERNAL_REFERENCE_SET') {
    add('P10_NOT_STRUCTURALLY_COMPLETE', 'The existing P10 validator must pass before provenance linkage can pass.', {
      p10Status: p10Report?.status || null,
      p10Errors: Array.isArray(p10Report?.errors) ? p10Report.errors.map(e => e.code) : []
    });
  }
}

if (handoff.data && approval.data) {
  const handoffPilot = handoff.data.scope?.pilotReference ?? null;
  const handoffScope = handoff.data.scope?.scopeVersion ?? null;
  const recordPilot = approval.data.pilot?.pilotReference ?? null;
  const recordScope = approval.data.pilot?.scopeVersion ?? null;
  if (handoffPilot !== recordPilot) add('PILOT_REFERENCE_MISMATCH', 'P10 pilotReference does not match the P11B handoff.', { handoffPilotReference: handoffPilot, recordPilotReference: recordPilot });
  if (handoffScope !== recordScope) add('SCOPE_VERSION_MISMATCH', 'P10 scopeVersion does not match the P11B handoff.', { handoffScopeVersion: handoffScope, recordScopeVersion: recordScope });

  const provenance = approval.data.handoffProvenance;
  if (!provenance || typeof provenance !== 'object' || Array.isArray(provenance)) {
    add('HANDOFF_PROVENANCE_MISSING', 'P10 record must include handoffProvenance linking it to the exact P11B handoff.');
  } else {
    if (provenance.p11bBundleSha256 !== handoff.data.bundleSha256) add('HANDOFF_BUNDLE_MISMATCH', 'P10 handoffProvenance.p11bBundleSha256 does not match the P11B bundle digest.');
    const actualManifestSha = handoff.raw ? sha256(handoff.raw) : null;
    if (provenance.p11bManifestSha256 !== actualManifestSha) add('HANDOFF_MANIFEST_HASH_MISMATCH', 'P10 handoffProvenance.p11bManifestSha256 does not match the exact P11B manifest bytes.');
  }
}

const linked = errors.length === 0;
const result = {
  schema: 'kirthiverse.p11c.review-handoff-provenance.v1',
  status: linked ? 'TRACEABLE_EXTERNAL_REFERENCE_SET' : 'HOLD',
  p11bManifestSha256: handoff.raw ? sha256(handoff.raw) : null,
  p11bBundleSha256: handoff.data?.bundleSha256 || null,
  p10RecordSha256: approval.raw ? sha256(approval.raw) : null,
  pilotReference: handoff.data?.scope?.pilotReference || approval.data?.pilot?.pilotReference || null,
  scopeVersion: handoff.data?.scope?.scopeVersion || approval.data?.pilot?.scopeVersion || null,
  p10Status: p10Report?.status || null,
  errors,
  claimGates: {
    canRecordTraceableExternalReferenceSet: linked,
    canClaimReviewerAuthenticity: false,
    canClaimExternalApproval: false,
    canClaimLegalCompliance: false,
    canClaimSafeguardingCertification: false,
    canStartParticipantPilot: false,
    canClaimProductionReadiness: false
  },
  limitations: [
    'P11C proves linkage between exact P11B handoff bytes/bundle identity and a structurally complete P10 record; it does not authenticate reviewers or signatures.',
    'A P10 structural pass and P11C provenance pass do not establish legal sufficiency, safeguarding certification, consent validity, school approval or research-ethics approval.',
    'SHA-256 values are traceability aids only and are not described as tamper-evident audit logging.',
    'P4 owner attestation and every real-world launch condition remain independent gates; P5 and production remain blocked unless those gates genuinely pass.'
  ]
};

const text = JSON.stringify(result, null, 2) + '\n';
if (output) fs.writeFileSync(output, text);
process.stdout.write(text);
process.exit(linked ? 0 : 1);
