# KirthiVerse Pilot Incident & Escalation Route — Draft

> **STATUS: DRAFT — MUST BE REPLACED/APPROVED BY THE RESPONSIBLE PILOT PROCESS BEFORE USE**
>
> This template is not a safeguarding procedure, emergency service, legal policy or compliance certification.

## 1. Purpose

Define an operational route so a controlled pilot is paused and escalated promptly when a privacy, safeguarding, participant-wellbeing or serious technical-integrity concern arises.

KirthiVerse local metrics are not the system of record for incidents.

## 2. Required named roles before pilot start

Do not begin a real pilot while these are placeholders.

| Role | Name / team | Approved contact route | Backup |
|---|---|---|---|
| Pilot owner | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |
| Safeguarding escalation contact | `[REQUIRED IF APPLICABLE]` | `[REQUIRED]` | `[REQUIRED]` |
| Privacy/data escalation contact | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |
| Technical incident owner | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |
| Organisation/school contact | `[IF APPLICABLE]` | `[REQUIRED IF USED]` | `[OPTIONAL]` |

## 3. Immediate operator rule

When an incident meets an approved stop/pause condition:

1. stop the participant activity safely;
2. do not ask the child/participant for unnecessary additional details;
3. preserve only information required by the approved incident process;
4. notify the named responsible contact using the approved route;
5. mark/keep the pilot paused until the responsible person authorises next action;
6. do not alter P5/P6/P7/P8 evidence to hide the interruption.

If there is an immediate risk to a person's safety, follow the responsible organisation's emergency/safeguarding procedures rather than relying on this software template.

## 4. Incident categories for review

The external reviewer should decide the final classification and response for at least:

### A. Safeguarding / participant wellbeing

Examples to assess:

- participant distress that meets the approved stopping threshold;
- disclosure or concern requiring the organisation's safeguarding process;
- inappropriate adult/participant interaction around the pilot;
- continued participation contrary to an approved stop/withdrawal instruction.

### B. Privacy / data

Examples to assess:

- real identifying information entered where an alias was required;
- evidence exported/shared to an unauthorised location/person;
- lost/stolen device containing pilot data;
- unintended browser sync/cloud propagation;
- inability to honour an approved deletion/withdrawal process;
- exposure of Parent PIN material or other sensitive local state.

### C. Technical evidence integrity

Examples to assess:

- metrics materially malfunctioning;
- P4 readiness becomes HOLD during a P5 run;
- evidence export cannot be validated by P6;
- duplicate/corrupt source files undermine intended reporting;
- material product defect affects participant safety, privacy or the agreed protocol.

A technical-integrity issue is not automatically a safeguarding incident; classification belongs to the responsible process.

## 5. Severity / response matrix — reviewer to approve

| Proposed level | Example interpretation | Minimum software/pilot action | External action |
|---|---|---|---|
| Critical | Immediate safety concern or severe incident under organisation procedure | Stop session/pilot | Use organisation/emergency escalation immediately |
| High | Significant safeguarding/privacy concern or material uncontrolled disclosure | Pause pilot | Escalate promptly to named responsible role |
| Medium | Contained privacy/technical issue that may affect protocol/evidence | Pause affected run if required | Review before restart |
| Low | Minor defect with no identified safety/privacy impact | Record through approved technical process | Fix/review under normal process |

This matrix is a draft. The responsible reviewer must replace or approve thresholds and response times.

## 6. Evidence handling during incidents

Do not:

- delete/alter evidence to make a pilot appear uninterrupted;
- add fabricated comments to evidence JSON;
- use participant identity inside P6/P7/P8 files merely to track an incident;
- represent SHA-256 as proof that no tampering occurred.

Use the approved external incident record for narrative details. P5/P6/P7/P8 should remain bounded evidence artifacts.

## 7. Restart authority

A paused run/pilot may restart only under the authority/process approved before the pilot.

Required restart record should state:

- incident/reference ID;
- person/role authorising restart;
- date/time;
- conditions/remediation completed;
- whether P4 references or protocol changed;
- whether a fresh P5 run is required.

## 8. End-of-pilot review

The final pilot review should record whether incidents occurred and whether any limitation affects use of P6/P7/P8 evidence externally.

Do not suppress adverse events/limitations from a funding or partner discussion where they materially affect interpretation.

Final approved incident-route reference: `[REAL REFERENCE REQUIRED]`
