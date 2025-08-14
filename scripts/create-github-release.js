#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Create GitHub Release Script
 * 
 * Creates a GitHub release with cross-platform packages
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const isDraft = args.includes('--draft');
const isPrerelease = args.includes('--prerelease');
const version = args.find(arg => !arg.startsWith('--')) || 'v0.3.1';

console.log('🚀 Creating GitHub Release');
console.log(`📦 Version: ${version}`);
console.log(`📋 Draft: ${isDraft}`);
console.log(`🔬 Prerelease: ${isPrerelease}`);

// Check if gh CLI is available
function checkGhCli() {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    console.log('✅ GitHub CLI is available');
    return true;
  } catch (error) {
    console.error('❌ GitHub CLI (gh) is not installed or not in PATH');
    console.log('💡 Install it from: https://cli.github.com/');
    return false;
  }
}

// Check if we're in a git repository with GitHub remote
function checkGitRepo() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    console.log(`📡 Repository: ${remoteUrl}`);
    
    if (!remoteUrl.includes('github.com')) {
      console.error('❌ Not a GitHub repository');
      return false;
    }
    
    console.log('✅ GitHub repository detected');
    return true;
  } catch (error) {
    console.error('❌ Not a git repository or no origin remote');
    return false;
  }
}

// Build cross-platform packages
async function buildPackages() {
  console.log('\n📦 Building cross-platform packages...');
  
  try {
    // Build current platform first for testing
    execSync('npm run build:standalone-simple', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ Current platform package built');
    
    // Note: For a real release, you would want to build all platforms
    // This would typically be done by GitHub Actions
    console.log('💡 For full cross-platform release, use GitHub Actions workflow');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to build packages:', error.message);
    return false;
  }
}

// Create release notes
function generateReleaseNotes(version) {
  const changelogPath = join(rootDir, 'CHANGELOG.md');
  let releaseNotes = `## Research CLI ${version}

### 🎉 新功能
- 跨平台支持：Linux、macOS、Windows (x64/ARM64)
- 一键安装脚本：支持 bash 和 PowerShell
- 独立可执行包：无需安装 Node.js 环境
- 自动化 CI/CD：GitHub Actions 自动构建发布

### 📦 安装方式

**Linux/macOS (一键安装):**
\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
\`\`\`

**Windows (PowerShell):**
\`\`\`powershell
iwr -useb https://raw.githubusercontent.com/iechor-research/research-cli/main/install.ps1 | iex
\`\`\`

**手动下载:**
从 Assets 中下载对应平台的包，解压后直接运行。

### 🌍 支持平台
- ✅ Linux x64
- ✅ Linux ARM64  
- ✅ macOS x64 (Intel)
- ✅ macOS ARM64 (M1/M2)
- ✅ Windows x64
- ✅ Windows ARM64

### 📋 包内容
每个包都是完全独立的，包含：
- Research CLI 应用程序
- Node.js 运行时 (v20.18.1)
- 所有必要的依赖
- 平台特定的启动脚本

### 🔐 安全验证
所有包都提供 SHA256 校验和，请验证下载完整性：
\`\`\`bash
shasum -a 256 -c checksums.txt
\`\`\`

### 🚀 快速开始
\`\`\`bash
research-cli --version
research-cli --help
research-cli -p "Hello, Research CLI!"
\`\`\`

---
**完整的跨平台支持现已可用！** 🌍✨`;

  // Try to read existing changelog
  if (existsSync(changelogPath)) {
    try {
      const changelog = readFileSync(changelogPath, 'utf8');
      // Extract version-specific notes if available
      const versionMatch = changelog.match(new RegExp(`## \\[?${version.replace('v', '')}\\]?[\\s\\S]*?(?=## |$)`));
      if (versionMatch) {
        releaseNotes = versionMatch[0].trim();
      }
    } catch (error) {
      console.warn('⚠️  Could not read CHANGELOG.md, using default notes');
    }
  }

  return releaseNotes;
}

// Create the GitHub release
async function createRelease(version, releaseNotes) {
  console.log('\n🎯 Creating GitHub release...');
  
  const releaseArgs = [
    'gh', 'release', 'create', version,
    '--title', `Research CLI ${version}`
  ];

  if (isDraft) {
    releaseArgs.push('--draft');
  }

  if (isPrerelease) {
    releaseArgs.push('--prerelease');
  }
  
  // Add notes as separate arguments to avoid shell escaping issues
  releaseArgs.push('--notes');
  releaseArgs.push(releaseNotes);

  // Add current platform package if it exists
  const currentPlatform = process.platform === 'darwin' ? 
    `darwin-${process.arch}` : 
    `${process.platform}-${process.arch}`;
  
  const packagePath = join(rootDir, `research-cli-standalone-${currentPlatform}.tar.gz`);
  
  if (existsSync(packagePath)) {
    releaseArgs.push(packagePath);
    console.log(`📎 Adding package: ${packagePath}`);
  }

  // Add install scripts
  const installShPath = join(rootDir, 'install.sh');
  const installPs1Path = join(rootDir, 'install.ps1');
  
  if (existsSync(installShPath)) {
    releaseArgs.push(installShPath);
    console.log(`📎 Adding: install.sh`);
  }
  
  if (existsSync(installPs1Path)) {
    releaseArgs.push(installPs1Path);
    console.log(`📎 Adding: install.ps1`);
  }

  try {
    // Use spawn-like approach to avoid shell escaping issues
    const [command, ...args] = releaseArgs;
    execSync(`"${command}" ${args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ')}`, { 
      stdio: 'inherit', 
      cwd: rootDir,
      shell: true
    });
    console.log('✅ GitHub release created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to create GitHub release:', error.message);
    return false;
  }
}

// Main function
async function main() {
  // Pre-flight checks
  if (!checkGhCli()) {
    process.exit(1);
  }

  if (!checkGitRepo()) {
    process.exit(1);
  }

  // Build packages
  if (!await buildPackages()) {
    process.exit(1);
  }

  // Generate release notes
  const releaseNotes = generateReleaseNotes(version);

  // Create the release
  if (await createRelease(version, releaseNotes)) {
    console.log('\n🎉 Release created successfully!');
    
    // Show next steps
    console.log('\n📋 Next Steps:');
    console.log('1. 🔍 Review the release on GitHub');
    console.log('2. 🧪 Test the installation scripts');
    console.log('3. 🤖 Trigger GitHub Actions for full cross-platform build');
    console.log('4. 📢 Announce the release');
    
    // Show useful links
    try {
      const repoUrl = execSync('gh repo view --web --json url -q .url', { encoding: 'utf8', cwd: rootDir }).trim();
      console.log(`\n🔗 Release URL: ${repoUrl}/releases/tag/${version}`);
    } catch {
      console.log(`\n🔗 Check your releases at: https://github.com/your-org/research-cli/releases`);
    }
  } else {
    console.log('\n❌ Release creation failed');
    process.exit(1);
  }
}

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
GitHub Release Creator

USAGE:
    node scripts/create-github-release.js [VERSION] [OPTIONS]

ARGUMENTS:
    VERSION     Release version (default: v0.3.1)

OPTIONS:
    --draft         Create as draft release
    --prerelease    Mark as prerelease
    --help, -h      Show this help

EXAMPLES:
    node scripts/create-github-release.js v1.0.0
    node scripts/create-github-release.js v1.0.0-beta --prerelease
    node scripts/create-github-release.js v1.0.0 --draft

PREREQUISITES:
    - GitHub CLI (gh) installed and authenticated
    - Git repository with GitHub remote
    - Built packages (will build current platform automatically)
`);
  process.exit(0);
}

// Run main function
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
