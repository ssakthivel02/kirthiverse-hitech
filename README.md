# KirthiVerse HI-TECH — ACTIVE MASTER

Canonical active repository: `ssakthivel02/kirthiverse-hitech`

Active integration branch: `main`

OLD and LEGACY versions are read-only references only. New development, fixes, redesign, deployment changes and content updates must be performed only in this HI-TECH active master after verifying the work is genuinely missing or failing here.

See `ACTIVE_MASTER_CONTROL.md` and `ACTIVE_MASTER_CONTROL.json` for the enforced task-control contract.

## Current HI-TECH runtime architecture

This summary describes the live `index.html` entrypoint in the ACTIVE MASTER. The `kv-runtime-generation` marker in `index.html` is authoritative for the core runtime generation.

- Runtime generation: `CORE-RUNTIME-V30`
- Core runtime: `core-runtime-v30.js`
- Learning foundation: `learning-foundation-v19.js` + `learning-foundation-v19.css`
- Learning tools: `learning-tools-v20.js` + `learning-tools-v20.css`
- Adaptive learner layer: `learner-adaptive-v26.js`
- Visual controller: `visual-controller-v27.js`
- Visual master CSS: `visual-master-v15.css`, `visual-master-pages-v15.css`, `visual-master-features-v15.css`
- Local learning-loop modules remain additive through `mastery-engine-v1.js`, `parent-v1.js`, `diagnostic-v1.js`, `speedlab-v1.js`, `lesson-check-v1.js` and `p0-entry-v1.js`.

The runtime-generation summary above is checked by the repository `Protected Main Gate` against the live entrypoint. Later feature-specific and pilot-readiness modules remain governed by their own evidence/QA contracts and must not be inferred as production approval from this architecture summary.
