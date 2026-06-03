# Brand Overrides

This file records strings that look like upstream Gemini branding but are
**intentionally preserved** in `iechor-research/research-cli`. The CI guard
(`scripts/check-rebrand.mjs`) deliberately does **not** flag these.

If you find yourself wanting to "fix" one of these, read the rationale here
first and update both this file and the guard's `FORBIDDEN` / `ALLOWLIST_FILES`
constants if the policy genuinely changes.

The canonical brand-replacement table lives in
[`scripts/upstream-config.js`](../../scripts/upstream-config.js)
(and is summarised in [`path-mapping.md`](./path-mapping.md)). The list below
is the _negative space_ — strings that look like brand leaks but are not.

---

## 1. API contract strings (kept verbatim)

These are not branding; they are wire-protocol values consumed by the Google
GenAI service. Rewriting them would break the CLI.

| String                                    | Why kept                                                       |
| ----------------------------------------- | -------------------------------------------------------------- |
| `gemini-2.5-pro`, `gemini-2.5-flash`      | Literal model IDs accepted by the Google GenAI API.            |
| `gemini-2.0-flash`, `gemini-1.5-*`        | Same — model IDs in API requests.                              |
| `gemini-embedding-*`                      | Embedding model IDs in API requests.                           |
| `@google/genai`                           | Upstream SDK package; we depend on it directly.                |
| `@google-cloud/*`                         | Google Cloud SDK packages used for telemetry / Vertex AI auth. |
| `googleapis.com`, `oauth2.googleapis.com` | OAuth and API endpoints.                                       |

## 2. Backwards-compatibility env vars (kept alongside renamed equivalents)

The fork accepts both `RESEARCH_*` (new) and `GEMINI_*` / `GOOGLE_*` (legacy)
environment variables so users migrating from upstream don't have to relearn
their shell config. Both names appear in the source.

| Env var                          | Status                                                      |
| -------------------------------- | ----------------------------------------------------------- |
| `GEMINI_API_KEY`                 | Accepted as a fallback for `RESEARCH_API_KEY`.              |
| `GEMINI_DEFAULT_AUTH_TYPE`       | Accepted as a fallback for `RESEARCH_DEFAULT_AUTH_TYPE`.    |
| `GOOGLE_API_KEY`                 | Accepted (Vertex AI / GenAI SDK convention).                |
| `GOOGLE_GENAI_USE_VERTEXAI`      | Read by upstream SDK; mirrored to `RESEARCH_USE_VERTEXAI`.  |
| `GOOGLE_CLOUD_PROJECT`           | Read by upstream SDK; mirrored to `RESEARCH_CLOUD_PROJECT`. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Standard GCP env var; consumed verbatim.                    |

> The `scripts/upstream-config.js` mapping is _aggressive_ (it would rewrite
> `GEMINI_API_KEY` → `RESEARCH_API_KEY` if applied blindly). That's fine for
> rewriting fresh upstream patches, but the guard does not enforce it on
> the current tree because both forms must continue to coexist.

## 3. Files exempt from the guard

These files contain forbidden brand strings _as data_ (mapping tables, docs,
snapshots) and would force false positives if scanned. The list is encoded
in `scripts/check-rebrand.mjs > ALLOWLIST_FILES`:

- `scripts/upstream-config.js` — the canonical mapping table.
- `scripts/rebrand.mjs` — the rebrander itself.
- `scripts/check-rebrand.mjs` — this guard.

The broader rebrander (`scripts/rebrand.mjs > ALLOWLIST_FILES`) additionally
exempts the upstream-sync docs, which may quote upstream strings verbatim:

- `docs/upstream-sync/README.md`
- `docs/upstream-sync/path-mapping.md`
- `docs/upstream-sync/BRAND_OVERRIDES.md` (this file)

## 4. Directories not rebranded

Some sub-projects under the repo root were authored independently and do
**not** participate in the upstream rebrand:

| Directory                                               | Reason                                                  |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `research-terminal-go/`                                 | Independent Go project with its own naming conventions. |
| `node_modules/`, `dist/`, `build/`, `out/`, `coverage/` | Generated artefacts.                                    |

## 5. Expected scan-scope behaviour

The guard scans only:

- `package.json` (root)
- `packages/cli/package.json`, `packages/cli/src/`
- `packages/core/package.json`, `packages/core/src/`

This is intentional. It's the minimum set where an upstream merge is most
likely to silently reintroduce upstream branding. Documentation, scripts,
and root-level marketing/build files are reviewed by humans during merges
and don't need machine enforcement.

If a future phase merges upstream code into a directory not in this list
(e.g. a newly-adopted `packages/sdk/` or `packages/vscode-ide-companion/`),
extend `SCAN_PATHS` in `scripts/check-rebrand.mjs` to cover it.

---

## Updating this file

When you change the policy:

1. Edit this file.
2. Mirror any allow-list change in `scripts/check-rebrand.mjs`
   (`ALLOWLIST_FILES`) and/or `scripts/rebrand.mjs` (`ALLOWLIST_FILES`).
3. Mirror any mapping change in `scripts/upstream-config.js`
   (`UPSTREAM_CONFIG.branding.replacements`) and
   `docs/upstream-sync/path-mapping.md`.
4. Run `node scripts/check-rebrand.mjs` locally to confirm a clean tree.
