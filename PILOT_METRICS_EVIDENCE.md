# KirthiVerse P3 Pilot Metrics + Weekly Report

Status: funding-readiness pilot evidence only.

## Purpose

Add longitudinal evidence that starts from the moment this runtime is installed, without backfilling pre-existing local activity or pretending local browser storage is audited analytics.

## Measured

- active learning seconds/minutes
- active learning days
- lesson starts
- unique lessons started
- lesson completion clicks / unique lessons completed
- new Quick Skills sessions after the metric baseline
- new diagnostic completions after the metric baseline
- new lesson answer checks after the metric baseline
- daily mastery snapshots and bounded mastery movement

## Active-time rule

Active learning time is counted only when all of these are true:

1. the document is visible;
2. the learner is on `/lesson/*`, `/diagnostic` or `/speedlab`;
3. user interaction has occurred within the previous 60 seconds;
4. a 15-second heartbeat fires.

Parent Space, Educator Pilot, Weekly Report, home browsing and other routes do not count as active learning time.

## No historical backfill

On first run, the runtime baselines the current diagnostic, Quick Skills and lesson-check identifiers. Existing records are not emitted as new pilot events. Only evidence created after `trackingStartedAt` is included as new activity.

## Seven-day reporting rule

The UI shows `completeSevenDayWindow=false` until a full seven 24-hour periods have elapsed from `trackingStartedAt`. Before then it explicitly labels the report as an early pilot window and does not describe the result as seven-day retention.

## Privacy / evidence boundary

- local browser storage only
- no fetch/XHR/beacon analytics from this module
- no child email, school ID or teacher email collected
- Parent PIN/hash/salt are not read into the report and are not exported
- local evidence is not tamper-evident
- the report is not audited research evidence
- the export is labelled `LOCAL_PILOT_EVIDENCE_ONLY`

## Parent / educator integration

Parent Space receives a weekly evidence card after the parent session is unlocked. Educator Pilot receives the same summary only for the device-linked learner and explicitly does not present it as class-wide analytics.

## QA gate

`.github/workflows/p3-pilot-metrics-qa.yml` runs a real headless-Chromium flow that checks:

- old local records are baselined rather than backfilled;
- Weekly Report is Parent-Space gated;
- new diagnostic / Quick Skills / answer-check evidence is recorded;
- a visible/recently-interactive lesson heartbeat produces measured active time;
- lesson start/completion evidence is captured;
- early-window wording remains truthful;
- weekly JSON export preserves the evidence boundary and excludes parent gate material;
- Parent and Educator summary cards render;
- mobile report has no page-level horizontal overflow;
- pilot metrics JS/CSS are available in the v31 PWA cache.

Production readiness remains NO. Real child/parent identity, school authentication, specialist safeguarding/legal review and tamper-evident cloud pilot telemetry remain separate future decisions.
