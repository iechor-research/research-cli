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
  //
  // The fork-point commit is an *upstream* commit that is not present in this
  // repository's own history. It only becomes resolvable after `git fetch upstream`
  // has been run. CI workflows and tooling MUST fetch upstream before reading
  // this value. See docs/upstream-sync/README.md.
  forkPoint: {
    commit: '26a79fec', // 2025-07-13 commit: feat: Add GEMINI_DEFAULT_AUTH_TYPE support
    date: '2025-07-13',
    description: 'feat: Add GEMINI_DEFAULT_AUTH_TYPE support'
  },

  // Path-based subsystem categorisation. Used by monitor-upstream.js to group
  // upstream commits by which fork subsystem they touch. Order matters: the
  // first matching prefix wins.
  pathCategories: [
    { name: 'core-utils',     prefix: 'packages/core/src/utils/' },
    { name: 'core-tools',     prefix: 'packages/core/src/tools/' },
    { name: 'core-services',  prefix: 'packages/core/src/services/' },
    { name: 'core-config',    prefix: 'packages/core/src/config/' },
    { name: 'core-mcp',       prefix: 'packages/core/src/mcp/' },
    { name: 'core-codeassist',prefix: 'packages/core/src/code_assist/' },
    { name: 'core-other',     prefix: 'packages/core/' },
    { name: 'cli-ui',         prefix: 'packages/cli/src/ui/' },
    { name: 'cli-commands',   prefix: 'packages/cli/src/commands/' },
    { name: 'cli-services',   prefix: 'packages/cli/src/services/' },
    { name: 'cli-other',      prefix: 'packages/cli/' },
    { name: 'a2a-server',     prefix: 'packages/a2a-server/' },
    { name: 'vscode-ide',     prefix: 'packages/vscode-ide-companion/' },
    { name: 'sdk',            prefix: 'packages/sdk/' },
    { name: 'docs',           prefix: 'docs/' },
    { name: 'workflows',      prefix: '.github/workflows/' },
    { name: 'github-actions', prefix: '.github/actions/' },
    { name: 'gemini-skills',  prefix: '.gemini/skills/' },
    { name: 'gemini-commands',prefix: '.gemini/commands/' },
    { name: 'integration',    prefix: 'integration-tests/' },
    { name: 'scripts',        prefix: 'scripts/' },
  ],
  
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

export function getPathCategories() {
  return UPSTREAM_CONFIG.pathCategories;
}
