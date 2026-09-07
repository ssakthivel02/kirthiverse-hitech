# KVS Mastery Constellation v1 — read-only evidence view

## Goal
Turn local Practice Arena confidence evidence into an explainable visual learning map without claiming that self-reported confidence equals verified mastery.

## Inputs
- canonical 135 lessons / 72 assessments / 11 worlds
- local lesson completion state
- `kirthiverse.hitech.mastery.evidence.v1`
- local confidence state

## V1 evidence states
These are evidence states, not grades:
- **Revisit** — revisit signals currently exceed secure signals.
- **Mixed** — both secure and revisit signals exist without a clear secure lead.
- **Secure signal** — secure signals exceed revisit signals.
- **No evidence** — no Practice Arena evidence yet.

No state is named `mastered` in v1.

## Explainable recommendation
The Constellation may recommend a lesson to revisit when local evidence supports it. The UI must explain the reason using existing local evidence, for example: “2 revisit signals and 0 secure signals.”

## Safety boundaries
- read-only interpretation of local evidence
- no automatic correctness judgement
- no automatic mastery claim
- no locking or punitive progression
- no public ranking
- no cloud sync
- no child account requirement
- no new canonical content

## Acceptance gates
- 135 lessons / 72 assessments / 11 worlds remain unchanged
- `/mastery` renders through the existing SPA lifecycle
- seeded evidence produces deterministic evidence states
- recommendation rationale is visible
- zero evidence has a clear empty state
- no horizontal overflow at desktop/tablet/mobile widths
- reduced-motion remains honored
- parent Practice Arena QA remains green
- production custom-domain HOLD remains unchanged
