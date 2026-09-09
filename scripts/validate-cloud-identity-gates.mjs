import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CONTRACT_PATH = 'governance/cloud-identity-gates.v1.json';

function fail(message) {
  const error = new Error(message);
  error.code = 'CLOUD_IDENTITY_HOLD_INVALID';
  throw error;
}

function requireEqual(actual, expected, message) {
  if (actual !== expected) fail(`${message}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}

export function validateCloudIdentityContract(contract, runtime = {}) {
  if (!contract || typeof contract !== 'object' || Array.isArray(contract)) fail('contract must be an object');

  requireEqual(contract.schemaVersion, '1.0.0', 'schemaVersion mismatch');
  requireEqual(contract.project, 'KirthiVerse', 'project mismatch');
  requireEqual(contract.status, 'ARCHITECTURE_ONLY_HOLD', 'cloud identity status must remain HOLD');
  requireEqual(contract.canonicalRepository, 'ssakthivel02/kirthiverse-hitech', 'canonical repository mismatch');
  requireEqual(contract.activeBranch, 'main', 'active branch mismatch');

  requireEqual(contract.reconciliation?.sourcePolicy, 'READ_ONLY_REFERENCE', 'historical source policy changed');
  requireEqual(contract.reconciliation?.method, 'ONE_TIME_RECONCILED_INTO_ACTIVE_MASTER', 'reconciliation method changed');
  requireEqual(contract.reconciliation?.oldBranchIsNotActiveSource, true, 'historical branch must remain non-active');

  if (runtime.repository) requireEqual(runtime.repository, contract.canonicalRepository, 'workflow repository mismatch');
  if (runtime.baseRef) requireEqual(runtime.baseRef, contract.activeBranch, 'pull-request base branch mismatch');

  const capabilityNames = [
    'activationAllowed',
    'productionAuthEnabled',
    'childCloudIdentityEnabled',
    'guardianLinkingEnabled',
    'teacherSchoolRbacEnabled',
    'rosterSyncEnabled',
    'realPersonalDataAllowed',
    'remoteLearnerEvidenceSyncEnabled',
  ];
  for (const name of capabilityNames) requireEqual(contract.capabilities?.[name], false, `${name} must remain false`);

  const gates = Object.entries(contract.requiredEvidenceGates || {});
  if (gates.length < 10) fail('insufficient required evidence gates');
  for (const [name, value] of gates) requireEqual(value, false, `evidence gate ${name} cannot self-promote`);

  const pilotBoundaryNames = [
    'p4OwnerAttestationDoesNotAuthorizeCloudIdentity',
    'p10ExternalReferenceGateDoesNotAuthorizeCloudIdentity',
    'localControlledPilotDoesNotVerifyGuardianIdentity',
    'localControlledPilotDoesNotVerifyLegalConsent',
    'localControlledPilotMayContinueOnlyWithinItsSeparatelyReviewedLocalScope',
  ];
  for (const name of pilotBoundaryNames) requireEqual(contract.pilotBoundary?.[name], true, `pilot boundary missing: ${name}`);

  const requiredProhibitions = [
    'create real child cloud profile',
    'link guardian identity to a real learner',
    'upload or synchronise a real learner roster',
    'activate production authentication for child-linked cloud identity',
  ];
  for (const item of requiredProhibitions) {
    if (!contract.prohibitedWhileHold?.includes(item)) fail(`missing HOLD prohibition: ${item}`);
  }

  if (!contract.principles?.includes('local-first until separately approved')) fail('local-first principle missing');

  const claimBoundaryNames = [
    'legalComplianceVerified',
    'safeguardingCertificationVerified',
    'guardianIdentityVerified',
    'legalConsentVerified',
    'productionReady',
  ];
  for (const name of claimBoundaryNames) requireEqual(contract.claimBoundaries?.[name], false, `unsupported positive claim: ${name}`);

  if (typeof contract.changeRule !== 'string' || contract.changeRule.length < 80) fail('changeRule must explain the future evidence boundary');

  return {
    status: 'CLOUD_IDENTITY_ARCHITECTURE_HOLD',
    evidenceGateCount: gates.length,
    capabilityCount: capabilityNames.length,
    activationAllowed: false,
    productionReady: false,
  };
}

export function loadAndValidateCloudIdentityContract(contractPath = CONTRACT_PATH, runtime = {}) {
  const text = fs.readFileSync(contractPath, 'utf8');
  return validateCloudIdentityContract(JSON.parse(text), runtime);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
const thisPath = fileURLToPath(import.meta.url);
if (invokedPath === thisPath) {
  try {
    const result = loadAndValidateCloudIdentityContract(process.argv[2] || CONTRACT_PATH, {
      repository: process.env.GITHUB_REPOSITORY || undefined,
      baseRef: process.env.GITHUB_BASE_REF || undefined,
    });
    console.log(
      `CLOUD_IDENTITY_HOLD_PASS gates=${result.evidenceGateCount} capabilities=${result.capabilityCount} activationAllowed=false productionReady=false`,
    );
  } catch (error) {
    console.error(`CLOUD_IDENTITY_HOLD_FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}
