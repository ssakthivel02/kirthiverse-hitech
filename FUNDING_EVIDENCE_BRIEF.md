# KirthiVerse P8 — Claim-Safe Funding Evidence Brief

## Purpose

P8 turns a valid P7 multi-run evidence pack into a bounded Markdown/JSON evidence brief for funding, grant, partner or due-diligence discussions.

It is an evidence appendix generator, not a marketing-copy generator. P8 rechecks the P7 manifest before rendering any approved wording.

## Input

Use a P7 pack generated from original P5 sources:

```bash
node scripts/render-funding-evidence-brief.mjs kirthiverse-pilot-evidence-pack.json \
  --output funding-evidence-brief.md \
  --json-output funding-evidence-brief.json
```

Require every included run to contain a validated completed seven-day observation window:

```bash
node scripts/render-funding-evidence-brief.mjs kirthiverse-pilot-evidence-pack.json \
  --require-all-seven-day \
  --output funding-evidence-brief.md
```

## Revalidation before rendering

P8 fails closed when it detects:

- wrong or invalid P7 pack type/status;
- closed P7 pack claim gate;
- unsafe positive claim gates;
- manifest SHA-256 mismatch;
- recomputed totals mismatch;
- duplicate run IDs or source digests;
- invalid source digests;
- sensitive fields such as learner alias, child name, Parent PIN material, email, school or address fields;
- disagreement between run entries and the P7 all-seven-day gate;
- `--require-all-seven-day` when any run is incomplete.

This does not make the pack tamper-evident. It only detects inconsistencies relative to the P7 manifest contract.

## Generated content

The Markdown brief contains:

- evidence status;
- P7 manifest SHA-256;
- number of validated local runs;
- evidence-supported wording;
- descriptive sums only;
- explicit unsupported claims;
- per-run traceability using run ID + source SHA-256;
- limitations requiring human review.

Learner aliases are intentionally excluded.

## Supported wording

P8 may render statements such as:

> “This evidence pack contains N independently P6-validated local controlled-pilot runs.”

and, when supported:

> “All N validated runs contain completed seven-day observation windows.”

For a mixed pack it uses bounded wording such as:

> “X of N validated runs contain completed seven-day observation windows.”

## Claims kept false

P8 never enables:

- retention / retention rate;
- learning improvement / efficacy;
- cohort outcome;
- comparative effectiveness;
- legal compliance/certification;
- safeguarding certification;
- production readiness;
- tamper-evident or audited analytics.

Activity minutes, summed active days and lesson completions are descriptive operational evidence only.

## Human review requirement

A human reviewer must still verify that the wording is appropriate for the actual external context and that any P4 warnings, pauses, safeguarding/privacy issues, or external-review limitations are disclosed.

P8 does not verify guardian identity, legal consent, external reviewer quality, school approval, ethics approval or research methodology.

## QA

```bash
node tests/funding-evidence-brief.test.mjs
```

The deterministic suite covers valid all-seven-day output, mixed-window bounded wording, strict-window failure, manifest tampering, totals tampering, unsafe claim gates and sensitive-field leakage.
