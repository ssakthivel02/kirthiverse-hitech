# Kiki Practice Arena V1

Status: feature branch implementation for review. Not production-promoted until validation passes.

## Purpose
Deliver short, calm, local-first practice missions that consume only canonical `KV_ASSESSMENTS` records. The arena must never fabricate questions, answers, hints or explanations.

## Implemented V1 behaviour
- Standalone `/practice.html` entrypoint.
- 3, 5 and 10 minute mission choices mapped to bounded practice queues.
- Canonical assessment prompts and verified answers/explanations only.
- Visual-question assessment records use their canonical `questionActivity.prompt` text; V1 does not invent missing artwork.
- Local-only retry queue using stable assessment identifiers.
- Retry-priority adaptive sequencing before fresh activities.
- Calm Mode defaults ON and hides countdown pressure.
- Bilingual English/Tamil coaching copy.
- Self-reported `Got it` / `Try again` confidence signal rather than pretending to auto-grade free-response work.
- Local best score, private streak and bounded recent history.
- No account, child cloud identity, ads, purchases, public leaderboard, chat or social features.
- Responsive and reduced-motion-aware presentation.

## Data contract
Required assessment fields:
- `stableAssessmentId` preferred identity
- `lessonId`
- `questionActivity` string or object with `prompt`
- `correctAnswer`
- optional `explanation`

The current canonical corpus uses `stableAssessmentId` such as `KV02-A-0001`; V1 preserves these IDs in the local retry/history state.

## Safety / integrity rules
1. If no usable canonical assessments load, show an explicit empty state. Do not synthesize practice.
2. Do not interpret self-reported confidence as objective mastery.
3. Do not upload local practice history.
4. Do not activate guardian, school or teacher identity from this feature.
5. Avoid timer pressure by default; Calm Mode remains the default.
6. Existing canonical lessons and assessments are read-only inputs.

## Release gates
Before merging to `main`:
- verify `/practice.html` loads all canonical assessment bundles;
- verify 3/5/10 minute queues start and finish;
- verify `Try again` persists and is prioritised in the next mission;
- verify `Got it` clears an item from retry state;
- verify visual-question objects render their prompt without `[object Object]`;
- verify refresh preserves local practice state safely;
- verify mobile layout at 320, 375, 390 and 430 CSS px widths;
- verify keyboard-only operation and visible focus states;
- verify reduced-motion preference;
- verify no network write is introduced by the arena;
- run existing repository regression/CI checks;
- keep custom-domain production cutover separately gated.

## Next increment after V1 acceptance
Integrate an Arena entry surface into the promoted visual-master navigation/home experience, then add explainable mastery signals using the same local-only state. Do not begin cloud identity work as part of this increment.