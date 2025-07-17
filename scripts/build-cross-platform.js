#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building Research CLI Native Wrapper for all platforms...\n');

// 确保构建目录存在
const distDir = path.join(__dirname, '..', 'dist-native');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 定义目标平台
const targets = [
    { rust: 'x86_64-apple-darwin', platform: 'darwin', arch: 'x64', name: 'macOS Intel' },
    { rust: 'aarch64-apple-darwin', platform: 'darwin', arch: 'arm64', name: 'macOS Apple Silicon' },
    { rust: 'x86_64-pc-windows-gnu', platform: 'win32', arch: 'x64', name: 'Windows x64', ext: '.exe' },
    { rust: 'x86_64-unknown-linux-musl', platform: 'linux', arch: 'x64', name: 'Linux x64' },
    { rust: 'aarch64-unknown-linux-musl', platform: 'linux', arch: 'arm64', name: 'Linux ARM64' }
];

// 读取package.json获取版本
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = packageJson.version;

console.log(`📦 Building version ${version} for ${targets.length} platforms...\n`);

const buildResults = [];

for (const target of targets) {
    const targetName = `research-cli-${target.platform}-${target.arch}${target.ext || ''}`;
    
    console.log(`🔨 Building ${target.name} (${target.rust})...`);
    
    try {
        // 安装目标平台工具链（如果需要）
        try {
            execSync(`rustup target add ${target.rust}`, { 
                stdio: 'pipe',
                cwd: path.join(__dirname, '..', 'src-tauri')
            });
        } catch (e) {
            // 目标可能已经安装，忽略错误
        }
        
        // 构建目标平台
        execSync(`cargo build --release --target ${target.rust}`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..', 'src-tauri')
        });
        
        // 确定源文件路径
        const binaryName = target.ext ? `research-cli${target.ext}` : 'research-cli';
        const sourcePath = path.join(__dirname, '..', 'src-tauri', 'target', target.rust, 'release', binaryName);
        const targetPath = path.join(distDir, targetName);
        
        // 检查文件是否存在
        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Binary not found at ${sourcePath}`);
        }
        
        // 复制二进制文件
        fs.copyFileSync(sourcePath, targetPath);
        
        // 获取文件大小
        const stats = fs.statSync(targetPath);
        const fileSizeInKB = Math.round(stats.size / 1024);
        
        console.log(`✅ Built ${targetName} (${fileSizeInKB}KB)`);
        
        // 创建发布信息
        const releaseInfo = {
            version: version,
            buildTime: new Date().toISOString(),
            platform: target.platform,
            arch: target.arch,
            rustTarget: target.rust,
            binaryName: targetName,
            size: fileSizeInKB + 'KB',
            description: `Native wrapper for Research CLI - ${target.name}`
        };
        
        fs.writeFileSync(
            path.join(distDir, `${targetName}.json`), 
            JSON.stringify(releaseInfo, null, 2)
        );
        
        buildResults.push({
            platform: target.name,
            file: targetName,
            size: fileSizeInKB,
            success: true
        });
        
    } catch (error) {
        console.error(`❌ Failed to build ${target.name}: ${error.message}`);
        buildResults.push({
            platform: target.name,
            file: targetName,
            size: 0,
            success: false,
            error: error.message
        });
    }
    
    console.log(''); // 空行分隔
}

// 创建跨平台README
const crossPlatformReadme = `# Research CLI Native Wrapper - Cross Platform

## 📦 Available Downloads

| Platform | Architecture | Download | Size | Status |
|----------|-------------|----------|------|--------|
${buildResults.map(result => {
    const status = result.success ? '✅ Ready' : '❌ Failed';
    const size = result.success ? result.size + 'KB' : 'N/A';
    return `| ${result.platform} | | \`${result.file}\` | ${size} | ${status} |`;
}).join('\n')}

## 🛠️ Installation Instructions

### macOS
\`\`\`bash
# Intel Macs
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v${version}-native/research-cli-darwin-x64
chmod +x research-cli

# Apple Silicon (M1/M2/M3)
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v${version}-native/research-cli-darwin-arm64
chmod +x research-cli
\`\`\`

### Windows
\`\`\`powershell
# Download and run
Invoke-WebRequest -Uri "https://github.com/iechor-research/research-cli/releases/download/v${version}-native/research-cli-win32-x64.exe" -OutFile "research-cli.exe"
.\\research-cli.exe
\`\`\`

### Linux
\`\`\`bash
# x64
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v${version}-native/research-cli-linux-x64
chmod +x research-cli

# ARM64
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v${version}-native/research-cli-linux-arm64
chmod +x research-cli
\`\`\`

## 📋 Requirements

- Node.js (required for Research CLI core functionality)
- Built Research CLI packages in your project

## ✨ Features

- **🚀 Ultra-lightweight**: ~400-500KB per platform
- **⚡ Lightning fast**: Direct process execution
- **🖥️ Native experience**: Full terminal compatibility
- **🔧 Zero dependencies**: Pure Rust wrapper
- **📱 Cross-platform**: Works on all major platforms

Built: ${new Date().toISOString()}
Version: ${version}
`;

fs.writeFileSync(path.join(distDir, 'README-CROSS-PLATFORM.md'), crossPlatformReadme);

// 显示构建总结
console.log('📋 Build Summary:');
console.log('================');
buildResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const size = result.success ? ` (${result.size}KB)` : '';
    console.log(`${status} ${result.platform}: ${result.file}${size}`);
});

const successCount = buildResults.filter(r => r.success).length;
const totalCount = buildResults.length;

console.log(`\n🎉 Successfully built ${successCount}/${totalCount} platforms`);

if (successCount > 0) {
    console.log(`\n📁 All files available in: ${distDir}`);
    console.log(`📄 Cross-platform guide: README-CROSS-PLATFORM.md`);
}

if (successCount < totalCount) {
    console.log('\n⚠️  Some builds failed. This is normal if you don\'t have all cross-compilation tools installed.');
    console.log('   You can install missing tools with: rustup target add <target-name>');
} 