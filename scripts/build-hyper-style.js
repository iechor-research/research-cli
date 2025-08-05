#!/usr/bin/env node

/**
 * Research CLI Multi-Platform Builder
 * Inspired by Hyper Terminal's build system
 * https://github.com/vercel/hyper
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Research CLI Multi-Platform Builder (Hyper-Style)\n');

// 读取package.json获取版本
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'),
);
const version = packageJson.version;

console.log(`📦 Building version ${version} with Hyper-inspired strategy...\n`);

// 构建策略配置 (参考 Hyper 的方法)
const buildStrategies = {
  // 1. 核心构建 - 类似 Hyper 的 webpack 构建
  core: {
    name: 'Core Application',
    description: 'Build core application bundle',
    command: 'npm run build',
    required: true
  },
  
  // 2. 原生包装器 - 轻量级二进制
  native: {
    name: 'Native Binaries',
    description: 'Lightweight native executables (Rust-based)',
    command: 'npm run build:cross-platform',
    platforms: ['darwin-x64', 'darwin-arm64', 'win32-x64', 'linux-x64'],
    skipOnError: true // 跳过交叉编译错误
  },
  
  // 3. 桌面应用 - 类似 Hyper 的 Electron 方式
  desktop: {
    name: 'Desktop Applications',
    description: 'Full-featured desktop apps',
    strategies: [
      {
        name: 'Tauri Apps',
        command: 'npm run tauri:build',
        condition: () => process.platform === 'darwin', // 只在 macOS 上构建
        platforms: ['macOS']
      },
      {
        name: 'Electron Apps',
        command: 'npm run build:electron-safe',
        platforms: ['macOS', 'Windows', 'Linux']
      }
    ]
  }
};

// 安全的 Electron 构建 - 分平台处理
const electronBuildSafe = async () => {
  const currentPlatform = process.platform;
  const platformMap = {
    'darwin': { flag: '--mac', name: 'macOS' },
    'win32': { flag: '--win', name: 'Windows' },
    'linux': { flag: '--linux', name: 'Linux' }
  };

  const platform = platformMap[currentPlatform];
  if (!platform) {
    throw new Error(`Unsupported platform: ${currentPlatform}`);
  }

  console.log(`🔨 Building Electron app for ${platform.name}...`);
  
  try {
    execSync(`npx electron-builder ${platform.flag} --publish=never`, {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        CSC_IDENTITY_AUTO_DISCOVERY: 'false',
        // 禁用代码签名以避免证书问题
        CSC_LINK: '',
        CSC_KEY_PASSWORD: ''
      }
    });
    return { success: true, platform: platform.name };
  } catch (error) {
    console.warn(`⚠️  Electron build failed for ${platform.name}: ${error.message}`);
    return { success: false, platform: platform.name, error: error.message };
  }
};

// 添加安全的 Electron 构建命令
if (!packageJson.scripts['build:electron-safe']) {
  packageJson.scripts['build:electron-safe'] = 'node scripts/build-hyper-style.js --electron-only';
  fs.writeFileSync(
    path.join(__dirname, '..', 'package.json'), 
    JSON.stringify(packageJson, null, 2) + '\n'
  );
}

const buildResults = [];
const startTime = Date.now();

// 检查是否只构建 Electron
const isElectronOnly = process.argv.includes('--electron-only');
if (isElectronOnly) {
  const result = await electronBuildSafe();
  console.log(result.success ? '✅ Electron build completed' : '❌ Electron build failed');
  process.exit(result.success ? 0 : 1);
}

// 执行核心构建
console.log(`🔨 ${buildStrategies.core.name}`);
console.log(`   📝 ${buildStrategies.core.description}`);

try {
  execSync(buildStrategies.core.command, { stdio: 'inherit' });
  console.log('✅ Core application built successfully\n');
  buildResults.push({ name: buildStrategies.core.name, success: true });
} catch (error) {
  console.error('❌ Core build failed:', error.message);
  if (buildStrategies.core.required) {
    process.exit(1);
  }
  buildResults.push({ name: buildStrategies.core.name, success: false, error: error.message });
}

// 执行原生构建 (允许部分失败)
console.log(`🔨 ${buildStrategies.native.name}`);
console.log(`   📝 ${buildStrategies.native.description}`);

try {
  execSync(buildStrategies.native.command, { stdio: 'inherit' });
  console.log('✅ Native binaries built successfully\n');
  buildResults.push({ name: buildStrategies.native.name, success: true });
} catch (error) {
  console.warn('⚠️  Some native builds failed (this is normal for cross-compilation)');
  buildResults.push({ name: buildStrategies.native.name, success: false, error: error.message });
}

// 执行桌面应用构建
for (const strategy of buildStrategies.desktop.strategies) {
  console.log(`🔨 ${strategy.name}`);
  
  // 检查构建条件
  if (strategy.condition && !strategy.condition()) {
    console.log(`⏭️  Skipping ${strategy.name}: Platform condition not met\n`);
    buildResults.push({ name: strategy.name, success: false, skipped: true });
    continue;
  }

  try {
    if (strategy.name === 'Electron Apps') {
      const result = await electronBuildSafe();
      buildResults.push({ name: strategy.name, success: result.success, error: result.error });
    } else {
      execSync(strategy.command, { stdio: 'inherit' });
      buildResults.push({ name: strategy.name, success: true });
    }
    console.log(`✅ ${strategy.name} built successfully\n`);
  } catch (error) {
    console.warn(`⚠️  ${strategy.name} build failed:`, error.message);
    buildResults.push({ name: strategy.name, success: false, error: error.message });
  }
}

// 生成构建报告 (类似 Hyper 的方式)
const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
const successful = buildResults.filter(r => r.success).length;
const failed = buildResults.filter(r => !r.success && !r.skipped).length;
const skipped = buildResults.filter(r => r.skipped).length;

console.log('📋 Build Summary (Hyper-Style):');
console.log('=================================');
console.log(`⏱️  Total build time: ${totalTime}s`);
console.log(`✅ Successful builds: ${successful}`);
console.log(`❌ Failed builds: ${failed}`);
console.log(`⏭️  Skipped builds: ${skipped}`);
console.log('');

buildResults.forEach(result => {
  const icon = result.success ? '✅' : result.skipped ? '⏭️' : '❌';
  const status = result.success ? 'SUCCESS' : result.skipped ? 'SKIPPED' : 'FAILED';
  console.log(`${icon} ${result.name}: ${status}`);
  if (result.error && !result.skipped) {
    console.log(`   Error: ${result.error.split('\n')[0]}`);
  }
});

console.log('\n💡 Next Steps:');
console.log('   1. Check dist-native/ for native binaries');
console.log('   2. Check src-tauri/target/release/bundle/ for Tauri apps');
console.log('   3. Check dist-electron/ for Electron packages');
console.log('   4. Use GitHub Actions for complete cross-platform builds');

// 创建安装指南 (类似 Hyper 的文档)
const installGuide = `# Research CLI Installation Guide

## Quick Install (Recommended)

\`\`\`bash
# One-line installer (auto-detects your platform)
curl -sSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
\`\`\`

## Platform-Specific Downloads

### macOS
- **Native Binary**: Fastest, smallest (~8MB)
- **Desktop App**: Full GUI experience
- **Homebrew**: \`brew install research-cli\`

### Windows
- **Native Binary**: Direct executable
- **Desktop Installer**: Full Windows integration
- **Chocolatey**: \`choco install research-cli\`

### Linux
- **Native Binary**: Universal Linux binary
- **AppImage**: Portable application
- **Package Managers**: Available for major distros

## Installation Methods

1. **Native Binary** (Recommended)
   - Smallest size (~8MB vs ~100MB for Electron)
   - Fastest startup
   - No dependencies

2. **Desktop Application**
   - GUI interface
   - System integration
   - Auto-updater

3. **Package Manager**
   - Automatic updates
   - System-wide installation
   - Easy uninstall

Built with ❤️ by IECHOR Research
`;

fs.writeFileSync(path.join(__dirname, '..', 'INSTALL.md'), installGuide);
console.log('📄 Installation guide created: INSTALL.md');

if (successful === 0) {
  console.log('\n❌ All builds failed. Please check the errors above.');
  process.exit(1);
} else {
  console.log(`\n🎉 Build completed: ${successful} successful, ${failed} failed, ${skipped} skipped`);
}