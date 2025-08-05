#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Generating Research CLI Icons...\n');

// 图标尺寸配置
const iconSizes = [
  { size: 16, name: '16x16.png' },
  { size: 32, name: '32x32.png' },
  { size: 64, name: '64x64.png' },
  { size: 128, name: '128x128.png' },
  { size: 128, name: '128x128@2x.png' }, // 实际是256x256但命名为@2x
  { size: 256, name: '256x256.png' },
  { size: 512, name: '512x512.png' },
  { size: 1024, name: '1024x1024.png' },
  { size: 512, name: 'icon.png' }, // 默认图标
];

const buildDir = path.join(__dirname, '..', 'build');
const iconsDir = path.join(buildDir, 'icons');
const svgFile = path.join(iconsDir, 'research-cli-icon.svg');

// 确保目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 检查 SVG 文件是否存在
if (!fs.existsSync(svgFile)) {
  console.error('❌ SVG source file not found:', svgFile);
  process.exit(1);
}

// 生成 PNG 图标的函数
function generatePNG(size, outputName) {
  const outputPath = path.join(iconsDir, outputName);
  
  try {
    // 使用不同的工具尝试转换
    let converted = false;
    
    // 尝试使用 librsvg (rsvg-convert)
    try {
      execSync(`rsvg-convert -w ${size} -h ${size} "${svgFile}" -o "${outputPath}"`, { stdio: 'pipe' });
      converted = true;
      console.log(`✅ Generated ${outputName} (${size}x${size}) using rsvg-convert`);
    } catch (e) {
      // rsvg-convert 不可用，尝试其他方法
    }
    
    // 尝试使用 ImageMagick
    if (!converted) {
      try {
        execSync(`magick convert -background transparent -size ${size}x${size} "${svgFile}" "${outputPath}"`, { stdio: 'pipe' });
        converted = true;
        console.log(`✅ Generated ${outputName} (${size}x${size}) using ImageMagick`);
      } catch (e) {
        // ImageMagick 不可用
      }
    }
    
    // 尝试使用 Inkscape
    if (!converted) {
      try {
        execSync(`inkscape -w ${size} -h ${size} "${svgFile}" -o "${outputPath}"`, { stdio: 'pipe' });
        converted = true;
        console.log(`✅ Generated ${outputName} (${size}x${size}) using Inkscape`);
      } catch (e) {
        // Inkscape 不可用
      }
    }
    
    if (!converted) {
      console.log(`⚠️  Could not generate ${outputName} - no suitable converter found`);
      // 创建一个占位符文件
      const placeholderContent = `# Placeholder for ${outputName} (${size}x${size})
# This should be replaced with actual PNG icon
# Original SVG: ${svgFile}
# Required size: ${size}x${size} pixels
# 
# To generate this icon, install one of:
# - librsvg-bin (rsvg-convert)
# - imagemagick (magick convert)  
# - inkscape
#
# Then run: npm run generate:icons`;
      
      fs.writeFileSync(outputPath, placeholderContent);
      console.log(`📝 Created placeholder for ${outputName}`);
    }
    
  } catch (error) {
    console.error(`❌ Failed to generate ${outputName}:`, error.message);
  }
}

// 生成所有尺寸的图标
console.log('📦 Generating PNG icons from SVG...\n');

for (const { size, name } of iconSizes) {
  // 对于 @2x 版本，实际使用双倍尺寸
  const actualSize = name.includes('@2x') ? size * 2 : size;
  generatePNG(actualSize, name);
}

// 生成 ICO 文件 (Windows)
console.log('\n🖥️  Generating Windows ICO file...');
const icoPath = path.join(iconsDir, 'icon.ico');

try {
  // 尝试使用 ImageMagick 生成 ICO
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const icoInputs = icoSizes.map(size => {
    const pngPath = path.join(iconsDir, `${size}x${size}.png`);
    return fs.existsSync(pngPath) ? `"${pngPath}"` : null;
  }).filter(Boolean);
  
  if (icoInputs.length > 0) {
    try {
      execSync(`magick convert ${icoInputs.join(' ')} "${icoPath}"`, { stdio: 'pipe' });
      console.log('✅ Generated icon.ico using ImageMagick');
    } catch (e) {
      console.log('⚠️  Could not generate ICO file - ImageMagick not available');
      fs.writeFileSync(icoPath, '# Placeholder for Windows ICO file\n# Install ImageMagick to generate this file');
    }
  } else {
    console.log('⚠️  No PNG files available for ICO generation');
    fs.writeFileSync(icoPath, '# Placeholder for Windows ICO file');
  }
} catch (error) {
  console.error('❌ Failed to generate ICO file:', error.message);
}

// 生成 ICNS 文件 (macOS)
console.log('\n🍎 Generating macOS ICNS file...');
const icnsPath = path.join(iconsDir, 'icon.icns');

try {
  // 创建 iconset 目录
  const iconsetDir = path.join(iconsDir, 'icon.iconset');
  if (fs.existsSync(iconsetDir)) {
    fs.rmSync(iconsetDir, { recursive: true });
  }
  fs.mkdirSync(iconsetDir);
  
  // macOS iconset 需要特定的文件名
  const macOSIcons = [
    { src: '16x16.png', dest: 'icon_16x16.png' },
    { src: '32x32.png', dest: 'icon_16x16@2x.png' },
    { src: '32x32.png', dest: 'icon_32x32.png' },
    { src: '64x64.png', dest: 'icon_32x32@2x.png' },
    { src: '128x128.png', dest: 'icon_128x128.png' },
    { src: '256x256.png', dest: 'icon_128x128@2x.png' },
    { src: '256x256.png', dest: 'icon_256x256.png' },
    { src: '512x512.png', dest: 'icon_256x256@2x.png' },
    { src: '512x512.png', dest: 'icon_512x512.png' },
    { src: '1024x1024.png', dest: 'icon_512x512@2x.png' },
  ];
  
  let copiedFiles = 0;
  for (const { src, dest } of macOSIcons) {
    const srcPath = path.join(iconsDir, src);
    const destPath = path.join(iconsetDir, dest);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      copiedFiles++;
    }
  }
  
  if (copiedFiles > 0) {
    try {
      execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`, { stdio: 'pipe' });
      console.log('✅ Generated icon.icns using iconutil');
      
      // 清理 iconset 目录
      fs.rmSync(iconsetDir, { recursive: true });
    } catch (e) {
      console.log('⚠️  Could not generate ICNS file - iconutil not available (macOS only)');
      fs.writeFileSync(icnsPath, '# Placeholder for macOS ICNS file\n# Use iconutil on macOS to generate this file');
    }
  } else {
    console.log('⚠️  No PNG files available for ICNS generation');
    fs.writeFileSync(icnsPath, '# Placeholder for macOS ICNS file');
  }
} catch (error) {
  console.error('❌ Failed to generate ICNS file:', error.message);
}

// 显示摘要
console.log('\n📋 Icon Generation Summary:');
console.log('==========================');

const generatedFiles = fs.readdirSync(iconsDir);
const pngFiles = generatedFiles.filter(f => f.endsWith('.png'));
const vectorFiles = generatedFiles.filter(f => f.endsWith('.svg'));
const iconFiles = generatedFiles.filter(f => f.endsWith('.ico') || f.endsWith('.icns'));

console.log(`📁 Icons directory: ${iconsDir}`);
console.log(`🖼️  PNG files: ${pngFiles.length}`);
console.log(`📐 SVG files: ${vectorFiles.length}`);
console.log(`🖥️  Platform icons: ${iconFiles.length}`);

console.log('\n📦 Generated files:');
generatedFiles.forEach(file => {
  const filePath = path.join(iconsDir, file);
  const stats = fs.statSync(filePath);
  const size = stats.size > 1024 ? `${Math.round(stats.size / 1024)}KB` : `${stats.size}B`;
  console.log(`   ${file} (${size})`);
});

console.log('\n💡 Tips:');
console.log('   • Install rsvg-convert, ImageMagick, or Inkscape for better PNG generation');
console.log('   • Run this script again after installing converters to regenerate icons');
console.log('   • Icons are automatically used by Tauri and Electron builders');

console.log('\n🎉 Icon generation completed!');