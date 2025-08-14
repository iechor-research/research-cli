#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Build Simple Standalone Research CLI Package
 * 
 * Creates a self-contained tar.gz package that includes:
 * - Built CLI files
 * - Required node_modules
 * - Node.js runtime binary
 * - Shell wrapper script
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync, cpSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { platform, arch } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const packageDir = join(rootDir, 'dist-package');
const cliPackageDir = join(rootDir, 'packages', 'cli');

console.log('🚀 Building simple standalone Research CLI package...');

// Clean and create package directory
if (existsSync(packageDir)) {
  rmSync(packageDir, { recursive: true, force: true });
}
mkdirSync(packageDir, { recursive: true });

// Step 1: Build the project
console.log('📦 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Copy built CLI files
console.log('📋 Copying CLI files...');
const cliDistDir = join(cliPackageDir, 'dist');
if (existsSync(cliDistDir)) {
  cpSync(cliDistDir, join(packageDir, 'dist'), { recursive: true });
  console.log('✅ CLI dist files copied');
} else {
  console.error('❌ CLI dist directory not found');
  process.exit(1);
}

// Step 3: Copy CLI bin files
console.log('📋 Copying CLI bin files...');
const cliBinDir = join(cliPackageDir, 'bin');
if (existsSync(cliBinDir)) {
  cpSync(cliBinDir, join(packageDir, 'bin'), { recursive: true });
  console.log('✅ CLI bin files copied');
}

// Step 4: Copy essential node_modules (production only)
console.log('📋 Installing production dependencies...');
const tempPackageJson = {
  "name": "research-cli-standalone-temp",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {}
};

// Copy dependencies from CLI package.json
const cliPackageJsonPath = join(cliPackageDir, 'package.json');
if (existsSync(cliPackageJsonPath)) {
  const cliPackageJson = JSON.parse(readFileSync(cliPackageJsonPath, 'utf8'));
  tempPackageJson.dependencies = cliPackageJson.dependencies || {};
}

writeFileSync(join(packageDir, 'package.json'), JSON.stringify(tempPackageJson, null, 2));

try {
  execSync('npm install --production --no-optional', { 
    stdio: 'inherit', 
    cwd: packageDir 
  });
  console.log('✅ Production dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 5: Download Node.js binary for current platform
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

// Step 6: Create wrapper script
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
MAIN_JS="$SCRIPT_DIR/dist/index.js"

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

# Set NODE_PATH to include our bundled node_modules
export NODE_PATH="$SCRIPT_DIR/node_modules:\${NODE_PATH:-}"

# Launch the CLI
exec "$NODE_BIN" "$MAIN_JS" "$@"
`;

writeFileSync(join(packageDir, 'research-cli'), wrapperScript);
execSync(`chmod +x "${join(packageDir, 'research-cli')}"`);

// Step 7: Update package.json for standalone use
console.log('📋 Updating package.json...');
const finalPackageJson = {
  "type": "module",
  "name": "@iechor/research-cli-standalone",
  "version": tempPackageJson.dependencies["@iechor/research-cli"] || "0.3.1",
  "private": true,
  "description": "Standalone Research CLI package with bundled Node.js runtime",
  "main": "dist/index.js",
  "bin": {
    "research-cli": "./research-cli"
  },
  "dependencies": tempPackageJson.dependencies
};

writeFileSync(join(packageDir, 'package.json'), JSON.stringify(finalPackageJson, null, 2));

// Step 8: Create tar.gz package
console.log('📦 Creating tar.gz package...');
const packageName = `research-cli-standalone-${platformName}-${archName}.tar.gz`;
const packagePath = join(rootDir, packageName);

try {
  execSync(`tar -czf "${packagePath}" -C "${dirname(packageDir)}" dist-package`, 
    { stdio: 'inherit' });
  console.log(`✅ Package created: ${packageName}`);
} catch (error) {
  console.error('❌ Failed to create tar.gz package:', error.message);
  process.exit(1);
}

// Step 9: Show package info
console.log('\n📊 Package Information:');
console.log(`📁 Package: ${packageName}`);
try {
  const size = execSync(`stat -f%z "${packagePath}" 2>/dev/null || stat -c%s "${packagePath}"`, 
    { encoding: 'utf8' }).trim();
  console.log(`📏 Size: ${(parseInt(size) / 1024 / 1024).toFixed(1)}MB`);
} catch {
  console.log('📏 Size: Unable to determine');
}
console.log(`🏗️  Platform: ${platformName}-${archName}`);
console.log(`📂 Contents:`);
execSync(`tar -tzf "${packagePath}" | head -20`, { stdio: 'inherit' });

console.log('\n🎉 Standalone package created successfully!');
console.log('\n📖 Usage:');
console.log(`1. Extract: tar -xzf ${packageName}`);
console.log(`2. Run: ./dist-package/research-cli --help`);
console.log(`3. Install globally: sudo cp dist-package/research-cli /usr/local/bin/`);

// Clean up
console.log('\n🧹 Cleaning up temporary files...');
rmSync(packageDir, { recursive: true, force: true });
