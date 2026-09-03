# KirthiVerse controlled-preview runtime payload baseline

Candidate: `MANUS-VISUAL-MASTER-05`
Branch: `design/manus-visual-master`
Scope: presentation/runtime only; canonical lesson and assessment data files are excluded from these numbers.

## Current loaded presentation/runtime payload

The current `index.html` loads approximately:

- CSS: **95,431 bytes** uncompressed
- JavaScript: **63,997 bytes** uncompressed
- Combined: **159,428 bytes** uncompressed

This is a source-size baseline, not a transfer-size claim. Cloudflare/browser compression will reduce network transfer, but source duplication still affects maintenance, parsing, execution and long-term architecture.

## Current loaded CSS families

- `styles.css`
- `experience.css`
- `intelligence-v4.css`
- `cockpit-v5.css`
- `mastery-v6.css`
- `workspace-v7.css`
- `planner-v8.css`
- `visual-master-v15.css`
- `visual-master-pages-v15.css`
- `visual-master-features-v15.css`

## Current loaded JavaScript families

- `app.js`
- `navigation-v18.js`
- `runtime-lifecycle-v16.js`
- `experience.js`
- `intelligence-v4.js`
- `cockpit-v5.js`
- `mastery-v6.js`
- `workspace-v7.js`
- `planner-v8.js`
- `visual-master-v15.js`
- `profile-v17.js`
- `visual-master-pages-v15.js`
- `visual-preview-gate.js`

## Consolidation target

Do not remove learner-facing capability to hit a size number. Preserve the verified corpus and all approved local-first learning functions.

Target architecture after browser parity is proven:

1. **Core runtime** — router, shared lifecycle, local-state primitives, navigation, accessibility basics.
2. **Learning runtime** — intelligence, cockpit, mastery/assessment, Study Studio/bookmarks, planner and profile behaviour.
3. **Core design system** — editorial visual tokens, global shell, responsive/accessibility primitives.
4. **Learning feature styles** — learner feature components and route-specific presentation.
5. **Optional preview gate** — validation only; not part of eventual normal learner production runtime.

Initial consolidation objective: reduce loaded non-data presentation/runtime source size by **at least 25% from this 159,428-byte baseline** while preserving functional and visual parity. This is an engineering target, not a production-readiness claim.

## Non-negotiable preservation contract

- 135 canonical lessons
- 72 canonical assessments
- 11 learning worlds
- local progress
- age paths
- command navigator
- Smart Mission Rail
- Learning Cockpit
- canonical assessment deck
- Universe Mastery Matrix
- reading density
- Study Studio/bookmarks/recent missions
- weekly planner and challenge deck
- accessibility controls
- local-only Profile
- Tamil rendering
- direct deep-link SPA behaviour
- reduced-motion support
- zero Manus runtime/storage/debug/config dependencies

## Safety boundary

This consolidation work remains on `design/manus-visual-master`. Do not merge to `main`, change production DNS, create another Cloudflare Worker, or enable paid Cloudflare services until browser-visible parity and explicit owner approval are complete.
