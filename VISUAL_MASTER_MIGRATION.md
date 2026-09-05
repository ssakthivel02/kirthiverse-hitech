# KirthiVerse Visual Master Migration

## Scope
This branch is the isolated visual migration workspace for the owner-approved KirthiVerse Manus visual master. Stable `main` remains Build 14 until visual and functional QA are complete.

## Non-negotiable source boundaries
- Canonical learning corpus remains 135 lessons, 72 assessments, 11 worlds.
- Manus handover is DESIGN / UI / ANIMATION donor only.
- Do not import historical Manus corpus as canonical content.
- Do not import `.project-config.json`, credentials, Manus runtime/storage/analytics/debug collector, `ManusDialog`, or `vite-plugin-manus-runtime`.
- Production DNS stays unchanged until owner-approved preview QA passes.

## Current candidate
`MANUS-VISUAL-MASTER-05`

## Visual direction
- warm editorial garden-classroom surfaces
- larger high-visibility typography
- botanical green / saffron / clay / blue accents
- premium cards and generous spacing
- stronger responsive hierarchy
- restrained route transitions and microinteractions
- reduced-motion support

## Runtime consolidation completed so far
A shared `kv:rendered` lifecycle now coordinates feature enhancement. Global MutationObserver dependency has been removed from:
- experience
- learning intelligence
- learning cockpit
- mastery / canonical assessment console
- Study Studio / bookmarks workspace
- planner / accessibility layer

The Profile controller also has a reduced lifecycle surface. Build 09–14 evidence layers remain preserved until browser validation.

## File-size / duplicate policy
1. Do not copy the complete Manus handover into production runtime.
2. Import only code/assets used by the final runtime.
3. Keep one canonical copy per production asset.
4. Hash-check assets before adding them.
5. Prefer shared tokens/components to repeated declarations.
6. Consolidate historical presentation layers only after browser parity is proven.
7. Keep QA/runbook files small and text-only.
8. Optimize approved images for actual rendered dimensions.
9. Never deploy caches, logs, `.git`, `.wrangler`, dependency folders or Manus exports as static assets.

## Pending owner assets
- `kirthiverse-mark_28bda5f0.png`
- `kirthiverse-hero_15ccac10.png`
- `kirthiverse-worlds_d4d17287.png`

These remain non-blocking for controlled preview.

## Remaining sequence
1. Browser-visible controlled visual preview.
2. Owner comparison with Manus design master.
3. Exact viewport QA: 1440x900, 1280x800, 768x1024, 390x844.
4. Direct `/lesson/:id` reload and route QA.
5. Local-state, bookmark, planner, profile and accessibility QA.
6. Measure runtime payload and consolidate redundant historical CSS/evidence layers.
7. Add only approved/deduplicated visual assets.
8. Merge only after explicit owner approval.
9. Production-domain cutover remains a separate final operation.

## Cloudflare discipline
No temporary Cloudflare project is required. Reuse the existing controlled KirthiVerse preview path when ready. Never delete a route/origin without first proving it is unused by production.
