# KirthiVerse P11C — Review Handoff Provenance Link

> **STATUS: TRACEABILITY CONTROL — NOT AN APPROVAL**
>
> P11C links a later structurally complete P10 external reference record back to the exact P11B handoff manifest that was prepared for external review. It does not authenticate reviewers, verify signatures, create consent, certify safeguarding, establish legal compliance, authorise a participant pilot, or permit production.

## Why P11C exists

P11B proves the exact frozen pilot scope and reviewer-document bundle that was prepared for review. P10 validates the structure and scope consistency of a later owner-supplied external reference set. Without a deterministic bridge between those two records, a later P10 record could refer to a different pilot/scope or a different handoff bundle.

P11C closes that traceability gap without making any external decision itself.

## Required P10 provenance block

When real external review references are eventually entered into a P10 JSON record, include:

```json
"handoffProvenance": {
  "p11bBundleSha256": "<exact bundleSha256 from the P11B manifest>",
  "p11bManifestSha256": "<SHA-256 of the exact P11B manifest file bytes>"
}
```

Do not populate those values from memory or by copying a similar pilot. Generate them from the exact P11B manifest that was actually used for the review handoff.

## Preconditions

P11C can pass only when all of the following are true:

1. The supplied P11B manifest uses schema `kirthiverse.p11b.external-review-handoff-integrity.v1`.
2. Its status is `EXTERNAL_REVIEW_HANDOFF_INTEGRITY_READY`.
3. It contains a valid bundle SHA-256 and the frozen `pilotReference` and `scopeVersion`.
4. The supplied P10 record independently passes `scripts/validate-external-pilot-approval.mjs` as `STRUCTURALLY_COMPLETE_EXTERNAL_REFERENCE_SET`.
5. P10 `pilotReference` exactly matches the P11B handoff.
6. P10 `scopeVersion` exactly matches the P11B handoff.
7. P10 `handoffProvenance.p11bBundleSha256` exactly matches the P11B bundle digest.
8. P10 `handoffProvenance.p11bManifestSha256` exactly matches the SHA-256 of the supplied P11B manifest bytes.

## Validate provenance

```bash
node scripts/validate-review-handoff-provenance.mjs <p11b-manifest.json> <p10-record.json> --output <p11c-report.json>
```

Required result:

`TRACEABLE_EXTERNAL_REFERENCE_SET`

Any malformed input, P11B HOLD state, incomplete P10 record, pilot mismatch, scope-version mismatch, bundle mismatch or manifest-byte mismatch returns `HOLD`.

## What a PASS means

A P11C PASS permits only this bounded statement:

> This structurally complete P10 external reference set is traceably linked to this exact P11B review handoff manifest and its frozen pilot/scope identity.

It does **not** mean:

- reviewer identity/authenticity has been independently verified;
- signatures have been cryptographically verified;
- external approval is legally sufficient;
- safeguarding is certified;
- parent/participant consent is valid;
- school/organisation approval is established;
- research-ethics approval is established;
- a participant pilot may start;
- production is ready.

## Change control

If the reviewed scope or reviewer-facing files change materially, create a new P11B manifest and obtain whatever re-review the responsible external process requires. A P11C record must never be reused to bridge across a changed pilot reference, scope version, or handoff bundle.

SHA-256 remains a traceability aid only, not tamper-evident audit logging.
