#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔨 Building Research CLI packages for all platforms...\n');

// 确保构建目录存在
const buildDirs = ['dist-pkg', 'dist-electron'];
buildDirs.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

async function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: rootDir,
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

async function buildPackages() {
  // 1. 构建项目
  await runCommand('npm run build', 'Building project');

  // 2. 使用 pkg 构建单文件可执行程序
  console.log('📦 Building standalone executables with pkg...');
  
  const pkgTargets = [
    'node18-linux-x64',
    'node18-macos-x64', 
    'node18-macos-arm64',
    'node18-win-x64'
  ];

  for (const target of pkgTargets) {
    const [, platform, arch] = target.split('-');
    const ext = platform === 'win' ? '.exe' : '';
    const outputName = `research-cli-${platform}-${arch}${ext}`;
    
    try {
      await runCommand(
        `npx pkg packages/cli/dist/index.js --target ${target} --output dist-pkg/${outputName}`,
        `Building ${outputName}`
      );
    } catch (error) {
      console.warn(`⚠️ Failed to build ${outputName}:`, error.message);
    }
  }

  // 3. 使用 electron-builder 构建桌面应用
  console.log('🖥️ Building desktop applications with Electron...');
  
  // 创建临时的 package.json 用于 Electron 应用
  const electronPackageJson = {
    name: "research-cli-desktop",
    version: "0.2.6",
    description: "Research CLI Desktop Application",
    main: "build/electron.config.js",
    scripts: {
      "electron": "electron .",
      "build": "electron-builder",
      "build:mac": "electron-builder --mac",
      "build:win": "electron-builder --win",
      "build:linux": "electron-builder --linux"
    },
    devDependencies: {
      "electron": "latest",
      "electron-builder": "latest"
    }
  };

  fs.writeFileSync(
    path.join(rootDir, 'package-electron.json'),
    JSON.stringify(electronPackageJson, null, 2)
  );

  // 根据当前平台构建对应的桌面应用
  const platform = process.platform;
  let buildCommand = 'npx electron-builder';
  
  if (platform === 'darwin') {
    buildCommand += ' --mac';
  } else if (platform === 'win32') {
    buildCommand += ' --win';
  } else {
    buildCommand += ' --linux';
  }

  try {
    await runCommand(
      `${buildCommand} --config build/electron-builder.config.js`,
      `Building Electron app for ${platform}`
    );
  } catch (error) {
    console.warn(`⚠️ Failed to build Electron app:`, error.message);
  }

  // 4. 创建发布信息文件
  const releaseInfo = {
    version: "0.2.6",
    buildDate: new Date().toISOString(),
    platforms: {
      standalone: {
        description: "Single executable files (no dependencies required)",
        files: fs.readdirSync(path.join(rootDir, 'dist-pkg')).map(file => ({
          name: file,
          platform: file.includes('linux') ? 'Linux' :
                   file.includes('macos') ? 'macOS' :
                   file.includes('win') ? 'Windows' : 'Unknown',
          arch: file.includes('x64') ? 'x64' :
                file.includes('arm64') ? 'ARM64' : 
                file.includes('ia32') ? 'x32' : 'Unknown'
        }))
      },
      desktop: {
        description: "Desktop applications with GUI",
        location: "dist-electron/"
      }
    },
    installation: {
      npm: "npm install -g @iechor/research-cli",
      standalone: "Download and run the executable for your platform",
      desktop: "Install the desktop application for your platform"
    }
  };

  fs.writeFileSync(
    path.join(rootDir, 'dist-pkg', 'release-info.json'),
    JSON.stringify(releaseInfo, null, 2)
  );

  console.log('🎉 Package building completed!');
  console.log('\n📋 Build Summary:');
  console.log('├── Standalone executables: dist-pkg/');
  console.log('├── Desktop applications: dist-electron/');
  console.log('└── Release info: dist-pkg/release-info.json');
  
  console.log('\n📦 Available packages:');
  try {
    const pkgFiles = fs.readdirSync(path.join(rootDir, 'dist-pkg'));
    pkgFiles.forEach(file => {
      if (file !== 'release-info.json') {
        console.log(`   • ${file}`);
      }
    });
  } catch (error) {
    console.log('   (No standalone packages built)');
  }

  try {
    const electronFiles = fs.readdirSync(path.join(rootDir, 'dist-electron'));
    electronFiles.forEach(file => {
      console.log(`   • dist-electron/${file}`);
    });
  } catch (error) {
    console.log('   (No desktop packages built)');
  }
}

// 运行构建
buildPackages().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
}); 