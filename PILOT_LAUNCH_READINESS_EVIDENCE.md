# KirthiVerse P4 Pilot Launch Readiness Evidence

## Purpose
Create a controlled, local-only pilot lifecycle that can generate honest funding/pilot evidence without claiming verified guardian identity, legal consent, cloud accounts, or production compliance.

## Contract
- Route: `/pilot-readiness`
- Requires the existing Parent Space session to be unlocked.
- Adult acknowledgement is explicitly a **self-attestation only**.
- `adultIdentityVerified=false` and `legalConsentVerified=false` are persisted in the pilot record and export boundary.
- New pilot assistance defaults **OFF**. The adult may explicitly opt into the existing bounded hints/worked-guidance feature; there is no live AI tutor in this build.
- Starting a pilot clears only the previous pilot-metrics observation store, then establishes a fresh baseline. Existing learning data is not backfilled into the new observation period.
- Ending a pilot freezes a final local metrics summary and educator-pilot summary.

## Data controls
- Evidence export contains pilot state, current metrics, educator-plan summary and explicit evidence-boundary flags.
- Parent PIN/hash/salt/iterations are never included in the pilot evidence bundle.
- `Reset pilot-only data` removes launch, longitudinal metrics and educator-pilot plan data but preserves ordinary learning progress and Parent Space.
- Full local deletion requires the exact phrase `DELETE LOCAL DATA` plus browser confirmation and removes only storage keys beginning `kirthiverse.hitech.`. Unrelated origin storage is not touched.

## Not claimed
- verified parent/guardian identity
- legally valid consent capture
- UK GDPR / Children's Code / COPPA compliance certification
- cloud telemetry or audited research analytics
- tamper-evident evidence
- production readiness

## Merge evidence gate
`KirthiVerse P4 Pilot Launch Readiness QA` must prove the complete locked → adult acknowledgement → pilot start → fresh evidence → end/freeze → secret-safe export → pilot reset → scoped deletion lifecycle in Chromium, alongside the always-on `Protected Main Gate` and inherited KirthiVerse regression gates.