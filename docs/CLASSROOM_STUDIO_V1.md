# Classroom Studio V1

Status: Phase 4 synthetic/local-only prototype.

## Purpose
Provide a teacher-workflow prototype around the canonical KirthiVerse lesson corpus without activating real student accounts, school tenancy, cloud rosters or child identity.

## Included
- local demo class code clearly labelled as non-enrolment
- canonical lesson assignment planner
- six synthetic learner aliases only
- illustrative mastery heatmap
- misconception/intervention groups
- explainable teacher recommendations
- printable/offline pack modes
- parent-ready local report text
- local persistence and explicit clear-data action
- direct links to Mastery Constellation and Family Bridge

## Non-negotiable boundaries
- no real learner names, emails, school IDs or contact data
- no real teacher account or school membership verification
- no network/API writes from Classroom Studio runtime
- no public ranking, messaging, advertising or purchases
- no claim that synthetic evidence describes real children
- no production DNS/custom-domain change

## Release gates
- deterministic source contract passes
- browser confirms synthetic-only warning and non-enrolment class-code label
- canonical lesson planner exposes a meaningful subset of the 135-lesson corpus
- local assignment and pack preferences persist
- clear-data removes Classroom Studio local state
- Mastery and Family cross-links work as direct destinations
- 390px mobile viewport has no horizontal overflow
- all tested interactive controls meet at least 44px target height
- keyboard focus works on primary planner controls
- print media path is available for offline/PDF output
- existing upstream Practice, Mastery and Family branches remain independently gated

Cloud identity remains a separate Phase 5 decision requiring privacy, consent, security, retention and tenant-isolation approval.