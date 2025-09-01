/**
 * Research CLI - Upstream Merge Configuration
 * This file contains configuration settings for upstream merging
 */

export const UPSTREAM_CONFIG = {
  // Upstream repository configuration
  upstream: {
    branch: 'upstream/main',
    url: 'https://github.com/google-gemini/gemini-cli.git',
    name: 'upstream'
  },
  
  // Fork point configuration
  forkPoint: {
    commit: '26a79fec', // 2025-07-13 commit: feat: Add GEMINI_DEFAULT_AUTH_TYPE support
    date: '2025-07-13',
    description: 'feat: Add GEMINI_DEFAULT_AUTH_TYPE support'
  },
  
  // Research CLI configuration
  researchCli: {
    version: '0.4.5',
    name: '@iechor/research-cli',
    repository: 'https://github.com/iechor-research/research-cli.git'
  },
  
  // Merge configuration
  merge: {
    batchSize: 10,
    priorityOrder: [
      'critical',
      'security', 
      'refactor',
      'feature',
      'test',
      'build',
      'deps',
      'docs',
      'other'
    ]
  },
  
  // Branding replacement configuration
  branding: {
    replacements: {
      // Package names
      '@google/gemini-cli': '@iechor/research-cli',
      'gemini-cli': 'research-cli',
      
      // Repository URLs
      'google-gemini/gemini-cli': 'iechor-research/research-cli',
      'gemini.google.com': 'research.iechor.com',
      'aistudio.google.com': 'research.iechor.com',
      
      // Command names
      'gemini ': 'research ',
      '`gemini`': '`research`',
      'command gemini': 'command research',
      'alias gemini': 'alias research',
      
      // Branding text
      'Gemini CLI': 'Research CLI',
      'Gemini Code Assist': 'Research Code Assist',
      'Gemini 2.5 Pro': 'Research 2.5 Pro',
      'Gemini 2.5 Flash': 'Research 2.5 Flash',
      'Gemini API': 'Research API',
      'Gemini models': 'Research models',
      'Gemini Studio': 'Research Studio',
      
      // Environment variables
      'GEMINI_API_KEY': 'RESEARCH_API_KEY',
      'GOOGLE_GENAI_USE_VERTEXAI': 'RESEARCH_USE_VERTEXAI',
      'GOOGLE_CLOUD_PROJECT': 'RESEARCH_CLOUD_PROJECT',
      
      // Configuration keys
      '"gemini"': '"research"',
      '"Gemini"': '"Research"',
      '"GEMINI"': '"RESEARCH"',
      
      // File paths and directories
      '.gemini': '.research',
      'gemini.md': 'research.md',
      'GEMINI.md': 'RESEARCH.md',
      
      // Documentation references
      'gemini-cli.github.io': 'research-cli.iechor.com',
      'google-gemini.github.io': 'iechor-research.github.io'
    }
  },
  
  // Package.json merge configuration
  packageJson: {
    // Fields to preserve from Research CLI
    preserveFields: [
      'name',
      'description', 
      'author',
      'repository',
      'config',
      'bin',
      'files',
      'workspaces',
      'private'
    ],
    
    // Fields to merge (combine both)
    mergeFields: [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies',
      'engines',
      'os',
      'cpu',
      'overrides',
      'resolutions'
    ],
    
    // Fields to update from upstream (if newer)
    updateFields: [
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
    ],
    
    // Research CLI specific scripts to preserve
    preserveScripts: [
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
    ]
  },
  
  // Testing configuration
  testing: {
    commands: [
      'npm run test:ci',
      'npm run build:all',
      'npm run test:integration:all'
    ],
    additionalTests: [
      'npm run preflight',
      'npm run test:cross-platform'
    ]
  },
  
  // File patterns to process
  filePatterns: [
    '*.ts',
    '*.tsx', 
    '*.js',
    '*.jsx',
    '*.json',
    '*.md',
    '*.txt',
    '*.yml',
    '*.yaml',
    '*.sh',
    '*.bat',
    '*.cmd',
    '*.ps1'
  ],
  
  // Directories to exclude
  excludePatterns: [
    './node_modules/*',
    './.git/*',
    './dist/*',
    './build/*',
    './target/*',
    './.next/*',
    './.nuxt/*',
    './.cache/*',
    './coverage/*'
  ]
};

// Helper functions
export function getForkPoint() {
  return UPSTREAM_CONFIG.forkPoint.commit;
}

export function getUpstreamBranch() {
  return UPSTREAM_CONFIG.upstream.branch;
}

export function getResearchCliVersion() {
  return UPSTREAM_CONFIG.researchCli.version;
}

export function getBrandingReplacements() {
  return UPSTREAM_CONFIG.branding.replacements;
}

export function getPackageJsonConfig() {
  return UPSTREAM_CONFIG.packageJson;
}

export function getFilePatterns() {
  return UPSTREAM_CONFIG.filePatterns;
}

export function getExcludePatterns() {
  return UPSTREAM_CONFIG.excludePatterns;
}

export function getMergePriorityOrder() {
  return UPSTREAM_CONFIG.merge.priorityOrder;
}

export function getBatchSize() {
  return UPSTREAM_CONFIG.merge.batchSize;
}

export function getTestingCommands() {
  return UPSTREAM_CONFIG.testing.commands;
}

export function getAdditionalTests() {
  return UPSTREAM_CONFIG.testing.additionalTests;
}
