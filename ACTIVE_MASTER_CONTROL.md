# KirthiVerse HI-TECH — ACTIVE MASTER

## Canonical source

- Active repository: `ssakthivel02/kirthiverse-hitech`
- Active integration branch: `main`
- Status: **HI-TECH — ACTIVE MASTER**

This repository is the only active development source of truth for KirthiVerse in this workstream.

## OLD / LEGACY policy

OLD and LEGACY versions are read-only references only. They must not receive new development, fixes, redesign, deployment changes or content updates.

If a useful item exists only in OLD/LEGACY, reconcile it once into this HI-TECH master after verifying it is genuinely missing here. Do not upgrade the old project separately.

## Task start contract

Before any new task:

1. Confirm this repository and current `main` as the active master baseline.
2. Inventory completed work already present in the active master.
3. Select only a genuine gap supported by missing/failing evidence.
4. Build, test and record evidence for that single task before starting the next task.

Completed tasks must not be recreated merely because an older branch, preview or legacy project contains a different implementation.

## Branch policy

Task branches are allowed only for genuinely new, evidence-backed gaps. A task branch must start from the exact current `main`, remain narrowly scoped, pass applicable QA, and merge back to `main`.

Do not create a replacement or duplicate branch for already completed work.

## Strict GitHub safety policy

GitHub changes must be conservative, evidence-backed and reversible wherever possible.

Before any GitHub write:

1. Re-read the canonical repository, active branch and current `main` SHA.
2. Inventory existing open pull requests, issues and relevant workflows so a duplicate task or governance path is not created.
3. Confirm the intended change is the smallest evidence-backed change that resolves the verified gap.
4. Use a task branch created from the exact current `main`; normal development must not write directly to protected `main`.

During implementation and review:

- Do not force-push or destructively move protected refs.
- Do not weaken, remove or bypass required CI, branch protection or rulesets merely to obtain a green result.
- Do not treat a skipped, cancelled, stale or different-head check as evidence for the candidate being merged.
- Merge only after the applicable required checks pass on the exact current PR head.
- Automated/API merges must use an expected-head SHA guard so a moved PR head cannot be merged accidentally.

After every merge:

1. Re-read `main` and record the new exact SHA.
2. Re-verify that `main` still reports protected and that the canonical repository/branch remain unchanged.
3. Close the task only after the merged state is confirmed.
4. Stop creating repository changes when the remaining blockers are genuinely manual, external, legal, safeguarding, organisational or owner-attestation work.

## Duplicate-artifact policy

Do not create duplicate repositories, websites, previews, dashboards, folders or deployments for an already active scope. First locate and continue the existing HI-TECH source.

## Enforcement

`ACTIVE_MASTER_CONTROL.json` is the machine-readable contract. The repository `Protected Main Gate` validates the canonical repository, active branch target, core task-control rules and strict GitHub safety controls for every pull request targeting `main`.

This governance contract does not replace feature-specific QA, production approval, safeguarding/privacy review or any other evidence gate.
