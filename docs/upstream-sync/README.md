# Upstream Sync System

This directory documents how `iechor-research/research-cli` tracks upstream
changes from [`google-gemini/gemini-cli`](https://github.com/google-gemini/gemini-cli)
and the conventions that govern any cherry-pick from upstream.

## Why this exists

`research-cli` was forked from `gemini-cli` around **2025-07-13**
(upstream commit `26a79fec` —
`feat: Add GEMINI_DEFAULT_AUTH_TYPE support`). The fork has since accumulated
extensive customisations (branding, research-specific tooling, telemetry,
sandbox, release pipeline). At the time Phase 0 of the sync plan was set up,
upstream `main` was already **4690 commits ahead** of the fork point, and the
two repositories no longer share an active merge base in
`iechor-research/research-cli`'s recorded history.

A "big-bang" `git merge upstream/main` is therefore not safe. Instead, this
project follows a staged plan; this `docs/upstream-sync/` folder is the home
of the artefacts that support the staged plan.

## Components

| Artefact                                     | Purpose                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `.github/workflows/upstream-sync.yml`        | Weekly workflow that fetches upstream, mirrors it, regenerates the report, and opens a PR if needed. |
| `scripts/monitor-upstream.js`                | Generates `upstream-monitor-report.json` (categorisation by commit message **and** file path).        |
| `scripts/upstream-config.js`                 | Single source of truth for fork point, brand-replacement table, and path-to-subsystem mapping.        |
| `upstream-monitor-report.json` (repo root)   | Machine-readable snapshot of "what upstream has that we don't yet".                                   |
| `upstream-mirror` branch (in this repo)      | Force-mirrored copy of `upstream/main`. Used as a stable diff target for reviewers and tooling.       |
| `docs/upstream-sync/path-mapping.md`         | Human-readable mapping of brand strings, subsystem paths, fork-only files, and upstream-only files.   |

## How the weekly workflow works

`upstream-sync.yml` runs every Monday at 03:00 UTC (and on demand via
`workflow_dispatch`). Per run it:

1. Adds the `upstream` remote (if missing) and runs `git fetch --no-tags upstream main`.
2. Force-pushes `refs/remotes/upstream/main` to `refs/heads/upstream-mirror`
   on `origin`. The mirror branch has independent history and is **only**
   used as a diff target — never merge it.
3. Runs `node scripts/monitor-upstream.js --ci --skip-fetch`, which writes
   the categorised report to `upstream-monitor-report.json`.
4. If the report's content changed (ignoring the `timestamp` field), opens
   or updates a PR with the new report.

## The report file

`upstream-monitor-report.json` contains:

- `forkPoint`, `forkPointDate` — the upstream commit this fork started from.
- `upstreamHeadSha`, `upstreamVersion` — the upstream commit being compared.
- `commitCount` — how many upstream commits are unmerged.
- `categories` — commits bucketed by **message keyword**
  (`critical`, `security`, `feature`, `refactor`, `docs`, `test`, `build`,
  `deps`, `other`).
- `pathCategories` — commits bucketed by **file path / subsystem**
  (e.g. `core-tools`, `cli-ui`, `docs`, `workflows`). A commit can appear in
  more than one path bucket if it touches multiple subsystems. The mapping
  is defined in `scripts/upstream-config.js > UPSTREAM_CONFIG.pathCategories`.
- `recommendations` — high-level suggestions (informational only).
- `mergeReady` — `false` in CI; meant only for manual local runs.

## How to act on the report

Picking up an upstream commit always follows the same shape, regardless of
whether it is a doc fix, a bug fix, or a feature:

1. Read the report and choose a small, related batch of commits from a
   **single** path category (e.g. all under `core-utils`).
2. Locally:

   ```sh
   git fetch upstream
   git checkout -b cherry-pick/<short-name>
   git cherry-pick <sha-1> <sha-2> ...
   ```

3. Resolve conflicts using `docs/upstream-sync/path-mapping.md` — every
   `@google/gemini-cli` reference becomes `@iechor/research-cli`, every
   `gemini` binary reference becomes `research`, etc.
4. Prepend each commit message with the upstream short SHA, e.g.
   `[upstream a167f28e] fix(diffstats): ...`.
5. Run the standard checks (`npm run build`, `npm run test`, applicable
   integration tests).
6. Open a PR. Keep one cherry-pick batch per PR for reviewability.

## Hard rules

- **Never** run `git merge upstream/main` (or its inverse) on the default
  branch — the histories are unrelated and the operation will produce a
  ~3000-file noise diff.
- **Never** force-push to `main`, `upstream-mirror`, or any branch listed
  in `.github/workflows/*.yml`.
- The `upstream-mirror` branch is **owned by automation**. Do not push to
  it manually; the workflow will overwrite your changes.
- The brand-replacement table in `scripts/upstream-config.js` is the
  canonical source. Update it there, not in scattered scripts.

## Roadmap

This README covers the Phase 0 infrastructure only. Subsequent phases
(documentation re-sync, common-dependency upgrades, targeted bug-fix
cherry-picks, subsystem-by-subsystem alignment) are described in the
project tracking issue.
