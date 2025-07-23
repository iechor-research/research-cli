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

console.log(`🚀 Creating local GitHub Release for Research CLI Native Wrapper v${version}\n`);

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

    // 3. 确保本地构建是最新的
    console.log('\n📦 Building latest native wrappers...');
    execSync('npm run build:cross-platform', { stdio: 'inherit' });

    // 4. 检查可用的文件
    const distDir = path.join(__dirname, '..', 'dist-native');
    const binaryFiles = fs.readdirSync(distDir).filter(f => 
        f.startsWith('research-cli-') && 
        !f.endsWith('.json') && 
        !f.endsWith('.md') &&
        !f.includes('node-package') &&
        f !== 'research-cli-node.tar.gz'
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

    // 5. 检查是否已存在release
    console.log(`\n🔍 Checking if release ${tagName} exists...`);
    try {
        execSync(`gh release view ${tagName}`, { stdio: 'pipe' });
        console.log(`⚠️  Release ${tagName} already exists. Deleting it...`);
        execSync(`gh release delete ${tagName} --yes`, { stdio: 'inherit' });
    } catch (error) {
        console.log('✅ Release does not exist, proceeding...');
    }

    // 6. 删除和重新创建标签
    try {
        execSync(`git tag -d ${tagName}`, { stdio: 'pipe' });
        execSync(`git push origin :refs/tags/${tagName}`, { stdio: 'pipe' });
    } catch (error) {
        // 忽略错误
    }

    console.log(`\n🏷️  Creating git tag: ${tagName}`);
    execSync(`git tag ${tagName}`, { stdio: 'inherit' });
    execSync(`git push origin ${tagName}`, { stdio: 'inherit' });

    // 7. 生成发布说明
    const availablePlatforms = [];
    if (binaryFiles.some(f => f.includes('darwin-x64'))) {
        availablePlatforms.push({ name: 'macOS Intel', file: 'research-cli-darwin-x64' });
    }
    if (binaryFiles.some(f => f.includes('darwin-arm64'))) {
        availablePlatforms.push({ name: 'macOS Apple Silicon', file: 'research-cli-darwin-arm64' });
    }
    if (binaryFiles.some(f => f.includes('win32-x64'))) {
        availablePlatforms.push({ name: 'Windows x64', file: 'research-cli-win32-x64.exe' });
    }
    if (binaryFiles.some(f => f.includes('linux-x64'))) {
        availablePlatforms.push({ name: 'Linux x64', file: 'research-cli-linux-x64' });
    }
    if (binaryFiles.some(f => f.includes('linux-arm64'))) {
        availablePlatforms.push({ name: 'Linux ARM64', file: 'research-cli-linux-arm64' });
    }

    const releaseNotes = `# Research CLI Native Wrapper ${tagName}

## 🎯 跨平台原生二进制文件

这个版本提供了可以独立工作的原生二进制文件，无需单独安装Research CLI。

## ✨ 主要特性

- **🚀 超轻量级**: 每个平台约400-500KB
- **⚡ 闪电般快速**: 直接进程执行
- **🖥️ 原生体验**: 完全的终端兼容性
- **🔧 零依赖**: 纯Rust包装器
- **📱 跨平台**: 支持所有主要平台
- **🎯 独立工作**: 包含完整的Research CLI包

## 📦 快速安装

### 一键安装器（所有平台）
\`\`\`bash
curl -sSL https://github.com/iechor-research/research-cli/releases/download/${tagName}/install-complete.sh | bash
\`\`\`

### 手动安装

${availablePlatforms.map(p => {
    if (p.file.includes('darwin')) {
        const arch = p.file.includes('arm64') ? 'Apple Silicon (M1/M2/M3)' : 'Intel';
        return `#### macOS ${arch}
\`\`\`bash
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/${p.file}
chmod +x research-cli && ./research-cli
\`\`\``;
    } else if (p.file.includes('win32')) {
        return `#### Windows (PowerShell)
\`\`\`powershell
Invoke-WebRequest -Uri "https://github.com/iechor-research/research-cli/releases/download/${tagName}/${p.file}" -OutFile "research-cli.exe"
.\\research-cli.exe
\`\`\``;
    } else if (p.file.includes('linux')) {
        const arch = p.file.includes('arm64') ? 'ARM64' : 'x64';
        return `#### Linux ${arch}
\`\`\`bash
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/${p.file}
chmod +x research-cli && ./research-cli
\`\`\``;
    }
    return '';
}).filter(s => s).join('\n\n')}

## 📋 系统要求

- Node.js (包装器会自动检测和使用)
- 包装器包含完整的Research CLI包

## 🔧 技术细节

每个二进制文件都是一个轻量级的Rust包装器，具有以下特性：
- 包含完整的Research CLI Node.js包
- 自动查找并使用系统的Node.js安装
- 提供完全的终端兼容性（stdin/stdout/stderr）
- 工作方式与直接运行Research CLI完全相同

## 📊 可用平台

${availablePlatforms.map(p => `- ✅ ${p.name}: \`${p.file}\``).join('\n')}

构建时间: ${new Date().toISOString()}`;

    // 8. 保存发布说明到临时文件
    const releaseNotesFile = path.join(distDir, 'release-notes-local.md');
    fs.writeFileSync(releaseNotesFile, releaseNotes);

    // 9. 准备上传文件
    const uploadFiles = [];
    
    // 添加二进制文件
    binaryFiles.forEach(file => {
        uploadFiles.push(path.join(distDir, file));
    });
    
    // 添加安装脚本
    if (fs.existsSync(path.join(distDir, 'install-complete.sh'))) {
        uploadFiles.push(path.join(distDir, 'install-complete.sh'));
    }
    
    // 添加Node.js包
    if (fs.existsSync(path.join(distDir, 'research-cli-node.tar.gz'))) {
        uploadFiles.push(path.join(distDir, 'research-cli-node.tar.gz'));
    }

    // 10. 创建GitHub Release
    console.log(`\n🎉 Creating GitHub Release: ${tagName}`);
    
    const ghCommand = `gh release create ${tagName} ${uploadFiles.join(' ')} ` +
        `--title "Research CLI Native Wrapper ${tagName} - 跨平台独立版本" ` +
        `--notes-file "${releaseNotesFile}"`;

    console.log(`\n📤 Executing release creation...`);
    execSync(ghCommand, { stdio: 'inherit' });

    // 11. 显示成功信息
    console.log(`\n✅ 本地发布创建成功！`);
    console.log(`\n📋 发布信息:`);
    console.log(`   🏷️  标签: ${tagName}`);
    console.log(`   📦 上传文件: ${uploadFiles.length} 个`);
    console.log(`   🔗 URL: https://github.com/iechor-research/research-cli/releases/tag/${tagName}`);
    
    // 12. 显示安装命令
    console.log(`\n📥 用户可以通过以下方式安装:`);
    console.log(`   curl -sSL https://github.com/iechor-research/research-cli/releases/download/${tagName}/install-complete.sh | bash`);
    
    console.log(`\n🎯 所有平台的原生二进制文件现在都可以独立工作！`);

} catch (error) {
    console.error('❌ 发布失败:', error.message);
    process.exit(1);
} 