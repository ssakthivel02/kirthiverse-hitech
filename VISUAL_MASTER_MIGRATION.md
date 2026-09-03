# KirthiVerse Visual Master Migration

## Scope

This branch is the isolated visual migration workspace for the owner-approved KirthiVerse Manus visual master. The stable `main` branch remains Build 14 until visual and functional QA are complete.

## Non-negotiable source boundaries

- Canonical learning corpus remains the clean KirthiVerse Hi-Tech corpus: 135 lessons, 72 assessments, 11 worlds.
- The Manus handover is a DESIGN / UI / ANIMATION donor only.
- Do not import historical Manus corpus as canonical content.
- Do not import `.project-config.json`, Manus credentials, Manus runtime, Manus storage proxy, Manus analytics, debug collector, `ManusDialog`, or `vite-plugin-manus-runtime`.
- Production DNS stays unchanged until owner-approved preview QA passes.

## Visual direction

Preserve the owner's preferred Manus visual identity:

- warm editorial garden-classroom surfaces
- larger high-visibility typography
- strong botanical green / saffron / clay / blue accents
- premium cards with generous spacing
- editorial headings with readable UI text
- visible responsive hierarchy rather than shrinking desktop UI
- restrained route transitions, hover lift, progress motion and microinteractions
- reduced-motion support

Improve beyond the donor where useful without changing its overall identity:

- stronger visual accessibility and contrast
- clearer age-path differentiation
- more polished mobile/tablet composition
- better learning-state visibility
- AI-ready interaction surfaces only when backed by a real implementation or clearly labelled preview state

## File-size / duplicate policy

1. Never copy the complete 1.5 MB Manus handover into the production repository.
2. Import only code/assets that are actually used by the final runtime.
3. One canonical copy per production asset; no version-suffixed duplicate images unless the bytes truly differ and both are required.
4. Before adding an asset, compare filename, dimensions and SHA-256 against existing assets.
5. Prefer shared CSS tokens/components over repeated route-specific declarations.
6. Consolidate older visual-layer CSS/JS after parity is proven; do not permanently ship Build 04-14 presentation layers plus a new duplicate layer.
7. Keep QA/runbook JSON/Markdown small and text-only.
8. Keep owner-approved source images optimized for the required rendered dimensions; do not store multiple redundant originals in the public asset directory.
9. Do not store caches, logs, `.git`, `.wrangler`, dependency folders or Manus exports in Cloudflare static assets.

## Current candidate

Candidate: `MANUS-VISUAL-MASTER-01`

Added on this branch:

- `visual-master-v15.css` — visual foundation mapped onto the current KirthiVerse runtime markup.
- `visual-master-v15.js` — route transition and route-state marker; deliberately adds no MutationObserver.
- `index.html` — activates the candidate only on this isolated branch while keeping `KV_BUILD` at Build 14.

The candidate does not claim Build 15, production readiness, or deployment.

## Pending owner assets

The following donor assets remain optional/pending until original bytes and reuse rights are available:

- `kirthiverse-mark_28bda5f0.png`
- `kirthiverse-hero_15ccac10.png`
- `kirthiverse-worlds_d4d17287.png`

Until then, the candidate uses CSS-generated visual treatment and does not fetch `/manus-storage/`.

## Required migration sequence

1. Visual shell parity: navigation, hero, typography, cards, major page composition.
2. Route parity: Home, Worlds, World detail, Lesson detail, Search, Progress; retain current Hi-Tech capabilities.
3. Learning-feature reconciliation: bookmarks, Study Studio, planner, age path, assessments, accessibility and local progress.
4. Runtime consolidation: replace redundant generation layers with a smaller shared runtime after visual/functional parity is proven.
5. Asset integration: add only owner-approved originals, deduplicated and optimized.
6. Responsive QA at 1440x900, 1280x800, 768x1024 and 390x844.
7. Deep-link QA including `/lesson/:id` reload.
8. Automated pre-production gate + manual accessibility/device closure.
9. Owner comparison against the Manus visual master.
10. Merge only after explicit approval; production domain cutover remains a separate final step.

## Cloudflare discipline

No temporary Cloudflare project is required for this branch. Reuse the existing controlled KirthiVerse preview path when the branch is ready for a deliberate preview deployment. Do not create additional Workers/Pages projects solely for iteration. Old/unused Cloudflare resources should be inventoried before deletion; never delete an origin or route still used by the production hostname.
