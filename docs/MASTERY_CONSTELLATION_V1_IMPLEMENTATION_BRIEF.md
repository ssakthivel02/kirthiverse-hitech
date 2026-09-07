# Mastery Constellation V1 — Implementation Brief

Status: NEXT PHASE BRIEF — implementation starts only after Practice Arena source promotion is approved.

## Purpose

Turn existing local learner evidence into an explainable subject/world mastery map without inventing scores or introducing cloud child identity.

## Evidence inputs

1. `kirthiverse.hitech.static.progress.v2`
   - started lesson IDs
   - completed lesson IDs
   - selected age path
2. `kirthiverse.hitech.confidence.v1`
   - lesson confidence: `practice`, `getting`, `confident`
3. `kirthiverse.hitech.practice.v1`
   - assessment retry IDs
   - bounded practice history
   - self-reported understood/retry signals
4. Canonical `KV_LESSONS` and `KV_ASSESSMENTS`
   - subject/world linkage
   - lesson/assessment provenance

## V1 mastery model

No opaque AI score. Each lesson receives an explainable evidence state:

- **Not explored** — no local evidence
- **Exploring** — lesson started
- **Practising** — retry evidence or confidence=`practice`
- **Developing** — completed lesson or confidence=`getting`
- **Secure signal** — lesson completed plus confidence=`confident`, or repeated positive practice evidence with no active retry

World/subject summaries are distributions of those lesson evidence states, not a fabricated percentage of knowledge.

## Explainable recommendation rules

`Why this next?` must name the evidence used. Examples:

- “Retry evidence exists for this lesson.”
- “You started this lesson but have not marked it complete.”
- “Your latest confidence signal says more practice.”
- “This is the next unexplored lesson in your selected age path.”

No claim that KirthiVerse knows a child's true ability.

## UI contract

- constellation/world cards for all 11 worlds
- state counts per world
- expandable lesson evidence list
- `Why this next?` explanation
- direct link back to canonical lesson
- direct link to Kiki Practice Arena
- English/Tamil explanation copy where practical
- keyboard accessible
- reduced-motion safe
- mobile-first layout
- no public ranking

## Privacy/safety contract

- browser-local only
- no network write
- no child account
- no behavioural ads
- no public leaderboard
- no open chat
- no manipulation/infinite-play mechanic
- no diagnostic/medical/psychological claims

## Required QA before promotion

- canonical 135 / 72 / 11 counts remain unchanged
- deterministic evidence-state unit tests
- retry evidence affects state as designed
- confidence evidence affects state as designed
- no evidence produces Not explored, never fabricated mastery
- recommendation explanation matches rule selected
- storage remains local-only
- home/progress/practice navigation regression
- mobile + keyboard + reduced-motion browser QA
