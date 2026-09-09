# KirthiVerse P4 Controlled Pilot Launch Gate

Status: software readiness/owner-attestation gate only.

## Purpose

Prevent the KirthiVerse controlled pilot from being described as ready merely because product features exist. The gate requires a defined pilot boundary plus owner-supplied references to real external review/consent/data/incident records.

## Required structured boundary

- age band
- subject
- duration, 1–12 weeks
- cohort ceiling, 1–100 (a maximum plan, not a recruitment claim)
- safeguarding/privacy specialist review reference and date
- consent/participant-information pack reference
- data-minimisation/retention plan reference
- incident/escalation route reference
- stopping criteria
- metrics protocol

## Required owner attestations

- specialist safeguarding/privacy review completed
- consent/information materials approved for the intended pilot
- data-minimisation plan reviewed
- incident/escalation route tested
- stopping criteria approved
- pilot metrics protocol approved
- explicit acknowledgement that this gate is not production readiness or legal certification

## Gate result

Incomplete state: `HOLD`

All software-required fields + attestations + P3 metrics runtime present:
`OWNER_ATTESTED_CONTROLLED_PILOT_READY`

That result means only that the owner has recorded the prerequisites. The software does not independently verify the reviewer, consent validity, school approval, legal sufficiency or research ethics.

The exported record must always preserve:

- `legalCertification=false`
- `productionReady=false`
- `externalReviewSelfVerified=false`

## Privacy boundary

This module is local-only and has no network analytics. It does not request child email, teacher email, school ID or date of birth. Parent PIN/hash/salt are not read into or exported by the readiness record.

## Relationship to P3 metrics

The readiness gate requires the P3 metrics runtime to exist, but it cannot invent or pre-state pilot outcomes. Actual longitudinal evidence must come from observations after the P3 measurement baseline.

## QA

`.github/workflows/p4-pilot-readiness-qa.yml` uses Chromium to prove:

- readiness route is Parent-Space gated;
- an empty/incomplete record returns `HOLD`;
- all required fields and attestations are necessary for owner-attested readiness;
- ready output still says no legal certification, no production readiness and no self-verification of external review;
- readiness export does not leak Parent gate material;
- Parent Space surfaces the gate result;
- mobile layout has no page-level overflow;
- readiness JS/CSS are available from the v31 PWA cache.

A real pilot must still wait for genuine specialist/legal/safeguarding review and any required school/participant permissions outside the application.
