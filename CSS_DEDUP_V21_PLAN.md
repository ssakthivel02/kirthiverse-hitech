# KirthiVerse Visual CSS v21 semantic deduplication

This preview-only optimization extends `build-visual-css.py` without changing the preserved source stylesheets.

Safety boundary:
- keep the six source stylesheets unchanged for rollback/review;
- preserve source cascade order;
- preserve declaration order and fallback declarations;
- never deduplicate across CSS container boundaries;
- recurse only into rule-container at-rules (`@media`, `@supports`, `@container`, `@layer`, `@scope`);
- leave keyframes, font-face and other declaration-bearing at-rules untouched;
- remove only byte-identical qualified rule blocks when an identical later rule exists in the same container;
- keep the generated `visual-system-v21.css` as the only stylesheet loaded by the preview entry point.

The GitHub Actions preview workflow rebuilds the stylesheet and measures the loaded non-data payload on every candidate push. Production DNS and the `main` branch remain outside this preview change.
