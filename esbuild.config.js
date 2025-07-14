/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const pkg = require(path.resolve(__dirname, 'package.json'));

esbuild
  .build({
    entryPoints: ['packages/cli/index.ts'],
    bundle: true,
    outfile: 'bundle/research.js',
    platform: 'node',
    format: 'esm',
    external: [
      // React
      'react',
      'react/jsx-runtime',
      'react-dom',
      // Ink UI components
      'ink',
      'ink-gradient',
      'ink-spinner',
      'ink-big-text',
      'ink-link',
      'ink-select-input',
      // Third-party libraries
      'gaxios',
      'string-width',
      'lowlight',
      'highlight.js',
      'yargs',
      'dotenv',
      'glob',
      'diff',
      'mime-types',
      'open',
      'shell-quote',
      'strip-ansi',
      'strip-json-comments',
      'update-notifier',
      'command-exists',
      'read-package-up',
      'ansi-escapes',
      'semver',
      'chalk',
      // Internal packages
      '@iechor/research-cli-core',
    ],
    define: {
      'process.env.CLI_VERSION': JSON.stringify(pkg.version),
    },
    banner: {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url); globalThis.__filename = require('url').fileURLToPath(import.meta.url); globalThis.__dirname = require('path').dirname(globalThis.__filename);`,
    },
  })
  .catch(() => process.exit(1));
