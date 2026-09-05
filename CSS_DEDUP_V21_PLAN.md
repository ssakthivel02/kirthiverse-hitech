# KirthiVerse Visual CSS v21 semantic deduplication — rejected experiment

This preview-only experiment tested whether `build-visual-css.py` could safely remove byte-identical qualified CSS rules inside the same cascade container without changing the preserved source stylesheets.

Safety boundary tested:
- keep all six source stylesheets unchanged for rollback/review;
- preserve source cascade order;
- preserve declaration order and fallback declarations;
- never deduplicate across CSS container boundaries;
- recurse only into rule-container at-rules (`@media`, `@supports`, `@container`, `@layer`, `@scope`);
- leave keyframes, font-face and other declaration-bearing at-rules untouched;
- consider removal only for byte-identical qualified rule blocks.

Result:
- exact duplicate qualified rules found: **0**;
- exact duplicate rule bytes removable: **0**;
- generated stylesheet increased from the proven v21 size of **93,877 bytes** to **95,459 bytes** because the semantic parser preserved additional structure;
- therefore the experiment was **not adopted** and the canonical `build-visual-css.py` was reverted to the proven conservative v21 generator.

This document is retained only as engineering evidence to prevent repeating the same no-gain experiment. The browser continues to load only `visual-system-v21.css`. Production DNS and the `main` branch remain outside this preview work.
