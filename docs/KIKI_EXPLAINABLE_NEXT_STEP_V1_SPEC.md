# Kiki Explainable Next-Step Engine V1

## Purpose

KVS-MASTERY-003 adds a deterministic, local-first next-step recommendation to the KirthiVerse progress experience. It helps a learner decide what to do next without inventing prerequisites, grades, diagnoses, or mastery scores.

## Allowed evidence

The engine may use only:

- canonical lesson records already present in `window.KV_LESSONS`;
- local lesson progress from `kirthiverse.hitech.static.progress.v2`;
- local self-reported Practice Arena evidence from `kirthiverse.hitech.mastery.evidence.v1`.

It must not use remote child identity, behavioral advertising data, device fingerprinting, hidden psychometric inference, public rankings, or fabricated prerequisite relationships.

## Deterministic priority order

1. **Revisit** — select the most-recent canonical lesson where self-reported `revisit > secure`.
2. **Continue** — otherwise select the most-recent started canonical lesson that is not completed.
3. **Explore** — otherwise select the first not-yet-started canonical lesson in the existing corpus order.
4. **Review** — if all canonical lessons are completed, select the most-recent completed canonical lesson when available.

Every recommendation must expose its reason in learner-facing text.

## Learner-facing semantics

Allowed labels:

- `REVISIT` — based on stronger self-reported revisit evidence.
- `CONTINUE` — based on an unfinished locally started lesson.
- `EXPLORE` — based on a canonical lesson not yet started.
- `REVIEW` — optional continuation after all lessons are completed.

The surface must state that the recommendation is local and deterministic, not a grade, diagnosis, ranking, or automatic mastery judgement.

## Canonical protection

The implementation must preserve exactly:

- 135 canonical lessons;
- 72 canonical assessments;
- 11 learning worlds.

No fabricated lesson, assessment, prerequisite, or recommendation target is permitted.

## Safety boundaries

- no public leaderboard;
- no child comparison;
- no open child chat;
- no ads or child-targeted purchases;
- no cloud learner identity;
- no automatic correctness claim;
- no automatic mastery claim;
- no high-stakes recommendation.

## Release gate

This is a preview-only Phase-2 slice. Passing automated QA does not remove physical-device, accessibility, Cloudflare preview, DNS/custom-domain, or owner approval gates. Production remains HOLD until those separate gates pass.