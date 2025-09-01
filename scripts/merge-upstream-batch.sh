#!/bin/bash

# Research CLI - Upstream Batch Merge Script
# This script merges upstream Gemini CLI commits by category (critical fixes first, then features, etc.)

set -e

# Configuration
UPSTREAM_BRANCH="upstream/main"
MERGE_BRANCH="merge/upstream-gemini-$(date +%Y%m%d)"
BATCH_SIZE=10
CONFLICT_LOG="merge-conflicts.txt"
SUCCESS_LOG="merge-success.txt"
FORK_POINT_COMMIT="26a79fec"  # 2025-07-13 commit: feat: Add GEMINI_DEFAULT_AUTH_TYPE support

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color="$1"
    local message="$2"
    echo -e "${color}${message}${NC}"
}

# Function to categorize commits
categorize_commit() {
    local commit_msg="$1"
    
    # Critical fixes (highest priority)
    if echo "$commit_msg" | grep -q -i "fix\|bug\|security\|critical\|hotfix\|patch"; then
        echo "critical"
    # Security updates
    elif echo "$commit_msg" | grep -q -i "security\|vulnerability\|cve"; then
        echo "security"
    # New features
    elif echo "$commit_msg" | grep -q -i "feat\|feature\|add\|implement"; then
        echo "feature"
    # Refactoring and improvements
    elif echo "$commit_msg" | grep -q -i "refactor\|cleanup\|optimize\|improve\|enhance"; then
        echo "refactor"
    # Documentation
    elif echo "$commit_msg" | grep -q -i "doc\|readme\|comment\|changelog"; then
        echo "docs"
    # Testing
    elif echo "$commit_msg" | grep -q -i "test\|spec\|e2e\|integration"; then
        echo "test"
    # Build and CI/CD
    elif echo "$commit_msg" | grep -q -i "build\|ci\|cd\|pipeline\|workflow"; then
        echo "build"
    # Dependencies
    elif echo "$commit_msg" | grep -q -i "deps\|dependency\|package\|npm\|yarn"; then
        echo "deps"
    else
        echo "other"
    fi
}

# Function to get commits by category
get_commits_by_category() {
    local category="$1"
    
    # Use the specified fork point (2025-07-13 commit)
    echo "Using fork point: $FORK_POINT_COMMIT (2025-07-13)" >&2
    
    # Get commits from fork point to upstream main
    git log --oneline --grep="$category" --invert-grep --grep="revert\|Revert" $FORK_POINT_COMMIT..$UPSTREAM_BRANCH | head -$BATCH_SIZE
}

# Function to merge commits by category
merge_by_category() {
    local category="$1"
    local commits=$(get_commits_by_category "$category")
    
    if [ -z "$commits" ]; then
        print_status $BLUE "No $category commits found to merge."
        return
    fi
    
    print_status $BLUE "Merging $category commits..."
    print_status $BLUE "Found $(echo "$commits" | wc -l | tr -d ' ') commits to process."
    
    echo "$commits" | while read commit; do
        local hash=$(echo "$commit" | cut -d' ' -f1)
        local msg=$(echo "$commit" | cut -d' ' -f2-)
        
        print_status $YELLOW "Cherry-picking: $msg"
        
        if git cherry-pick "$hash" 2>/dev/null; then
            print_status $GREEN "✓ Successfully merged: $msg"
            echo "$hash $msg" >> "$SUCCESS_LOG"
        else
            print_status $RED "✗ Conflict in: $msg"
            git cherry-pick --abort 2>/dev/null || true
            
            # Add to conflict list for manual resolution
            echo "$hash $msg" >> "$CONFLICT_LOG"
            
            # Try to resolve common conflicts automatically
            resolve_common_conflicts "$hash" "$msg"
        fi
    done
}

# Function to resolve common conflicts automatically
resolve_common_conflicts() {
    local hash="$1"
    local msg="$2"
    
    print_status $YELLOW "Attempting automatic conflict resolution for: $msg"
    
    # Check if there are conflicted files
    local conflicted_files=$(git diff --name-only --diff-filter=U 2>/dev/null || true)
    
    if [ -n "$conflicted_files" ]; then
        echo "$conflicted_files" | while read file; do
            if [[ "$file" == "package.json" ]]; then
                resolve_package_json_conflict "$file"
            elif [[ "$file" == "README.md" ]]; then
                resolve_readme_conflict "$file"
            elif [[ "$file" == *.config.js ]] || [[ "$file" == *.config.ts ]]; then
                resolve_config_conflict "$file"
            fi
        done
        
        # Try to continue the cherry-pick
        if git add . && git cherry-pick --continue 2>/dev/null; then
            print_status $GREEN "✓ Auto-resolved conflict for: $msg"
            echo "$hash $msg" >> "$SUCCESS_LOG"
        else
            print_status $RED "✗ Auto-resolution failed for: $msg"
            git cherry-pick --abort 2>/dev/null || true
        fi
    fi
}

# Function to resolve package.json conflicts
resolve_package_json_conflict() {
    local file="$1"
    print_status $YELLOW "Resolving package.json conflict in: $file"
    
    # Keep Research CLI specific fields, merge others
    # This is a simplified approach - manual review may be needed
    sed -i '' \
        -e 's/"name": "@google\/gemini-cli"/"name": "@iechor\/research-cli"/g' \
        -e 's/"name": "gemini-cli"/"name": "research-cli"/g' \
        -e 's|"url": "git+https://github.com/google-gemini/gemini-cli.git"|"url": "git+https://github.com/iechor-research/research-cli.git"|g' \
        "$file"
}

# Function to resolve README conflicts
resolve_readme_conflict() {
    local file="$1"
    print_status $YELLOW "Resolving README conflict in: $file"
    
    # Keep Research CLI branding, merge content
    sed -i '' \
        -e 's/npm install -g @google\/gemini-cli/npm install -g @iechor\/research-cli/g' \
        -e 's/npm install -g gemini-cli/npm install -g research-cli/g' \
        -e 's/gemini /research /g' \
        -e 's/`gemini`/`research`/g' \
        "$file"
}

# Function to resolve config conflicts
resolve_config_conflict() {
    local file="$1"
    print_status $YELLOW "Resolving config conflict in: $file"
    
    # Apply branding replacement
    sed -i '' \
        -e 's/gemini/research/g' \
        -e 's/Gemini/Research/g' \
        -e 's/GEMINI/RESEARCH/g' \
        "$file"
}

# Function to create merge branch
create_merge_branch() {
    print_status $BLUE "Creating merge branch: $MERGE_BRANCH"
    
    # Check if we're already on the merge branch
    if [ "$(git branch --show-current)" != "$MERGE_BRANCH" ]; then
        git checkout -b "$MERGE_BRANCH"
    fi
    
    # Create backup tag
    git tag "backup-before-upstream-merge-$(date +%Y%m%d)"
}

# Function to show merge summary
show_merge_summary() {
    print_status $BLUE "=== Merge Summary ==="
    
    if [ -f "$SUCCESS_LOG" ]; then
        local success_count=$(wc -l < "$SUCCESS_LOG")
        print_status $GREEN "Successfully merged: $success_count commits"
    else
        print_status $YELLOW "Successfully merged: 0 commits"
    fi
    
    if [ -f "$CONFLICT_LOG" ]; then
        local conflict_count=$(wc -l < "$CONFLICT_LOG")
        print_status $RED "Conflicts encountered: $conflict_count commits"
        print_status $YELLOW "Check $CONFLICT_LOG for details"
    else
        print_status $GREEN "Conflicts encountered: 0 commits"
    fi
    
    print_status $BLUE "Merge branch: $MERGE_BRANCH"
    print_status $BLUE "Backup tag: backup-before-upstream-merge-$(date +%Y%m%d)"
}

# Function to clean up
cleanup() {
    # Remove temporary files if no conflicts
    if [ ! -f "$CONFLICT_LOG" ] || [ ! -s "$CONFLICT_LOG" ]; then
        rm -f "$CONFLICT_LOG"
    fi
}

# Main execution
main() {
    print_status $BLUE "=== Research CLI Upstream Batch Merge ==="
    print_status $BLUE "Upstream branch: $UPSTREAM_BRANCH"
    print_status $BLUE "Merge branch: $MERGE_BRANCH"
    print_status $BLUE "Batch size: $BATCH_SIZE"
    echo ""
    
    # Initialize log files
    > "$CONFLICT_LOG"
    > "$SUCCESS_LOG"
    
    # Create merge branch
    create_merge_branch
    
    # Merge commits by priority order
    print_status $BLUE "Starting batch merge by priority..."
    echo ""
    
    # 1. Critical fixes (highest priority)
    merge_by_category "critical"
    echo ""
    
    # 2. Security updates
    merge_by_category "security"
    echo ""
    
    # 3. Core functionality and refactoring
    merge_by_category "refactor"
    echo ""
    
    # 4. New features
    merge_by_category "feature"
    echo ""
    
    # 5. Testing updates
    merge_by_category "test"
    echo ""
    
    # 6. Build and CI/CD updates
    merge_by_category "build"
    echo ""
    
    # 7. Dependency updates
    merge_by_category "deps"
    echo ""
    
    # 8. Documentation updates
    merge_by_category "docs"
    echo ""
    
    # 9. Other updates
    merge_by_category "other"
    echo ""
    
    # Show summary
    show_merge_summary
    
    # Cleanup
    cleanup
    
    print_status $GREEN "=== Batch merge completed ==="
    print_status $YELLOW "Next steps:"
    print_status $YELLOW "1. Review the changes"
    print_status $YELLOW "2. Resolve any remaining conflicts manually"
    print_status $YELLOW "3. Run tests: npm run test:ci"
    print_status $YELLOW "4. Build verification: npm run build:all"
    print_status $YELLOW "5. Merge to main when ready"
}

# Handle script interruption
trap 'print_status $RED "Script interrupted. Cleaning up..."; cleanup; exit 1' INT TERM

# Run main function
main "$@"
