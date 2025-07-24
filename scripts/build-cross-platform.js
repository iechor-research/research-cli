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
  {
    rust: 'x86_64-apple-darwin',
    platform: 'darwin',
    arch: 'x64',
    name: 'macOS Intel',
  },
  {
    rust: 'aarch64-apple-darwin',
    platform: 'darwin',
    arch: 'arm64',
    name: 'macOS Apple Silicon',
  },
  {
    rust: 'x86_64-pc-windows-msvc',
    platform: 'win32',
    arch: 'x64',
    name: 'Windows x64',
    ext: '.exe',
  },
  {
    rust: 'x86_64-unknown-linux-musl',
    platform: 'linux',
    arch: 'x64',
    name: 'Linux x64',
  },
  {
    rust: 'aarch64-unknown-linux-musl',
    platform: 'linux',
    arch: 'arm64',
    name: 'Linux ARM64',
  },
];

// 读取package.json获取版本
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'),
);
const version = packageJson.version;

console.log(
  `📦 Building version ${version} for ${targets.length} platforms...\n`,
);

// 检查平台兼容性
function checkPlatformCompatibility(target) {
  const currentPlatform = process.platform;

  // macOS可以构建macOS目标
  if (currentPlatform === 'darwin' && target.rust.includes('apple-darwin')) {
    return { canBuild: true, reason: 'Native platform' };
  }

  // Linux可以构建Linux目标
  if (currentPlatform === 'linux' && target.rust.includes('linux')) {
    return { canBuild: true, reason: 'Native platform' };
  }

  // Windows可以构建Windows目标
  if (currentPlatform === 'win32' && target.rust.includes('windows')) {
    return { canBuild: true, reason: 'Native platform' };
  }

  // 交叉编译检查
  if (currentPlatform === 'darwin') {
    if (target.rust.includes('windows-gnu')) {
      return {
        canBuild: false,
        reason: 'Windows GNU toolchain not available on macOS',
      };
    }
    if (target.rust.includes('linux-musl')) {
      return {
        canBuild: false,
        reason: 'Linux musl toolchain requires proper linker setup',
      };
    }
  }

  return { canBuild: true, reason: 'Cross-compilation attempt' };
}

const buildResults = [];

for (const target of targets) {
  const targetName = `research-cli-${target.platform}-${target.arch}${target.ext || ''}`;

  console.log(`🔨 Building ${target.name} (${target.rust})...`);

  // 检查平台兼容性
  const compatibility = checkPlatformCompatibility(target);
  if (!compatibility.canBuild) {
    console.log(`⏭️  Skipping ${target.name}: ${compatibility.reason}`);
    buildResults.push({
      platform: target.name,
      file: targetName,
      size: 0,
      success: false,
      error: `Skipped: ${compatibility.reason}`,
      skipped: true,
    });
    console.log(''); // 空行分隔
    continue;
  }

  try {
    // 安装目标平台工具链（如果需要）
    try {
      console.log(`   📥 Installing target ${target.rust}...`);
      execSync(`rustup target add ${target.rust}`, {
        stdio: 'pipe',
        cwd: path.join(__dirname, '..', 'src-tauri'),
      });
    } catch (e) {
      // 目标可能已经安装，忽略错误
    }

    // 设置特定的环境变量和构建配置
    const buildEnv = { ...process.env };

    if (target.rust.includes('windows-msvc')) {
      // Windows MSVC构建配置
      buildEnv.CARGO_TARGET_X86_64_PC_WINDOWS_MSVC_LINKER = 'lld-link';
    } else if (target.rust.includes('linux-musl')) {
      // Linux musl构建配置
      if (target.rust.includes('aarch64')) {
        buildEnv.CC_aarch64_unknown_linux_musl = 'aarch64-linux-gnu-gcc';
        buildEnv.CARGO_TARGET_AARCH64_UNKNOWN_LINUX_MUSL_LINKER =
          'aarch64-linux-gnu-gcc';
      }
    }

    // 构建目标平台
    console.log(`   🔧 Compiling for ${target.rust}...`);
    execSync(`cargo build --release --target ${target.rust}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', 'src-tauri'),
      env: buildEnv,
    });

    // 确定源文件路径
    const binaryName = target.ext
      ? `research-cli${target.ext}`
      : 'research-cli';
    const sourcePath = path.join(
      __dirname,
      '..',
      'src-tauri',
      'target',
      target.rust,
      'release',
      binaryName,
    );
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
      description: `Native wrapper for Research CLI - ${target.name}`,
    };

    fs.writeFileSync(
      path.join(distDir, `${targetName}.json`),
      JSON.stringify(releaseInfo, null, 2),
    );

    buildResults.push({
      platform: target.name,
      file: targetName,
      size: fileSizeInKB,
      success: true,
    });
  } catch (error) {
    console.error(`❌ Failed to build ${target.name}: ${error.message}`);

    // 提供更具体的错误信息和建议
    let suggestion = '';
    if (error.message.includes('linker') && target.rust.includes('windows')) {
      suggestion =
        '\n   💡 Try installing Visual Studio Build Tools or use GitHub Actions for Windows builds';
    } else if (
      error.message.includes('linker') &&
      target.rust.includes('linux')
    ) {
      suggestion =
        '\n   💡 Try installing cross-compilation tools or use GitHub Actions for Linux builds';
    }

    buildResults.push({
      platform: target.name,
      file: targetName,
      size: 0,
      success: false,
      error: error.message + suggestion,
    });
  }

  console.log(''); // 空行分隔
}

// 构建Node.js包
console.log('📦 Building Node.js package...');
try {
  execSync('npm run build', { stdio: 'inherit' });

  // 创建包结构
  const nodePackageDir = path.join(distDir, 'node-package');
  if (fs.existsSync(nodePackageDir)) {
    fs.rmSync(nodePackageDir, { recursive: true });
  }
  fs.mkdirSync(nodePackageDir, { recursive: true });

  // 复制整个构建好的项目（包括node_modules）
  const projectRoot = path.join(__dirname, '..');

  // 复制必要的文件和目录
  const itemsToCopy = [
    'dist',
    'packages',
    'node_modules',
    'package.json',
    'package-lock.json',
  ];

  for (const item of itemsToCopy) {
    const srcPath = path.join(projectRoot, item);
    const destPath = path.join(nodePackageDir, item);

    if (fs.existsSync(srcPath)) {
      console.log(`📁 Copying ${item}...`);
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      console.log(`⚠️  ${item} not found, skipping...`);
    }
  }

  // 创建tarball
  execSync('tar -czf research-cli-node.tar.gz -C node-package .', {
    cwd: distDir,
    stdio: 'inherit',
  });

  console.log('✅ Node.js package created');
} catch (error) {
  console.error('❌ Failed to build Node.js package:', error.message);
}

// 创建跨平台README
const successfulBuilds = buildResults.filter((r) => r.success);
const failedBuilds = buildResults.filter((r) => !r.success && !r.skipped);
const skippedBuilds = buildResults.filter((r) => r.skipped);

const crossPlatformReadme = `# Research CLI Native Wrapper - Cross Platform

## 📦 Available Downloads

| Platform | Architecture | Download | Size | Status |
|----------|-------------|----------|------|--------|
${buildResults
  .map((result) => {
    let status;
    if (result.success) {
      status = '✅ Ready';
    } else if (result.skipped) {
      status = '⏭️ Skipped';
    } else {
      status = '❌ Failed';
    }
    const size = result.success ? result.size + 'KB' : 'N/A';
    return `| ${result.platform} | | \`${result.file}\` | ${size} | ${status} |`;
  })
  .join('\n')}

## 🛠️ Installation Instructions

### One-line installer (all platforms)
\`\`\`bash
curl -sSL https://github.com/iechor-research/research-cli/releases/download/v${version}-native/install-complete.sh | bash
\`\`\`

### Manual Installation

#### macOS
\`\`\`bash
# Intel Macs
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v${version}-native/research-cli-darwin-x64
chmod +x research-cli

# Apple Silicon (M1/M2/M3)
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v${version}-native/research-cli-darwin-arm64
chmod +x research-cli
\`\`\`

#### Windows
\`\`\`powershell
# Download and run
Invoke-WebRequest -Uri "https://github.com/iechor-research/research-cli/releases/download/v${version}-native/research-cli-win32-x64.exe" -OutFile "research-cli.exe"
.\\research-cli.exe
\`\`\`

#### Linux
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

## 🔧 Build Information

Built: ${new Date().toISOString()}
Version: ${version}

### Build Results
- ✅ Successful builds: ${successfulBuilds.length}
- ❌ Failed builds: ${failedBuilds.length}
- ⏭️ Skipped builds: ${skippedBuilds.length}

${
  failedBuilds.length > 0
    ? `
### Failed Builds
${failedBuilds.map((build) => `- **${build.platform}**: ${build.error}`).join('\n')}

💡 **Note**: Failed builds are normal when cross-compilation tools aren't available.
For complete cross-platform builds, use GitHub Actions or build on each target platform.
`
    : ''
}

### Recommendations
- For production releases, use GitHub Actions to build on native platforms
- For local development, the available builds should be sufficient
- Users can always use the complete installer which handles platform detection
`;

fs.writeFileSync(
  path.join(distDir, 'README-CROSS-PLATFORM.md'),
  crossPlatformReadme,
);

// 显示构建摘要
console.log('📋 Build Summary:');
console.log('================');
buildResults.forEach((result) => {
  if (result.success) {
    console.log(`✅ ${result.platform}: ${result.file} (${result.size}KB)`);
  } else if (result.skipped) {
    console.log(`⏭️  ${result.platform}: ${result.file} (skipped)`);
  } else {
    console.log(`❌ ${result.platform}: ${result.file}`);
  }
});

console.log(
  `\n🎉 Successfully built ${successfulBuilds.length}/${targets.length} platforms`,
);

console.log(`\n📁 All files available in: ${distDir}`);
console.log('📄 Cross-platform guide: README-CROSS-PLATFORM.md');

if (failedBuilds.length > 0 || skippedBuilds.length > 0) {
  console.log(
    "\n⚠️  Some builds failed or were skipped. This is normal if you don't have all cross-compilation tools installed.",
  );
  console.log(
    '   For complete cross-platform builds, use GitHub Actions or build on each target platform.',
  );
  console.log('\n💡 To trigger a complete GitHub Actions build:');
  console.log('   npm run github:build');
}
