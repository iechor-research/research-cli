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
  `🚀 Publishing Research CLI Native Wrapper v${version} (Available Platforms)\n`,
);

try {
  // 1. 构建可用平台
  console.log('📦 Building available platforms...');
  execSync('npm run build:cross-platform', { stdio: 'inherit' });

  // 2. 获取成功构建的文件
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

  console.log(`\n📁 Found ${binaryFiles.length} binaries to upload:`);
  binaryFiles.forEach((file) => {
    const stats = fs.statSync(path.join(distDir, file));
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   📦 ${file} (${sizeKB}KB)`);
  });

  // 3. 创建发布说明
  const platforms = binaryFiles.map((f) => {
    if (f.includes('darwin-arm64'))
      return { name: 'macOS Apple Silicon', file: f, arch: 'ARM64' };
    if (f.includes('darwin-x64'))
      return { name: 'macOS Intel', file: f, arch: 'x64' };
    if (f.includes('win32-x64'))
      return { name: 'Windows', file: f, arch: 'x64' };
    if (f.includes('linux-x64')) return { name: 'Linux', file: f, arch: 'x64' };
    if (f.includes('linux-arm64'))
      return { name: 'Linux ARM64', file: f, arch: 'ARM64' };
    return { name: 'Unknown', file: f, arch: 'Unknown' };
  });

  const releaseNotes = `# Research CLI Native Wrapper v${version}

## 🎯 What's New

This is a **native wrapper** for Research CLI that provides the **original terminal experience** with minimal overhead.

## ✨ Key Features

- **🚀 Ultra-lightweight**: Only ~400-500KB per platform (99% smaller than previous packaging attempts)
- **⚡ Lightning fast**: Direct process execution, no web interface overhead  
- **🖥️ Native experience**: Full terminal compatibility with stdin/stdout/stderr
- **🔧 Zero dependencies**: Pure Rust wrapper, no Node.js bundling

## 📦 Available Downloads

| Platform | Architecture | Download | Size |
|----------|-------------|----------|------|
${platforms
  .map((p) => {
    const stats = fs.statSync(path.join(distDir, p.file));
    const sizeKB = Math.round(stats.size / 1024);
    return `| **${p.name}** | ${p.arch} | [\`${p.file}\`](https://github.com/iechor-research/research-cli/releases/download/${tagName}/${p.file}) | ${sizeKB}KB |`;
  })
  .join('\n')}

## 🛠️ Quick Installation

${platforms
  .map((p) => {
    if (p.file.includes('darwin')) {
      const arch = p.file.includes('arm64')
        ? 'Apple Silicon (M1/M2/M3)'
        : 'Intel';
      return `### macOS ${arch}
\`\`\`bash
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/${p.file}
chmod +x research-cli && ./research-cli
\`\`\``;
    } else if (p.file.includes('win32')) {
      return `### Windows
\`\`\`powershell
Invoke-WebRequest -Uri "https://github.com/iechor-research/research-cli/releases/download/${tagName}/${p.file}" -OutFile "research-cli.exe"
.\\research-cli.exe
\`\`\``;
    } else if (p.file.includes('linux')) {
      const arch = p.file.includes('arm64') ? 'ARM64' : 'x64';
      return `### Linux ${arch}
\`\`\`bash
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/${tagName}/${p.file}
chmod +x research-cli && ./research-cli
\`\`\``;
    }
    return '';
  })
  .filter((s) => s)
  .join('\n\n')}

## 📋 Requirements

- Node.js (required for Research CLI core functionality)
- Built Research CLI packages in your project

## 🔧 Technical Details

This wrapper is built with Rust and directly executes the Research CLI Node.js process, inheriting all stdio streams for a completely native terminal experience.

- **Minimal footprint**: No bundled runtime or web interface
- **Native performance**: Direct process execution
- **Full compatibility**: Works exactly like running \`node packages/cli/dist/index.js\`

## 🆚 Comparison with Previous Approaches

| Approach | Size | Experience | Performance |
|----------|------|------------|-------------|
| PKG bundling | 60-75MB | Native CLI | Good |
| Tauri + Web UI | 12MB | Custom interface | Good |
| **Native wrapper** | **~400-500KB** | **Native CLI** | **Excellent** |

Built: ${new Date().toISOString()}`;

  // 4. 保存发布说明
  const releaseNotesFile = path.join(distDir, 'release-notes-available.md');
  fs.writeFileSync(releaseNotesFile, releaseNotes);

  console.log(`\n📄 Generated release notes: release-notes-available.md`);
  console.log(`\n📋 Manual Release Steps:`);
  console.log(
    `   1. Go to: https://github.com/iechor-research/research-cli/releases/new`,
  );
  console.log(`   2. Tag: ${tagName}`);
  console.log(`   3. Title: Research CLI Native Wrapper v${version}`);
  console.log(`   4. Upload files: ${binaryFiles.join(', ')}`);
  console.log(`   5. Copy release notes from: ${releaseNotesFile}`);

  // 5. 创建快速安装脚本
  const installScript = `#!/bin/bash
# Research CLI Native Wrapper Quick Install Script

set -e

echo "🚀 Installing Research CLI Native Wrapper v${version}..."

# 检测平台
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Darwin)
        case "$ARCH" in
            arm64|aarch64)
                BINARY="research-cli-darwin-arm64"
                ;;
            x86_64)
                BINARY="research-cli-darwin-x64"
                ;;
            *)
                echo "❌ Unsupported architecture: $ARCH"
                exit 1
                ;;
        esac
        ;;
    Linux)
        case "$ARCH" in
            x86_64)
                BINARY="research-cli-linux-x64"
                ;;
            arm64|aarch64)
                BINARY="research-cli-linux-arm64"
                ;;
            *)
                echo "❌ Unsupported architecture: $ARCH"
                exit 1
                ;;
        esac
        ;;
    *)
        echo "❌ Unsupported OS: $OS"
        echo "Please download manually from: https://github.com/iechor-research/research-cli/releases/tag/${tagName}"
        exit 1
        ;;
esac

# 下载二进制文件
URL="https://github.com/iechor-research/research-cli/releases/download/${tagName}/$BINARY"
echo "📥 Downloading $BINARY..."

if command -v curl >/dev/null 2>&1; then
    curl -L -o research-cli "$URL"
elif command -v wget >/dev/null 2>&1; then
    wget -O research-cli "$URL"
else
    echo "❌ Neither curl nor wget found. Please install one of them."
    exit 1
fi

# 设置执行权限
chmod +x research-cli

echo "✅ Research CLI Native Wrapper installed successfully!"
echo "🏃 Run with: ./research-cli"
`;

  fs.writeFileSync(path.join(distDir, 'install.sh'), installScript);
  console.log(`   6. Optional: Upload install.sh for easy installation`);

  console.log(`\n🎉 Release preparation completed!`);
  console.log(`📁 Files ready in: ${distDir}`);
} catch (error) {
  console.error('❌ Release preparation failed:', error.message);
  process.exit(1);
}
