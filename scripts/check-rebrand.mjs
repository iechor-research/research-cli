#!/usr/bin/env node
/**
 * Research CLI — rebrand regression guard.
 *
 * Scans tracked source files for upstream Gemini brand strings that must
 * never appear in fork code. Intended to run in CI after lint, so that any
 * upstream merge / cherry-pick that forgot to apply `scripts/rebrand.mjs`
 * fails the build with a precise list of offenders.
 *
 * The guard is intentionally narrow:
 *   - Only checks `packages/{cli,core}/{src,package.json}` and the root
 *     `package.json`. These are the directories where merging upstream
 *     code is most likely to silently reintroduce upstream branding.
 *   - Only checks a small "must never regress" set of strings. Strings that
 *     are intentionally preserved (model IDs, env-var compatibility,
 *     `@google/genai` SDK package, etc.) are documented in
 *     `docs/upstream-sync/BRAND_OVERRIDES.md` and are deliberately NOT
 *     listed here.
 *
 * Exit codes:
 *   0 — clean
 *   1 — usage / IO error
 *   2 — at least one forbidden brand string was found
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REPO_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
);

/**
 * Strings that, if found in the scan scope, indicate that an upstream brand
 * leaked back into the fork. Each entry is the literal needle to look for.
 * Add to this list cautiously — any false positive forces a docs change.
 */
const FORBIDDEN = [
  '@google/gemini-cli',
  '@google/gemini-cli-core',
  'google-gemini/gemini-cli',
  'Gemini CLI',
];

/**
 * Paths (relative to repo root) that are scanned. Each may be a file or a
 * directory; directories are walked recursively.
 */
const SCAN_PATHS = [
  'package.json',
  'packages/cli/package.json',
  'packages/cli/src',
  'packages/core/package.json',
  'packages/core/src',
];

/**
 * Files (relative to repo root) skipped during the scan. These either
 * intentionally contain upstream strings (mapping tables, docs, snapshots)
 * or are generated artefacts.
 */
const ALLOWLIST_FILES = new Set([
  // The mapping/guard files themselves contain forbidden strings by design.
  'scripts/upstream-config.js',
  'scripts/rebrand.mjs',
  'scripts/check-rebrand.mjs',
  'scripts/replace-gemini-branding.sh',
]);

/** File extensions skipped as binary. */
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
]);

const SKIP_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  '.git',
  'coverage',
]);

function relativeToRepo(filePath) {
  return path
    .relative(REPO_ROOT, path.resolve(filePath))
    .split(path.sep)
    .join('/');
}

async function* walk(absTarget) {
  let stat;
  try {
    stat = await fs.stat(absTarget);
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }
  if (stat.isFile()) {
    yield absTarget;
    return;
  }
  if (!stat.isDirectory()) return;
  const entries = await fs.readdir(absTarget, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRECTORIES.has(e.name)) continue;
      yield* walk(path.join(absTarget, e.name));
    } else if (e.isFile()) {
      yield path.join(absTarget, e.name);
    }
  }
}

async function scanFile(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) return [];
  const rel = relativeToRepo(absPath);
  if (ALLOWLIST_FILES.has(rel)) return [];

  let content;
  try {
    content = await fs.readFile(absPath, 'utf8');
  } catch (err) {
    if (err.code === 'EISDIR') return [];
    throw err;
  }

  const hits = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    for (const needle of FORBIDDEN) {
      if (lines[i].includes(needle)) {
        hits.push({
          file: rel,
          line: i + 1,
          needle,
          snippet: lines[i].trim().slice(0, 200),
        });
      }
    }
  }
  return hits;
}

async function main() {
  const allHits = [];
  for (const target of SCAN_PATHS) {
    const abs = path.join(REPO_ROOT, target);
    for await (const file of walk(abs)) {
      const hits = await scanFile(file);
      allHits.push(...hits);
    }
  }

  if (allHits.length === 0) {
    process.stdout.write(
      '[check-rebrand] OK — no forbidden upstream brand strings found.\n',
    );
    return 0;
  }

  process.stderr.write(
    `[check-rebrand] FAIL — found ${allHits.length} forbidden brand string(s):\n\n`,
  );
  for (const h of allHits) {
    process.stderr.write(
      `  ${h.file}:${h.line}: "${h.needle}"\n    ${h.snippet}\n`,
    );
  }
  process.stderr.write(
    '\nTo fix, run:\n  node scripts/rebrand.mjs <file>\n' +
      'If a hit is intentional, add it to docs/upstream-sync/BRAND_OVERRIDES.md\n' +
      'and update the allow-list in scripts/check-rebrand.mjs.\n',
  );
  return 2;
}

main().then(
  (code) => process.exit(code ?? 0),
  (err) => {
    process.stderr.write(`[check-rebrand] error: ${err?.stack ?? err}\n`);
    process.exit(1);
  },
);
