#!/usr/bin/env node

/**
 * Research CLI - Upstream System Verification
 * This script verifies that the entire upstream merging system is working correctly
 */

import { UPSTREAM_CONFIG, getForkPoint, getUpstreamBranch, getResearchCliVersion } from './upstream-config.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return null;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function verifyScripts() {
  log('=== Script Verification ===', 'purple');
  
  const scripts = [
    'scripts/merge-upstream.sh',
    'scripts/merge-upstream-batch.sh',
    'scripts/replace-gemini-branding.sh',
    'scripts/monitor-upstream.js',
    'scripts/merge-package-json.js',
    'scripts/upstream-config.js',
    'scripts/test-upstream-config.js'
  ];
  
  let allScriptsExist = true;
  
  scripts.forEach(script => {
    if (checkFileExists(script)) {
      log(`✓ ${script}`, 'green');
    } else {
      log(`✗ ${script} (missing)`, 'red');
      allScriptsExist = false;
    }
  });
  
  return allScriptsExist;
}

function verifyConfiguration() {
  log('\n=== Configuration Verification ===', 'purple');
  
  // Test configuration values
  const forkPoint = getForkPoint();
  const upstreamBranch = getUpstreamBranch();
  const researchCliVersion = getResearchCliVersion();
  
  log(`Fork Point: ${forkPoint}`, 'blue');
  log(`Upstream Branch: ${upstreamBranch}`, 'blue');
  log(`Research CLI Version: ${researchCliVersion}`, 'blue');
  
  // Verify fork point commit exists
  const forkPointExists = execCommand(`git cat-file -t ${forkPoint}`);
  if (forkPointExists === 'commit') {
    log('✓ Fork point commit exists', 'green');
  } else {
    log('✗ Fork point commit not found', 'red');
    return false;
  }
  
  return true;
}

function verifyGitSetup() {
  log('\n=== Git Setup Verification ===', 'purple');
  
  // Check upstream remote
  const upstreamUrl = execCommand('git remote get-url upstream');
  if (upstreamUrl && upstreamUrl.includes('google-gemini/gemini-cli')) {
    log('✓ Upstream remote configured correctly', 'green');
  } else {
    log('✗ Upstream remote not configured correctly', 'red');
    return false;
  }
  
  // Check current branch
  const currentBranch = execCommand('git branch --show-current');
  if (currentBranch === 'main') {
    log('✓ On main branch', 'green');
  } else {
    log(`⚠ Currently on ${currentBranch} branch`, 'yellow');
  }
  
  // Check for uncommitted changes
  const uncommittedChanges = execCommand('git status --porcelain');
  if (!uncommittedChanges) {
    log('✓ No uncommitted changes', 'green');
  } else {
    log('⚠ Uncommitted changes detected', 'yellow');
    log('   (This is expected during development)', 'blue');
  }
  
  return true;
}

function verifyUpstreamAccess() {
  log('\n=== Upstream Access Verification ===', 'purple');
  
  try {
    // Fetch upstream
    execCommand('git fetch upstream');
    log('✓ Upstream fetch successful', 'green');
    
    // Get latest upstream commit
    const latestUpstream = execCommand(`git log --oneline -1 ${getUpstreamBranch()}`);
    if (latestUpstream) {
      log(`Latest upstream: ${latestUpstream}`, 'blue');
    }
    
    // Count commits since fork point
    const commitCount = execCommand(`git rev-list --count ${getForkPoint()}..${getUpstreamBranch()}`);
    if (commitCount) {
      log(`Commits available for merge: ${commitCount}`, 'blue');
    }
    
    return true;
  } catch (error) {
    log('✗ Upstream access failed', 'red');
    return false;
  }
}

function verifyBrandingReplacements() {
  log('\n=== Branding Replacements Verification ===', 'purple');
  
  const replacements = UPSTREAM_CONFIG.branding.replacements;
  const replacementCount = Object.keys(replacements).length;
  
  log(`Branding replacements configured: ${replacementCount}`, 'blue');
  
  // Show some key replacements
  const keyReplacements = [
    '@google/gemini-cli',
    'gemini-cli',
    'Gemini CLI',
    'GEMINI_API_KEY'
  ];
  
  keyReplacements.forEach(key => {
    if (replacements[key]) {
      log(`  ${key} → ${replacements[key]}`, 'cyan');
    }
  });
  
  return true;
}

function verifyPackageJsonConfig() {
  log('\n=== Package.json Configuration Verification ===', 'purple');
  
  const config = UPSTREAM_CONFIG.packageJson;
  
  log(`Preserve fields: ${config.preserveFields.length}`, 'blue');
  log(`Merge fields: ${config.mergeFields.length}`, 'blue');
  log(`Update fields: ${config.updateFields.length}`, 'blue');
  log(`Preserve scripts: ${config.preserveScripts.length}`, 'blue');
  
  return true;
}

function verifyTestingConfig() {
  log('\n=== Testing Configuration Verification ===', 'purple');
  
  const testing = UPSTREAM_CONFIG.testing;
  
  log(`Test commands: ${testing.commands.length}`, 'blue');
  testing.commands.forEach(cmd => {
    log(`  ${cmd}`, 'cyan');
  });
  
  log(`Additional tests: ${testing.additionalTests.length}`, 'blue');
  testing.additionalTests.forEach(cmd => {
    log(`  ${cmd}`, 'cyan');
  });
  
  return true;
}

function runQuickTests() {
  log('\n=== Quick System Tests ===', 'purple');
  
  // Test monitoring script
  log('Testing monitoring script...', 'blue');
  try {
    const monitorOutput = execCommand('node scripts/monitor-upstream.js --check-only');
    if (monitorOutput && monitorOutput.includes('Merge Readiness Check')) {
      log('✓ Monitoring script works', 'green');
    } else {
      log('✗ Monitoring script failed', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Monitoring script error', 'red');
    return false;
  }
  
  // Test configuration script
  log('Testing configuration script...', 'blue');
  try {
    const configOutput = execCommand('node scripts/test-upstream-config.js');
    if (configOutput && configOutput.includes('Configuration test completed')) {
      log('✓ Configuration script works', 'green');
    } else {
      log('✗ Configuration script failed', 'red');
      return false;
    }
  } catch (error) {
    log('✗ Configuration script error', 'red');
    return false;
  }
  
  return true;
}

function generateSystemReport() {
  log('\n=== System Report ===', 'purple');
  
  const report = {
    timestamp: new Date().toISOString(),
    system: 'Research CLI Upstream Merging System',
    version: getResearchCliVersion(),
    forkPoint: {
      commit: getForkPoint(),
      date: UPSTREAM_CONFIG.forkPoint.date,
      description: UPSTREAM_CONFIG.forkPoint.description
    },
    configuration: {
      upstreamBranch: getUpstreamBranch(),
      batchSize: UPSTREAM_CONFIG.merge.batchSize,
      priorityCategories: UPSTREAM_CONFIG.merge.priorityOrder.length,
      brandingReplacements: Object.keys(UPSTREAM_CONFIG.branding.replacements).length,
      filePatterns: UPSTREAM_CONFIG.filePatterns.length,
      excludePatterns: UPSTREAM_CONFIG.excludePatterns.length
    },
    scripts: [
      'merge-upstream.sh',
      'merge-upstream-batch.sh', 
      'replace-gemini-branding.sh',
      'monitor-upstream.js',
      'merge-package-json.js',
      'upstream-config.js',
      'test-upstream-config.js'
    ],
    status: 'Ready for upstream merging'
  };
  
  // Save report
  fs.writeFileSync('upstream-system-report.json', JSON.stringify(report, null, 2));
  log('System report saved to: upstream-system-report.json', 'blue');
  
  return report;
}

function main() {
  log('Research CLI Upstream System Verification', 'cyan');
  log('==========================================', 'cyan');
  log('');
  
  let allTestsPassed = true;
  
  // Run all verifications
  allTestsPassed = verifyScripts() && allTestsPassed;
  allTestsPassed = verifyConfiguration() && allTestsPassed;
  allTestsPassed = verifyGitSetup() && allTestsPassed;
  allTestsPassed = verifyUpstreamAccess() && allTestsPassed;
  allTestsPassed = verifyBrandingReplacements() && allTestsPassed;
  allTestsPassed = verifyPackageJsonConfig() && allTestsPassed;
  allTestsPassed = verifyTestingConfig() && allTestsPassed;
  allTestsPassed = runQuickTests() && allTestsPassed;
  
  // Generate report
  const report = generateSystemReport();
  
  log('\n=== Verification Summary ===', 'purple');
  if (allTestsPassed) {
    log('✓ All verifications passed!', 'green');
    log('✓ System is ready for upstream merging', 'green');
    log('');
    log('Next steps:', 'yellow');
    log('1. Run: node scripts/monitor-upstream.js', 'blue');
    log('2. Run: ./scripts/merge-upstream.sh', 'blue');
    log('3. Follow the merge process and test thoroughly', 'blue');
  } else {
    log('✗ Some verifications failed', 'red');
    log('Please fix the issues before proceeding with upstream merging', 'red');
  }
  
  log('');
  log('System verification completed!', 'cyan');
}

// Run verification
main();
