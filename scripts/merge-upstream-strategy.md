# Research CLI - Upstream Merging Strategy

## Overview

This document outlines the strategy for safely merging upstream Gemini CLI development code into the Research CLI project. The goal is to maintain the Research CLI's customizations while incorporating the latest features and bug fixes from the upstream repository.

## Current State Analysis

- **Research CLI Version**: 0.4.5
- **Upstream Gemini CLI**: Latest from https://github.com/google-gemini/gemini-cli.git
- **Fork Date**: Approximately July 14, 2025
- **Customizations**: Extensive modifications including branding, research-specific features, and tool integrations

## Merging Strategy

### 1. Pre-Merge Preparation

#### 1.1 Create Merge Branch
```bash
# Create a dedicated branch for upstream merging
git checkout -b merge/upstream-gemini-$(date +%Y%m%d)
```

#### 1.2 Backup Current State
```bash
# Create a backup of current state
git tag backup-before-upstream-merge-$(date +%Y%m%d)
```

### 2. Automated Branding Replacement Script

Create a script to automatically replace Gemini branding with Research branding:

```bash
#!/bin/bash
# scripts/replace-gemini-branding.sh

# Function to replace Gemini branding with Research branding
replace_branding() {
    local file="$1"
    
    # Replace various forms of "gemini" with "research"
    sed -i '' \
        -e 's/gemini/research/g' \
        -e 's/Gemini/Research/g' \
        -e 's/GEMINI/RESEARCH/g' \
        -e 's/@google\/gemini-cli/@iechor\/research-cli/g' \
        -e 's/google-gemini\/gemini-cli/iechor-research\/research-cli/g' \
        -e 's/gemini-cli/research-cli/g' \
        -e 's/Gemini CLI/Research CLI/g' \
        -e 's/gemini\.google\.com/research\.iechor\.com/g' \
        "$file"
}

# Function to process all relevant files
process_files() {
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.txt" \) \
        -not -path "./node_modules/*" \
        -not -path "./.git/*" \
        -not -path "./dist/*" \
        -not -path "./build/*" \
        -exec grep -l -i "gemini" {} \; | while read file; do
        echo "Processing: $file"
        replace_branding "$file"
    done
}

# Main execution
echo "Starting Gemini to Research branding replacement..."
process_files
echo "Branding replacement completed."
```

### 3. Commit-Level Merging Process

#### 3.1 Identify Merge Range
```bash
# Find the common ancestor (fork point)
git merge-base HEAD upstream/main

# List commits to merge (from fork point to latest upstream)
git log --oneline $(git merge-base HEAD upstream/main)..upstream/main
```

#### 3.2 Batch Merge Strategy

Instead of merging all commits at once, use a batched approach:

1. **Critical Bug Fixes** (Priority 1)
2. **Security Updates** (Priority 1)
3. **Core Functionality** (Priority 2)
4. **New Features** (Priority 3)
5. **Documentation Updates** (Priority 4)

#### 3.3 Automated Merge Script

```bash
#!/bin/bash
# scripts/merge-upstream-batch.sh

# Configuration
UPSTREAM_BRANCH="upstream/main"
MERGE_BRANCH="merge/upstream-gemini-$(date +%Y%m%d)"
BATCH_SIZE=10

# Function to categorize commits
categorize_commit() {
    local commit_msg="$1"
    
    # Critical fixes
    if echo "$commit_msg" | grep -q -i "fix\|bug\|security\|critical"; then
        echo "critical"
    # New features
    elif echo "$commit_msg" | grep -q -i "feat\|feature\|add"; then
        echo "feature"
    # Documentation
    elif echo "$commit_msg" | grep -q -i "doc\|readme\|comment"; then
        echo "docs"
    # Refactoring
    elif echo "$commit_msg" | grep -q -i "refactor\|cleanup\|optimize"; then
        echo "refactor"
    else
        echo "other"
    fi
}

# Function to merge commits by category
merge_by_category() {
    local category="$1"
    local commits=$(git log --oneline --grep="$category" $(git merge-base HEAD $UPSTREAM_BRANCH)..$UPSTREAM_BRANCH | head -$BATCH_SIZE)
    
    echo "Merging $category commits..."
    echo "$commits" | while read commit; do
        local hash=$(echo "$commit" | cut -d' ' -f1)
        local msg=$(echo "$commit" | cut -d' ' -f2-)
        
        echo "Cherry-picking: $msg"
        if git cherry-pick "$hash"; then
            echo "Successfully merged: $msg"
        else
            echo "Conflict in: $msg"
            git cherry-pick --abort
            # Add to conflict list for manual resolution
            echo "$hash $msg" >> merge-conflicts.txt
        fi
    done
}

# Main execution
echo "Starting batched upstream merge..."

# Create merge branch
git checkout -b "$MERGE_BRANCH"

# Merge critical fixes first
merge_by_category "critical"

# Then features
merge_by_category "feature"

# Then refactoring
merge_by_category "refactor"

# Finally documentation
merge_by_category "docs"

echo "Batched merge completed. Check merge-conflicts.txt for conflicts."
```

### 4. Conflict Resolution Strategy

#### 4.1 Conflict Categories

1. **Branding Conflicts**: Automatic resolution using replacement script
2. **Package Name Conflicts**: Manual resolution required
3. **Configuration Conflicts**: Manual resolution required
4. **Feature Conflicts**: Manual resolution required

#### 4.2 Conflict Resolution Script

```bash
#!/bin/bash
# scripts/resolve-merge-conflicts.sh

# Function to resolve common conflicts
resolve_conflicts() {
    local file="$1"
    
    # Resolve package.json conflicts
    if [[ "$file" == "package.json" ]]; then
        echo "Resolving package.json conflicts..."
        # Keep Research CLI specific fields, merge others
        node scripts/merge-package-json.js
    fi
    
    # Resolve README conflicts
    if [[ "$file" == "README.md" ]]; then
        echo "Resolving README conflicts..."
        # Keep Research CLI branding, merge content
        node scripts/merge-readme.js
    fi
    
    # Resolve configuration conflicts
    if [[ "$file" == "*.config.js" ]] || [[ "$file" == "*.config.ts" ]]; then
        echo "Resolving config conflicts..."
        # Manual resolution required
        echo "Manual resolution required for: $file"
    fi
}

# Main execution
echo "Resolving merge conflicts..."

# Find all conflicted files
git diff --name-only --diff-filter=U | while read file; do
    echo "Resolving conflicts in: $file"
    resolve_conflicts "$file"
done

echo "Conflict resolution completed."
```

### 5. Testing Strategy

#### 5.1 Pre-Merge Testing
```bash
# Run existing tests
npm run test:ci

# Run integration tests
npm run test:integration:all

# Build verification
npm run build:all
```

#### 5.2 Post-Merge Testing
```bash
# Comprehensive test suite
npm run preflight

# Cross-platform testing
npm run test:cross-platform

# Manual testing checklist
echo "Manual testing required for:"
echo "1. CLI functionality"
echo "2. Research-specific features"
echo "3. Branding consistency"
echo "4. Documentation accuracy"
```

### 6. Rollback Strategy

#### 6.1 Quick Rollback
```bash
# If issues are detected
git checkout main
git reset --hard backup-before-upstream-merge-$(date +%Y%m%d)
```

#### 6.2 Selective Rollback
```bash
# Rollback specific problematic commits
git revert <commit-hash>
```

### 7. Documentation Updates

#### 7.1 Update Version History
- Document merged commits
- Update changelog
- Update version numbers

#### 7.2 Update Documentation
- Update README.md
- Update API documentation
- Update user guides

### 8. Release Process

#### 8.1 Pre-Release Checklist
- [ ] All tests passing
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Version numbers updated
- [ ] Changelog updated

#### 8.2 Release Steps
```bash
# Create release branch
git checkout -b release/v0.4.6

# Update version
npm version patch

# Create release notes
node scripts/generate-release-notes.js

# Tag release
git tag v0.4.6

# Push to main
git checkout main
git merge release/v0.4.6
git push origin main
git push origin v0.4.6
```

## Automation Scripts

### Main Merge Script

```bash
#!/bin/bash
# scripts/merge-upstream.sh

set -e

echo "Starting Research CLI upstream merge process..."

# 1. Preparation
echo "Step 1: Preparation"
git fetch upstream
git checkout -b merge/upstream-gemini-$(date +%Y%m%d)
git tag backup-before-upstream-merge-$(date +%Y%m%d)

# 2. Run branding replacement
echo "Step 2: Branding replacement"
./scripts/replace-gemini-branding.sh

# 3. Batch merge
echo "Step 3: Batch merge"
./scripts/merge-upstream-batch.sh

# 4. Conflict resolution
echo "Step 4: Conflict resolution"
./scripts/resolve-merge-conflicts.sh

# 5. Testing
echo "Step 5: Testing"
npm run test:ci
npm run build:all

echo "Upstream merge process completed!"
echo "Please review the changes and run manual testing before merging to main."
```

## Monitoring and Maintenance

### 1. Regular Sync Schedule
- Weekly: Check for critical updates
- Monthly: Full upstream sync
- Quarterly: Major version review

### 2. Automated Monitoring
- GitHub Actions for upstream monitoring
- Automated conflict detection
- Automated testing on merge branches

### 3. Documentation Maintenance
- Keep this strategy document updated
- Maintain merge history log
- Update conflict resolution patterns

## Conclusion

This strategy provides a systematic approach to safely merging upstream Gemini CLI changes while preserving Research CLI's customizations. The key is to:

1. **Automate repetitive tasks** (branding replacement)
2. **Batch merges by priority** (critical fixes first)
3. **Maintain comprehensive testing** (automated + manual)
4. **Have clear rollback procedures** (quick recovery)
5. **Document everything** (maintainability)

The process should be iterative and refined based on experience with each merge cycle.
