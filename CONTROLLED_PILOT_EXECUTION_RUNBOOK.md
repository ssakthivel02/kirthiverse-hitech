# KirthiVerse Controlled Pilot Execution Runbook

## Scope

This runbook is for a small, controlled KirthiVerse pilot using the existing P3 metrics, P4 readiness gate, P5 controlled-run lifecycle and P6 evidence validator.

It is an operational checklist, not legal advice or a compliance certificate. External safeguarding, privacy, consent, school, ethics and research requirements remain accountable to the responsible adults/organisations.

## Gate 0 — Do not recruit or start yet

Do not start a controlled pilot until the real-world prerequisites referenced by P4 exist outside the application.

Required external records should include, as applicable:

1. safeguarding/privacy specialist review reference;
2. participant/parent information and consent-material reference;
3. data-minimisation and retention-plan reference;
4. incident/escalation route reference;
5. explicit stopping criteria;
6. metrics protocol describing what will be measured and what will **not** be inferred;
7. owner acknowledgement that P4 readiness is not production readiness or legal certification.

The application stores only the references/attestations. It does not verify the reviewer, guardian identity or legal sufficiency.

## Gate 1 — Prepare the pilot device

Before a participant uses the pilot device:

- use a current supported browser;
- open Parent Space and configure the local grown-up PIN;
- use a learner **alias**, not a real child name, email or school identifier;
- review the local-only storage boundary;
- confirm the P3 weekly report is available;
- confirm P4 shows `OWNER-ATTESTED READY`;
- confirm P5 shows that a controlled run can start;
- leave bounded hints/worked guidance OFF unless the approved protocol specifically allows it;
- do not claim a live AI tutor: the current control is deterministic assistance only.

## Gate 2 — Start the P5 run

Start from `/pilot-run` only after P4 is READY.

Record:

- non-identifying learner alias;
- optional target end date;
- operator self-attestation;
- assistance choice.

P5 freezes the P4 readiness record/evaluation at run start and begins a fresh P3 metrics observation window. Pre-existing local evidence is baselined rather than backfilled as new pilot activity.

## During the pilot

Use the product normally. Do not manually manufacture metrics or edit browser storage to create stronger evidence.

Monitor:

- weekly local activity report;
- active-learning minutes/days;
- lesson starts/completions;
- diagnostic/Quick Skills/answer-check evidence;
- P4 readiness status.

If P4 becomes HOLD during an active run, P5 displays `HOLD — PAUSE PILOT`. Treat that as a real stop/pause signal. Resolve the external readiness issue before continuing.

Record safety/privacy incidents in the approved external incident route. Do not turn KirthiVerse local metrics into the system of record for safeguarding incidents.

## Evidence interpretation during the run

Do not call an early observation window “seven-day retention”.

Do not infer learning improvement from:

- time spent;
- number of active days;
- number of lesson completions;
- diagnostic activity alone;
- Quick Skills sessions alone.

If learning-improvement evidence is a target, define a separate pre/post outcome design before the pilot and analyse it independently.

## Gate 3 — End and freeze

At the agreed stop point:

1. open `/pilot-run`;
2. choose `End & freeze run`;
3. confirm the final P4 readiness snapshot is present;
4. export `kirthiverse-controlled-pilot-run-evidence.json`;
5. do not edit that original export.

If the run ended while P4 was HOLD, preserve that fact and document the pause/interruption. Do not silently rewrite the readiness history.

## Gate 4 — Validate with P6

Run:

```bash
node scripts/validate-pilot-evidence.mjs kirthiverse-controlled-pilot-run-evidence.json \
  --output kirthiverse-controlled-pilot-run-validation.json
```

If external wording requires a completed seven-day observation window, use:

```bash
node scripts/validate-pilot-evidence.mjs kirthiverse-controlled-pilot-run-evidence.json \
  --require-seven-day-window \
  --output kirthiverse-controlled-pilot-run-validation.json
```

Do not move evidence into a funding/grant/partner pack while P6 status is `INVALID`.

Record together:

- original P5 export filename;
- P6 validation report;
- P6 SHA-256 digest;
- date of validation;
- human reviewer who approved the external wording;
- any P6 warnings/limitations.

The digest is traceability only, not tamper-evident proof.

## Gate 5 — Funding/partner wording

Safe evidence wording should stay within what P6 allows.

Examples:

- “Observed local controlled-pilot activity: X active minutes across Y active days.”
- “The run recorded Z unique lesson completions after the P5 observation window began.”
- “P6 validated the structure and evidence boundaries of the exported local pilot file.”
- “The validated run contains a completed seven-day observation window.” — only when P6 explicitly allows this wording.

Do **not** state, without separate supporting evidence:

- “7-day retention”;
- “learning improved by X%”;
- “students improved”;
- “school-wide outcome”;
- “guardian identity verified”;
- “legally compliant/certified”;
- “safeguarding certified”;
- “production ready”;
- “tamper-evident analytics”.

## Pilot stop conditions

Pause or stop immediately when any approved stopping criterion is triggered, including a P4 HOLD state or a real safety/privacy issue that the external protocol says requires suspension.

Software readiness must never override safeguarding or organisational judgement.

## After the pilot

Before starting another participant/run:

- preserve the completed export + validation report;
- use P5 `Reset run + observation` only when intentionally beginning a fresh observation window;
- confirm P4 remains current;
- check whether the protocol/review references need updating;
- never combine multiple participant files into a cohort outcome claim without a separately defined aggregation/analysis protocol.

## Current evidence ceiling

P3–P6 now provide a disciplined **single-run local controlled-pilot evidence chain**. They do not yet provide independently verified identity, legal consent capture, tamper-evident central telemetry, institutional analytics or research-grade cohort inference.
