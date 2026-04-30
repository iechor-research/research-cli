# Upstream Sync — Path & Brand Mapping

When cherry-picking from `google-gemini/gemini-cli` into this fork, every
upstream patch must be rewritten using the rules below. The
machine-readable source of truth is
[`scripts/upstream-config.js`](../../scripts/upstream-config.js); this file
exists to keep that knowledge reviewable in human-readable form.

If you change a mapping, change it in **both** places.

---

## 1. Brand-replacement table

| Upstream                          | Fork (`research-cli`)                  | Notes                                  |
| --------------------------------- | -------------------------------------- | -------------------------------------- |
| `@google/gemini-cli`              | `@iechor/research-cli`                 | npm package name                       |
| `gemini-cli`                      | `research-cli`                         | repo / project name                    |
| `google-gemini/gemini-cli`        | `iechor-research/research-cli`         | GitHub `<owner>/<repo>`                |
| `gemini.google.com`               | `research.iechor.com`                  | marketing host                         |
| `aistudio.google.com`             | `research.iechor.com`                  | AI Studio host                         |
| `gemini-cli.github.io`            | `research-cli.iechor.com`              | docs site                              |
| `google-gemini.github.io`         | `iechor-research.github.io`            | org docs site                          |
| ``gemini`` (binary, in prose)     | ``research``                           | CLI binary name                        |
| `command gemini`                  | `command research`                     | Shell-completion / docs phrasing       |
| `alias gemini`                    | `alias research`                       | Shell-alias phrasing                   |
| `Gemini CLI`                      | `Research CLI`                         | Title-case product name                |
| `Gemini Code Assist`              | `Research Code Assist`                 |                                        |
| `Gemini API`                      | `Research API`                         |                                        |
| `Gemini models`                   | `Research models`                      |                                        |
| `Gemini Studio`                   | `Research Studio`                      |                                        |
| `Gemini 2.5 Pro` / `Gemini 2.5 Flash` | `Research 2.5 Pro` / `Research 2.5 Flash` | only when used as branding, not when referring to actual model IDs in API calls |
| `GEMINI_API_KEY`                  | `RESEARCH_API_KEY`                     | env var                                |
| `GOOGLE_GENAI_USE_VERTEXAI`       | `RESEARCH_USE_VERTEXAI`                | env var                                |
| `GOOGLE_CLOUD_PROJECT`            | `RESEARCH_CLOUD_PROJECT`               | env var                                |
| `"gemini"` / `"Gemini"` / `"GEMINI"` (config keys) | `"research"` / `"Research"` / `"RESEARCH"` | JSON config keys only |
| `.gemini` (config dir)            | `.research`                            | per-user / per-project config dir      |
| `gemini.md` / `GEMINI.md`         | `research.md` / `RESEARCH.md`          | context file name                      |

### Things that are intentionally **not** rewritten

- The literal model IDs returned by the Google GenAI API
  (`gemini-2.5-pro-...`, `gemini-2.0-flash-...`) — these are passed verbatim
  to the underlying API.
- `@google/genai` and other Google SDK package names.
- Any reference inside `node_modules`, `dist/`, or build artefacts.

---

## 2. Subsystem path map

This is the same map encoded in
`UPSTREAM_CONFIG.pathCategories` and used by `monitor-upstream.js` to bucket
upstream commits in `upstream-monitor-report.json > pathCategories`. It is
also the order in which subsystems are tackled in Phase 2 of the sync plan.

| Bucket               | Path prefix                                | Phase-2 order |
| -------------------- | ------------------------------------------ | ------------- |
| `core-utils`         | `packages/core/src/utils/`                 | 1             |
| `core-tools`         | `packages/core/src/tools/`                 | 2             |
| `core-services`      | `packages/core/src/services/`              | 3             |
| `core-mcp`           | `packages/core/src/mcp/`                   | 4             |
| `core-codeassist`    | `packages/core/src/code_assist/`           | 4             |
| `core-config`        | `packages/core/src/config/`                | 5 (review-heavy) |
| `core-other`         | `packages/core/` (catch-all)               | —             |
| `cli-ui`             | `packages/cli/src/ui/`                     | 6             |
| `cli-commands`       | `packages/cli/src/commands/`               | 7             |
| `cli-services`       | `packages/cli/src/services/`               | 8             |
| `cli-other`          | `packages/cli/` (catch-all)                | 8             |
| `a2a-server`         | `packages/a2a-server/`                     | Phase 3 only  |
| `vscode-ide`         | `packages/vscode-ide-companion/`           | Phase 3 only  |
| `sdk`                | `packages/sdk/`                            | Phase 3 only  |
| `docs`               | `docs/`                                    | Phase 1.1     |
| `workflows`          | `.github/workflows/`                       | Phase 4       |
| `github-actions`     | `.github/actions/`                         | Phase 4       |
| `gemini-skills`      | `.gemini/skills/`                          | not adopted   |
| `gemini-commands`    | `.gemini/commands/`                        | not adopted   |
| `integration`        | `integration-tests/`                       | Phase 1.4     |
| `scripts`            | `scripts/`                                 | case-by-case  |
| `other`              | (anything not matched above)               | case-by-case  |

The first matching prefix wins, so a file under
`packages/core/src/utils/...` is counted in `core-utils` and **not** in the
`core-other` catch-all.

---

## 3. Files only in the fork (preserve verbatim during cherry-picks)

These directories / files do not exist upstream and must never be touched
by an upstream cherry-pick. If a cherry-pick conflicts with one of these,
keep the fork's version.

Top-level groupings (full list: `git diff --diff-filter=A --name-only upstream/main HEAD`):

- `RESEARCH.md`, `Makefile` (fork-customised)
- `SciToolAgent/` — research tool integration
- `research-site/`, `research-terminal/`, `research-terminal-go/` — fork-only sub-projects
- `qianwen_latex_demo/`, `baidu_latex_demo*` — research demos
- `blogs/` — fork blog content
- `docs/assets/research-screenshot*.png`, `docs/Uninstall.md`,
  `docs/cross-platform-release.md`, `docs/deployment.md`,
  `docs/github-actions-build.md`, `docs/tauri-desktop.md`
- `eslint-rules/`
- `install.sh`, `Dockerfile` (root-level)
- `.github/workflows/build-cross-platform.yml`,
  `.github/workflows/build-native*.yml`,
  `.github/workflows/build-release.yml`,
  `.github/workflows/release.yml`,
  `.github/workflows/research-*-triage.yml`,
  `.github/workflows/e2e.yml`
- `.gcp/release-docker.yaml` (fork release pipeline)
- `scripts/build-cross-platform*.js`, `scripts/build-native-wrapper.js`,
  `scripts/build-research-terminal.js`, `scripts/build-simple*.js`,
  `scripts/build-standalone-package.js`, `scripts/build-hyper-style.js`,
  `scripts/check-build-status.js`, `scripts/clean.js`,
  `scripts/create-*-release.js`, `scripts/gh-release*.js`,
  `scripts/get-release-version.js`, `scripts/local_telemetry.js`,
  `scripts/merge-package-json.js`, `scripts/merge-upstream*`,
  `scripts/monitor-upstream.js`, `scripts/qianwen_latex_demo.js`,
  `scripts/release.js`, `scripts/replace-gemini-branding.sh`,
  `scripts/test-*.js` (fork-specific test harnesses),
  `scripts/trigger-github-build.js`, `scripts/upstream-config.js`,
  `scripts/verify-upstream-system.js`
- `upstream-monitor-report.json`, `upstream-system-report.json`
- Inside `packages/core/` and `packages/cli/`: any file added by the fork
  to support research-specific tools (e.g. `SciToolAgent` integration,
  iEchor telemetry / auth, model-provider adapters). When a cherry-pick
  conflicts with one of these, keep the fork's version.

To regenerate the canonical list:

```sh
git fetch upstream
git diff --diff-filter=A --name-only upstream/main HEAD
```

---

## 4. Files only in upstream (do **not** auto-adopt)

These exist in `gemini-cli` but were intentionally not carried over (or
have not been adopted yet). Treat their cherry-picks as Phase 3 design
work, not Phase 1 / 2 mechanical sync.

- `packages/a2a-server/` — agent-to-agent server (~40 files)
- `packages/vscode-ide-companion/` — VS Code companion extension (~21 files)
- `packages/sdk/` — public SDK package (~32 files)
- `packages/devtools/`, `packages/test-utils/` — internal tooling Google
  added post-fork
- `tools/gemini-cli-bot/` — upstream's release bot
- `.gemini/` (commands + skills + config) — upstream-specific agent config
  (~80 files). Do **not** adopt: this fork has its own command set.
- `.allstar/` — Google org policy files
- `.gcp/Dockerfile.development*`, `.gcp/development-worker.yml`,
  `.gcp/release-docker.yml` (note the `.yml`, not `.yaml`) — Google build
  pipeline; the fork has its own.
- Most files under `docs/get-started/`, `docs/extensions/`, `docs/hooks/`,
  `docs/reference/`, `docs/resources/` — these are upstream-only doc
  reorganisations; pick what is useful, do not bulk-import.
- `third_party/get-ripgrep/` — upstream's vendored ripgrep helper.

To regenerate the canonical list:

```sh
git fetch upstream
git diff --diff-filter=A --name-only HEAD upstream/main
```

---

## 5. Renamed files (upstream relative to fork)

Upstream has renamed several files since the fork point. When applying an
upstream patch that touches one of these, redirect it to the fork's
historical path:

| Fork path                                             | Upstream renamed to                                                                |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `.gcp/Dockerfile.research-code-builder`               | `.gcp/Dockerfile.gemini-code-builder` (keep fork name)                             |
| `packages/cli/src/ui/components/AuthInProgress.tsx`   | `packages/cli/src/ui/auth/AuthInProgress.tsx`                                      |
| `packages/cli/src/ui/hooks/useEditorSettings.test.ts` | `packages/cli/src/ui/hooks/useEditorSettings.test.tsx`                             |
| `packages/cli/src/ui/themes/ansi.ts`                  | `packages/cli/src/ui/themes/builtin/dark/ansi-dark.ts`                             |
| `packages/cli/src/ui/themes/atom-one-dark.ts`         | `packages/cli/src/ui/themes/builtin/dark/atom-one-dark.ts`                         |
| `packages/cli/src/ui/themes/ayu.ts`                   | `packages/cli/src/ui/themes/builtin/dark/ayu-dark.ts`                              |
| `packages/cli/src/ui/themes/default.ts`               | `packages/cli/src/ui/themes/builtin/dark/default-dark.ts`                          |
| `packages/cli/src/ui/themes/dracula.ts`               | `packages/cli/src/ui/themes/builtin/dark/dracula-dark.ts`                          |
| `packages/cli/src/ui/themes/github-dark.ts`           | `packages/cli/src/ui/themes/builtin/dark/github-dark.ts`                           |
| `packages/cli/src/ui/themes/shades-of-purple.ts`      | `packages/cli/src/ui/themes/builtin/dark/shades-of-purple-dark.ts`                 |
| `packages/cli/src/ui/themes/ansi-light.ts`            | `packages/cli/src/ui/themes/builtin/light/ansi-light.ts`                           |
| `packages/cli/src/ui/themes/ayu-light.ts`             | `packages/cli/src/ui/themes/builtin/light/ayu-light.ts`                            |
| `packages/cli/src/ui/themes/default-light.ts`         | `packages/cli/src/ui/themes/builtin/light/default-light.ts`                        |
| `packages/cli/src/ui/themes/github-light.ts`          | `packages/cli/src/ui/themes/builtin/light/github-light.ts`                         |
| `packages/cli/src/ui/themes/xcode.ts`                 | `packages/cli/src/ui/themes/builtin/light/xcode-light.ts`                          |
| `packages/cli/src/ui/themes/no-color.ts`              | `packages/cli/src/ui/themes/builtin/no-color.ts`                                   |
| `packages/cli/src/utils/sandbox-macos-restrictive-closed.sb` | `packages/cli/src/utils/sandbox-macos-strict-open.sb` (review semantics before adopting) |

When cherry-picking the *upstream* theme reorganisation (Phase 2 step 6),
the fork should adopt the upstream `themes/builtin/...` layout. Until then,
patches that target the new paths must be rewritten back to the fork's
flat `themes/*.ts` layout.

To regenerate the canonical list:

```sh
git fetch upstream
git diff --find-renames --diff-filter=R --name-status HEAD upstream/main
```
