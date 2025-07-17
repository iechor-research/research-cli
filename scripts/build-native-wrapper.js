#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building native Research CLI wrapper...\n');

// 确保构建目录存在
const distDir = path.join(__dirname, '..', 'dist-native');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 构建当前平台的版本
console.log('📦 Building for current platform...');
try {
    execSync('cd src-tauri && cargo build --release', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
    });
    
    const platform = process.platform;
    const arch = process.arch;
    
    let binaryName = 'research-cli';
    let targetName = `research-cli-${platform}-${arch}`;
    
    if (platform === 'win32') {
        binaryName += '.exe';
        targetName += '.exe';
    }
    
    const sourcePath = path.join(__dirname, '..', 'src-tauri', 'target', 'release', binaryName);
    const targetPath = path.join(distDir, targetName);
    
    // 复制二进制文件
    fs.copyFileSync(sourcePath, targetPath);
    
    // 获取文件大小
    const stats = fs.statSync(targetPath);
    const fileSizeInKB = Math.round(stats.size / 1024);
    
    console.log(`✅ Built ${targetName} (${fileSizeInKB}KB)`);
    
    // 读取package.json获取版本
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    
    // 创建发布信息
    const releaseInfo = {
        version: packageJson.version,
        buildTime: new Date().toISOString(),
        platform: platform,
        arch: arch,
        binaryName: targetName,
        size: fileSizeInKB + 'KB',
        description: 'Native wrapper for Research CLI - provides original terminal experience with minimal overhead'
    };
    
    fs.writeFileSync(
        path.join(distDir, `${targetName}.json`), 
        JSON.stringify(releaseInfo, null, 2)
    );
    
    console.log('\n📋 Release Information:');
    console.log(`   Version: ${releaseInfo.version}`);
    console.log(`   Platform: ${releaseInfo.platform}-${releaseInfo.arch}`);
    console.log(`   Size: ${releaseInfo.size}`);
    console.log(`   Binary: ${releaseInfo.binaryName}`);
    
    // 创建使用说明
    const readmeContent = `# Research CLI Native Wrapper

## Installation

1. Download the appropriate binary for your platform:
   - \`${targetName}\` for ${platform}-${arch}

2. Make it executable (Unix/Linux/macOS):
   \`\`\`bash
   chmod +x ${targetName}
   \`\`\`

3. Run it:
   \`\`\`bash
   ./${targetName}
   \`\`\`

## Features

- ✅ Native Research CLI experience
- ✅ Minimal size (${fileSizeInKB}KB)
- ✅ Fast startup
- ✅ Full terminal compatibility
- ✅ No web interface overhead

## Requirements

- Node.js (required for Research CLI)
- Built Research CLI packages

## About

This is a lightweight native wrapper that directly launches the Research CLI with full terminal compatibility.
Built with Rust for maximum performance and minimal footprint.

Version: ${releaseInfo.version}
Built: ${releaseInfo.buildTime}
`;

    fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);
    
    console.log('\n📄 Generated README.md');
    console.log(`\n🎉 Native wrapper built successfully!`);
    console.log(`📁 Output directory: ${distDir}`);
    
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
} 