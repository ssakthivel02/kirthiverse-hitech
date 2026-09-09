# KirthiVerse P7 — Pilot Evidence Pack

## Purpose

P7 creates one traceable manifest from multiple **original P5 controlled-pilot exports**. It does not trust separately edited P6 validation reports: the pack builder invokes the merged P6 validator itself for every source file.

The purpose is operational/funding evidence hygiene, not research inference.

## Input

Use original files exported from P5 after `End & freeze run`.

Example:

```bash
node scripts/build-pilot-evidence-pack.mjs \
  pilot-a.json pilot-b.json pilot-c.json \
  --output kirthiverse-pilot-evidence-pack.json
```

Require every run to contain a P6-validated complete seven-day observation window:

```bash
node scripts/build-pilot-evidence-pack.mjs \
  pilot-a.json pilot-b.json pilot-c.json \
  --require-seven-day-window-all \
  --output kirthiverse-pilot-evidence-pack.json
```

## Fail-closed rules

P7 rejects the pack when:

- any original P5 source fails P6;
- a source has no usable `runId`;
- the same `runId` is present more than once;
- the same source SHA-256 appears more than once;
- strict all-seven-day mode is requested and one or more runs do not satisfy the P6 seven-day claim gate.

This reduces accidental double counting and prevents a manually edited P6 report from bypassing the source evidence check.

## Pack contents

Each manifest entry contains only bounded operational evidence:

- `runId`;
- source filename;
- source SHA-256;
- P6 status;
- observation days;
- active days;
- active minutes;
- unique lessons completed;
- whether the run contains a P6-validated completed seven-day observation window;
- P4 READY-at-start / READY-at-end indicators.

Learner aliases and Parent Space secrets are deliberately excluded from the P7 manifest.

## Totals

P7 produces descriptive sums such as:

- number of validated runs;
- runs with completed seven-day observation windows;
- sum of active days across runs;
- sum of active minutes across runs;
- sum of unique lesson completions across runs.

These are **simple sums across independently validated local runs**. They are not a cohort outcome analysis.

`sumActiveDaysAcrossRuns` is not the number of unique calendar days.

## Claim gates

P7 may allow:

- `canDescribeAsPackOfValidatedLocalRuns`
- `canDescribeAllRunsAsCompletedSevenDayObservation`

P7 keeps the following false by design:

- `canClaimRetention`
- `canClaimLearningImprovement`
- `canClaimCohortOutcome`
- `canClaimComparativeEffectiveness`
- `canClaimLegalCompliance`
- `canClaimSafeguardingCertification`
- `canClaimProductionReadiness`
- `canClaimTamperEvidentAnalytics`

A collection of validated runs does not automatically become a research cohort.

## Manifest digest

`manifestSha256` is computed from a stable, sorted subset of each manifest entry. It is useful for identifying the exact manifest contents reviewed.

It is not a signature, trusted timestamp, chain of custody, append-only ledger, or tamper-evident evidence system.

## External wording

Reasonable wording when P7 is valid:

> “This evidence pack contains N independently P6-validated local controlled-pilot runs.”

When every run satisfies the seven-day gate:

> “All N validated runs contain completed seven-day observation windows.”

Do not convert that into:

- “N retained users”;
- “retention rate”;
- “learning improvement”;
- “cohort effectiveness”;
- “school outcome”;
- “production readiness”;
- “compliance certification”.

## QA

Run locally:

```bash
node tests/pilot-evidence-pack.test.mjs
```

The deterministic tests cover multi-run success, early-window limitations, strict seven-day failure, duplicate run IDs, duplicate digests, P6-invalid sources, and output-file integrity.
