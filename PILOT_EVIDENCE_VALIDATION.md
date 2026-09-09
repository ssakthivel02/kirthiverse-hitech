# KirthiVerse P6 — Pilot Evidence Validation

## Purpose

P6 validates an exported P5 controlled-pilot evidence JSON file before its numbers are reused in a funding, grant, partner, school, research or investor document.

The validator is deliberately conservative. It verifies structure, internal consistency, evidence boundaries, obvious sensitive-field leakage and unsupported positive claims. It does **not** verify the truth or legal sufficiency of the owner-supplied P4 readiness references.

## Evidence chain

```text
P3 measured local evidence
  -> P4 owner-attested readiness
  -> P5 readiness-gated controlled run
  -> P5 end/freeze/export
  -> P6 offline validation
  -> human-reviewed external wording
```

P6 is not a substitute for safeguarding, privacy, legal, school, ethics or research review.

## Run the validator

Basic validation:

```bash
node scripts/validate-pilot-evidence.mjs kirthiverse-controlled-pilot-run-evidence.json
```

Write a validation report:

```bash
node scripts/validate-pilot-evidence.mjs kirthiverse-controlled-pilot-run-evidence.json \
  --output kirthiverse-controlled-pilot-run-validation.json
```

Require a complete seven-day observation window:

```bash
node scripts/validate-pilot-evidence.mjs kirthiverse-controlled-pilot-run-evidence.json \
  --require-seven-day-window \
  --output kirthiverse-controlled-pilot-run-validation.json
```

The strict command exits non-zero when the evidence does not establish a validated complete seven-day observation window.

## Validator statuses

| Status | Meaning |
|---|---|
| `STRUCTURALLY_VALID_LOCAL_PILOT_EVIDENCE` | No structural errors or current warnings were found. This is still local controlled-pilot evidence only. |
| `STRUCTURALLY_VALID_WITH_LIMITATIONS` | Structure is usable but one or more limitations/warnings must accompany external interpretation. |
| `INVALID` | Do not reuse the evidence externally until the listed errors are resolved. |
| `INVALID_JSON` | The source file is not valid JSON. |

## Fail-closed checks

P6 rejects or flags, among other cases:

- wrong evidence schema;
- a P5 run that is not ended/frozen;
- missing or invalid start/end timestamps;
- P4 not READY at P5 start;
- missing P4 start/end snapshots or frozen records;
- operator acknowledgement upgraded from self-attestation to verified identity/consent;
- missing frozen final metrics;
- invalid metric ranges or types;
- a claimed seven-day window contradicted by run timestamps;
- missing local-only/non-production/non-tamper-evident boundaries;
- forbidden PIN, child-name, contact or school-identity fields;
- manually-added positive claims such as `retention:true`, `learningImprovement:true` or `productionReady:true`.

## Claim gates

A structurally valid P6 report may set these descriptive gates:

- `canDescribeAsLocalControlledPilotEvidence`
- `canDescribeCompletedSevenDayObservation`

The following remain **false** by design in P6:

- `canClaimRetention`
- `canClaimLearningImprovement`
- `canClaimCohortOutcome`
- `canClaimLegalCompliance`
- `canClaimSafeguardingCertification`
- `canClaimProductionReadiness`
- `canClaimTamperEvidentAnalytics`

A complete seven-day observation window is not the same as seven-day retention. Activity and lesson-completion counts are not, on their own, evidence of learning improvement.

## SHA-256 digest

P6 computes SHA-256 over the exact source-file bytes and returns it as `sha256`.

Use the digest to identify the exact exported file that was reviewed. Preserve the original JSON unchanged after recording the digest; any modification creates a different digest.

A SHA-256 digest by itself does **not** make evidence tamper-evident. It has no trusted timestamp, signer, append-only log or independent custody mechanism.

## External wording examples

Allowed when the corresponding P6 gate is true:

> “This file contains locally observed evidence from a controlled KirthiVerse pilot run and passed the P6 structural/evidence-boundary validator.”

Allowed only when `canDescribeCompletedSevenDayObservation === true`:

> “The validated run contains a completed seven-day observation window.”

Do not convert that sentence into “seven-day retention”.

Do not state “learning improved” unless a separate, appropriate pre/post outcome design and analysis supports that claim.

## QA

Run the deterministic fixture suite locally:

```bash
node tests/pilot-evidence-validator.test.mjs
```

CI runs the same suite for every P6 pull request affecting the validator, tests, workflow or evidence runbooks.
