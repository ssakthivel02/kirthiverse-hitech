# KirthiVerse P11B External Review Handoff Integrity

> **STATUS: REVIEW-HANDOFF TRACEABILITY CONTROL — NOT AN APPROVAL**
>
> P11B proves only that a specific structurally frozen P11A scope and a specific set of reviewer documents were bundled together without later drift. It does not create consent, safeguarding certification, legal compliance, school/organisation approval, research-ethics approval, participant-pilot permission or production readiness.

## Why P11B exists

P11A defines the review handoff, but a reviewer decision is only meaningful if KirthiVerse can later identify the exact scope and exact documents that were actually provided. P11B therefore creates a deterministic SHA-256 manifest for the handoff and can later verify that the scope and documents still match that recorded bundle.

## Preconditions

Before creating a P11B manifest:

1. Create a real working copy of `PILOT_SCOPE_FREEZE_TEMPLATE.json` outside the blank repository template.
2. Fill it truthfully and set `template=false` only when the real scope is complete.
3. Validate it with `scripts/validate-pilot-scope-freeze.mjs`.
4. Required status: `STRUCTURALLY_FROZEN_PILOT_SCOPE`.
5. Keep the P11A baseline controls intact: `liveAIEnabled=false`, `cloudChildIdentityEnabled=false`, no participant PII in the scope record, and material scope changes require re-review.

## Create the handoff manifest

From the exact repository revision whose documents will be sent to the reviewer:

```bash
node scripts/external-review-handoff-integrity.mjs create <real-scope.json> --output <handoff-manifest.json>
```

Required result:

`EXTERNAL_REVIEW_HANDOFF_INTEGRITY_READY`

The manifest binds:

- the validated pilot reference and `scopeVersion`;
- SHA-256 of the exact frozen scope file;
- the current repository commit where available;
- SHA-256 and byte length of every required P11A review document;
- a deterministic bundle SHA-256 derived from the scope and document inventory.

## Required document set

P11B currently binds these exact files:

- `P11A_EXTERNAL_REVIEW_EXECUTION_PACK.md`
- `EXTERNAL_PILOT_REVIEW_PACK.md`
- `PILOT_PARTICIPANT_INFORMATION_DRAFT.md`
- `PILOT_DATA_MINIMISATION_RETENTION_DRAFT.md`
- `PILOT_INCIDENT_ESCALATION_DRAFT.md`
- `PILOT_STOPPING_CRITERIA_DRAFT.md`
- `PILOT_METRICS_PROTOCOL_DRAFT.md`
- `PILOT_SPECIALIST_REVIEW_CHECKLIST.md`
- `PILOT_APPROVAL_REGISTER_TEMPLATE.md`
- `P11A_UK_OFFICIAL_REFERENCE_GUIDE.md`

If a required file is missing, manifest creation HOLDs.

## Verify later

Before relying on the handoff as the source for a reviewer decision or transferring references into P10, verify the recorded bundle against the current working copy:

```bash
node scripts/external-review-handoff-integrity.mjs verify <handoff-manifest.json> <real-scope.json>
```

Required result:

`EXACT_EXTERNAL_REVIEW_HANDOFF_MATCH`

Verification HOLDs on scope drift, document drift, missing documents, invalid manifest status or bundle mismatch.

## Change-control rule

After a manifest has been supplied to an external reviewer, any material change to the scope or any reviewer-facing document requires a new manifest. If the change affects what the reviewer was asked to assess, the responsible external process must decide whether re-review is required. Repository automation must not make that decision.

## Claim boundaries

A READY manifest permits only this statement:

> The prepared external-review handoff can be traced to this exact frozen scope and this exact set of files.

It never permits any of these statements by itself:

- externally approved;
- legally compliant;
- safeguarding certified;
- valid participant/parent consent obtained;
- school/organisation approved;
- research-ethics approved;
- participant pilot authorised;
- production ready.

SHA-256 is used as a traceability aid only. It is not described as tamper-evident audit logging.
