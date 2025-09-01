# Research CLI - Upstream Merging Guide

This guide provides comprehensive instructions for safely merging upstream Gemini CLI changes into the Research CLI project.

## Overview

Research CLI is a fork of [Google's Gemini CLI](https://github.com/google-gemini/gemini-cli) with extensive customizations for research and development workflows. This guide ensures that upstream improvements are incorporated while preserving Research CLI's unique features and branding.

## Prerequisites

Before starting the merge process, ensure you have:

- Git configured with access to both repositories
- Node.js 20+ installed
- npm or pnpm package manager
- Upstream remote configured: `git remote add upstream https://github.com/google-gemini/gemini-cli.git`

## Quick Start

### 1. Monitor Upstream Updates

Check for available upstream updates:

```bash
node scripts/monitor-upstream.js
```

This will:
- Fetch latest upstream changes
- Categorize commits by type (critical fixes, features, etc.)
- Provide recommendations on what to merge
- Check if your environment is ready for merging

### 2. Run the Merge Process

Execute the automated merge process:

```bash
./scripts/merge-upstream.sh
```

This script will:
- Create backups of your current state
- Replace Gemini branding with Research branding
- Cherry-pick commits by priority (critical fixes first)
- Run tests to ensure everything works
- Provide detailed next steps

## Detailed Process

### Step 1: Preparation

The merge process starts with preparation:

```bash
# Check prerequisites
git status  # Ensure no uncommitted changes
git fetch upstream  # Get latest upstream changes
```

### Step 2: Create Backup

Before making any changes, create a backup:

```bash
# Create backup tag and branch
git tag backup-before-upstream-merge-$(date +%Y%m%d)
git checkout -b backup/backup-before-upstream-merge-$(date +%Y%m%d)
git checkout main
```

### Step 3: Branding Replacement

Automatically replace Gemini branding with Research branding:

```bash
./scripts/replace-gemini-branding.sh
```

This script handles:
- Package names (`@google/gemini-cli` → `@iechor/research-cli`)
- Repository URLs
- Command names (`gemini` → `research`)
- Environment variables
- Documentation references
- Configuration files

### Step 4: Batch Merge

Merge commits by priority using the batch merge script:

```bash
./scripts/merge-upstream-batch.sh
```

The script categorizes commits and merges them in this order:
1. **Critical fixes** (highest priority)
2. **Security updates**
3. **Refactoring and improvements**
4. **New features**
5. **Testing updates**
6. **Build and CI/CD updates**
7. **Dependency updates**
8. **Documentation updates**
9. **Other updates**

### Step 5: Conflict Resolution

If conflicts occur, they are automatically categorized:

- **Branding conflicts**: Automatically resolved
- **Package.json conflicts**: Intelligently merged
- **Configuration conflicts**: Manual resolution required
- **Feature conflicts**: Manual resolution required

### Step 6: Testing

Run comprehensive tests:

```bash
npm run test:ci        # Unit tests
npm run build:all      # Build verification
npm run test:integration:all  # Integration tests
```

### Step 7: Review and Merge

After successful testing:

```bash
# Review changes
git log --oneline backup/backup-before-upstream-merge-$(date +%Y%m%d)..HEAD

# Merge to main
git checkout main
git merge merge/upstream-gemini-$(date +%Y%m%d)

# Push to origin
git push origin main
```

## Conflict Resolution

### Automatic Resolution

The scripts automatically resolve common conflicts:

1. **Branding conflicts**: Gemini → Research replacements
2. **Package.json conflicts**: Preserve Research CLI specific fields
3. **README conflicts**: Keep Research CLI branding, merge content

### Manual Resolution

For conflicts that require manual intervention:

1. **Feature conflicts**: Review both implementations and choose the best approach
2. **Configuration conflicts**: Merge carefully, preserving Research CLI customizations
3. **API changes**: Update Research CLI specific code to match new APIs

### Conflict Resolution Scripts

Use the provided scripts for common conflict types:

```bash
# Resolve package.json conflicts
node scripts/merge-package-json.js

# Apply branding replacement to conflicted files
./scripts/replace-gemini-branding.sh
```

## Monitoring and Maintenance

### Regular Monitoring

Set up regular monitoring to check for upstream updates:

```bash
# Weekly check
node scripts/monitor-upstream.js

# Check merge readiness
node scripts/monitor-upstream.js --check-only
```

### Automated Monitoring (Recommended)

Add to your CI/CD pipeline:

```yaml
# .github/workflows/upstream-monitor.yml
name: Upstream Monitor
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node scripts/monitor-upstream.js
      - name: Create Issue for Updates
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Upstream updates available',
              body: 'Check upstream-monitor-report.json for details'
            })
```

## Best Practices

### 1. Commit-Level Merging

- Use cherry-picking for selective merging
- Merge critical fixes immediately
- Review feature commits before merging
- Test each batch of commits

### 2. Branding Consistency

- Always run branding replacement after merging
- Review all files for missed Gemini references
- Update documentation and examples
- Check configuration files

### 3. Testing Strategy

- Run tests after each batch
- Test Research CLI specific features
- Verify branding consistency
- Test on multiple platforms

### 4. Documentation Updates

- Update version numbers
- Update changelog
- Update user documentation
- Update API documentation

### 5. Rollback Strategy

If issues are detected:

```bash
# Quick rollback
git checkout main
git reset --hard backup-before-upstream-merge-$(date +%Y%m%d)

# Or use the rollback script
./scripts/merge-upstream.sh --rollback
```

## Troubleshooting

### Common Issues

1. **Merge conflicts in package.json**
   - Use `node scripts/merge-package-json.js`
   - Preserve Research CLI specific fields
   - Merge dependencies carefully

2. **Branding not replaced**
   - Run `./scripts/replace-gemini-branding.sh`
   - Check for case-sensitive references
   - Review backup files

3. **Tests failing after merge**
   - Check for API changes
   - Update Research CLI specific code
   - Review dependency updates

4. **Build failures**
   - Check for configuration changes
   - Update build scripts if needed
   - Verify all dependencies are compatible

### Getting Help

If you encounter issues:

1. Check the backup files for reference
2. Review the merge logs
3. Consult the upstream documentation
4. Create an issue with detailed information

## Scripts Reference

### Core Scripts

- `scripts/merge-upstream.sh` - Main merge orchestration script
- `scripts/merge-upstream-batch.sh` - Batch cherry-picking by priority
- `scripts/replace-gemini-branding.sh` - Branding replacement
- `scripts/monitor-upstream.js` - Upstream monitoring and recommendations

### Helper Scripts

- `scripts/merge-package-json.js` - Package.json conflict resolution
- `scripts/merge-readme.js` - README conflict resolution (if needed)

### Usage Examples

```bash
# Monitor upstream updates
node scripts/monitor-upstream.js

# Run full merge process
./scripts/merge-upstream.sh

# Run only branding replacement
./scripts/replace-gemini-branding.sh

# Run only batch merge
./scripts/merge-upstream-batch.sh

# Resolve package.json conflicts
node scripts/merge-package-json.js --all

# Rollback if needed
./scripts/merge-upstream.sh --rollback
```

## Version Management

### Version Bumping

When merging upstream changes:

1. **Patch version**: For bug fixes and minor updates
2. **Minor version**: For new features
3. **Major version**: For breaking changes

### Changelog Updates

Update the changelog with:

- Merged commits summary
- Research CLI specific changes
- Breaking changes
- New features
- Bug fixes

## Security Considerations

### Dependency Updates

- Review security advisories
- Test dependency updates thoroughly
- Update vulnerable dependencies immediately
- Maintain security scanning

### Code Review

- Review all merged changes
- Check for security implications
- Verify Research CLI customizations are preserved
- Test thoroughly before release

## Conclusion

This merging strategy ensures that Research CLI stays up-to-date with upstream improvements while maintaining its unique features and branding. The automated scripts reduce manual work and minimize errors, while the comprehensive testing ensures reliability.

Remember to:
- Monitor upstream regularly
- Test thoroughly after each merge
- Keep backups until confident in the merge
- Update documentation and version numbers
- Follow security best practices

For questions or issues, refer to the troubleshooting section or create an issue in the repository.
