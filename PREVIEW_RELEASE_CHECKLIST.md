# KirthiVerse Hi-Tech — End-to-End Preview Closure Checklist

Target build: `HITECH-2026-09-03-13`

## Automated browser closure

The browser-visible End-to-End Preview Closure Center must report `PREVIEW GO` before manual production review begins.

Critical automated checks:

- runtime build identity equals Build 13
- 135 canonical lessons loaded
- 72 canonical assessments loaded
- lesson IDs are complete and unique
- assessment IDs are complete and unique
- Tamil Unicode is present in the canonical corpus
- localStorage write/read succeeds
- existing KirthiVerse local-state keys are parse-safe when present
- local learning state can be exported as a browser-only backup
- History API is available
- preview is HTTPS
- manifest is linked
- `/`, `/worlds`, `/search`, `/progress`, and one real lesson deep link return successfully
- critical CSS/JS runtime assets are reachable
- `version.json` is reachable and reports Build 13
- release-candidate contract is reachable
- production cutover runbook is reachable
- runtime isolation scan finds no known legacy UI or Manus runtime markers
- closure evidence JSON can be exported

Advisory browser signals:

- viewport width is at least 320px
- reduced-motion media-query capability is available
- no obvious horizontal overflow exists at the current viewport

These signals do not replace physical-device or formal accessibility testing.

## Manual closure before production

- owner visual approval on desktop
- physical phone validation
- physical tablet validation
- keyboard-only walkthrough of major flows
- formal screen-reader validation
- 200% zoom and reflow validation
- professional Tamil language review
- final Cloudflare custom-domain/DNS change approval
- production-domain smoke test after cutover
- rollback verification immediately after cutover

## Required evidence artifacts

- `/version.json`
- `/release-candidate.json`
- `/preview-closure.json`
- exported browser closure evidence JSON
- exported representative local-state backup JSON
- `/PRODUCTION_CUTOVER_RUNBOOK.md`

## Production rule

`PREVIEW GO` is necessary but not sufficient for launch. The production hostname remains untouched until the automated preview gate is clean, every manual closure item is completed, and the owner explicitly approves cutover.