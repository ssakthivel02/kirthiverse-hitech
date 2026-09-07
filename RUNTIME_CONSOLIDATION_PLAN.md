# KirthiVerse Runtime Consolidation Gate

Candidate: `MANUS-VISUAL-MASTER-03`

## Why this gate exists

The visual migration now reconciles the current learning features into one design language, but the preview still loads historical additive presentation/runtime layers from Builds 03–14. Those layers are retained temporarily because they contain working local-first behavior that must not be lost during a visual rewrite.

The next optimization must reduce runtime duplication **without changing canonical data, local progress keys, route behavior, assessment integrity, or accessibility state**.

## Current functional layers to preserve

- `app.js` — primary router and canonical lesson/world/search/progress rendering.
- `experience.js` — command navigator, keyboard shortcut, network state, scroll telemetry, age-path enhancement.
- `intelligence-v4.js` — local learning pulse, smart mission rail, active navigation.
- `cockpit-v5.js` — learning cockpit, mission queue, universe quick strip.
- `mastery-v6.js` — lesson mission console, canonical assessment deck, mastery matrix, density controls.
- `workspace-v7.js` — bookmarks, recent lessons, Study Studio, continue learning.
- `planner-v8.js` — weekly target, challenge deck, accessibility controls, return-user continuity.
- `diagnostics-v9.js` through `preprod-v14.js` — preview/release evidence and closure tools.

## Consolidation target

### Runtime A — `kv-core-runtime.js`
Own:
- router hooks and render-complete event
- active navigation
- keyboard command navigator
- online/offline state
- age-path state
- density state
- shared local-storage helpers

### Runtime B — `kv-learning-runtime.js`
Own:
- local learning pulse
- smart mission queue/rail
- Study Studio
- bookmarks
- recent missions
- weekly planner
- challenge deck
- mission console
- canonical assessment deck
- mastery matrix

### Runtime C — `kv-preview-gate.js`
Preview-only:
- diagnostics
- route/asset smoke checks
- release evidence
- contamination checks
- manual closure register
- export/backup tools

Production should not permanently ship historical release-gate generations after the final gate is proven.

## Observer rule

The consolidated runtime must use one deterministic render lifecycle rather than independent DOM MutationObservers.

Target flow:

`app render -> dispatch kv:rendered -> core runtime -> learning runtime -> optional preview gate`

No feature is allowed to remove and immediately reinsert its own DOM in response to its own MutationObserver.

## State compatibility

The following existing local keys must remain readable during consolidation:

- `kirthiverse.hitech.static.progress.v2`
- `kirthiverse.hitech.workspace.v1`
- `kirthiverse.hitech.planner.v8`
- `kirthiverse.hitech.density`
- `kirthiverse.hitech.profile.local.v1`

Any future state schema change requires migration rather than silent reset.

## Removal policy

Do not delete an old layer merely because a replacement file exists. Remove it only when all of its behaviors are mapped to the consolidated runtime and verified in-browser.

Before deleting each old CSS/JS pair:
1. map owned features;
2. implement replacement;
3. verify routes and local state;
4. compare browser behavior;
5. remove old script/style reference from `index.html`;
6. rerun preview gate;
7. delete file only after no runtime/reference dependency remains.

## File-size discipline

- no duplicate Manus source bundle in runtime repository;
- no `/manus-storage/` dependency;
- one canonical production copy per approved image;
- no caches, logs, dependency directories or `.wrangler` artifacts;
- combine shared CSS tokens instead of repeated route declarations;
- keep preview/release tooling separable from production payload.

## Current decision

`CONSOLIDATION_READY_TO_START`

Not yet approved to remove historical runtime layers because browser-visible parity of `MANUS-VISUAL-MASTER-03` has not been demonstrated.

Production DNS remains unchanged.
