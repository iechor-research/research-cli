#!/usr/bin/env node

/**
 * Simple GitHub Release Creator
 * Creates a basic release with current platform package
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const version = process.argv[2] || 'v0.3.1-test';
const isDraft = process.argv.includes('--draft');

console.log(`🚀 Creating simple GitHub release: ${version}`);

// Create release notes file
const releaseNotes = `# Research CLI ${version}

## 🎉 Features

- 🌍 Cross-platform support: Linux, macOS, Windows (x64/ARM64)
- 🚀 One-click installation scripts
- 📦 Self-contained packages with Node.js runtime
- 🤖 Automated GitHub Actions CI/CD

## 📦 Installation

### Linux/macOS (One-click install):
\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
\`\`\`

### Windows (PowerShell):
\`\`\`powershell
iwr -useb https://raw.githubusercontent.com/iechor-research/research-cli/main/install.ps1 | iex
\`\`\`

### Manual Download:
Download the appropriate package for your platform from the Assets below.

## 🌍 Supported Platforms
- ✅ Linux x64
- ✅ Linux ARM64  
- ✅ macOS x64 (Intel)
- ✅ macOS ARM64 (M1/M2)
- ✅ Windows x64
- ✅ Windows ARM64

## 🚀 Quick Start
\`\`\`bash
research-cli --version
research-cli --help
research-cli -p "Hello, Research CLI!"
\`\`\`

---
**Cross-platform support is now available!** 🌍✨
`;

const notesFile = join(rootDir, 'release-notes.md');
writeFileSync(notesFile, releaseNotes);

try {
  // Build current platform package
  console.log('📦 Building current platform package...');
  execSync('npm run build:standalone-simple', { stdio: 'inherit', cwd: rootDir });

  // Create basic release command
  let releaseCmd = `gh release create "${version}" --title "Research CLI ${version}" --notes-file "${notesFile}"`;
  
  if (isDraft) {
    releaseCmd += ' --draft';
  }

  // Add files to release
  const currentPlatform = process.platform === 'darwin' ? 
    `darwin-${process.arch}` : 
    `${process.platform}-${process.arch}`;
  
  const packagePath = join(rootDir, `research-cli-standalone-${currentPlatform}.tar.gz`);
  
  if (existsSync(packagePath)) {
    releaseCmd += ` "${packagePath}"`;
  }
  
  if (existsSync(join(rootDir, 'install.sh'))) {
    releaseCmd += ` "${join(rootDir, 'install.sh')}"`;
  }
  
  if (existsSync(join(rootDir, 'install.ps1'))) {
    releaseCmd += ` "${join(rootDir, 'install.ps1')}"`;
  }

  console.log('🎯 Creating GitHub release...');
  console.log(`Command: ${releaseCmd}`);
  
  execSync(releaseCmd, { stdio: 'inherit', cwd: rootDir });
  
  console.log('✅ GitHub release created successfully!');
  
  // Clean up
  execSync(`rm -f "${notesFile}"`, { cwd: rootDir });
  
} catch (error) {
  console.error('❌ Failed to create release:', error.message);
  
  // Clean up on error
  try {
    execSync(`rm -f "${notesFile}"`, { cwd: rootDir });
  } catch {}
  
  process.exit(1);
}
