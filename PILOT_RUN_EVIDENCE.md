# KirthiVerse P5 Controlled Pilot Run Evidence

## Evidence chain
P3 observed local metrics → P4 owner-attested readiness gate → P5 controlled run.

P5 cannot start unless `KV_PILOT_READINESS.evaluate().ready === true`. A copy of the P4 readiness evaluation and owner-supplied readiness record is frozen at run start and again at run end.

## Run controls
- Parent Space must be unlocked.
- P4 readiness must be READY before a new run can start.
- Operator acknowledgement is a local self-attestation only; it does not verify guardian identity or legal consent.
- Bounded hints/worked guidance default OFF for every new P5 run unless explicitly enabled by the supervising adult.
- P5 starts a fresh P3 metrics observation store, baselining current evidence instead of backfilling pre-run usage.
- If P4 changes to HOLD during an active run, P5 displays `HOLD — PAUSE PILOT`; it does not claim the old readiness snapshot is still current.
- Ending the run freezes the final observed metrics and the P4 readiness state at end.

## Evidence export
The export contains P5 run state, readiness snapshots, current/final P3 metrics, and explicit limitations. It does not include Parent PIN/hash/salt/iterations.

## Local data controls
- Run reset removes only P5 run state + P3 metrics observation; P4 readiness, Parent Space and ordinary learning evidence remain.
- Full local deletion requires the exact phrase `DELETE LOCAL DATA` plus browser confirmation and removes only keys beginning `kirthiverse.hitech.` from local/session storage. Unrelated origin storage remains untouched.

## Not claimed
- independently verified external review
- verified parent/guardian identity
- legally valid consent capture
- safeguarding or regulatory certification
- cloud/audited/tamper-evident analytics
- production readiness

## Merge gate
The P5 Chromium QA must prove P4 HOLD blocks start, P4 READY allows start, pre-run metrics are excluded, a mid-run P4 HOLD becomes a visible pause signal, final evidence freezes correctly, secrets stay out of export, reset/delete scopes are correct, mobile works, and P5 assets are offline-cached. All inherited KirthiVerse QA and the always-on `Protected Main Gate` must remain green.