# KirthiVerse Cloud Identity Architecture V1 — HOLD

Status: **ARCHITECTURE ONLY / HOLD**.

This document is part of `ssakthivel02/kirthiverse-hitech`, the KirthiVerse **HI-TECH — ACTIVE MASTER**. It is a one-time reconciliation of the still-useful governance concept from historical PR #9. The historical branch remains read-only reference and is not an active development source.

## Purpose

Define the evidence boundaries that must exist before KirthiVerse can move from its current local-first / controlled-pilot model to real child-linked cloud identity, guardian linking, teacher/school tenancy, roster synchronisation or remote learner-evidence processing.

This document does **not** authorise those capabilities and is not legal advice, consent, a privacy approval, a safeguarding certification, a school approval or production approval.

## Current state

`governance/cloud-identity-gates.v1.json` is the machine-readable contract for this architecture increment. It deliberately keeps all cloud-identity capabilities disabled and all external evidence gates false.

Current prohibited capability families include:

- real child cloud profiles;
- guardian identity linked to a real learner;
- real teacher/school tenants or privileged school roles;
- real roster upload/synchronisation;
- child-linked school SSO or SIS/LMS integration;
- remote identity-service processing of learner evidence;
- production child-linked cloud authentication.

## Identity architecture principles

### Adult-owned identity first

Any future approved cloud architecture should begin with an adult-owned identity. A child profile must not become an independently public identity.

### Guardian linkage

Any future guardian-to-learner linkage must be explicitly scoped, revocable and auditable, with the responsible privacy/permission process reviewed before activation. A local Parent Space PIN or local application acknowledgement is not guardian identity verification and must not be treated as legal consent.

### Teacher / school access

Real teacher or school roles require an independently reviewed authorisation model, tenant isolation and role-based access control. A class code or local alias must never be treated as privileged access to real learner data.

### Data minimisation

Avoid collecting child email, phone number, precise location, public real name or school identifiers unless a separately reviewed requirement establishes why the data is necessary and how it will be protected, retained, exported and deleted.

## Evidence gates before any activation review

The machine-readable contract currently requires evidence/approval decisions for:

- privacy impact assessment;
- guardian permission model;
- child-data minimisation;
- retention and deletion model;
- tenant-isolation verification;
- encryption architecture;
- RBAC threat model;
- audit logging;
- incident response;
- organisation/school data terms where applicable;
- age-assurance approach;
- accessibility review;
- security-test evidence.

A future change must decide the responsible review/approval process for the actual deployment context. This repository cannot self-certify those external decisions.

## Relationship to the controlled-pilot chain

The existing KirthiVerse funding/pilot controls remain separate:

- P4 is owner-attested pilot readiness, not identity verification.
- P10 structurally validates owner-supplied external references; it does not certify legality or authorise cloud identity.
- A local controlled pilot does not verify guardian identity or legal consent.
- A successful local pilot does not automatically justify real cloud child profiles, school tenancy, roster sync or remote learner-data processing.

Cloud identity therefore remains HOLD even if P4/P10 or a local pilot is otherwise ready within its separately reviewed scope.

## Future activation rule

Any future move away from HOLD requires a deliberate reviewed revision of `governance/cloud-identity-gates.v1.json`, supported by real evidence for the applicable controls. The change must start from the then-current HI-TECH `main`, pass current governance/QA, and must not revive or upgrade the historical PR #9 branch.

Code, fixtures, owner checkboxes or architectural documents alone cannot turn an evidence gate true.
