#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kirthiverse-p11c-'));
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const run = (...args) => spawnSync(process.execPath, args, { cwd: repoRoot, encoding: 'utf8' });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

const manifestPath = path.join(tmp, 'p11b.json');
const recordPath = path.join(tmp, 'p10.json');

const manifest = {
  schema: 'kirthiverse.p11b.external-review-handoff-integrity.v1',
  status: 'EXTERNAL_REVIEW_HANDOFF_INTEGRITY_READY',
  canonicalRepository: 'ssakthivel02/kirthiverse-hitech',
  sourceCommit: 'a'.repeat(40),
  scope: {
    pilotReference: 'KV-PILOT-TRACE-001',
    scopeVersion: 'scope-v1',
    sha256: '1'.repeat(64),
    validationStatus: 'STRUCTURALLY_FROZEN_PILOT_SCOPE'
  },
  documents: [],
  bundleSha256: '2'.repeat(64),
  errors: [],
  claimGates: {
    canSendExactBundleToExternalReviewer: true,
    canClaimExternallyApproved: false,
    canClaimLegalCompliance: false,
    canClaimSafeguardingCertification: false,
    canStartParticipantPilot: false,
    canClaimProductionReadiness: false
  }
};
writeJson(manifestPath, manifest);
const manifestDigest = sha256(fs.readFileSync(manifestPath));

const approved = (reference, summary = undefined) => ({
  required: true,
  status: 'approved_by_responsible_process',
  reference,
  authorityRoleOrOrganisation: 'Responsible external review process',
  reviewDate: '2026-09-01',
  scopeVersion: 'scope-v1',
  ...(summary ? { approvedSummary: summary } : {})
});

const record = {
  schema: 'kirthiverse.hitech.external-pilot-approval-record.v1',
  template: false,
  recordedDate: '2026-09-02',
  pilot: {
    pilotReference: 'KV-PILOT-TRACE-001',
    ownerRole: 'KirthiVerse pilot owner',
    subject: 'Mathematics',
    scopeVersion: 'scope-v1',
    jurisdiction: 'England, UK',
    organisationContext: 'Controlled external pilot review',
    ageBand: '7–10',
    durationWeeks: 4,
    cohortCeiling: 12
  },
  handoffProvenance: {
    p11bBundleSha256: manifest.bundleSha256,
    p11bManifestSha256: manifestDigest
  },
  approvals: {
    specialistReview: approved('REF-SPECIALIST-001'),
    participantInformationPermission: approved('REF-PARTICIPANT-002'),
    dataMinimisationRetention: approved('REF-DATA-003'),
    incidentEscalation: approved('REF-INCIDENT-004'),
    stoppingRestart: approved('REF-STOP-005', 'Approved stopping and restart criteria are recorded for this exact controlled pilot scope.'),
    metricsEvidence: approved('REF-METRICS-006', 'Approved evidence protocol records bounded activity and assessment measures without claiming outcomes.'),
    organisationApproval: {
      required: false,
      status: 'not_applicable_by_responsible_process',
      decisionReference: 'REF-ORG-NA-007',
      decisionAuthorityRoleOrOrganisation: 'Responsible organisational review process',
      decisionRationale: 'The responsible process determined that a separate organisation approval is not applicable to this test fixture.',
      decisionDate: '2026-09-01',
      scopeVersion: 'scope-v1'
    },
    researchEthicsApproval: {
      required: false,
      status: 'not_applicable_by_responsible_process',
      decisionReference: 'REF-ETHICS-NA-008',
      decisionAuthorityRoleOrOrganisation: 'Responsible ethics applicability process',
      decisionRationale: 'The responsible process determined that separate research ethics approval is not applicable to this test fixture.',
      decisionDate: '2026-09-01',
      scopeVersion: 'scope-v1'
    }
  },
  ownerAttestation: {
    referencesCorrespondToRealExternalRecords: true,
    allConditionsUnderstood: true,
    p4WillUseSamePilotScope: true,
    noProductionClaimAcknowledged: true,
    noLegalCertificationClaimAcknowledged: true
  }
};
writeJson(recordPath, record);

function invoke(m = manifestPath, r = recordPath) {
  const result = run('scripts/validate-review-handoff-provenance.mjs', m, r);
  let parsed;
  try { parsed = JSON.parse(result.stdout); } catch { throw new Error(`Validator returned non-JSON: ${result.stdout}\n${result.stderr}`); }
  return { result, parsed };
}

let x = invoke();
assert(x.result.status === 0, 'valid linkage must exit 0');
assert(x.parsed.status === 'TRACEABLE_EXTERNAL_REFERENCE_SET', 'valid linkage must pass');
assert(x.parsed.claimGates.canRecordTraceableExternalReferenceSet === true, 'traceability gate must be true');
assert(x.parsed.claimGates.canStartParticipantPilot === false, 'P11C must not authorise pilot start');
assert(x.parsed.claimGates.canClaimProductionReadiness === false, 'P11C must not claim production readiness');

const pilotMismatch = structuredClone(record);
pilotMismatch.pilot.pilotReference = 'KV-PILOT-OTHER';
const pilotMismatchPath = path.join(tmp, 'pilot-mismatch.json');
writeJson(pilotMismatchPath, pilotMismatch);
x = invoke(manifestPath, pilotMismatchPath);
assert(x.result.status !== 0, 'pilot mismatch must fail');
assert(x.parsed.errors.some(e => e.code === 'PILOT_REFERENCE_MISMATCH'), 'pilot mismatch error required');

const scopeMismatch = structuredClone(record);
scopeMismatch.pilot.scopeVersion = 'scope-v2';
for (const item of Object.values(scopeMismatch.approvals)) item.scopeVersion = 'scope-v2';
const scopeMismatchPath = path.join(tmp, 'scope-mismatch.json');
writeJson(scopeMismatchPath, scopeMismatch);
x = invoke(manifestPath, scopeMismatchPath);
assert(x.result.status !== 0, 'scope mismatch must fail');
assert(x.parsed.errors.some(e => e.code === 'SCOPE_VERSION_MISMATCH'), 'scope mismatch error required');

const bundleMismatch = structuredClone(record);
bundleMismatch.handoffProvenance.p11bBundleSha256 = '3'.repeat(64);
const bundleMismatchPath = path.join(tmp, 'bundle-mismatch.json');
writeJson(bundleMismatchPath, bundleMismatch);
x = invoke(manifestPath, bundleMismatchPath);
assert(x.result.status !== 0, 'bundle mismatch must fail');
assert(x.parsed.errors.some(e => e.code === 'HANDOFF_BUNDLE_MISMATCH'), 'bundle mismatch error required');

const incomplete = structuredClone(record);
incomplete.approvals.specialistReview.status = 'not_reviewed';
const incompletePath = path.join(tmp, 'incomplete-p10.json');
writeJson(incompletePath, incomplete);
x = invoke(manifestPath, incompletePath);
assert(x.result.status !== 0, 'incomplete P10 must fail');
assert(x.parsed.errors.some(e => e.code === 'P10_NOT_STRUCTURALLY_COMPLETE'), 'P10 structural error required');

const tamperedManifest = structuredClone(manifest);
tamperedManifest.sourceCommit = 'b'.repeat(40);
const tamperedManifestPath = path.join(tmp, 'tampered-manifest.json');
writeJson(tamperedManifestPath, tamperedManifest);
x = invoke(tamperedManifestPath, recordPath);
assert(x.result.status !== 0, 'manifest byte drift must fail');
assert(x.parsed.errors.some(e => e.code === 'HANDOFF_MANIFEST_HASH_MISMATCH'), 'manifest hash mismatch error required');

console.log('P11C_REVIEW_HANDOFF_PROVENANCE_TEST_PASS');
