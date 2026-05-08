#!/usr/bin/env node
/**
 * Research CLI — deterministic rebranding tool.
 *
 * Replaces upstream Gemini brand strings with their Research CLI equivalents
 * using the canonical mapping from `scripts/upstream-config.js`. Designed to
 * be used during upstream cherry-picks and merges:
 *
 *   1. Apply an upstream patch / take an upstream file as-is.
 *   2. Run `node scripts/rebrand.mjs <files...>` to rewrite brand strings.
 *
 * Differences from the legacy `scripts/replace-gemini-branding.sh`:
 *   - Pure Node (no GNU/BSD sed portability problems).
 *   - Single source of truth for the mapping (`UPSTREAM_CONFIG.branding`).
 *   - Skips binary files, generated artefacts, and fork-only files that
 *     intentionally preserve upstream strings (see BRAND_OVERRIDES.md).
 *   - `--check` mode reports diffs instead of writing — useful in CI.
 *   - `--dry-run` mode prints what would change without touching disk.
 *
 * Usage:
 *   node scripts/rebrand.mjs <file-or-dir> [<file-or-dir> ...]
 *   node scripts/rebrand.mjs --check <file-or-dir> ...
 *   node scripts/rebrand.mjs --dry-run <file-or-dir> ...
 *   node scripts/rebrand.mjs --stdin < input.ts > output.ts
 *
 * Exit codes:
 *   0 — success (or, in --check mode, no changes needed)
 *   1 — usage error
 *   2 — --check mode found files that need rebranding
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { UPSTREAM_CONFIG } from './upstream-config.js';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const REPO_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
);

// File extensions / names we know are binary or otherwise off-limits.
const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.icns',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.pdf',
  '.zip',
  '.gz',
  '.tgz',
  '.tar',
  '.7z',
  '.mp3',
  '.mp4',
  '.mov',
  '.webm',
  '.wav',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.node',
  '.lock', // lockfiles are bumped by package managers, never by us
]);

// Directories never visited (build outputs, deps, fork-only sub-projects that
// must not be brand-rewritten because they were authored independently).
const SKIP_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  '.git',
  '.next',
  '.cache',
  'coverage',
  'research-terminal-go', // separate Go project with its own naming
]);

// Files that intentionally contain unrebranded upstream strings. Update
// `docs/upstream-sync/BRAND_OVERRIDES.md` whenever this list changes.
const ALLOWLIST_FILES = new Set([
  // The mapping table itself necessarily contains both sides of every pair.
  'scripts/upstream-config.js',
  'scripts/rebrand.mjs',
  'scripts/check-rebrand.mjs',
  'scripts/replace-gemini-branding.sh',
  'docs/upstream-sync/path-mapping.md',
  'docs/upstream-sync/BRAND_OVERRIDES.md',
  'docs/upstream-sync/README.md',
  'docs/upstream-merging-guide.md',
  // Snapshot of upstream commits.
  'upstream-monitor-report.json',
  'upstream-system-report.json',
]);

// -----------------------------------------------------------------------------
// Mapping
// -----------------------------------------------------------------------------

/**
 * Build the ordered list of (search, replacement) pairs.
 * Order matters: longer / more specific keys must run before shorter ones,
 * otherwise e.g. `gemini-cli` would consume the `gemini` in `gemini-cli.github.io`
 * before the latter mapping has a chance to match.
 */
function buildReplacements() {
  const raw = UPSTREAM_CONFIG.branding.replacements;
  const entries = Object.entries(raw);
  // Sort by descending key length so that longer keys win.
  entries.sort((a, b) => b[0].length - a[0].length);
  return entries;
}

const REPLACEMENTS = buildReplacements();

/** Apply every mapping to `text` and return the rewritten string. */
function rewrite(text) {
  let out = text;
  for (const [from, to] of REPLACEMENTS) {
    if (out.includes(from)) {
      // Use split/join to avoid regex escaping pitfalls.
      out = out.split(from).join(to);
    }
  }
  return out;
}

// -----------------------------------------------------------------------------
// Filesystem walking
// -----------------------------------------------------------------------------

function isBinaryPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

function relativeToRepo(filePath) {
  const abs = path.resolve(filePath);
  return path.relative(REPO_ROOT, abs).split(path.sep).join('/');
}

function isAllowlisted(filePath) {
  return ALLOWLIST_FILES.has(relativeToRepo(filePath));
}

async function* walk(target) {
  const stat = await fs.stat(target);
  if (stat.isFile()) {
    yield target;
    return;
  }
  if (!stat.isDirectory()) return;

  const entries = await fs.readdir(target, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue;
      if (entry.name.startsWith('.') && entry.name !== '.github') continue;
      yield* walk(path.join(target, entry.name));
    } else if (entry.isFile()) {
      yield path.join(target, entry.name);
    }
  }
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { check: false, dryRun: false, stdin: false, paths: [] };
  for (const arg of argv) {
    if (arg === '--check') opts.check = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--stdin') opts.stdin = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else opts.paths.push(arg);
  }
  return opts;
}

function printHelp() {
  process.stdout.write(
    'Usage: node scripts/rebrand.mjs [--check|--dry-run] <file-or-dir>...\n' +
      '       node scripts/rebrand.mjs --stdin < input > output\n',
  );
}

async function processStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const input = Buffer.concat(chunks).toString('utf8');
  process.stdout.write(rewrite(input));
}

async function processFile(filePath, { check, dryRun }) {
  if (isBinaryPath(filePath)) return { skipped: 'binary' };
  if (isAllowlisted(filePath)) return { skipped: 'allowlisted' };

  let original;
  try {
    original = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    if (err.code === 'ERR_INVALID_ARG_TYPE' || err.code === 'EISDIR') {
      return { skipped: 'not-a-text-file' };
    }
    throw err;
  }

  const rewritten = rewrite(original);
  if (rewritten === original) return { changed: false };

  if (!check && !dryRun) {
    await fs.writeFile(filePath, rewritten);
  }
  return { changed: true };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return 0;
  }
  if (opts.stdin) {
    await processStdin();
    return 0;
  }
  if (opts.paths.length === 0) {
    printHelp();
    return 1;
  }

  let changedCount = 0;
  let scannedCount = 0;
  const changedFiles = [];

  for (const target of opts.paths) {
    for await (const file of walk(target)) {
      scannedCount += 1;
      const result = await processFile(file, opts);
      if (result.changed) {
        changedCount += 1;
        changedFiles.push(relativeToRepo(file));
      }
    }
  }

  const verb = opts.check
    ? 'need rebranding'
    : opts.dryRun
      ? 'would change'
      : 'rewrote';
  process.stdout.write(
    `[rebrand] scanned ${scannedCount} file(s); ${changedCount} ${verb}.\n`,
  );
  if (changedFiles.length > 0 && (opts.check || opts.dryRun)) {
    for (const f of changedFiles) process.stdout.write(`  - ${f}\n`);
  }

  if (opts.check && changedCount > 0) return 2;
  return 0;
}

main().then(
  (code) => process.exit(code ?? 0),
  (err) => {
    process.stderr.write(`[rebrand] error: ${err?.stack ?? err}\n`);
    process.exit(1);
  },
);
