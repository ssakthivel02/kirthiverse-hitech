# KirthiVerse P10 External Pilot Launch Gate

> **STATUS: SOFTWARE STRUCTURAL GATE ONLY — NOT EXTERNAL APPROVAL, LEGAL ADVICE OR SAFEGUARDING CERTIFICATION**

## Purpose

P9 provides draft/template materials for a genuine external pilot-review process. P10 adds a machine-readable, fail-closed check between those external records and P4 owner attestation.

The P10 question is narrow:

> **Does this owner-supplied record contain a structurally complete, scope-consistent set of external references suitable to support manual P4 owner attestation?**

P10 does **not** answer whether a reviewer is qualified, whether a signature is authentic, whether consent is legally valid, whether school/organisation approval is legally required, whether research-ethics approval is legally required, whether safeguarding duties are satisfied, or whether KirthiVerse is production ready.

## Evidence sequence

Use the sequence below. Do not skip directly from P9 templates to P5.

1. Finalise the real pilot scope externally.
2. Obtain the real specialist/review/approval artifacts through the responsible process.
3. Record the external references in a copy of `PILOT_EXTERNAL_APPROVAL_RECORD_TEMPLATE.json`.
4. Change `template` to `false` only for a real populated record.
5. Run P10 validation.
6. If P10 returns `HOLD`, resolve the errors; do not use the record to support P4 READY.
7. If P10 returns `STRUCTURALLY_COMPLETE_EXTERNAL_REFERENCE_SET`, manually review the underlying real artifacts and transfer the same scope/references into P4.
8. The owner must personally complete P4 attestations. P10 does not auto-check them.
9. P5 may start only when P4 independently evaluates `OWNER_ATTESTED_CONTROLLED_PILOT_READY` and the real-world pilot conditions remain satisfied.

## Required machine-readable record

`PILOT_EXTERNAL_APPROVAL_RECORD_TEMPLATE.json` contains:

- pilot reference;
- owner role;
- P4-compatible age band;
- subject;
- duration, 1–12 weeks;
- cohort ceiling, 1–100;
- jurisdiction/context description;
- a single `scopeVersion` binding every approval/decision to the same pilot scope;
- six required P4 prerequisite approval references;
- explicit organisation/school approval applicability decision;
- explicit research-ethics approval applicability decision;
- owner acknowledgements that the references correspond to real external records and that P10 is not production/legal certification.

Avoid personal contact details in this structural record. Store externally governed documents in the approved external process and record only bounded references/roles here.

## Six mandatory P4 prerequisite reference categories

P10 requires all six of these as `approved_by_responsible_process`:

1. specialist safeguarding/privacy review;
2. participant/parent information and permission process;
3. data minimisation / retention / deletion plan;
4. incident / escalation route;
5. stopping / restart criteria;
6. metrics / evidence protocol.

The stopping/restart and metrics rows also require a bounded `approvedSummary` for manual transfer into the corresponding P4 narrative fields.

## Conditional approvals

P10 does not decide whether organisation/school approval or research-ethics approval is legally/operationally required.

The responsible process must set each item explicitly:

- `required: true` → provide a full approved reference; or
- `required: false` → provide a real applicability-decision reference, responsible authority role/organisation, decision date and rationale.

For a validation run where one is known to be mandatory, use:

```bash
node scripts/validate-external-pilot-approval.mjs my-record.json --require-organisation-approval
```

or:

```bash
node scripts/validate-external-pilot-approval.mjs my-record.json --require-research-ethics-approval
```

Both flags may be supplied together.

## Normal validation

```bash
node scripts/validate-external-pilot-approval.mjs my-record.json
```

Write the validation result to a file:

```bash
node scripts/validate-external-pilot-approval.mjs my-record.json --output p10-validation.json
```

Exit codes:

- `0` — structurally complete external reference set;
- `1` — HOLD / invalid record;
- `2` — CLI usage error.

## Fail-closed checks

P10 rejects or HOLDs records when it finds, among other things:

- repository/template placeholders;
- missing required approvals;
- status other than `approved_by_responsible_process` for the six required categories;
- a review bound to a different `scopeVersion`;
- duplicate external references reused across different approval rows;
- review/decision dates after the record date;
- invalid validity-date ordering;
- unsupported P4 age band;
- duration outside 1–12 weeks;
- cohort ceiling outside 1–100;
- undecided conditional approval applicability;
- sensitive fields such as participant/child/parent names, emails, phone numbers, DOB, school ID or Parent PIN material;
- obvious unsupported positive claims in the approved P4 summaries.

## P4 transfer output

A valid P10 report contains a `p4Transfer` object for the fields P4 already requires:

- `ageBand`
- `subject`
- `durationWeeks`
- `cohortCeiling`
- `reviewReference`
- `reviewDate`
- `consentPackReference`
- `dataPlanReference`
- `incidentRouteReference`
- `stoppingCriteria`
- `metricsProtocol`

This is a copy aid, not an auto-approval mechanism. The owner must compare the real artifacts and personally complete the P4 attestations.

## Claim boundary

Even when P10 is structurally complete:

- `canProceedToP4OwnerAttestation = true`
- `canStartP5 = false`
- `canClaimExternalApproval = false`
- `canClaimLegalCompliance = false`
- `canClaimSafeguardingCertification = false`
- `canClaimProductionReadiness = false`

P10 therefore cannot be quoted as proof that an external authority approved the pilot. It proves only that the supplied JSON record passed the repository's structural consistency checks.

## SHA-256 boundary

P10 reports the SHA-256 digest of the exact input record for traceability. The digest does not verify signatures, document authenticity, reviewer authority, legal sufficiency or absence of tampering before the digest was created.

## Relationship to P9, P4 and P5

- **P9** — draft/review materials and blank approval register; no approval is created by repository merge.
- **P10** — structural validation of a populated owner-supplied external reference set.
- **P4** — local owner-attestation gate; still independently requires all fields/attestations and P3 metrics runtime.
- **P5** — controlled pilot run; remains blocked unless P4 is READY.

The correct sequence is:

**real external process → P10 structural validation → manual P4 owner attestation → P4 READY → P5 controlled run → P6/P7/P8 evidence chain.**

## QA

`.github/workflows/p10-external-pilot-launch-gate-qa.yml` proves that:

- the blank repository template cannot pass;
- a complete same-scope record can proceed only to P4 owner attestation;
- P10 never starts P5 directly;
- missing/placeholder/duplicate references fail closed;
- scope mismatches fail closed;
- future-relative-to-record dates fail closed;
- conditional approval applicability cannot be left undecided;
- strict CLI policy can require organisation/school or research-ethics approval;
- sensitive-field leakage fails closed;
- obvious unsupported positive outcome/compliance claims fail closed;
- P4-aligned duration/cohort/age bounds are enforced.
