#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Release Script for Research CLI
 * 
 * Handles version bumping, tagging, and triggering cross-platform builds
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // patch, minor, major, or specific version like "1.2.3"

console.log('🚀 Research CLI Release Process');
console.log(`📦 Version type: ${versionType}`);

// Step 1: Ensure clean working directory
console.log('\n🔍 Checking working directory...');
try {
  const status = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' });
  if (status.trim()) {
    console.error('❌ Working directory is not clean. Please commit or stash changes first.');
    console.log('Uncommitted changes:');
    console.log(status);
    process.exit(1);
  }
  console.log('✅ Working directory is clean');
} catch (error) {
  console.error('❌ Failed to check git status:', error.message);
  process.exit(1);
}

// Step 2: Update version in package.json files
console.log('\n📝 Updating version...');
let newVersion;

try {
  if (versionType.match(/^\d+\.\d+\.\d+/)) {
    // Specific version provided
    newVersion = versionType;
    updatePackageVersion(join(rootDir, 'package.json'), newVersion);
    updatePackageVersion(join(rootDir, 'packages', 'cli', 'package.json'), newVersion);
    updatePackageVersion(join(rootDir, 'packages', 'core', 'package.json'), newVersion);
  } else {
    // Use npm version to bump
    execSync(`npm version ${versionType} --no-git-tag-version`, { cwd: rootDir, stdio: 'inherit' });
    
    // Get the new version
    const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
    newVersion = packageJson.version;
    
    // Update other package.json files
    updatePackageVersion(join(rootDir, 'packages', 'cli', 'package.json'), newVersion);
    updatePackageVersion(join(rootDir, 'packages', 'core', 'package.json'), newVersion);
  }
  
  console.log(`✅ Version updated to: ${newVersion}`);
} catch (error) {
  console.error('❌ Failed to update version:', error.message);
  process.exit(1);
}

// Step 3: Build and test
console.log('\n🔨 Building project...');
try {
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('\n🧪 Running tests...');
try {
  execSync('npm test', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Tests passed');
} catch (error) {
  console.warn('⚠️  Tests failed, but continuing with release...');
}

// Step 4: Commit changes
console.log('\n💾 Committing changes...');
try {
  execSync('git add .', { cwd: rootDir });
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, { cwd: rootDir });
  console.log('✅ Changes committed');
} catch (error) {
  console.error('❌ Failed to commit changes:', error.message);
  process.exit(1);
}

// Step 5: Create and push tag
console.log('\n🏷️  Creating tag...');
const tagName = `v${newVersion}`;
try {
  execSync(`git tag -a ${tagName} -m "Release ${tagName}"`, { cwd: rootDir });
  console.log(`✅ Tag ${tagName} created`);
} catch (error) {
  console.error('❌ Failed to create tag:', error.message);
  process.exit(1);
}

// Step 6: Push to remote
console.log('\n📤 Pushing to remote...');
try {
  execSync('git push origin main', { cwd: rootDir, stdio: 'inherit' });
  execSync(`git push origin ${tagName}`, { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Pushed to remote');
} catch (error) {
  console.error('❌ Failed to push to remote:', error.message);
  console.log('💡 You may need to push manually:');
  console.log(`   git push origin main`);
  console.log(`   git push origin ${tagName}`);
  process.exit(1);
}

// Step 7: Trigger cross-platform build (if GitHub Actions is available)
console.log('\n🤖 Triggering cross-platform builds...');
try {
  // Check if we can trigger GitHub Actions
  const repoInfo = execSync('git remote get-url origin', { cwd: rootDir, encoding: 'utf8' }).trim();
  console.log(`📡 Repository: ${repoInfo}`);
  
  if (repoInfo.includes('github.com')) {
    console.log('✅ GitHub repository detected - cross-platform builds will start automatically');
    console.log(`🔗 Check progress at: ${repoInfo.replace('.git', '')}/actions`);
  } else {
    console.log('⚠️  Not a GitHub repository - you may need to trigger builds manually');
  }
} catch (error) {
  console.warn('⚠️  Could not determine repository info');
}

// Step 8: Show success message and next steps
console.log('\n🎉 Release process completed successfully!');
console.log(`\n📋 Release Summary:`);
console.log(`   Version: ${newVersion}`);
console.log(`   Tag: ${tagName}`);
console.log(`   Commit: ${execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf8' }).trim().substring(0, 7)}`);

console.log(`\n📖 Next Steps:`);
console.log(`1. 🔍 Monitor GitHub Actions for cross-platform builds`);
console.log(`2. 📦 Review generated packages in the GitHub release`);
console.log(`3. 🧪 Test packages on different platforms`);
console.log(`4. 📢 Announce the release`);

console.log(`\n🔗 Useful Links:`);
if (repoInfo.includes('github.com')) {
  const repoUrl = repoInfo.replace('.git', '');
  console.log(`   📦 Release: ${repoUrl}/releases/tag/${tagName}`);
  console.log(`   🤖 Actions: ${repoUrl}/actions`);
  console.log(`   📊 Insights: ${repoUrl}/pulse`);
}

/**
 * Update version in a package.json file
 */
function updatePackageVersion(packagePath, version) {
  try {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    packageJson.version = version;
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`  ✅ Updated ${packagePath}`);
  } catch (error) {
    console.warn(`  ⚠️  Failed to update ${packagePath}:`, error.message);
  }
}
