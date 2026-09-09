# KirthiVerse Pilot Stopping Criteria — Draft

> **STATUS: DRAFT — REQUIRES EXTERNAL/OWNER APPROVAL BEFORE REAL PILOT USE**
>
> These are proposed operational safeguards, not legal/safeguarding certification.

## 1. Purpose

Define conditions that require a participant session, an individual P5 run, or the entire controlled pilot to pause or stop. The approved external process may add stricter criteria.

## 2. Immediate session stop / participant stop

Stop the current participant session when any approved threshold is met, including:

- participant asks to stop or the responsible adult instructs that the session stop;
- participant distress/discomfort meets the approved wellbeing threshold;
- a safeguarding concern/disclosure arises that requires the organisation's safeguarding route;
- identifying information is entered/exposed contrary to the approved protocol and continuing could increase risk;
- the operator can no longer provide the agreed supervision;
- the application behaves in a way that creates a material safety/privacy concern.

Follow the approved external escalation/withdrawal procedure after stopping.

## 3. P5 run pause

Pause an active P5 run when:

- P4 readiness changes from READY to HOLD;
- a required external review/reference is withdrawn, expires or becomes materially inaccurate;
- the approved data/retention/incident process can no longer be followed;
- metrics/evidence malfunction enough to invalidate the agreed observation protocol;
- assistance/settings differ materially from the approved protocol and the deviation cannot be corrected immediately;
- the responsible pilot owner instructs a pause.

P5's visible `HOLD — PAUSE PILOT` signal is a software control. The responsible external process may require a pause even when P5 itself still displays READY.

## 4. Whole-pilot stop

Stop recruitment/use across the controlled pilot when the responsible process determines that a material issue cannot be safely contained within one session/run, for example:

- repeated safeguarding/privacy incidents;
- evidence of systematic inappropriate data collection/sharing;
- material product defect affecting multiple participants;
- inability to comply with the approved incident/withdrawal/deletion process;
- external reviewer/organisation withdraws approval to proceed;
- approved cohort/duration boundary is exceeded without review;
- a material protocol change is proposed without re-review.

## 5. Evidence-quality stop

Pause external evidence collection/reporting when:

- original P5 exports are lost or edited after export;
- P6 marks a source `INVALID`;
- duplicate/misattributed runs cannot be resolved;
- P7 marks a pack `INVALID`;
- P8 rejects the pack or detects digest/totals inconsistency;
- the intended external statement exceeds P6/P7/P8 claim gates.

A failed evidence gate does not necessarily mean participant harm occurred; it means the evidence cannot safely support the proposed external claim.

## 6. Predefined administrative boundaries — owner to approve

Before launch, fill and approve:

| Boundary | Approved value |
|---|---|
| Pilot age band | `[REQUIRED]` |
| Subject | `[REQUIRED]` |
| Pilot duration | `[REQUIRED]` |
| Cohort ceiling | `[REQUIRED]` |
| Maximum session duration / break rule | `[REVIEW/DECIDE]` |
| Supervision arrangement | `[REVIEW/DECIDE]` |
| Assistance setting policy | `[REVIEW/DECIDE]` |
| Evidence review cadence | `[REVIEW/DECIDE]` |

Exceeding an approved boundary should trigger review rather than silent scope expansion.

## 7. Restart criteria

A stopped/paused pilot may restart only when the responsible approved process confirms:

1. the triggering issue has been assessed;
2. required remediation is complete;
3. external references/protocols are current;
4. P4 accurately reflects those real references;
5. if the observation boundary was broken materially, a fresh P5 run is started instead of pretending continuity;
6. the restart decision/reference is recorded externally.

## 8. Final approved text for P4

P4's `stoppingCriteria` field should contain or reference the **approved** pilot stopping criteria, not merely say “see draft.”

Approved stopping-criteria reference: `[REAL REFERENCE REQUIRED]`
