#!/usr/bin/env node

/**
 * Research CLI Launcher
 * This script provides better compatibility across different Linux systems
 */

const path = require('path');
const { spawn } = require('child_process');

// Find the actual CLI entry point
const cliPath = path.join(__dirname, '..', 'dist', 'index.js');

// Launch the CLI with all arguments
const child = spawn('node', [cliPath, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

// Forward exit code
child.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle errors
child.on('error', (error) => {
  console.error('Failed to start Research CLI:', error.message);
  process.exit(1);
}); 