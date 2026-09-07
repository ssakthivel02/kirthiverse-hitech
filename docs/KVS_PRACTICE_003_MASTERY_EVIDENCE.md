# KVS-PRACTICE-003 — confidence evidence for future mastery

## Purpose
Capture useful local evidence from Kiki Practice Arena without overstating what the evidence proves.

## Evidence source
Every Practice Arena result is a learner self-report made after working with a canonical KirthiVerse assessment and its verified guidance.

Storage key: `kirthiverse.hitech.mastery.evidence.v1`

Each event records only:
- stable assessment ID
- stable lesson ID
- `secure` or `revisit` signal
- local timestamp
- provenance: `practice-self-report`

The store also maintains a bounded per-lesson aggregate and keeps at most 200 recent evidence events.

## Interpretation rules
A `secure` signal means the learner selected **Got it**.
A `revisit` signal means the learner selected **Need more practice**.

Neither signal is treated as an automatically graded answer, an exam score, or proof of mastery. KirthiVerse does not auto-promote a lesson to mastered from this evidence alone.

Future Mastery Constellation work may combine this signal with stronger evidence such as repeated performance, assessment-type-specific evaluation, prerequisite evidence and spaced retrieval. Those rules must be separately specified and tested before they can make a mastery claim.

## Privacy and safety
- local-only; no cloud sync in this phase
- no child account required
- no name, email, school, device fingerprint or remote identifier stored
- no public ranking or social exposure
- evidence is used to suggest revisits, not to punish or lock content
- canonical lesson and assessment records are not modified

## Acceptance gates
- canonical baseline remains 135 lessons / 72 assessments / 11 worlds
- stable assessment and lesson IDs are preserved in evidence
- provenance is explicit
- duplicate click handling must not create duplicate evidence events
- evidence panel clearly states self-reported limitations
- `automaticCorrectness=false`
- `automaticMastery=false`
- Practice Arena, Progress, mobile layout and reduced-motion regression tests remain green
- production custom-domain HOLD remains unchanged
