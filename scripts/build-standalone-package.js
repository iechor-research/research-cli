#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Build Standalone Research CLI Package
 * 
 * Creates a self-contained tar.gz package similar to agent-cli-package.tar.gz
 * that includes:
 * - Bundled JavaScript application
 * - Node.js runtime binary
 * - Required native modules
 * - Shell wrapper script
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { platform, arch } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const packageDir = join(rootDir, 'dist-package');
const cliPackageDir = join(rootDir, 'packages', 'cli');

console.log('🚀 Building standalone Research CLI package...');

// Clean and create package directory
if (existsSync(packageDir)) {
  rmSync(packageDir, { recursive: true, force: true });
}
mkdirSync(packageDir, { recursive: true });
mkdirSync(join(packageDir, 'build'), { recursive: true });

// Step 1: Build the project
console.log('📦 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Bundle the CLI into a single file using esbuild
console.log('🔄 Bundling CLI application...');
const bundleScript = `
import esbuild from 'esbuild';
import { join } from 'path';

await esbuild.build({
  entryPoints: ['${join(cliPackageDir, 'dist', 'index.js')}'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: '${join(packageDir, 'index.js')}',
  external: [
    // Platform-specific modules
    'sqlite3',
    '@mapbox/node-pre-gyp',
    'fsevents',
    'win32-api',
    
    // Optional dependencies that may not be installed
    'cache-manager',
    'flat-cache',
    
    // Google Cloud dependencies (often optional)
    '@google-cloud/*',
    'google-*',
    'gcp-metadata',
    'google-auth-library',
    'google-logging-utils',
    
    // Other potentially problematic modules
    'sharp',
    'canvas',
    'puppeteer',
    'playwright'
  ],
  // Handle require() calls that might fail
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  banner: {
    js: '// Standalone Research CLI Bundle'
  },
  minify: false, // Keep readable for debugging
  sourcemap: false,
  metafile: true,
  // Log level for debugging
  logLevel: 'warning'
});

console.log('✅ Bundle created successfully');
`;

writeFileSync(join(packageDir, 'bundle.mjs'), bundleScript);
try {
  execSync('node bundle.mjs', { stdio: 'inherit', cwd: packageDir });
  rmSync(join(packageDir, 'bundle.mjs'));
} catch (error) {
  console.error('❌ Bundling failed:', error.message);
  process.exit(1);
}

// Step 3: Download Node.js binary for current platform
console.log('⬇️  Downloading Node.js binary...');
const nodeVersion = 'v20.18.1'; // Use a stable LTS version
const platformName = platform() === 'darwin' ? 'darwin' : platform();
const archName = arch() === 'x64' ? 'x64' : arch() === 'arm64' ? 'arm64' : arch();
const nodeUrl = `https://nodejs.org/dist/${nodeVersion}/node-${nodeVersion}-${platformName}-${archName}.tar.gz`;

try {
  // Create temporary directory for Node.js download
  const tempDir = join('/tmp', `node-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });
  
  // Download and extract Node.js binary
  console.log(`📥 Downloading from: ${nodeUrl}`);
  execSync(`curl -L "${nodeUrl}" | tar -xz -C "${tempDir}"`, { stdio: 'inherit' });
  
  // Find the node binary in the extracted files
  const extractedDir = join(tempDir, `node-${nodeVersion}-${platformName}-${archName}`);
  const nodeBinaryPath = join(extractedDir, 'bin', 'node');
  
  if (existsSync(nodeBinaryPath)) {
    copyFileSync(nodeBinaryPath, join(packageDir, 'node'));
    execSync(`chmod +x "${join(packageDir, 'node')}"`);
    console.log('✅ Node.js binary downloaded and installed');
  } else {
    throw new Error(`Node binary not found at ${nodeBinaryPath}`);
  }
  
  // Clean up temp directory
  rmSync(tempDir, { recursive: true, force: true });
} catch (error) {
  console.error('❌ Failed to download Node.js binary:', error.message);
  console.log('💡 You can manually place a node binary in the dist-package directory');
  console.log('💡 Or copy the current system node binary:');
  console.log(`   cp $(which node) ${join(packageDir, 'node')}`);
}

// Step 4: Copy required native modules
console.log('📋 Copying native modules...');
const nativeModulePaths = [
  // SQLite3 native module (if exists)
  join(rootDir, 'node_modules', 'sqlite3', 'lib', 'binding', `napi-v6-${platformName}-${archName}`, 'node_sqlite3.node'),
  join(rootDir, 'packages', 'cli', 'node_modules', 'sqlite3', 'lib', 'binding', `napi-v6-${platformName}-${archName}`, 'node_sqlite3.node'),
  join(rootDir, 'packages', 'core', 'node_modules', 'sqlite3', 'lib', 'binding', `napi-v6-${platformName}-${archName}`, 'node_sqlite3.node'),
];

let foundNativeModule = false;
for (const modulePath of nativeModulePaths) {
  if (existsSync(modulePath)) {
    copyFileSync(modulePath, join(packageDir, 'build', 'node_sqlite3.node'));
    console.log('✅ SQLite3 native module copied');
    foundNativeModule = true;
    break;
  }
}

if (!foundNativeModule) {
  console.log('⚠️  SQLite3 native module not found - package may not work on systems without sqlite3');
}

// Step 5: Create wrapper script
console.log('📝 Creating wrapper script...');
const wrapperScript = `#!/usr/bin/env bash
set -euo pipefail

# Get the directory of the actual script (handles symlinks)
if command -v realpath >/dev/null 2>&1; then
  SCRIPT_DIR="$(dirname "$(realpath "$0")")"
else
  SCRIPT_DIR="$(dirname "$(readlink "$0" || echo "$0")")"
fi

NODE_BIN="$SCRIPT_DIR/node"
MAIN_JS="$SCRIPT_DIR/index.js"

# Check if Node.js binary exists
if [ ! -f "$NODE_BIN" ]; then
  echo "Error: Node.js binary not found at $NODE_BIN"
  echo "This package requires the bundled Node.js binary to run."
  exit 1
fi

# Check if main script exists
if [ ! -f "$MAIN_JS" ]; then
  echo "Error: Main script not found at $MAIN_JS"
  exit 1
fi

# Launch the CLI
exec "$NODE_BIN" "$MAIN_JS" "$@"
`;

writeFileSync(join(packageDir, 'research-cli'), wrapperScript);
execSync(`chmod +x "${join(packageDir, 'research-cli')}"`);

// Also make index.js executable and add proper shebang
const indexJsPath = join(packageDir, 'index.js');
if (existsSync(indexJsPath)) {
  const indexContent = readFileSync(indexJsPath, 'utf8');
  // Add shebang if not present
  if (!indexContent.startsWith('#!')) {
    const newContent = '#!/usr/bin/env node\n' + indexContent;
    writeFileSync(indexJsPath, newContent);
  }
  execSync(`chmod +x "${indexJsPath}"`);
}

// Step 6: Create package.json
console.log('📋 Creating package.json...');
const packageJson = {
  "type": "module",
  "name": "@iechor/research-cli-standalone",
  "private": true,
  "description": "Standalone Research CLI package with bundled Node.js runtime"
};

writeFileSync(join(packageDir, 'package.json'), JSON.stringify(packageJson, null, 2));

// Step 7: Create tar.gz package
console.log('📦 Creating tar.gz package...');
const packageName = `research-cli-standalone-${platformName}-${archName}.tar.gz`;
const packagePath = join(rootDir, packageName);

try {
  execSync(`tar -czf "${packagePath}" -C "${dirname(packageDir)}" "${join('dist-package')}"`, 
    { stdio: 'inherit' });
  console.log(`✅ Package created: ${packageName}`);
} catch (error) {
  console.error('❌ Failed to create tar.gz package:', error.message);
  process.exit(1);
}

// Step 8: Show package info
console.log('\n📊 Package Information:');
console.log(`📁 Package: ${packageName}`);
console.log(`📏 Size: ${(execSync(`stat -f%z "${packagePath}" 2>/dev/null || stat -c%s "${packagePath}"`, { encoding: 'utf8' }).trim() / 1024 / 1024).toFixed(1)}MB`);
console.log(`🏗️  Platform: ${platformName}-${archName}`);
console.log(`📂 Contents:`);
execSync(`tar -tzf "${packagePath}"`, { stdio: 'inherit' });

console.log('\n🎉 Standalone package created successfully!');
console.log('\n📖 Usage:');
console.log(`1. Extract: tar -xzf ${packageName}`);
console.log(`2. Run: ./dist-package/research-cli --help`);
console.log(`3. Install globally: sudo cp dist-package/research-cli /usr/local/bin/`);

// Clean up
rmSync(packageDir, { recursive: true, force: true });
