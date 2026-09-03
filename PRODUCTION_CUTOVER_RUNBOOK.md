# KirthiVerse Hi-Tech — Production Cutover Runbook

Target preview candidate: `HITECH-2026-09-03-13`

## Scope

This runbook applies only to the new `ssakthivel02/kirthiverse-hitech` implementation and the Cloudflare Workers Static Assets preview. The production hostname remains untouched until owner approval.

## Preconditions

1. `/version.json` reports Build 13.
2. The End-to-End Preview Closure Center reports `PREVIEW GO` with no critical automated failures.
3. Canonical corpus remains 135 lessons, 72 assessments and 11 worlds.
4. No legacy ArivuKids implementation or Manus runtime dependency is present.
5. Owner visual approval is recorded.
6. Physical phone and tablet checks are complete.
7. Keyboard-only, formal screen-reader, 200% zoom/reflow and Tamil review are complete.
8. A local-state backup is exported from at least one representative browser before any production-domain change.

## Cutover sequence

1. Record the current production hostname origin and DNS configuration for rollback.
2. Record the current known-good preview URL and Build 13 commit state.
3. Add `kirthiverse.omsaravanabhava.org` to the new Cloudflare Workers project using the supported custom-domain/route mechanism in the current Cloudflare dashboard.
4. Remove or retire the old GitHub Pages custom-domain claim only when Cloudflare confirms the new binding is active.
5. Ensure the production DNS/custom-domain path no longer resolves to the old GitHub Pages origin.
6. Purge Cloudflare cache for the production hostname if required.
7. Open `/version.json` on the production hostname and verify Build 13.
8. Validate `/`, `/worlds`, `/search`, `/progress` and one real `/lesson/:id` deep link.
9. Validate lesson start/completion persistence, Study Studio bookmarks, weekly planner state and accessibility controls.
10. Verify Tamil content renders correctly on desktop and physical mobile.
11. Re-run the browser closure gate on the production hostname.
12. Keep the rollback information available until the production site has remained stable through the agreed observation window.

## Rollback triggers

Rollback immediately if any of these occur after cutover: old/incorrect build appears; homepage or deep links return an error; canonical lesson/assessment counts change unexpectedly; critical CSS/JS assets fail; local progress becomes unreadable; Tamil text is corrupted; navigation is materially broken; or Cloudflare binding/DNS does not consistently resolve to the new runtime.

## Rollback sequence

1. Restore the previous production DNS/custom-domain target recorded before cutover.
2. Remove or disable the new Workers production binding if it is causing routing conflict.
3. Purge Cloudflare cache if stale responses persist.
4. Confirm the previous production site is reachable.
5. Preserve the Build 13 preview URL for diagnosis.
6. Do not delete GitHub history or the new repository; source-control history is the rollback record.

## Cost and service policy

Static assets remain the default. Do not enable paid Cloudflare services, D1, R2, KV, Workers AI or other paid runtime dependencies without explicit owner approval.

## Production decision rule

`PREVIEW GO` is necessary but not sufficient. Production cutover requires automated preview GO plus all manual closure items plus explicit owner approval.