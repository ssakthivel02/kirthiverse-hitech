# Safe Community Challenges V1

Status: synthetic/local-only Phase 6 prototype.

## Purpose
Demonstrate bounded, privacy-preserving challenge mechanics without creating a public social network or exposing child identity.

## Included
- explicit opt-in, OFF by default
- Hide Me, ON by default
- anonymous synthetic aliases only
- maximum three local challenge entries per day
- personal-growth and team-reflection formats
- no speed-only winner model
- local persistence with explicit clear-data control
- links back to Practice Arena and Mastery Constellation

## Safety boundaries
- no real names
- no public child profiles
- no open chat or direct messaging
- no network sharing or remote competition service
- no behavioural advertising
- no purchases
- no infinite participation loop
- no production community activation
- no dependence on Phase 5 cloud identity

## Acceptance gates
- deterministic safety contract passes
- browser confirms opt-in OFF and Hide Me ON on first load
- challenge entry is disabled until opt-in
- exactly three entries are permitted per local day
- fourth entry is unavailable after cap
- Hide Me suppresses the local alias from the synthetic comparison preview
- disabling Hide Me reveals only the anonymous alias, never a real name
- clear-data removes local challenge state
- 390px mobile viewport has no horizontal overflow
- tested interactive targets are at least 44px
- no fetch/XHR/WebSocket/sendBeacon capability in challenge runtime

This prototype does not authorise a public leaderboard, school-wide competition service, real learner identity, chat or production network sharing.