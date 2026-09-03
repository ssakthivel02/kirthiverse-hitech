# KirthiVerse Hi-Tech — Preview Release Candidate Checklist

Target build: `HITECH-2026-09-03-12`

## Automated browser gate

The browser-visible Release Candidate Control Center must report all critical checks PASS before preview may be called `GO`:

- runtime build identity equals Build 12
- 135 canonical lessons loaded
- 72 canonical assessments loaded
- lesson IDs are complete and unique
- learning-universe representation remains intact
- Tamil corpus and Tamil Unicode sample are present
- localStorage write/read succeeds
- existing KirthiVerse local-state keys are parse-safe when present
- History API is available
- preview is HTTPS
- manifest is linked
- `/`, `/worlds`, `/search`, `/progress`, and a real lesson deep link return successfully
- critical CSS/JS runtime assets are reachable
- `version.json` is reachable and reports Build 12
- no stale-build mismatch exists
- runtime isolation scan finds no legacy UI or external runtime contamination markers
- browser evidence JSON can be exported

## Manual closure before production

These checks cannot be truthfully certified by the automated browser gate and remain mandatory before production cutover:

- owner visual approval on desktop
- physical mobile validation
- physical tablet validation
- keyboard-only walkthrough of major flows
- formal screen-reader validation
- 200% zoom/reflow validation
- professional Tamil language review
- final Cloudflare custom-domain/DNS change approval
- production-domain smoke test after cutover
- rollback verification immediately after cutover

## Production rule

`PREVIEW GO` does not equal production ready. The production hostname remains untouched until automated preview evidence is clean and the manual closure set is approved.