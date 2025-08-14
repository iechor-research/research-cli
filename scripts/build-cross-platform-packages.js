#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Build Cross-Platform Research CLI Packages
 * 
 * Creates standalone packages for multiple platforms:
 * - Linux x64, arm64
 * - macOS x64 (Intel), arm64 (M1/M2)
 * - Windows x64, arm64
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync, cpSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const releasesDir = join(rootDir, 'releases');

// Platform configurations
const platforms = [
  { platform: 'linux', arch: 'x64', nodeArch: 'x64' },
  { platform: 'linux', arch: 'arm64', nodeArch: 'arm64' },
  { platform: 'darwin', arch: 'x64', nodeArch: 'x64' },
  { platform: 'darwin', arch: 'arm64', nodeArch: 'arm64' },
  { platform: 'win32', arch: 'x64', nodeArch: 'x64', ext: '.exe' },
  { platform: 'win32', arch: 'arm64', nodeArch: 'arm64', ext: '.exe' }
];

const nodeVersion = 'v20.18.1';

console.log('🚀 Building cross-platform Research CLI packages...');
console.log(`📦 Target platforms: ${platforms.length} platforms`);

// Clean and create releases directory
if (existsSync(releasesDir)) {
  rmSync(releasesDir, { recursive: true, force: true });
}
mkdirSync(releasesDir, { recursive: true });

// Step 1: Build the project once
console.log('📦 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
  console.log('✅ Project built successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Build packages for each platform
for (const config of platforms) {
  console.log(`\n🔄 Building for ${config.platform}-${config.arch}...`);
  
  try {
    await buildPlatformPackage(config);
    console.log(`✅ ${config.platform}-${config.arch} package created`);
  } catch (error) {
    console.error(`❌ Failed to build ${config.platform}-${config.arch}:`, error.message);
    // Continue with other platforms
  }
}

// Step 3: Create checksums
console.log('\n🔐 Creating checksums...');
createChecksums();

// Step 4: Show summary
console.log('\n📊 Build Summary:');
showBuildSummary();

console.log('\n🎉 Cross-platform packages created successfully!');
console.log(`📁 All packages are in: ${releasesDir}`);

/**
 * Build package for a specific platform
 */
async function buildPlatformPackage(config) {
  const { platform, arch, nodeArch, ext = '' } = config;
  const packageName = `research-cli-${platform}-${arch}`;
  const packageDir = join(releasesDir, packageName);
  const cliPackageDir = join(rootDir, 'packages', 'cli');
  
  // Create package directory
  mkdirSync(packageDir, { recursive: true });
  
  // Copy built CLI files
  const cliDistDir = join(cliPackageDir, 'dist');
  if (existsSync(cliDistDir)) {
    cpSync(cliDistDir, join(packageDir, 'dist'), { recursive: true });
  }
  
  // Copy CLI bin files
  const cliBinDir = join(cliPackageDir, 'bin');
  if (existsSync(cliBinDir)) {
    cpSync(cliBinDir, join(packageDir, 'bin'), { recursive: true });
  }
  
  // Install production dependencies
  const tempPackageJson = {
    "name": `research-cli-${platform}-${arch}`,
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
    execSync('npm install --production --no-optional --silent', { 
      cwd: packageDir,
      stdio: 'pipe'
    });
  } catch (error) {
    console.warn(`⚠️  Warning: npm install failed for ${packageName}, continuing...`);
  }
  
  // Download Node.js binary for target platform
  await downloadNodeBinary(packageDir, platform, nodeArch, ext);
  
  // Create platform-specific wrapper script
  createWrapperScript(packageDir, platform, ext);
  
  // Update package.json for standalone use
  const finalPackageJson = {
    "type": "module",
    "name": `@iechor/research-cli-${platform}-${arch}`,
    "version": tempPackageJson.dependencies["@iechor/research-cli"] || "0.3.1",
    "private": true,
    "description": `Standalone Research CLI package for ${platform}-${arch} with bundled Node.js runtime`,
    "main": "dist/index.js",
    "bin": {
      "research-cli": platform === 'win32' ? "./research-cli.bat" : "./research-cli"
    },
    "dependencies": tempPackageJson.dependencies,
    "os": [platform],
    "cpu": [arch]
  };
  
  writeFileSync(join(packageDir, 'package.json'), JSON.stringify(finalPackageJson, null, 2));
  
  // Create tar.gz or zip package
  const archiveExt = platform === 'win32' ? 'zip' : 'tar.gz';
  const archiveName = `${packageName}.${archiveExt}`;
  const archivePath = join(releasesDir, archiveName);
  
  if (platform === 'win32') {
    // Create zip for Windows
    try {
      execSync(`cd "${releasesDir}" && zip -r "${archiveName}" "${packageName}"`, { stdio: 'pipe' });
    } catch {
      // Fallback: use tar even on Windows
      execSync(`tar -czf "${archivePath.replace('.zip', '.tar.gz')}" -C "${releasesDir}" "${packageName}"`, { stdio: 'pipe' });
    }
  } else {
    // Create tar.gz for Unix-like systems
    execSync(`tar -czf "${archivePath}" -C "${releasesDir}" "${packageName}"`, { stdio: 'pipe' });
  }
  
  // Clean up the directory after archiving
  rmSync(packageDir, { recursive: true, force: true });
}

/**
 * Download Node.js binary for target platform
 */
async function downloadNodeBinary(packageDir, platform, arch, ext = '') {
  const nodeUrl = `https://nodejs.org/dist/${nodeVersion}/node-${nodeVersion}-${platform}-${arch}.tar.gz`;
  const nodeBinaryName = `node${ext}`;
  
  try {
    console.log(`  📥 Downloading Node.js for ${platform}-${arch}...`);
    
    // Create temporary directory for Node.js download
    const tempDir = join('/tmp', `node-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    
    // Download and extract Node.js binary
    if (platform === 'win32') {
      // Windows uses zip files
      const windowsUrl = `https://nodejs.org/dist/${nodeVersion}/node-${nodeVersion}-win-${arch}.zip`;
      execSync(`curl -L "${windowsUrl}" -o "${join(tempDir, 'node.zip')}"`, { stdio: 'pipe' });
      execSync(`cd "${tempDir}" && unzip -q node.zip`, { stdio: 'pipe' });
      
      const extractedDir = join(tempDir, `node-${nodeVersion}-win-${arch}`);
      const nodeBinaryPath = join(extractedDir, 'node.exe');
      
      if (existsSync(nodeBinaryPath)) {
        copyFileSync(nodeBinaryPath, join(packageDir, nodeBinaryName));
      } else {
        throw new Error(`Node binary not found at ${nodeBinaryPath}`);
      }
    } else {
      // Unix-like systems use tar.gz
      execSync(`curl -L "${nodeUrl}" | tar -xz -C "${tempDir}"`, { stdio: 'pipe' });
      
      const extractedDir = join(tempDir, `node-${nodeVersion}-${platform}-${arch}`);
      const nodeBinaryPath = join(extractedDir, 'bin', 'node');
      
      if (existsSync(nodeBinaryPath)) {
        copyFileSync(nodeBinaryPath, join(packageDir, nodeBinaryName));
        execSync(`chmod +x "${join(packageDir, nodeBinaryName)}"`);
      } else {
        throw new Error(`Node binary not found at ${nodeBinaryPath}`);
      }
    }
    
    // Clean up temp directory
    rmSync(tempDir, { recursive: true, force: true });
    
  } catch (error) {
    console.warn(`  ⚠️  Warning: Failed to download Node.js binary for ${platform}-${arch}: ${error.message}`);
    console.warn(`  💡 You may need to manually add the Node.js binary for this platform`);
  }
}

/**
 * Create platform-specific wrapper script
 */
function createWrapperScript(packageDir, platform, ext = '') {
  if (platform === 'win32') {
    // Windows batch script
    const batchScript = `@echo off
setlocal

REM Get the directory of the batch file
set SCRIPT_DIR=%~dp0
set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%

set NODE_BIN=%SCRIPT_DIR%\\node.exe
set MAIN_JS=%SCRIPT_DIR%\\dist\\index.js

REM Check if Node.js binary exists
if not exist "%NODE_BIN%" (
    echo Error: Node.js binary not found at %NODE_BIN%
    echo This package requires the bundled Node.js binary to run.
    exit /b 1
)

REM Check if main script exists
if not exist "%MAIN_JS%" (
    echo Error: Main script not found at %MAIN_JS%
    exit /b 1
)

REM Set NODE_PATH to include our bundled node_modules
set NODE_PATH=%SCRIPT_DIR%\\node_modules;%NODE_PATH%

REM Launch the CLI
"%NODE_BIN%" "%MAIN_JS%" %*
`;
    
    writeFileSync(join(packageDir, 'research-cli.bat'), batchScript);
    
    // Also create a PowerShell script
    const psScript = `#!/usr/bin/env pwsh
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$NodeBin = Join-Path $ScriptDir "node.exe"
$MainJs = Join-Path $ScriptDir "dist" "index.js"

if (-not (Test-Path $NodeBin)) {
    Write-Error "Node.js binary not found at $NodeBin"
    Write-Error "This package requires the bundled Node.js binary to run."
    exit 1
}

if (-not (Test-Path $MainJs)) {
    Write-Error "Main script not found at $MainJs"
    exit 1
}

$env:NODE_PATH = (Join-Path $ScriptDir "node_modules") + ";" + $env:NODE_PATH

& $NodeBin $MainJs $args
`;
    
    writeFileSync(join(packageDir, 'research-cli.ps1'), psScript);
    
  } else {
    // Unix shell script
    const shellScript = `#!/usr/bin/env bash
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
    
    writeFileSync(join(packageDir, 'research-cli'), shellScript);
    execSync(`chmod +x "${join(packageDir, 'research-cli')}"`);
  }
}

/**
 * Create checksums for all packages
 */
function createChecksums() {
  const checksumFile = join(releasesDir, 'checksums.txt');
  let checksums = '';
  
  try {
    const files = execSync('ls *.tar.gz *.zip 2>/dev/null || true', { 
      cwd: releasesDir, 
      encoding: 'utf8' 
    }).trim().split('\n').filter(f => f);
    
    for (const file of files) {
      if (file) {
        try {
          const checksum = execSync(`shasum -a 256 "${file}" | cut -d' ' -f1`, { 
            cwd: releasesDir, 
            encoding: 'utf8' 
          }).trim();
          checksums += `${checksum}  ${file}\n`;
        } catch (error) {
          console.warn(`⚠️  Failed to create checksum for ${file}`);
        }
      }
    }
    
    if (checksums) {
      writeFileSync(checksumFile, checksums);
      console.log('✅ Checksums created');
    }
  } catch (error) {
    console.warn('⚠️  Failed to create checksums:', error.message);
  }
}

/**
 * Show build summary
 */
function showBuildSummary() {
  try {
    const files = execSync('ls -la *.tar.gz *.zip 2>/dev/null || true', { 
      cwd: releasesDir, 
      encoding: 'utf8' 
    });
    
    if (files.trim()) {
      console.log(files);
    } else {
      console.log('No packages found in releases directory');
    }
    
    // Show total size
    try {
      const totalSize = execSync('du -sh . 2>/dev/null || echo "Size unknown"', { 
        cwd: releasesDir, 
        encoding: 'utf8' 
      }).trim();
      console.log(`\n📏 Total size: ${totalSize.split('\t')[0]}`);
    } catch {
      console.log('\n📏 Total size: Unable to determine');
    }
  } catch (error) {
    console.log('Unable to show build summary');
  }
}
