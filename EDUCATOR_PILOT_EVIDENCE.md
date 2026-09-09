# KirthiVerse Educator Pilot — Funding-Readiness P2

Status: **LOCAL PILOT CONSOLE**  
Production ready: **NO**  
Real teacher authentication: **NO**  
School SIS/MIS integration: **NO**  
Cloud child roster: **NO**

## What this sprint adds

- Parent-Space-gated `/educator` route.
- Local class display name.
- Roster aliases only; no learner email, school ID, date of birth or cloud identity.
- Exactly one device-linked learner can inherit real KirthiVerse local learning evidence.
- Additional aliases remain explicitly `No device evidence`.
- Assignment creation uses canonical `window.KV_LESSONS` records only.
- Assignment evidence is derived from the existing local progress store; there is no manual grade/completion fabrication.
- Deterministic intervention recommendation is reused from `KV_MASTERY` for the linked learner only.
- Exported pilot plan contains aliases, assignments and derived evidence states, not Parent PIN secrets.
- Educator assets are added to the existing v31 PWA cache.

## Why this matters for funding readiness

The earlier gap was that KirthiVerse had parent-facing learning evidence but no concrete teacher/class planning surface. This sprint demonstrates the minimum teacher workflow without pretending the product already has school identity, cloud rosters or institution-wide analytics.

The truthful demonstration is:

`Parent unlock -> Educator Pilot -> local roster aliases -> canonical lesson assignment -> linked learner evidence -> unlinked learner honest empty state -> deterministic intervention -> local export`

## Explicitly not claimed

- verified teacher identity
- school administrator controls
- multi-device roster sync
- classroom SSO
- cloud consent ledger
- safeguarding/legal approval
- institution-wide analytics
- automated grading beyond existing learner evidence
- school MIS/SIS integration
- production readiness

## QA gate

`.github/workflows/p2-educator-pilot-qa.yml` verifies:

- static local-only/no-school-PII boundaries
- Parent Space gating
- one linked learner + one alias-only learner
- canonical lesson assignment
- linked completion evidence
- unlinked `No device evidence` state
- export secret boundary
- mobile overflow
- PWA educator asset cache

A green P2 QA result is a funding-readiness proof for this local pilot flow only.
