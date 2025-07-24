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
  `🚀 Creating GitHub Release for Research CLI Native Wrapper v${version}\n`,
);

try {
  // 1. 构建原生包装器
  console.log('📦 Building native wrapper...');
  execSync('npm run build:native', { stdio: 'inherit' });

  // 2. 创建Git标签
  console.log(`\n🏷️  Creating git tag: ${tagName}`);
  try {
    execSync(`git tag -d ${tagName}`, { stdio: 'pipe' }); // 删除已存在的标签
  } catch (e) {
    // 忽略错误，标签可能不存在
  }
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });

  // 3. 推送标签
  console.log('📤 Pushing tag to GitHub...');
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });

  // 4. 创建发布说明
  const releaseNotes = `# Research CLI Native Wrapper v${version}

## 🎯 What's New

This is a **native wrapper** for Research CLI that provides the **original terminal experience** with minimal overhead.

## ✨ Key Features

- **🚀 Ultra-lightweight**: Only 431KB (99% smaller than previous packaging attempts)
- **⚡ Lightning fast**: Direct process execution, no web interface overhead  
- **🖥️ Native experience**: Full terminal compatibility with stdin/stdout/stderr
- **🔧 Zero dependencies**: Pure Rust wrapper, no Node.js bundling
- **📱 Cross-platform**: Supports macOS, Windows, and Linux

## 📦 Downloads

| Platform | Architecture | Download | Size |
|----------|-------------|----------|------|
| macOS | ARM64 (M1/M2) | \`research-cli-darwin-arm64\` | 431KB |
| macOS | x64 (Intel) | \`research-cli-darwin-x64\` | ~450KB |
| Windows | x64 | \`research-cli-win32-x64.exe\` | ~400KB |
| Linux | x64 | \`research-cli-linux-x64\` | ~420KB |

## 🛠️ Installation

1. Download the appropriate binary for your platform
2. Make it executable (Unix/Linux/macOS):
   \`\`\`bash
   chmod +x research-cli-darwin-arm64
   \`\`\`
3. Run it:
   \`\`\`bash
   ./research-cli-darwin-arm64
   \`\`\`

## 📋 Requirements

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

Built: ${new Date().toISOString()}
`;

  // 5. 检查dist-native目录中的文件
  const distDir = path.join(__dirname, '..', 'dist-native');
  const files = fs
    .readdirSync(distDir)
    .filter((f) => !f.endsWith('.json') && f !== 'README.md');

  console.log(`\n📁 Release assets:`);
  files.forEach((file) => {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   - ${file} (${sizeKB}KB)`);
  });

  // 6. 创建发布说明文件
  fs.writeFileSync(path.join(distDir, 'RELEASE_NOTES.md'), releaseNotes);

  console.log(`\n✅ Release preparation completed!`);
  console.log(`\n📋 Next steps:`);
  console.log(
    `   1. Go to: https://github.com/iechor-research/research-cli/releases/new`,
  );
  console.log(`   2. Select tag: ${tagName}`);
  console.log(`   3. Upload files from: dist-native/`);
  console.log(`   4. Copy release notes from: dist-native/RELEASE_NOTES.md`);
  console.log(`   5. Publish the release`);
} catch (error) {
  console.error('❌ Release creation failed:', error.message);
  process.exit(1);
}
