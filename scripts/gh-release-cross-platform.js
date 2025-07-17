#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取package.json获取版本
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = packageJson.version;
const tagName = `v${version}-native`;

console.log(`🚀 Publishing Research CLI Native Wrapper v${version} (Cross Platform) with GitHub CLI\n`);

try {
    // 1. 检查gh命令是否可用
    console.log('🔍 Checking GitHub CLI...');
    try {
        execSync('gh --version', { stdio: 'pipe' });
        console.log('✅ GitHub CLI is available');
    } catch (error) {
        console.error('❌ GitHub CLI not found. Please install it: https://cli.github.com/');
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

    // 3. 构建所有平台的原生包装器
    console.log('\n📦 Building native wrappers for all platforms...');
    execSync('node scripts/build-cross-platform.js', { stdio: 'inherit' });

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
    const releaseNotes = `# Research CLI Native Wrapper v${version} - Cross Platform

## 🎯 What's New

This is a **cross-platform native wrapper** for Research CLI that provides the **original terminal experience** with minimal overhead across all major operating systems.

## ✨ Key Features

- **🚀 Ultra-lightweight**: Only ~400-500KB per platform (99% smaller than previous packaging attempts)
- **⚡ Lightning fast**: Direct process execution, no web interface overhead  
- **🖥️ Native experience**: Full terminal compatibility with stdin/stdout/stderr
- **🔧 Zero dependencies**: Pure Rust wrapper, no Node.js bundling
- **📱 Cross-platform**: Native binaries for all major platforms and architectures

## 📦 Downloads

| Platform | Architecture | Download | Size |
|----------|-------------|----------|------|
| **macOS** | Intel (x64) | [\`research-cli-darwin-x64\`](https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-darwin-x64) | ~450KB |
| **macOS** | Apple Silicon (ARM64) | [\`research-cli-darwin-arm64\`](https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-darwin-arm64) | ~431KB |
| **Windows** | x64 | [\`research-cli-win32-x64.exe\`](https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-win32-x64.exe) | ~400KB |
| **Linux** | x64 | [\`research-cli-linux-x64\`](https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-linux-x64) | ~420KB |
| **Linux** | ARM64 | [\`research-cli-linux-arm64\`](https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-linux-arm64) | ~410KB |

## 🛠️ Quick Installation

### macOS
\`\`\`bash
# Intel Macs
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-darwin-x64
chmod +x research-cli && ./research-cli

# Apple Silicon (M1/M2/M3)
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-darwin-arm64
chmod +x research-cli && ./research-cli
\`\`\`

### Windows (PowerShell)
\`\`\`powershell
Invoke-WebRequest -Uri "https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-win32-x64.exe" -OutFile "research-cli.exe"
.\\research-cli.exe
\`\`\`

### Linux
\`\`\`bash
# x64
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-linux-x64
chmod +x research-cli && ./research-cli

# ARM64 (Raspberry Pi, ARM servers)
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-linux-arm64
chmod +x research-cli && ./research-cli
\`\`\`

## 📋 Requirements

- Node.js (required for Research CLI core functionality)
- Built Research CLI packages in your project

## 🔧 Technical Details

This wrapper is built with Rust and directly executes the Research CLI Node.js process, inheriting all stdio streams for a completely native terminal experience. Unlike previous packaging attempts with Electron or bundled Node.js, this approach provides:

- **Minimal footprint**: No bundled runtime or web interface
- **Native performance**: Direct process execution
- **Full compatibility**: Works exactly like running \`node packages/cli/dist/index.js\`
- **Cross-platform**: Single binary per platform, no dependencies

## 🆚 Comparison with Previous Approaches

| Approach | Size | Experience | Performance | Cross-Platform |
|----------|------|------------|-------------|----------------|
| PKG bundling | 60-75MB | Native CLI | Good | ✅ |
| Tauri + Web UI | 12MB | Custom interface | Good | ✅ |
| **Native wrapper** | **~400-500KB** | **Native CLI** | **Excellent** | **✅** |

## 🏗️ Build Information

- Built with: Rust ${execSync('rustc --version', { encoding: 'utf8' }).trim()}
- Targets: 5 platforms (macOS x64/ARM64, Windows x64, Linux x64/ARM64)
- Build time: ${new Date().toISOString()}
- Total size: ~2MB for all platforms combined

Built: ${new Date().toISOString()}`;

    // 8. 保存发布说明到临时文件
    const releaseNotesFile = path.join(__dirname, '..', 'dist-native', 'release-notes-cross-platform.md');
    fs.writeFileSync(releaseNotesFile, releaseNotes);

    // 9. 获取要上传的文件
    const distDir = path.join(__dirname, '..', 'dist-native');
    const binaryFiles = fs.readdirSync(distDir).filter(f => 
        f.startsWith('research-cli-') && 
        !f.endsWith('.json') && 
        !f.endsWith('.md')
    );

    if (binaryFiles.length === 0) {
        console.error('❌ No binary files found to upload');
        process.exit(1);
    }

    console.log(`\n📁 Found ${binaryFiles.length} binaries to upload:`);
    binaryFiles.forEach(file => {
        const stats = fs.statSync(path.join(distDir, file));
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`   📦 ${file} (${sizeKB}KB)`);
    });

    // 10. 创建GitHub Release
    console.log(`\n🎉 Creating GitHub Release: ${tagName}`);
    
    const uploadFiles = binaryFiles.map(f => path.join(distDir, f)).join(' ');
    
    const ghCommand = `gh release create ${tagName} ${uploadFiles} ` +
        `--title "Research CLI Native Wrapper v${version} - Cross Platform" ` +
        `--notes-file "${releaseNotesFile}"`;

    console.log(`\n📤 Executing release creation...`);
    execSync(ghCommand, { stdio: 'inherit' });

    // 11. 显示成功信息
    console.log(`\n✅ Cross-platform release created successfully!`);
    console.log(`\n📋 Release Information:`);
    console.log(`   🏷️  Tag: ${tagName}`);
    console.log(`   📦 Files uploaded: ${binaryFiles.length} binaries`);
    console.log(`   🔗 URL: https://github.com/iechor-research/research-cli/releases/tag/${tagName}`);
    
    // 12. 显示平台特定的安装命令
    console.log(`\n📥 Quick Install Commands:`);
    console.log(`\n🍎 macOS (Apple Silicon):`);
    console.log(`   curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-darwin-arm64 && chmod +x research-cli`);
    
    console.log(`\n🍎 macOS (Intel):`);
    console.log(`   curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-darwin-x64 && chmod +x research-cli`);
    
    console.log(`\n🪟 Windows:`);
    console.log(`   Invoke-WebRequest -Uri "https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-win32-x64.exe" -OutFile "research-cli.exe"`);
    
    console.log(`\n🐧 Linux (x64):`);
    console.log(`   curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/research-cli-linux-x64 && chmod +x research-cli`);

} catch (error) {
    console.error('❌ Cross-platform release failed:', error.message);
    process.exit(1);
} 