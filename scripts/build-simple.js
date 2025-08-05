#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Research CLI - Simplified Build');

// 1. 构建核心应用
console.log('🔨 Building core application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Core application built');
} catch (error) {
  console.log('❌ Core build failed');
  process.exit(1);
}

// 2. 构建原生二进制 (仅 macOS)
console.log('🔨 Building native binaries...');
try {
  const platform = process.platform;
  if (platform === 'darwin') {
    // 只构建当前平台
    execSync('cd src-tauri && cargo build --release', { stdio: 'inherit' });
    
    // 复制到 dist-native
    const targetDir = 'src-tauri/target/release';
    const distDir = 'dist-native';
    
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
    const binaryName = `research-cli-darwin-${arch}`;
    
    fs.copyFileSync(`${targetDir}/research-cli`, `${distDir}/${binaryName}`);
    execSync(`chmod +x ${distDir}/${binaryName}`);
    
    console.log(`✅ Native binary: ${binaryName}`);
  } else {
    console.log('⏭️  Skipping native build (not on macOS)');
  }
} catch (error) {
  console.log('⚠️  Native build failed, continuing...');
}

// 3. 构建 Tauri 应用 (仅 .app)
console.log('🔨 Building Tauri app...');
try {
  execSync('cd src-tauri && cargo tauri build --target app', { stdio: 'inherit' });
  console.log('✅ Tauri app built');
} catch (error) {
  console.log('⚠️  Tauri build failed, trying alternative...');
  try {
    execSync('cd src-tauri && cargo build --release', { stdio: 'inherit' });
    console.log('✅ Tauri binary built');
  } catch (altError) {
    console.log('❌ All Tauri builds failed');
  }
}

console.log('\n🎉 Simplified build completed!');
console.log('📁 Check dist-native/ for binaries');
console.log('📁 Check src-tauri/target/release/ for Tauri builds');
