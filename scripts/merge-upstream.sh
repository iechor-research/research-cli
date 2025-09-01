#!/bin/bash

# Research CLI - Main Upstream Merge Script
# This script orchestrates the entire process of merging upstream Gemini CLI changes

set -e

# Configuration
UPSTREAM_BRANCH="upstream/main"
MERGE_BRANCH="merge/upstream-gemini-$(date +%Y%m%d)"
BACKUP_TAG="backup-before-upstream-merge-$(date +%Y%m%d)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color="$1"
    local message="$2"
    echo -e "${color}${message}${NC}"
}

# Function to print step header
print_step() {
    local step="$1"
    local title="$2"
    echo ""
    print_status $PURPLE "=== Step $step: $title ==="
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    print_status $BLUE "Checking prerequisites..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_status $RED "Error: Not in a git repository"
        exit 1
    fi
    
    # Check if upstream remote exists
    if ! git remote get-url upstream > /dev/null 2>&1; then
        print_status $RED "Error: Upstream remote not found. Please add it first:"
        print_status $YELLOW "git remote add upstream https://github.com/google-gemini/gemini-cli.git"
        exit 1
    fi
    
    # Check if we have uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_status $RED "Error: You have uncommitted changes. Please commit or stash them first."
        exit 1
    fi
    
    # Check if Node.js and npm are available
    if ! command -v node > /dev/null 2>&1; then
        print_status $RED "Error: Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm > /dev/null 2>&1; then
        print_status $RED "Error: npm is not installed"
        exit 1
    fi
    
    print_status $GREEN "✓ Prerequisites check passed"
}

# Function to fetch latest upstream changes
fetch_upstream() {
    print_status $BLUE "Fetching latest upstream changes..."
    
    git fetch upstream
    git fetch upstream --tags
    
    # Show what we're about to merge
    local fork_point=$(git merge-base HEAD $UPSTREAM_BRANCH)
    local commit_count=$(git rev-list --count $fork_point..$UPSTREAM_BRANCH)
    
    print_status $BLUE "Found $commit_count commits to potentially merge"
    
    if [ "$commit_count" -eq 0 ]; then
        print_status $GREEN "✓ Already up to date with upstream"
        exit 0
    fi
    
    print_status $GREEN "✓ Upstream fetch completed"
}

# Function to create backup
create_backup() {
    print_status $BLUE "Creating backup..."
    
    # Create backup tag
    git tag "$BACKUP_TAG"
    
    # Create backup branch
    git checkout -b "backup/$BACKUP_TAG"
    git checkout main
    
    print_status $GREEN "✓ Backup created: tag=$BACKUP_TAG, branch=backup/$BACKUP_TAG"
}

# Function to create merge branch
create_merge_branch() {
    print_status $BLUE "Creating merge branch: $MERGE_BRANCH"
    
    git checkout -b "$MERGE_BRANCH"
    
    print_status $GREEN "✓ Merge branch created: $MERGE_BRANCH"
}

# Function to run branding replacement
run_branding_replacement() {
    print_status $BLUE "Running branding replacement..."
    
    if [ -f "scripts/replace-gemini-branding.sh" ]; then
        ./scripts/replace-gemini-branding.sh
        print_status $GREEN "✓ Branding replacement completed"
    else
        print_status $YELLOW "Warning: Branding replacement script not found"
    fi
}

# Function to run batch merge
run_batch_merge() {
    print_status $BLUE "Running batch merge..."
    
    if [ -f "scripts/merge-upstream-batch.sh" ]; then
        ./scripts/merge-upstream-batch.sh
        print_status $GREEN "✓ Batch merge completed"
    else
        print_status $YELLOW "Warning: Batch merge script not found"
    fi
}

# Function to run tests
run_tests() {
    print_status $BLUE "Running tests..."
    
    # Run unit tests
    print_status $BLUE "Running unit tests..."
    if npm run test:ci; then
        print_status $GREEN "✓ Unit tests passed"
    else
        print_status $RED "✗ Unit tests failed"
        return 1
    fi
    
    # Run build verification
    print_status $BLUE "Running build verification..."
    if npm run build:all; then
        print_status $GREEN "✓ Build verification passed"
    else
        print_status $RED "✗ Build verification failed"
        return 1
    fi
    
    # Run integration tests (if available)
    if npm run | grep -q "test:integration"; then
        print_status $BLUE "Running integration tests..."
        if npm run test:integration:all; then
            print_status $GREEN "✓ Integration tests passed"
        else
            print_status $RED "✗ Integration tests failed"
            return 1
        fi
    fi
    
    print_status $GREEN "✓ All tests passed"
}

# Function to show merge summary
show_merge_summary() {
    print_status $BLUE "=== Merge Summary ==="
    
    print_status $BLUE "Merge branch: $MERGE_BRANCH"
    print_status $BLUE "Backup tag: $BACKUP_TAG"
    print_status $BLUE "Backup branch: backup/$BACKUP_TAG"
    
    # Show commit count using fixed fork point
    local fork_point="26a79fec"  # 2025-07-13 commit
    local total_commits=$(git rev-list --count $fork_point..$UPSTREAM_BRANCH)
    local merged_commits=$(git rev-list --count $fork_point..HEAD)
    
    print_status $BLUE "Total upstream commits: $total_commits"
    print_status $BLUE "Merged commits: $merged_commits"
    
    # Show conflict status
    if [ -f "merge-conflicts.txt" ] && [ -s "merge-conflicts.txt" ]; then
        local conflict_count=$(wc -l < "merge-conflicts.txt")
        print_status $RED "Conflicts to resolve: $conflict_count"
        print_status $YELLOW "Check merge-conflicts.txt for details"
    else
        print_status $GREEN "No conflicts detected"
    fi
    
    # Show success status
    if [ -f "merge-success.txt" ] && [ -s "merge-success.txt" ]; then
        local success_count=$(wc -l < "merge-success.txt")
        print_status $GREEN "Successfully merged: $success_count commits"
    fi
}

# Function to provide next steps
show_next_steps() {
    print_status $PURPLE "=== Next Steps ==="
    echo ""
    print_status $YELLOW "1. Review the changes:"
    print_status $YELLOW "   git log --oneline backup/$BACKUP_TAG..HEAD"
    echo ""
    print_status $YELLOW "2. Check for conflicts:"
    print_status $YELLOW "   git status"
    print_status $YELLOW "   cat merge-conflicts.txt (if exists)"
    echo ""
    print_status $YELLOW "3. Resolve any conflicts manually if needed"
    echo ""
    print_status $YELLOW "4. Run additional tests if needed:"
    print_status $YELLOW "   npm run preflight"
    print_status $YELLOW "   npm run test:cross-platform"
    echo ""
    print_status $YELLOW "5. Manual testing checklist:"
    print_status $YELLOW "   - CLI functionality"
    print_status $YELLOW "   - Research-specific features"
    print_status $YELLOW "   - Branding consistency"
    print_status $YELLOW "   - Documentation accuracy"
    echo ""
    print_status $YELLOW "6. When ready to merge to main:"
    print_status $YELLOW "   git checkout main"
    print_status $YELLOW "   git merge $MERGE_BRANCH"
    print_status $YELLOW "   git push origin main"
    echo ""
    print_status $YELLOW "7. Clean up (after successful merge):"
    print_status $YELLOW "   git branch -d $MERGE_BRANCH"
    print_status $YELLOW "   git branch -d backup/$BACKUP_TAG"
    print_status $YELLOW "   git tag -d $BACKUP_TAG"
    echo ""
    print_status $RED "⚠️  IMPORTANT: Do not delete backup until you're confident the merge is successful!"
}

# Function to handle rollback
rollback() {
    print_status $RED "Rolling back to backup..."
    
    git checkout main
    git reset --hard "$BACKUP_TAG"
    
    print_status $GREEN "✓ Rollback completed"
    print_status $YELLOW "You can now start over or investigate the issue"
}

# Function to clean up on exit
cleanup() {
    print_status $YELLOW "Cleaning up..."
    
    # Remove temporary files
    rm -f merge-conflicts.txt merge-success.txt branding-replacement-report.md
    
    print_status $GREEN "✓ Cleanup completed"
}

# Main execution
main() {
    print_status $PURPLE "=== Research CLI Upstream Merge Process ==="
    print_status $BLUE "This script will safely merge upstream Gemini CLI changes"
    print_status $BLUE "into the Research CLI project while preserving customizations."
    echo ""
    
    # Check prerequisites
    print_step "1" "Prerequisites Check"
    check_prerequisites
    
    # Fetch upstream
    print_step "2" "Fetch Upstream Changes"
    fetch_upstream
    
    # Create backup
    print_step "3" "Create Backup"
    create_backup
    
    # Create merge branch
    print_step "4" "Create Merge Branch"
    create_merge_branch
    
    # Run branding replacement
    print_step "5" "Branding Replacement"
    run_branding_replacement
    
    # Run batch merge
    print_step "6" "Batch Merge"
    run_batch_merge
    
    # Run tests
    print_step "7" "Testing"
    if run_tests; then
        print_status $GREEN "✓ Testing completed successfully"
    else
        print_status $RED "✗ Testing failed"
        print_status $YELLOW "Consider rolling back or fixing issues before proceeding"
        show_merge_summary
        show_next_steps
        exit 1
    fi
    
    # Show summary
    print_step "8" "Summary"
    show_merge_summary
    
    # Show next steps
    show_next_steps
    
    print_status $GREEN "=== Upstream merge process completed ==="
    print_status $BLUE "Review the changes and follow the next steps above."
}

# Handle script interruption
trap 'print_status $RED "Script interrupted. Cleaning up..."; cleanup; exit 1' INT TERM

# Handle script exit
trap cleanup EXIT

# Check if user wants to rollback
if [ "$1" = "--rollback" ]; then
    rollback
    exit 0
fi

# Run main function
main "$@"
