#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const REQUIRED_DOCUMENTS = [
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

const argv = process.argv.slice(2);
const mode = argv[0];
const input = argv[1];
const getArg = name => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
};
const output = getArg('--output');
const documentRoot = path.resolve(getArg('--document-root') || '.');

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const read = file => fs.readFileSync(file);
const fail = (code, message, detail = {}) => ({ code, message, ...detail });

function validateScope(scopePath) {
  const validator = path.resolve('scripts/validate-pilot-scope-freeze.mjs');
  const run = spawnSync(process.execPath, [validator, scopePath], { encoding: 'utf8' });
  let report = null;
  try { report = JSON.parse(run.stdout || '{}'); } catch {}
  if (run.status !== 0 || report?.status !== 'STRUCTURALLY_FROZEN_PILOT_SCOPE') {
    return { ok: false, report, error: fail('SCOPE_NOT_STRUCTURALLY_FROZEN', 'P11B requires a P11A scope that passes the existing scope-freeze validator.') };
  }
  return { ok: true, report };
}

function sourceCommit() {
  const run = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : null;
}

function buildManifest(scopePath) {
  const errors = [];
  if (!scopePath || !fs.existsSync(scopePath)) {
    errors.push(fail('SCOPE_FILE_MISSING', 'Scope file is required.', { path: scopePath || null }));
  }
  let scopeValidation = null;
  let scopeRaw = null;
  if (!errors.length) {
    scopeRaw = read(scopePath);
    scopeValidation = validateScope(scopePath);
    if (!scopeValidation.ok) errors.push(scopeValidation.error);
  }

  const documents = [];
  for (const rel of REQUIRED_DOCUMENTS) {
    const full = path.join(documentRoot, rel);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
      errors.push(fail('REVIEW_DOCUMENT_MISSING', 'Required external-review document is missing.', { path: rel }));
      continue;
    }
    const bytes = read(full);
    documents.push({ path: rel, bytes: bytes.length, sha256: sha256(bytes) });
  }
  documents.sort((a, b) => a.path.localeCompare(b.path));

  const ready = errors.length === 0;
  const scope = ready ? {
    pilotReference: scopeValidation.report.pilotReference,
    scopeVersion: scopeValidation.report.scopeVersion,
    sha256: sha256(scopeRaw),
    validationStatus: scopeValidation.report.status
  } : null;

  const digestInput = ready
    ? JSON.stringify({ scope, documents: documents.map(({ path, bytes, sha256 }) => ({ path, bytes, sha256 })) })
    : null;

  return {
    schema: 'kirthiverse.p11b.external-review-handoff-integrity.v1',
    status: ready ? 'EXTERNAL_REVIEW_HANDOFF_INTEGRITY_READY' : 'HOLD',
    canonicalRepository: 'ssakthivel02/kirthiverse-hitech',
    sourceCommit: sourceCommit(),
    scope,
    documents,
    bundleSha256: ready ? sha256(digestInput) : null,
    errors,
    claimGates: {
      canSendExactBundleToExternalReviewer: ready,
      canClaimExternallyApproved: false,
      canClaimLegalCompliance: false,
      canClaimSafeguardingCertification: false,
      canStartParticipantPilot: false,
      canClaimProductionReadiness: false
    },
    limitations: [
      'This manifest proves only file/scope integrity for the prepared handoff; it does not prove reviewer competence or approval.',
      'SHA-256 values are traceability aids and do not by themselves create tamper-evident audit logging.',
      'Any material scope or document change after handoff requires a new manifest and, where applicable, external re-review.'
    ]
  };
}

function verifyManifest(manifestPath, scopePath) {
  const errors = [];
  if (!manifestPath || !fs.existsSync(manifestPath)) {
    return { schema: 'kirthiverse.p11b.external-review-handoff-verification.v1', status: 'HOLD', errors: [fail('MANIFEST_FILE_MISSING', 'Manifest file is required.')], claimGates: { exactHandoffStillMatches: false, canStartParticipantPilot: false, canClaimProductionReadiness: false } };
  }
  let recorded;
  try { recorded = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
  catch { return { schema: 'kirthiverse.p11b.external-review-handoff-verification.v1', status: 'HOLD', errors: [fail('MANIFEST_JSON_INVALID', 'Manifest is not valid JSON.')], claimGates: { exactHandoffStillMatches: false, canStartParticipantPilot: false, canClaimProductionReadiness: false } }; }

  if (recorded.schema !== 'kirthiverse.p11b.external-review-handoff-integrity.v1' || recorded.status !== 'EXTERNAL_REVIEW_HANDOFF_INTEGRITY_READY') {
    errors.push(fail('MANIFEST_NOT_READY', 'Only a READY P11B manifest can be verified.'));
  }
  const current = buildManifest(scopePath);
  if (current.status !== 'EXTERNAL_REVIEW_HANDOFF_INTEGRITY_READY') errors.push(...current.errors);
  if (recorded.scope?.sha256 !== current.scope?.sha256) errors.push(fail('SCOPE_HASH_MISMATCH', 'Frozen scope no longer matches the recorded handoff.'));
  const recordedDocs = new Map((recorded.documents || []).map(x => [x.path, x]));
  for (const doc of current.documents || []) {
    const old = recordedDocs.get(doc.path);
    if (!old) errors.push(fail('DOCUMENT_NOT_IN_MANIFEST', 'Required document was not recorded in the manifest.', { path: doc.path }));
    else if (old.sha256 !== doc.sha256 || old.bytes !== doc.bytes) errors.push(fail('DOCUMENT_HASH_MISMATCH', 'Review document no longer matches the recorded handoff.', { path: doc.path }));
  }
  for (const rel of REQUIRED_DOCUMENTS) if (!recordedDocs.has(rel)) errors.push(fail('REQUIRED_DOCUMENT_NOT_RECORDED', 'Manifest omitted a required review document.', { path: rel }));
  if (recorded.bundleSha256 !== current.bundleSha256) errors.push(fail('BUNDLE_HASH_MISMATCH', 'Handoff bundle digest no longer matches.'));

  const match = errors.length === 0;
  return {
    schema: 'kirthiverse.p11b.external-review-handoff-verification.v1',
    status: match ? 'EXACT_EXTERNAL_REVIEW_HANDOFF_MATCH' : 'HOLD',
    recordedBundleSha256: recorded.bundleSha256 || null,
    currentBundleSha256: current.bundleSha256 || null,
    errors,
    claimGates: {
      exactHandoffStillMatches: match,
      canClaimExternallyApproved: false,
      canStartParticipantPilot: false,
      canClaimProductionReadiness: false
    }
  };
}

if (!['create', 'verify'].includes(mode)) {
  console.error('Usage: create <scope.json> [--document-root dir] [--output manifest.json] | verify <manifest.json> <scope.json> [--document-root dir] [--output report.json]');
  process.exit(2);
}

let result;
if (mode === 'create') {
  result = buildManifest(input);
} else {
  const scopePath = argv[2];
  result = verifyManifest(input, scopePath);
}
const json = JSON.stringify(result, null, 2) + '\n';
if (output) fs.writeFileSync(output, json);
process.stdout.write(json);
process.exit(result.status === 'EXTERNAL_REVIEW_HANDOFF_INTEGRITY_READY' || result.status === 'EXACT_EXTERNAL_REVIEW_HANDOFF_MATCH' ? 0 : 1);
