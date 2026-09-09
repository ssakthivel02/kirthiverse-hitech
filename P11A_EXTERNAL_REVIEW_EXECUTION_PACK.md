# KirthiVerse P11A External Review Execution Pack

> **STATUS: DRAFT EXTERNAL-REVIEW INPUT — NOT AN APPROVAL**
>
> This pack does not provide legal advice, consent, safeguarding certification, school approval, research-ethics approval or production readiness. Real decisions must come from the responsible external/organisational process.

## Purpose

Turn P11 Issue #24 from a broad blocker into a controlled review handoff. P11A freezes the exact pilot scope before external review starts, so later evidence cannot silently expand the reviewed age band, data model, AI capability, identity model, duration or cohort.

## Required sequence

1. Copy `PILOT_SCOPE_FREEZE_TEMPLATE.json` to a working file outside the blank repository template.
2. Fill the real pilot reference, owner role, jurisdiction, organisation context, age band, subject, duration, cohort ceiling, supervision model, device model and data model.
3. Keep `liveAIEnabled=false` and `cloudChildIdentityEnabled=false` for this baseline pilot.
4. List every external service introduced into the pilot process.
5. Set `materialChangeRequiresReReview=true` and complete the owner acknowledgements truthfully.
6. Validate:

```bash
node scripts/validate-pilot-scope-freeze.mjs <scope.json> --output <scope-validation.json>
```

Required result before sending the pack to a reviewer:

`STRUCTURALLY_FROZEN_PILOT_SCOPE`

This means only that the owner-supplied scope is structurally complete. It does not mean the pilot is approved.

## Reviewer handoff

Provide the externally selected reviewer/organisation with:

- the validated scope-freeze record and its SHA-256 traceability digest;
- `EXTERNAL_PILOT_REVIEW_PACK.md`;
- `PILOT_PARTICIPANT_INFORMATION_DRAFT.md`;
- `PILOT_DATA_MINIMISATION_RETENTION_DRAFT.md`;
- `PILOT_INCIDENT_ESCALATION_DRAFT.md`;
- `PILOT_STOPPING_CRITERIA_DRAFT.md`;
- `PILOT_METRICS_PROTOCOL_DRAFT.md`;
- `PILOT_SPECIALIST_REVIEW_CHECKLIST.md`;
- `PILOT_APPROVAL_REGISTER_TEMPLATE.md` as a blank transfer template only;
- `P11A_UK_OFFICIAL_REFERENCE_GUIDE.md` when the intended pilot is in England/UK.

## Required reviewer/process outputs

The real process should resolve, as applicable:

- safeguarding/privacy review outcome and conditions;
- participant/parent information and permission/consent/assent process;
- data minimisation, retention, deletion and export handling;
- incident/escalation ownership and routes;
- stopping/restart criteria;
- descriptive metrics/evidence protocol;
- whether organisation/school approval is required;
- whether research-ethics approval is required;
- change/re-review triggers.

Each real artifact/decision should have a reference, date, responsible authority/role and the same `scopeVersion`.

## Change-control rule

If any of these materially changes after review begins, stop the transfer to P10/P4 and create a new/revised scope version for re-review:

- participant age band or cohort ceiling;
- subject/activity scope;
- duration or supervision model;
- device/storage/export model;
- live AI interactions;
- cloud child identity/accounts;
- external services/providers;
- data collected/shared/retained;
- organisation/school context;
- outcome/metrics study design.

## Evidence intake after review

Do not edit repository templates to make them look approved. Store/reference the real governed external artifacts according to the approved process, then populate a working copy of `PILOT_EXTERNAL_APPROVAL_RECORD_TEMPLATE.json` and run P10.

P11A success therefore permits only:

`scope freeze → external review handoff`

It does **not** permit:

`scope freeze → participant pilot`.
