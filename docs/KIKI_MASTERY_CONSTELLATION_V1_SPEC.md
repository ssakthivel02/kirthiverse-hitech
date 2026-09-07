# Kiki Mastery Constellation V1

Status: preview-only implementation contract

## Purpose

Kiki Mastery Constellation turns existing local learner signals into an explainable progress view without claiming that KirthiVerse has automatically measured correctness, proficiency, intelligence, or exam mastery.

It is the bridge between Kiki Practice Arena V1 and a future diagnostic/mastery system. V1 remains local-only and uses only approved canonical KirthiVerse lesson and assessment identifiers.

## Inputs

V1 may read only these existing local signals:

- `kirthiverse.hitech.static.progress.v2` — lessons started/completed.
- `kirthiverse.hitech.practice.v1` — local Practice Arena session summaries.
- `kirthiverse.hitech.confidence.v1` — learner-selected confidence/revisit preference.
- `kirthiverse.hitech.mastery.evidence.v1` — learner self-reports recorded after canonical Practice Arena guidance.

No remote learner ID, email, school, teacher, device fingerprint, advertising ID, or cloud child profile is introduced.

## Evidence semantics

Practice evidence has two learner-selected signals:

- `secure` — the learner selected “Got it / புரிந்தது”.
- `revisit` — the learner selected “Need more practice / மேலும் பயிற்சி”.

Every stored practice evidence event must preserve:

- canonical `stableAssessmentId` as `assessmentId`;
- canonical `lessonId`;
- `signal` (`secure` or `revisit`);
- local timestamp;
- provenance `source: practice-self-report`.

The application must not convert these signals into automatic correctness, automatic mastery, grades, exam scores, psychometric labels, or high-stakes recommendations.

## Learner-facing constellation

The `/progress` surface may present:

- completed and explored lesson counts;
- number of Practice Arena sessions;
- secure and revisit self-report totals;
- number of lessons with practice evidence;
- an explainable suggested revisit when a lesson has more revisit than secure signals;
- a direct link back to the canonical lesson.

The explanation must state that the practice evidence is self-reported and is not an exam score or automatic mastery claim.

## Recommendation rule V1

The suggested revisit is deliberately simple and transparent:

1. consider only lessons with recorded local practice evidence;
2. select lessons where `revisit > secure`;
3. choose the most recently signalled eligible lesson;
4. resolve it back to the canonical lesson corpus;
5. show the learner the canonical lesson title and an explicit review link.

If no lesson qualifies, show that no revisit signal is currently stronger than the secure signal.

This is an explainable local recommendation, not an AI diagnosis.

## Safety boundaries

V1 must retain all Practice Arena child-safety boundaries:

- no public leaderboard;
- no open child chat;
- no ads or child-targeted purchases;
- no public real name;
- no remote child profile;
- no automatic correctness or mastery classification;
- no inference of sensitive learner traits;
- no fabricated educational content.

## Accessibility and wellbeing

The progress view must remain keyboard reachable, responsive at small mobile widths, compatible with reduced-motion preference, and readable without relying on colour alone. Practice Calm Mode remains separate and unchanged.

## Canonical corpus protection

Kiki Mastery Constellation V1 must not alter the approved baseline:

- 135 canonical lessons;
- 72 canonical assessments;
- 11 learning worlds.

## V1 acceptance gates

- `/progress` renders the local confidence-evidence panel.
- Evidence limitation copy is present and visible.
- A synthetic local `revisit` signal resolves to the correct canonical lesson recommendation.
- The recommendation links to that canonical lesson.
- No automatic correctness/mastery flag is enabled in runtime contracts.
- 135/72/11 canonical baseline remains unchanged.
- No horizontal overflow at desktop, tablet, 390px mobile, or 320px mobile.
- Reduced-motion emulation remains respected.
- Existing Kiki Practice Arena QA remains green.

## Not V1

The following remain separately gated and are not authorised by this slice:

- diagnostic placement scores;
- mastery percentages derived from correctness;
- guardian or teacher cloud dashboards;
- shared class/school progress;
- cloud identity or cross-device sync;
- public/community challenge ranking;
- predictive profiling;
- automated high-stakes educational decisions.

Production custom-domain cutover remains a separate owner-approved release gate.