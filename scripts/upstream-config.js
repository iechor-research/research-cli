/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Canonical upstream-sync configuration for `iechor-research/research-cli`.
 *
 * This is the single machine-readable source of truth consumed by
 * `scripts/rebrand.mjs` (brand rewriting) and mirrored, in human-readable
 * form, by `docs/upstream-sync/path-mapping.md`. If you change a mapping
 * here, update that document too.
 *
 * IMPORTANT — what is intentionally *not* rewritten:
 *   - Literal model IDs accepted by the Google GenAI API
 *     (`gemini-2.5-pro`, `gemini-2.0-flash`, `gemini-embedding-*`, ...).
 *     That is why there is deliberately **no** bare `gemini` -> `research`
 *     mapping below: a blind lowercase replacement would corrupt those IDs.
 *   - Google SDK package names (`@google/genai`, `@google-cloud/*`).
 *   - Backwards-compatibility env vars that must continue to coexist with
 *     their renamed equivalents (see docs/upstream-sync/BRAND_OVERRIDES.md).
 *
 * The rewriter (`rebrand.mjs`) applies these pairs ordered by descending key
 * length, so more specific strings (e.g. `@google/gemini-cli-core`) always
 * win over shorter prefixes (e.g. `@google/gemini-cli`).
 */

export const UPSTREAM_CONFIG = {
  /** Upstream repository this fork tracks. */
  upstream: {
    owner: 'google-gemini',
    repo: 'gemini-cli',
    remote: 'https://github.com/google-gemini/gemini-cli',
    branch: 'main',
  },

  branding: {
    /**
     * Literal `search -> replacement` pairs. Order here is for readability
     * only; `rebrand.mjs` re-sorts by descending key length before applying.
     */
    replacements: {
      // --- npm package names (most specific first) ---------------------------
      '@google/gemini-cli-core': '@iechor/research-cli-core',
      '@google/gemini-cli-a2a-server': '@iechor/research-cli-a2a-server',
      '@google/gemini-cli-test-utils': '@iechor/research-cli-test-utils',
      '@google/gemini-cli-devtools': '@iechor/research-cli-devtools',
      '@google/gemini-cli-sdk': '@iechor/research-cli-sdk',
      '@google/gemini-cli': '@iechor/research-cli',

      // --- repo / project / hosts -------------------------------------------
      'google-gemini/gemini-cli': 'iechor-research/research-cli',
      'gemini-cli.github.io': 'research-cli.iechor.com',
      'google-gemini.github.io': 'iechor-research.github.io',
      'gemini.google.com': 'research.iechor.com',
      'aistudio.google.com': 'research.iechor.com',
      'gemini-cli': 'research-cli',

      // --- title-case product naming ----------------------------------------
      'Gemini Code Assist': 'Research Code Assist',
      'Gemini CLI': 'Research CLI',
      'Gemini API': 'Research API',
      'Gemini Studio': 'Research Studio',
      'Gemini models': 'Research models',

      // --- shell / prose references to the binary ---------------------------
      'command gemini': 'command research',
      'alias gemini': 'alias research',

      // --- context files & config dir ---------------------------------------
      'GEMINI.md': 'RESEARCH.md',
      'gemini.md': 'research.md',
      '.gemini': '.research',

      // --- env vars (aggressive; see BRAND_OVERRIDES.md for coexistence) -----
      'GEMINI_API_KEY': 'RESEARCH_API_KEY',
      'GEMINI_DEFAULT_AUTH_TYPE': 'RESEARCH_DEFAULT_AUTH_TYPE',
      'GOOGLE_GENAI_USE_VERTEXAI': 'RESEARCH_USE_VERTEXAI',
      'GOOGLE_CLOUD_PROJECT': 'RESEARCH_CLOUD_PROJECT',
    },

    /**
     * Strings that look like brand leaks but are kept verbatim. Mirrored in
     * docs/upstream-sync/BRAND_OVERRIDES.md and enforced (negatively) by
     * scripts/check-rebrand.mjs.
     */
    preserve: [
      '@google/genai',
      '@google-cloud/',
      'googleapis.com',
      'oauth2.googleapis.com',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5',
      'gemini-embedding',
    ],
  },

  /**
   * Subsystem buckets used to triage upstream commits. The first matching
   * prefix wins. Mirrored in docs/upstream-sync/path-mapping.md.
   */
  pathCategories: [
    { bucket: 'core-utils', prefix: 'packages/core/src/utils/' },
    { bucket: 'core-tools', prefix: 'packages/core/src/tools/' },
    { bucket: 'core-services', prefix: 'packages/core/src/services/' },
    { bucket: 'core-mcp', prefix: 'packages/core/src/mcp/' },
    { bucket: 'core-codeassist', prefix: 'packages/core/src/code_assist/' },
    { bucket: 'core-config', prefix: 'packages/core/src/config/' },
    { bucket: 'core-other', prefix: 'packages/core/' },
    { bucket: 'cli-ui', prefix: 'packages/cli/src/ui/' },
    { bucket: 'cli-commands', prefix: 'packages/cli/src/commands/' },
    { bucket: 'cli-services', prefix: 'packages/cli/src/services/' },
    { bucket: 'cli-other', prefix: 'packages/cli/' },
    { bucket: 'a2a-server', prefix: 'packages/a2a-server/' },
    { bucket: 'vscode-ide', prefix: 'packages/vscode-ide-companion/' },
    { bucket: 'sdk', prefix: 'packages/sdk/' },
    { bucket: 'docs', prefix: 'docs/' },
    { bucket: 'workflows', prefix: '.github/workflows/' },
    { bucket: 'github-actions', prefix: '.github/actions/' },
    { bucket: 'integration', prefix: 'integration-tests/' },
    { bucket: 'scripts', prefix: 'scripts/' },
  ],
};

export default UPSTREAM_CONFIG;
