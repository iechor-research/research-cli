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

console.log(`🚀 Triggering GitHub Actions build for Research CLI Native Wrapper v${version}\n`);

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

    // 3. 创建并推送标签
    console.log(`\n🏷️  Creating and pushing tag: ${tagName}`);
    
    // 删除本地标签（如果存在）
    try {
        execSync(`git tag -d ${tagName}`, { stdio: 'pipe' });
        console.log('   🗑️  Deleted existing local tag');
    } catch (error) {
        // 忽略错误，标签可能不存在
    }

    // 删除远程标签（如果存在）
    try {
        execSync(`git push origin :refs/tags/${tagName}`, { stdio: 'pipe' });
        console.log('   🗑️  Deleted existing remote tag');
    } catch (error) {
        // 忽略错误，标签可能不存在
    }

    // 创建新标签
    execSync(`git tag ${tagName}`, { stdio: 'inherit' });
    console.log('   ✅ Created local tag');

    // 推送标签
    execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
    console.log('   ✅ Pushed tag to GitHub');

    console.log(`\n🎉 GitHub Actions workflow triggered!`);
    console.log(`\n📋 What happens next:`);
    console.log(`   1. GitHub Actions will build for all platforms:`);
    console.log(`      - macOS Intel (x64)`);
    console.log(`      - macOS Apple Silicon (ARM64)`);
    console.log(`      - Windows x64`);
    console.log(`      - Linux x64`);
    console.log(`      - Linux ARM64`);
    console.log(`   2. Create a GitHub Release automatically`);
    console.log(`   3. Upload all binaries and install script`);
    
    console.log(`\n🔗 Monitor progress:`);
    console.log(`   Actions: https://github.com/iechor-research/research-cli/actions`);
    console.log(`   Release: https://github.com/iechor-research/research-cli/releases/tag/${tagName} (after completion)`);

    console.log(`\n📥 After completion, users can install with:`);
    console.log(`   curl -sSL https://github.com/iechor-research/research-cli/releases/download/${tagName}/install.sh | bash`);

} catch (error) {
    console.error('❌ Failed to trigger GitHub Actions:', error.message);
    process.exit(1);
} 