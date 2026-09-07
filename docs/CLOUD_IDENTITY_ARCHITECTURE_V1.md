# KirthiVerse Authorised Cloud Identity — Architecture V1

Status: **ARCHITECTURE ONLY / HOLD**. This document does not authorise implementation or production activation.

## Objective
Define the minimum architecture and governance gates required before KirthiVerse can move from local/synthetic prototypes to any real guardian, teacher, school or learner-linked cloud identity.

## Identity model

### Adult-owned identity first
Real cloud identity, when eventually approved, must begin with an adult-owned account. A child profile must never be independently exposed as a public identity.

### Guardian linkage
Guardian-to-learner linking must be explicit, revocable, scoped and auditable. A time-limited link mechanism may be considered only after consent, security and privacy gates pass.

### Teacher / school access
Teacher and school roles require verified authorisation, tenant isolation and role-based access control. A class code alone must never grant privileged access to real learner data.

### Child profile
Use the minimum data needed for learning. Avoid collecting child email, phone, precise location, public real name or school identifiers unless a separately approved requirement proves they are necessary.

## Required controls before activation
- privacy impact assessment
- guardian consent and revocation model
- child-data minimisation review
- approved retention schedule
- export and deletion workflow
- tenant-isolation design and verification
- encryption in transit and at rest
- RBAC and threat model
- access/audit logging design
- incident response runbook
- school data-processing terms
- age-assurance approach
- accessibility review
- security-test evidence

## Consent ledger design
A future consent ledger should record only the minimum event metadata required to prove and manage consent: actor role, learner linkage reference, scope, purpose, timestamp, expiry where applicable, policy version and revocation timestamp. It must not become a behavioural surveillance log.

## Role scopes
- Guardian: linked learner view, home goals, accessibility/wellbeing controls, export/delete/revoke actions.
- Teacher: authorised class/group assignment and learning-support views inside one tenant only.
- School admin: role/tenant governance, aggregate controls, retention/export/delete administration.
- Tutor/mentor: guardian-approved, learner-specific and time-bounded scope only.
- Learner: no administrative access to adult or school controls.

## Tenant isolation
Each school tenant must be isolated by design and verified through automated and adversarial testing. Cross-tenant identifiers must not be guessable access mechanisms. Support/admin access must be explicit, logged and tightly scoped.

## Deletion and export
Deletion must cover primary records, derived learning-profile records and scheduled downstream copies according to an approved retention model. Export should be understandable to families and schools and must not expose unrelated learners.

## Activation rule
`governance/cloud-identity-gates.v1.json` is authoritative for this architecture increment. Production identity remains prohibited while any required gate is false. Turning a gate true requires attached evidence and explicit owner/governance approval; code alone cannot satisfy a gate.

## Explicitly out of scope for V1
- authentication provider selection
- production login UI
- real user registration
- real guardian-child linking
- real class rosters
- SSO
- third-party SIS/LMS integrations
- storing real child personal data
- remote learner-evidence synchronisation
- production DNS or deployment changes
