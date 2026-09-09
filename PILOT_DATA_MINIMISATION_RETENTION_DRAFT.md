# KirthiVerse Pilot Data Minimisation & Retention Plan — Draft

> **STATUS: DRAFT — REQUIRES PRIVACY/SAFEGUARDING REVIEW BEFORE REAL PILOT USE**
>
> This document is a design template, not a compliance certification or legal determination.

## 1. Principle

Collect and retain only the information genuinely needed for the approved controlled-pilot purpose. Do not add identifying information merely because a field or storage mechanism makes it convenient.

## 2. Current controlled-pilot data boundary

The intended KirthiVerse P3–P8 evidence path is local-first and should use a non-identifying learner alias.

| Data category | Proposed need | Storage / handling | Default decision |
|---|---|---|---|
| Learner alias | Distinguish a local controlled run | Local browser / P5 runtime | Allow non-identifying alias only |
| Real child name | Not needed for P3–P8 evidence | N/A | Do not collect in pilot evidence |
| Participant email | Not needed | N/A | Do not collect |
| School/student ID | Not needed | N/A | Do not collect |
| Parent/guardian identity | Current app cannot verify it | External approved process if required | Do not treat app PIN as identity |
| Parent PIN verifier | Local child-deterrent control | Local browser | Do not export |
| Learning progress | Needed for prototype learning loop | Local browser | Keep only for approved pilot purpose |
| Diagnostic results | Descriptive pilot evidence / learning flow | Local browser | Keep if protocol requires |
| Quick Skills records | Descriptive pilot evidence / learning flow | Local browser | Keep if protocol requires |
| Answer-check records | Descriptive pilot evidence | Local browser | Keep if protocol requires |
| Conservative active-learning time | Descriptive pilot evidence | Local browser | Keep if protocol requires |
| P4 readiness snapshots | Show readiness state at P5 start/end | P5 export | Keep with evidence bundle |
| P5 run export | Evidence source | Approved external evidence location after deliberate export | Limit access and retention |
| P6/P7/P8 derived reports | Evidence validation / bounded reporting | Approved evidence location | Retain with source references as approved |

## 3. Data explicitly excluded from P6/P7/P8 evidence

The software validators reject or avoid fields including Parent PIN material, child/display names, participant emails, school identifiers, phone/address/date-of-birth fields, and unsupported positive claims.

That technical boundary does not remove the need for operational controls: adults must not put identifying information into free-text aliases or external filenames.

## 4. Device/storage controls to approve

Before a real pilot, decide and document:

- which device/browser is approved;
- whether the device is shared;
- who can access the browser profile;
- whether OS/device login controls are adequate;
- whether browser sync is enabled and whether that changes the intended local-only boundary;
- where exported JSON files are saved;
- whether exported files are copied to email/cloud/file sharing;
- who is permitted to receive/access exports;
- how lost/stolen device scenarios are handled.

## 5. Retention schedule — decision required

Do not invent a universal retention period in this template.

The responsible reviewer/owner must approve a schedule for at least:

| Record | Approved retention period | Trigger/start date | Disposal method | Owner |
|---|---|---|---|---|
| Local browser learning/pilot data | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` |
| Original P5 evidence exports | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` |
| P6 validation reports | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` |
| P7 pack | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` |
| P8 brief | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` |
| External review/approval records | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` |
| Incident records, if any | `[DECIDE SEPARATELY]` | `[DECIDE]` | `[DECIDE]` | `[DECIDE]` |

A pilot must not be described as ready while required `[DECIDE]` retention fields remain unresolved in the final approved plan.

## 6. Withdrawal/deletion handling — decision required

The final process should define:

1. how a participant/adult requests stopping, withdrawal or deletion;
2. how the operator identifies the relevant local run without collecting unnecessary identity in the evidence pack;
3. whether local browser data is deleted immediately, at end of session, or under another approved rule;
4. how already-exported evidence is located;
5. which exported/derived records can be deleted and which, if any, must be retained under the approved external process;
6. how deletion is confirmed/documented without creating unnecessary new personal data.

The current P5 interface includes scoped local deletion controls, but software functionality does not decide legal/organisational retention obligations.

## 7. Data sharing

Default assumption: **no participant-level evidence sharing beyond the approved pilot team/process**.

Any proposed sharing with schools, partners, funders, researchers or service providers must be separately reviewed before it occurs. A P8 brief should use bounded aggregate/descriptive wording and source digests; it should not be used as justification to disclose participant identity.

## 8. Security and integrity limitations

Current pilot evidence is not tamper-evident central telemetry. SHA-256 values in P6–P8 provide exact-file/content traceability only.

The final reviewer should decide whether the intended pilot requires stronger custody controls, such as access-controlled storage, audit logs, trusted timestamps, signatures or another independently managed evidence system.

## 9. Approval questions

Reviewer/owner should explicitly answer:

- Is every proposed data item necessary for the stated pilot purpose?
- Can any field be removed or made less identifying?
- Is the device/browser configuration acceptable?
- Is export storage/access acceptable?
- Are retention/deletion periods defined and proportionate?
- Is withdrawal/deletion operationally achievable?
- Are data-sharing boundaries clear?
- Does any external service/process change the local-only statement?

Final status: `[NOT REVIEWED / CHANGES REQUIRED / APPROVED FOR SPECIFIED PILOT BY RESPONSIBLE PROCESS]`

Approval reference: `[REAL REFERENCE REQUIRED]`
