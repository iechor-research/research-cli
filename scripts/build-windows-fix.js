#!/usr/bin/env node

/**
 * Windows 构建修复脚本
 * 解决 macOS 上 Windows 交叉编译的库文件问题
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Windows Build Fix - Addressing Cross-Compilation Issues\n');

// 检测当前平台
const currentPlatform = process.platform;
const isWindows = currentPlatform === 'win32';
const isMacOS = currentPlatform === 'darwin';
const isLinux = currentPlatform === 'linux';

console.log(`📋 Current platform: ${currentPlatform}`);

// Windows 构建策略
const windowsBuildStrategies = {
  native: {
    name: 'Native Windows Build',
    condition: () => isWindows,
    command: 'cargo build --release --target x86_64-pc-windows-msvc',
    description: 'Build directly on Windows'
  },
  
  crossCompileWithFix: {
    name: 'Cross-compile with SDK Fix',
    condition: () => !isWindows,
    setup: async () => {
      console.log('🔍 Attempting to fix Windows SDK libraries...');
      
      // 检查是否安装了 xwin
      try {
        execSync('cargo install xwin --quiet', { stdio: 'pipe' });
        console.log('✅ xwin installed');
      } catch (error) {
        console.log('📥 Installing xwin for Windows SDK...');
        try {
          execSync('cargo install xwin', { stdio: 'inherit' });
        } catch (installError) {
          console.log('⚠️  Failed to install xwin, will skip Windows build');
          return false;
        }
      }
      
      // 尝试下载 Windows SDK
      try {
        console.log('📥 Downloading Windows SDK libraries...');
        const sdkDir = path.join(process.env.HOME || '/tmp', '.xwin');
        
        if (!fs.existsSync(sdkDir)) {
          execSync('xwin --accept-license splat --output ~/.xwin', { 
            stdio: 'inherit',
            timeout: 300000 // 5 分钟超时
          });
        }
        
        // 设置环境变量
        process.env.XWIN_ARCH = 'x86_64';
        process.env.XWIN_VARIANT = 'desktop';
        process.env.XWIN_CACHE_DIR = sdkDir;
        
        console.log('✅ Windows SDK setup completed');
        return true;
      } catch (error) {
        console.log('⚠️  Windows SDK setup failed, will use alternative method');
        return false;
      }
    },
    command: 'cargo build --release --target x86_64-pc-windows-msvc',
    description: 'Cross-compile with Windows SDK'
  },
  
  githubActions: {
    name: 'GitHub Actions Build',
    condition: () => !isWindows,
    setup: async () => {
      console.log('🚀 Recommending GitHub Actions for Windows build...');
      return true;
    },
    command: null,
    description: 'Use GitHub Actions for reliable Windows builds'
  }
};

// 执行 Windows 构建
async function buildWindows() {
  console.log('\n🔨 Starting Windows build process...\n');
  
  for (const [key, strategy] of Object.entries(windowsBuildStrategies)) {
    if (!strategy.condition()) {
      continue;
    }
    
    console.log(`📋 Trying strategy: ${strategy.name}`);
    console.log(`   📝 ${strategy.description}`);
    
    // 执行设置步骤
    if (strategy.setup) {
      const setupSuccess = await strategy.setup();
      if (!setupSuccess) {
        console.log(`❌ Setup failed for ${strategy.name}\n`);
        continue;
      }
    }
    
    // 执行构建命令
    if (strategy.command) {
      try {
        console.log(`🔧 Executing: ${strategy.command}`);
        
        // 切换到 src-tauri 目录
        process.chdir(path.join(__dirname, '..', 'src-tauri'));
        
        execSync(strategy.command, { 
          stdio: 'inherit',
          env: { ...process.env }
        });
        
        console.log(`✅ ${strategy.name} succeeded!\n`);
        return true;
        
      } catch (error) {
        console.log(`❌ ${strategy.name} failed: ${error.message}\n`);
        continue;
      }
    } else {
      // GitHub Actions 策略
      console.log('💡 For reliable Windows builds, use GitHub Actions:');
      console.log('   1. Push your code to GitHub');
      console.log('   2. The workflow will automatically build for Windows');
      console.log('   3. Download artifacts from the Actions tab');
      console.log('');
      console.log('🚀 To trigger a build now:');
      console.log('   git push origin main');
      console.log('');
      return false;
    }
  }
  
  console.log('❌ All Windows build strategies failed');
  console.log('');
  console.log('💡 Recommended solutions:');
  console.log('   1. Use GitHub Actions for Windows builds (most reliable)');
  console.log('   2. Build on a Windows machine');
  console.log('   3. Use Windows Subsystem for Linux (WSL) on Windows');
  console.log('');
  
  return false;
}

// 创建 Windows 构建配置
function createWindowsBuildConfig() {
  const cargoConfigDir = path.join(__dirname, '..', 'src-tauri', '.cargo');
  const configPath = path.join(cargoConfigDir, 'config.toml');
  
  if (!fs.existsSync(cargoConfigDir)) {
    fs.mkdirSync(cargoConfigDir, { recursive: true });
  }
  
  const config = `
# Windows cross-compilation configuration
[target.x86_64-pc-windows-msvc]
# Use lld linker for faster builds
linker = "lld-link"

# Alternative: use system linker
# linker = "x86_64-w64-mingw32-gcc"

[target.x86_64-pc-windows-gnu]
linker = "x86_64-w64-mingw32-gcc"
ar = "x86_64-w64-mingw32-ar"

# Environment variables for Windows builds
[env]
# Disable incremental compilation for cross-compilation
CARGO_INCREMENTAL = "0"
`;

  fs.writeFileSync(configPath, config.trim());
  console.log('✅ Created Cargo build configuration for Windows');
}

// 主函数
async function main() {
  // 创建构建配置
  createWindowsBuildConfig();
  
  // 尝试构建 Windows 版本
  const success = await buildWindows();
  
  if (success) {
    console.log('🎉 Windows build completed successfully!');
    
    // 检查生成的文件
    const targetDir = path.join(__dirname, '..', 'src-tauri', 'target', 'x86_64-pc-windows-msvc', 'release');
    const exePath = path.join(targetDir, 'research-cli.exe');
    
    if (fs.existsSync(exePath)) {
      const stats = fs.statSync(exePath);
      console.log(`📦 Generated: research-cli.exe (${Math.round(stats.size / 1024)}KB)`);
      
      // 复制到 dist-native
      const distDir = path.join(__dirname, '..', 'dist-native');
      const destPath = path.join(distDir, 'research-cli-win32-x64.exe');
      
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      
      fs.copyFileSync(exePath, destPath);
      console.log(`📁 Copied to: ${destPath}`);
    }
  } else {
    console.log('⚠️  Windows build not completed locally');
    console.log('💡 Use GitHub Actions for reliable Windows builds');
  }
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { buildWindows, createWindowsBuildConfig };