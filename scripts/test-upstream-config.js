#!/usr/bin/env node

/**
 * Research CLI - Test Upstream Configuration
 * This script tests the upstream configuration and shows current status
 */

import { UPSTREAM_CONFIG, getForkPoint, getUpstreamBranch, getResearchCliVersion } from './upstream-config.js';
import { execSync } from 'child_process';

// Colors for output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
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

function testConfiguration() {
  log('=== Research CLI Upstream Configuration Test ===', 'blue');
  log('');
  
  // Test configuration values
  log('Configuration Values:', 'yellow');
  log(`Fork Point: ${getForkPoint()}`, 'blue');
  log(`Upstream Branch: ${getUpstreamBranch()}`, 'blue');
  log(`Research CLI Version: ${getResearchCliVersion()}`, 'blue');
  log('');
  
  // Test git configuration
  log('Git Configuration:', 'yellow');
  
  // Check if upstream remote exists
  const upstreamUrl = execCommand('git remote get-url upstream');
  if (upstreamUrl) {
    log(`✓ Upstream remote: ${upstreamUrl}`, 'green');
  } else {
    log('✗ Upstream remote not found', 'red');
  }
  
  // Check if fork point commit exists
  const forkPointExists = execCommand(`git cat-file -t ${getForkPoint()}`);
  if (forkPointExists === 'commit') {
    log(`✓ Fork point commit exists: ${getForkPoint()}`, 'green');
    
    // Get commit details
    const commitDetails = execCommand(`git log --oneline -1 ${getForkPoint()}`);
    if (commitDetails) {
      log(`  ${commitDetails}`, 'blue');
    }
  } else {
    log(`✗ Fork point commit not found: ${getForkPoint()}`, 'red');
  }
  
  // Check current branch
  const currentBranch = execCommand('git branch --show-current');
  if (currentBranch) {
    log(`✓ Current branch: ${currentBranch}`, 'green');
  }
  
  log('');
  
  // Test upstream fetch
  log('Testing Upstream Fetch:', 'yellow');
  try {
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
      log(`Commits since fork point: ${commitCount}`, 'blue');
    }
    
  } catch (error) {
    log('✗ Upstream fetch failed', 'red');
  }
  
  log('');
  
  // Show configuration summary
  log('Configuration Summary:', 'yellow');
  log(`Fork Date: ${UPSTREAM_CONFIG.forkPoint.date}`, 'blue');
  log(`Fork Description: ${UPSTREAM_CONFIG.forkPoint.description}`, 'blue');
  log(`Batch Size: ${UPSTREAM_CONFIG.merge.batchSize}`, 'blue');
  log(`Priority Categories: ${UPSTREAM_CONFIG.merge.priorityOrder.length}`, 'blue');
  log(`Branding Replacements: ${Object.keys(UPSTREAM_CONFIG.branding.replacements).length}`, 'blue');
  log(`File Patterns: ${UPSTREAM_CONFIG.filePatterns.length}`, 'blue');
  log(`Exclude Patterns: ${UPSTREAM_CONFIG.excludePatterns.length}`, 'blue');
  
  log('');
  log('Configuration test completed!', 'green');
}

// Run the test
testConfiguration();
