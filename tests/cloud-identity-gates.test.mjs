import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateCloudIdentityContract } from '../scripts/validate-cloud-identity-gates.mjs';

const baseline = JSON.parse(fs.readFileSync('governance/cloud-identity-gates.v1.json', 'utf8'));
const clone = () => structuredClone(baseline);
const mustFail = (name, mutate, runtime = {}) => {
  const candidate = clone();
  mutate(candidate);
  assert.throws(
    () => validateCloudIdentityContract(candidate, runtime),
    error => error?.code === 'CLOUD_IDENTITY_HOLD_INVALID',
    `${name} must fail closed`,
  );
};

const valid = validateCloudIdentityContract(clone(), {
  repository: 'ssakthivel02/kirthiverse-hitech',
  baseRef: 'main',
});
assert.equal(valid.status, 'CLOUD_IDENTITY_ARCHITECTURE_HOLD');
assert.equal(valid.activationAllowed, false);
assert.equal(valid.productionReady, false);
assert.ok(valid.evidenceGateCount >= 10);

mustFail('global activation', c => { c.capabilities.activationAllowed = true; });
mustFail('child cloud identity', c => { c.capabilities.childCloudIdentityEnabled = true; });
mustFail('guardian linking', c => { c.capabilities.guardianLinkingEnabled = true; });
mustFail('self-promoted evidence gate', c => { c.requiredEvidenceGates.privacyImpactAssessmentApproved = true; });
mustFail('P10 boundary removal', c => { c.pilotBoundary.p10ExternalReferenceGateDoesNotAuthorizeCloudIdentity = false; });
mustFail('unsupported consent claim', c => { c.claimBoundaries.legalConsentVerified = true; });
mustFail('historical source promotion', c => { c.reconciliation.sourcePolicy = 'ACTIVE_SOURCE'; });
mustFail('missing roster prohibition', c => {
  c.prohibitedWhileHold = c.prohibitedWhileHold.filter(x => x !== 'upload or synchronise a real learner roster');
});
mustFail('wrong workflow repository', () => {}, {
  repository: 'ssakthivel02/kirthiverse',
  baseRef: 'main',
});
mustFail('wrong PR target', () => {}, {
  repository: 'ssakthivel02/kirthiverse-hitech',
  baseRef: 'legacy',
});

console.log('CLOUD_IDENTITY_HOLD_TEST_PASS cases=11 baseline=1 negative=10');
