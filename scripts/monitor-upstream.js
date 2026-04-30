#!/usr/bin/env node

/**
 * Research CLI - Upstream Monitoring Script
 * This script monitors upstream Gemini CLI for updates and provides recommendations
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { UPSTREAM_CONFIG } from './upstream-config.js';
import { getForkPoint, getUpstreamBranch, getResearchCliVersion, getPathCategories } from './upstream-config.js';

// Configuration
const UPSTREAM_BRANCH = getUpstreamBranch();
const RESEARCH_CLI_VERSION = getResearchCliVersion();
const FORK_POINT_COMMIT = getForkPoint();
const FORK_POINT_DATE = UPSTREAM_CONFIG.forkPoint.date;
const PATH_CATEGORIES = getPathCategories();

// CLI flags (parsed once so helpers can consult them)
const CLI_ARGS = process.argv.slice(2);
const CI_MODE = CLI_ARGS.includes('--ci');
const SKIP_FETCH = CLI_ARGS.includes('--skip-fetch');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, { allowFailure = true } = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    if (!allowFailure) {
      const stderr = error.stderr ? error.stderr.toString() : '';
      throw new Error(`Command failed: ${command}\n${stderr || error.message}`);
    }
    return null;
  }
}

function ensureUpstreamRemote() {
  const url = execCommand('git remote get-url upstream');
  if (!url) {
    log('Adding missing "upstream" git remote', 'yellow');
    execCommand('git remote add upstream https://github.com/google-gemini/gemini-cli.git', { allowFailure: false });
  }
}

function fetchUpstream() {
  if (SKIP_FETCH) {
    log('--skip-fetch set, not contacting upstream', 'yellow');
    return;
  }
  ensureUpstreamRemote();
  log('Fetching latest upstream/main...', 'blue');
  // Use --no-tags to keep the local namespace clean; explicit error if it fails.
  execCommand('git fetch --no-tags upstream main', { allowFailure: false });
}

function categorizeByPath(commits) {
  const buckets = Object.fromEntries(PATH_CATEGORIES.map((c) => [c.name, []]));
  buckets.other = [];
  for (const commit of commits) {
    const sha = commit.split(' ', 1)[0];
    const filesOutput = execCommand(`git show --no-renames --name-only --pretty=format: ${sha}`) || '';
    const files = filesOutput.split('\n').filter((f) => f.trim());
    const matched = new Set();
    for (const file of files) {
      const cat = PATH_CATEGORIES.find((c) => file.startsWith(c.prefix));
      if (cat) matched.add(cat.name);
    }
    if (matched.size === 0) {
      buckets.other.push(commit);
    } else {
      for (const name of matched) buckets[name].push(commit);
    }
  }
  // Drop empty buckets for compactness.
  for (const k of Object.keys(buckets)) {
    if (buckets[k].length === 0) delete buckets[k];
  }
  return buckets;
}

function getUpstreamInfo() {
  fetchUpstream();

  const forkPoint = FORK_POINT_COMMIT;
  log(`Using fork point: ${forkPoint} (${FORK_POINT_DATE})`, 'blue');

  // Verify the fork-point commit actually resolves; if not, the user has not
  // fetched upstream history. Refuse to silently report "up to date".
  const forkPointSha = execCommand(`git rev-parse --verify ${forkPoint}^{commit}`);
  if (!forkPointSha) {
    throw new Error(
      `Fork-point commit ${forkPoint} is not present locally. ` +
      `Run "git fetch upstream" or remove --skip-fetch.`,
    );
  }

  // Get commits since fork point. allowFailure:false so a transient git failure
  // does not silently turn into "up to date".
  const commits = execCommand(`git log --oneline ${forkPoint}..${UPSTREAM_BRANCH}`, { allowFailure: false });
  if (!commits) {
    log('Already up to date with upstream', 'green');
    return { upToDate: true, forkPoint };
  }

  const commitList = commits.split('\n').filter(line => line.trim());

  // Get latest upstream version (best-effort; tags may be missing in shallow clones)
  const latestTag = execCommand(`git describe --tags ${UPSTREAM_BRANCH} --abbrev=0`);
  const upstreamHeadSha = execCommand(`git rev-parse ${UPSTREAM_BRANCH}`);

  return {
    upToDate: false,
    forkPoint,
    upstreamHeadSha,
    commitCount: commitList.length,
    commits: commitList,
    latestVersion: latestTag,
  };
}

function categorizeCommits(commits) {
  const categories = {
    critical: [],
    security: [],
    feature: [],
    refactor: [],
    docs: [],
    test: [],
    build: [],
    deps: [],
    other: []
  };
  
  commits.forEach(commit => {
    const msg = commit.split(' ').slice(1).join(' ').toLowerCase();
    
    if (msg.includes('fix') || msg.includes('bug') || msg.includes('critical') || msg.includes('hotfix') || msg.includes('patch')) {
      categories.critical.push(commit);
    } else if (msg.includes('security') || msg.includes('vulnerability') || msg.includes('cve')) {
      categories.security.push(commit);
    } else if (msg.includes('feat') || msg.includes('feature') || msg.includes('add') || msg.includes('implement')) {
      categories.feature.push(commit);
    } else if (msg.includes('refactor') || msg.includes('cleanup') || msg.includes('optimize') || msg.includes('improve')) {
      categories.refactor.push(commit);
    } else if (msg.includes('doc') || msg.includes('readme') || msg.includes('comment')) {
      categories.docs.push(commit);
    } else if (msg.includes('test') || msg.includes('spec') || msg.includes('e2e')) {
      categories.test.push(commit);
    } else if (msg.includes('build') || msg.includes('ci') || msg.includes('cd') || msg.includes('pipeline')) {
      categories.build.push(commit);
    } else if (msg.includes('deps') || msg.includes('dependency') || msg.includes('package')) {
      categories.deps.push(commit);
    } else {
      categories.other.push(commit);
    }
  });
  
  return categories;
}

function generateRecommendations(categories, commitCount, latestVersion) {
  log('\n=== Recommendations ===', 'purple');
  
  const recommendations = [];
  
  // Check for critical updates
  if (categories.critical.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      type: 'Critical Fixes',
      count: categories.critical.length,
      action: 'Merge immediately',
      commits: categories.critical.slice(0, 3) // Show first 3
    });
  }
  
  // Check for security updates
  if (categories.security.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      type: 'Security Updates',
      count: categories.security.length,
      action: 'Merge immediately',
      commits: categories.security.slice(0, 3)
    });
  }
  
  // Check for major version updates
  if (latestVersion && latestVersion !== RESEARCH_CLI_VERSION) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'Version Update',
      current: RESEARCH_CLI_VERSION,
      latest: latestVersion,
      action: 'Consider merging with version bump'
    });
  }
  
  // Check for feature updates
  if (categories.feature.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'New Features',
      count: categories.feature.length,
      action: 'Review and merge if needed',
      commits: categories.feature.slice(0, 3)
    });
  }
  
  // Check for dependency updates
  if (categories.deps.length > 0) {
    recommendations.push({
      priority: 'LOW',
      type: 'Dependency Updates',
      count: categories.deps.length,
      action: 'Review for security/compatibility',
      commits: categories.deps.slice(0, 3)
    });
  }
  
  return recommendations;
}

function displayReport(info, categories, recommendations) {
  log('\n=== Research CLI Upstream Monitoring Report ===', 'cyan');
  log(`Generated: ${new Date().toISOString()}`, 'blue');
  log(`Current Research CLI Version: ${RESEARCH_CLI_VERSION}`, 'blue');
  
  if (info.upToDate) {
    log('\n✓ Research CLI is up to date with upstream', 'green');
    return;
  }
  
  log(`\nLatest Upstream Version: ${info.latestVersion || 'Unknown'}`, 'blue');
  log(`Commits behind upstream: ${info.commitCount}`, 'yellow');
  
  // Display commit categories
  log('\n=== Commit Categories ===', 'purple');
  Object.entries(categories).forEach(([category, commits]) => {
    if (commits.length > 0) {
      log(`${category.toUpperCase()}: ${commits.length} commits`, 'blue');
    }
  });
  
  // Display recommendations
  if (recommendations.length > 0) {
    log('\n=== Recommendations ===', 'purple');
    recommendations.forEach((rec, index) => {
      log(`\n${index + 1}. ${rec.type} (${rec.priority} Priority)`, 'yellow');
      log(`   Action: ${rec.action}`, 'blue');
      
      if (rec.count) {
        log(`   Count: ${rec.count} commits`, 'blue');
      }
      
      if (rec.current && rec.latest) {
        log(`   Version: ${rec.current} → ${rec.latest}`, 'blue');
      }
      
      if (rec.commits && rec.commits.length > 0) {
        log('   Sample commits:', 'blue');
        rec.commits.forEach(commit => {
          log(`     ${commit}`, 'cyan');
        });
      }
    });
  } else {
    log('\nNo urgent updates detected', 'green');
  }
  
  // Display next steps
  log('\n=== Next Steps ===', 'purple');
  log('1. Review the recommendations above', 'blue');
  log('2. Run merge script if updates are needed:', 'blue');
  log('   ./scripts/merge-upstream.sh', 'cyan');
  log('3. Test thoroughly after merging', 'blue');
  log('4. Update version numbers if needed', 'blue');
}

function checkMergeReadiness() {
  log('\n=== Merge Readiness Check ===', 'purple');
  
  const checks = [
    {
      name: 'Git Status',
      command: 'git status --porcelain',
      success: (output) => output === '',
      message: 'No uncommitted changes'
    },
    {
      name: 'Upstream Remote',
      command: 'git remote get-url upstream',
      success: (output) => output && output.includes('google-gemini/gemini-cli'),
      message: 'Upstream remote configured'
    },
    {
      name: 'Node.js Version',
      command: 'node --version',
      success: (output) => {
        const version = output.replace('v', '');
        const major = parseInt(version.split('.')[0]);
        return major >= 20;
      },
      message: 'Node.js 20+ installed'
    },
    {
      name: 'Dependencies',
      command: 'npm list --depth=0',
      success: (output) => !output.includes('UNMET DEPENDENCY'),
      message: 'All dependencies installed'
    }
  ];
  
  let allReady = true;
  
  checks.forEach(check => {
    const output = execCommand(check.command);
    const isReady = check.success(output);
    
    if (isReady) {
      log(`✓ ${check.name}: ${check.message}`, 'green');
    } else {
      log(`✗ ${check.name}: Not ready`, 'red');
      allReady = false;
    }
  });
  
  if (allReady) {
    log('\n✓ Ready to merge upstream changes', 'green');
  } else {
    log('\n✗ Please resolve issues before merging', 'red');
  }
  
  return allReady;
}

function main() {
  log('Research CLI Upstream Monitor', 'cyan');
  log('Checking for upstream updates...', 'blue');
  
  try {
    // Get upstream information
    const info = getUpstreamInfo();
    if (!info) {
      process.exit(1);
    }

    if (info.upToDate) {
      log('✓ Research CLI is up to date with upstream', 'green');
      // Still write a minimal report so consumers (and the CI workflow) can
      // detect the up-to-date state from the JSON file.
      const upToDateReport = {
        timestamp: new Date().toISOString(),
        researchCliVersion: RESEARCH_CLI_VERSION,
        forkPoint: info.forkPoint,
        upToDate: true,
        commitCount: 0,
        categories: {},
        pathCategories: {},
        recommendations: [],
        mergeReady: false,
      };
      fs.writeFileSync('upstream-monitor-report.json', JSON.stringify(upToDateReport, null, 2));
      return;
    }

    // Categorize commits by message and by file path
    const categories = categorizeCommits(info.commits);
    const pathCategories = categorizeByPath(info.commits);

    // Generate recommendations
    const recommendations = generateRecommendations(categories, info.commitCount, info.latestVersion);

    if (!CI_MODE) {
      // Display report
      displayReport(info, categories, recommendations);
    } else {
      log(`Upstream HEAD: ${info.upstreamHeadSha} (${info.commitCount} commits ahead of fork point)`, 'blue');
    }

    // In CI mode, skip the noisy `npm list --depth=0` readiness check; record
    // a conservative `mergeReady: false` instead.
    const mergeReady = CI_MODE ? false : checkMergeReadiness();

    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      researchCliVersion: RESEARCH_CLI_VERSION,
      forkPoint: info.forkPoint,
      forkPointDate: FORK_POINT_DATE,
      upstreamBranch: UPSTREAM_BRANCH,
      upstreamHeadSha: info.upstreamHeadSha,
      upstreamVersion: info.latestVersion,
      commitCount: info.commitCount,
      categories,
      pathCategories,
      recommendations,
      mergeReady,
    };

    fs.writeFileSync('upstream-monitor-report.json', JSON.stringify(report, null, 2));
    log('\nReport saved to: upstream-monitor-report.json', 'blue');

  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (CLI_ARGS.includes('--help') || CLI_ARGS.includes('-h')) {
  log('Research CLI Upstream Monitor', 'cyan');
  log('Usage: node monitor-upstream.js [options]', 'blue');
  log('Options:', 'blue');
  log('  --help, -h     Show this help message', 'blue');
  log('  --check-only   Only check readiness, don\'t generate full report', 'blue');
  log('  --ci           Run in CI mode (no interactive output, skip merge-readiness check)', 'blue');
  log('  --skip-fetch   Do not call "git fetch upstream" (assume caller already fetched)', 'blue');
  process.exit(0);
}

if (CLI_ARGS.includes('--check-only')) {
  checkMergeReadiness();
} else {
  main();
}
