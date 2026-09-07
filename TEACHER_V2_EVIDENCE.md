# Teacher v2 + overlay-removal evidence

Candidate: `MANUS-VISUAL-MASTER-05`
Branch: `design/manus-visual-master`
Base SHA this work started from: `6668fa0b2df8f731ddf60771af64c6954fd3380a`

This records the local verification performed before pushing, using the
same headless-Chromium/CDP technique the repo's GitHub Actions jobs use,
against a local static server serving the working tree.

## Static contract checks (run locally, all PASS)

- `teacher-v2-qa.yml` static contract: `TEACHER_V2_CONTRACT_PASS`
- `teacher-v2-bilingual-qa.yml` static contract: `TEACHER_V2_BILINGUAL_CONTRACT_PASS`
- `teacher-v2-closure-qa.yml` static contract: `OVERLAY_REMOVAL_STATIC_PASS`
- `performance-security-qa.yml` static contract: `PERF_STATIC_PASS external=164518 html=20282 shell=184800 js_requests=6`
- `release-closure-qa.yml` static contract: `RELEASE_STATIC_PASS` (`EXTERNAL_CSS_JS_BYTES 164518`)
- `accessibility-closure-qa.yml` static contract: `A11Y_CONTRACT_PASS` (unaffected by this change)
- identity static contract: `IDENTITY_STATIC_PASS 164518` (unaffected by this change)

## Payload budget

| Metric | Before this change | After this change | Ceiling |
| --- | --- | --- | --- |
| External CSS bytes | 95,894 | 93,718 | — |
| External JS bytes | 71,839 | 70,800 | — |
| External CSS + JS combined | 167,733 | 164,518 | 168,000 |
| `index.html` bytes | 11,774 | 20,282 | 32,000 |
| CSS + JS + HTML combined | 179,507 | 184,800 | 200,000 |
| External JS `<script src>` requests | 6 | 6 | 6 |

Removing `.kv-command-dock` and `.device-rail` freed 940 + 652 + 584 bytes
of CSS (learning-foundation-v19.css, learning-tools-v20.css,
visual-master-features-v15.css) and 107 bytes net of JS
(learning-foundation-v19.js, learning-tools-v20.js after also adding the
reading-density buttons to the accessibility deck), which made room for
the larger inline Teacher v2 style/script block without breaching the
168,000-byte external ceiling. No seventh primary runtime JS request was
added; Teacher v2 stays inline in `index.html`, same as v1.

## Chromium interaction QA (local, headless, real Chromium 1194)

Run against `http://127.0.0.1:8888/` with the six primary runtime files
and canonical lesson `math.number.place-value.base10.age6-8.l1`:

```
Step 1: app shell ready                       -> OK
Step 2: navigate to lesson, teacher renders   -> OK ([data-teacher="v2"])
Step 3: exactly one teacher instance          -> count=1
Step 4: cycle all 6 states                    -> states=[welcome,explain,question,
                                                  encourage,retry,success]; 6 distinct
                                                  mouth paths; 6 distinct badges;
                                                  eye styles=[normal,narrow,happy]
Step 5: gesture icon present per state        -> OK
Step 6: motion toggle + local persistence     -> OK
Step 7: Speak/Stop present, Stop idle-disabled, no autoplay -> OK
Step 8: Speak click does not throw            -> OK (no voices in headless
                                                  Chromium, so it resolves
                                                  gracefully with no crash)
Step 9: .kv-command-dock / .device-rail absent -> OK
Step 10: reading-density controls in a11y deck -> 3 buttons found
ALL CHECKS PASSED
```

## Responsive / overflow QA (local, headless, real Chromium 1194)

All 6 required viewports x 4 routes (Home, Worlds, Progress, canonical
Lesson) = 24 checks, all `OK`:

```
1440x900, 1280x800, 768x1024, 390x844, 375x812, 320x800
```

No page-level horizontal overflow, no obsolete overlay present, and the
active item in the mobile top navigation remained visible (not clipped)
at every mobile-width check (390x844, 375x812, 320x800).

## What this evidence does not cover

This is local, developer-side verification run against a static file
server — it exercises the same DOM/CDP assertions the GitHub Actions
workflows run, but it is not a substitute for the actual CI jobs, the
Cloudflare Worker preview deploy, or a human owner's visual review.
Those are the next step after this branch is pushed: the repository's
own `teacher-v2-qa.yml`, `teacher-v2-bilingual-qa.yml`,
`teacher-v2-closure-qa.yml`, `performance-security-qa.yml`,
`release-closure-qa.yml`, `accessibility-closure-qa.yml`,
`pwa-offline-qa.yml`, `identity-architecture-qa.yml`,
`identity-interaction-qa.yml`, `owner-visual-evidence-qa.yml` and
`preview-manus.yml` are what actually gate this branch. Production
remains on `HOLD`; this PR remains open/draft/unmerged pending explicit
owner visual/voice review.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
