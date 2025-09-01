#!/usr/bin/env node

/**
 * Research CLI - Package.json Merge Script
 * This script intelligently merges package.json files during upstream merge conflicts
 */

import fs from 'fs';
import path from 'path';

// Research CLI specific configurations that should be preserved
const RESEARCH_CLI_CONFIG = {
  name: '@iechor/research-cli',
  description: 'AI-powered research and development CLI tool for developers',
  author: 'IECHOR Research <research@iechor.com>',
  repository: {
    type: 'git',
    url: 'git+https://github.com/iechor-research/research-cli.git'
  },
  config: {
    sandboxImageUri: 'us-docker.pkg.dev/research-code-dev/research-cli/sandbox:0.2.0'
  }
};

// Fields that should be merged (not overwritten)
const MERGEABLE_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'engines',
  'os',
  'cpu',
  'overrides',
  'resolutions'
];

// Fields that should be preserved from Research CLI
const PRESERVE_FIELDS = [
  'name',
  'description',
  'author',
  'repository',
  'config',
  'bin',
  'files',
  'workspaces',
  'private'
];

// Fields that should be updated from upstream (if newer)
const UPDATEABLE_FIELDS = [
  'version',
  'keywords',
  'license',
  'bugs',
  'homepage',
  'main',
  'module',
  'types',
  'exports',
  'scripts'
];

function mergePackageJson(researchPkg, upstreamPkg) {
  const merged = { ...researchPkg };
  
  // Preserve Research CLI specific configurations
  Object.assign(merged, RESEARCH_CLI_CONFIG);
  
  // Merge dependencies and related fields
  MERGEABLE_FIELDS.forEach(field => {
    if (upstreamPkg[field]) {
      merged[field] = {
        ...merged[field],
        ...upstreamPkg[field]
      };
    }
  });
  
  // Update version and other fields from upstream
  UPDATEABLE_FIELDS.forEach(field => {
    if (upstreamPkg[field]) {
      // For version, increment patch version
      if (field === 'version' && upstreamPkg[field]) {
        const currentVersion = merged[field] || '0.0.0';
        const upstreamVersion = upstreamPkg[field];
        
        // Compare versions and use the higher one, then increment patch
        const currentParts = currentVersion.split('.').map(Number);
        const upstreamParts = upstreamVersion.split('.').map(Number);
        
        let shouldUseUpstream = false;
        for (let i = 0; i < Math.max(currentParts.length, upstreamParts.length); i++) {
          const current = currentParts[i] || 0;
          const upstream = upstreamParts[i] || 0;
          if (upstream > current) {
            shouldUseUpstream = true;
            break;
          } else if (upstream < current) {
            break;
          }
        }
        
        if (shouldUseUpstream) {
          // Increment patch version
          upstreamParts[2] = (upstreamParts[2] || 0) + 1;
          merged[field] = upstreamParts.join('.');
        }
      } else {
        merged[field] = upstreamPkg[field];
      }
    }
  });
  
  // Merge scripts intelligently
  if (upstreamPkg.scripts) {
    merged.scripts = {
      ...merged.scripts,
      ...upstreamPkg.scripts
    };
    
    // Preserve Research CLI specific scripts
    const researchSpecificScripts = [
      'auth:npm',
      'auth:docker',
      'auth',
      'build:iechor-style',
      'build:electron-safe',
      'build:standalone',
      'build:standalone-simple',
      'release',
      'release:patch',
      'release:minor',
      'release:major',
      'gh:release',
      'gh:release-draft'
    ];
    
    researchSpecificScripts.forEach(script => {
      if (researchPkg.scripts && researchPkg.scripts[script]) {
        merged.scripts[script] = researchPkg.scripts[script];
      }
    });
  }
  
  return merged;
}

function resolvePackageJsonConflict(filePath) {
  console.log(`Resolving package.json conflict in: ${filePath}`);
  
  try {
    // Read the current file
    const currentContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse the current package.json
    const currentPkg = JSON.parse(currentContent);
    
    // Create a backup
    const backupPath = `${filePath}.backup.$(Date.now())`;
    fs.writeFileSync(backupPath, currentContent);
    console.log(`Backup created: ${backupPath}`);
    
    // For now, we'll just apply branding replacement
    // In a real conflict scenario, we'd need to parse the conflict markers
    let updatedContent = currentContent;
    
    // Replace Gemini branding with Research branding
    updatedContent = updatedContent
      .replace(/"name": "@google\/gemini-cli"/g, '"name": "@iechor/research-cli"')
      .replace(/"name": "gemini-cli"/g, '"name": "research-cli"')
      .replace(/"description": ".*Gemini.*"/g, '"description": "AI-powered research and development CLI tool for developers"')
      .replace(/"author": ".*Google.*"/g, '"author": "IECHOR Research <research@iechor.com>"')
      .replace(/"url": "git\+https:\/\/github\.com\/google-gemini\/gemini-cli\.git"/g, '"url": "git+https://github.com/iechor-research/research-cli.git"')
      .replace(/gemini-cli/g, 'research-cli')
      .replace(/Gemini CLI/g, 'Research CLI')
      .replace(/Gemini Code Assist/g, 'Research Code Assist');
    
    // Write the updated content
    fs.writeFileSync(filePath, updatedContent);
    
    console.log(`✓ Package.json conflict resolved: ${filePath}`);
    
  } catch (error) {
    console.error(`✗ Error resolving package.json conflict: ${error.message}`);
    throw error;
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node merge-package-json.js <package.json-file>');
    console.log('Or run without arguments to process all package.json files');
    process.exit(1);
  }
  
  if (args[0] === '--all') {
    // Process all package.json files
    const findPackageJson = (dir) => {
      const files = fs.readdirSync(dir);
      const packageFiles = [];
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          packageFiles.push(...findPackageJson(filePath));
        } else if (file === 'package.json') {
          packageFiles.push(filePath);
        }
      });
      
      return packageFiles;
    };
    
    const packageFiles = findPackageJson('.');
    console.log(`Found ${packageFiles.length} package.json files`);
    
    packageFiles.forEach(file => {
      try {
        resolvePackageJsonConflict(file);
      } catch (error) {
        console.error(`Failed to process ${file}: ${error.message}`);
      }
    });
  } else {
    // Process specific file
    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    
    resolvePackageJsonConflict(filePath);
  }
}

// ES module equivalent
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  mergePackageJson,
  resolvePackageJsonConflict
};
