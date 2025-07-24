#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取package.json获取版本
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'),
);
const version = packageJson.version;
const tagName = `v${version}-native`;

console.log(
  `🚀 Publishing Research CLI Native Wrapper v${version} with GitHub CLI\n`,
);

try {
  // 1. 检查gh命令是否可用
  console.log('🔍 Checking GitHub CLI...');
  try {
    execSync('gh --version', { stdio: 'pipe' });
    console.log('✅ GitHub CLI is available');
  } catch (error) {
    console.error(
      '❌ GitHub CLI not found. Please install it: https://cli.github.com/',
    );
    process.exit(1);
  }

  // 2. 检查是否已登录
  console.log('🔑 Checking GitHub authentication...');
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    console.log('✅ GitHub authentication verified');
  } catch (error) {
    console.error('❌ Not authenticated with GitHub. Run: gh auth login');
    process.exit(1);
  }

  // 3. 构建原生包装器
  console.log('\n📦 Building native wrapper...');
  execSync('npm run build:native', { stdio: 'inherit' });

  // 4. 检查是否已存在release
  console.log(`\n🔍 Checking if release ${tagName} exists...`);
  try {
    execSync(`gh release view ${tagName}`, { stdio: 'pipe' });
    console.log(`⚠️  Release ${tagName} already exists. Deleting it...`);
    execSync(`gh release delete ${tagName} --yes`, { stdio: 'inherit' });
  } catch (error) {
    console.log('✅ Release does not exist, proceeding...');
  }

  // 5. 删除本地标签（如果存在）
  try {
    execSync(`git tag -d ${tagName}`, { stdio: 'pipe' });
    execSync(`git push origin :refs/tags/${tagName}`, { stdio: 'pipe' });
  } catch (error) {
    // 忽略错误
  }

  // 6. 创建新标签
  console.log(`\n🏷️  Creating git tag: ${tagName}`);
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });

  // 7. 创建发布说明
  const releaseNotes = `# Research CLI Native Wrapper v${version}

## 🎯 What's New

This is a **native wrapper** for Research CLI that provides the **original terminal experience** with minimal overhead.

## ✨ Key Features

- **🚀 Ultra-lightweight**: Only 431KB (99% smaller than previous packaging attempts)
- **⚡ Lightning fast**: Direct process execution, no web interface overhead  
- **🖥️ Native experience**: Full terminal compatibility with stdin/stdout/stderr
- **🔧 Zero dependencies**: Pure Rust wrapper, no Node.js bundling
- **📱 Cross-platform**: Supports macOS, Windows, and Linux

## 🛠️ Installation

### macOS (ARM64 - M1/M2)
\`\`\`bash
# Download and make executable
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-darwin-arm64
chmod +x research-cli

# Run
./research-cli
\`\`\`

### Requirements

- Node.js (required for Research CLI core functionality)
- Built Research CLI packages in your project

## 🔧 Technical Details

This wrapper is built with Rust and directly executes the Research CLI Node.js process, inheriting all stdio streams for a completely native terminal experience. Unlike previous packaging attempts with Electron or bundled Node.js, this approach provides:

- **Minimal footprint**: No bundled runtime or web interface
- **Native performance**: Direct process execution
- **Full compatibility**: Works exactly like running \`node packages/cli/dist/index.js\`

## 🆚 Comparison with Previous Approaches

| Approach | Size | Experience | Performance |
|----------|------|------------|-------------|
| PKG bundling | 60-75MB | Native CLI | Good |
| Tauri + Web UI | 12MB | Custom interface | Good |
| **Native wrapper** | **431KB** | **Native CLI** | **Excellent** |

Built: ${new Date().toISOString()}`;

  // 8. 保存发布说明到临时文件
  const releaseNotesFile = path.join(
    __dirname,
    '..',
    'dist-native',
    'release-notes.md',
  );
  fs.writeFileSync(releaseNotesFile, releaseNotes);

  // 9. 获取要上传的文件
  const distDir = path.join(__dirname, '..', 'dist-native');
  const binaryFiles = fs
    .readdirSync(distDir)
    .filter(
      (f) =>
        f.startsWith('research-cli-') &&
        !f.endsWith('.json') &&
        !f.endsWith('.md'),
    );

  if (binaryFiles.length === 0) {
    console.error('❌ No binary files found to upload');
    process.exit(1);
  }

  // 10. 创建GitHub Release
  console.log(`\n🎉 Creating GitHub Release: ${tagName}`);

  const uploadFiles = binaryFiles.map((f) => path.join(distDir, f)).join(' ');

  const ghCommand =
    `gh release create ${tagName} ${uploadFiles} ` +
    `--title "Research CLI Native Wrapper v${version}" ` +
    `--notes-file "${releaseNotesFile}"`;

  console.log(`\n📤 Executing: ${ghCommand}`);
  execSync(ghCommand, { stdio: 'inherit' });

  // 11. 显示成功信息
  console.log(`\n✅ Release created successfully!`);
  console.log(`\n📋 Release Information:`);
  console.log(`   🏷️  Tag: ${tagName}`);
  console.log(`   📦 Files uploaded: ${binaryFiles.join(', ')}`);
  console.log(
    `   🔗 URL: https://github.com/iechor-research/research-cli/releases/tag/${tagName}`,
  );

  // 12. 显示安装命令
  console.log(`\n📥 Quick Install (macOS ARM64):`);
  console.log(
    `   curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-darwin-arm64`,
  );
  console.log(`   chmod +x research-cli`);
  console.log(`   ./research-cli`);
} catch (error) {
  console.error('❌ Release failed:', error.message);
  process.exit(1);
}
