#!/usr/bin/env node
/**
 * Comprehensive CLI Testing Framework for Research CLI
 * Tests all documented functionality with real system validation
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test configuration
const TEST_CONFIG = {
  CLI_PATH: path.join(__dirname, 'bundle', 'research.js'),
  TIMEOUT: 30000, // 30 seconds per test
  TEST_DIR: path.join(__dirname, 'test-output'),
  TEMP_DIR: path.join(__dirname, 'test-temp'),
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  details: []
};

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

class CLITestFramework {
  constructor() {
    this.setupComplete = false;
  }

  async setup() {
    console.log(`${colors.cyan}${colors.bold}=== Research CLI Comprehensive Testing Framework ===${colors.reset}`);
    console.log(`${colors.blue}Setting up test environment...${colors.reset}`);

    // Create test directories
    await this.ensureDir(TEST_CONFIG.TEST_DIR);
    await this.ensureDir(TEST_CONFIG.TEMP_DIR);

    // Check if CLI exists
    try {
      await fs.access(TEST_CONFIG.CLI_PATH);
      console.log(`${colors.green}✓ CLI binary found at: ${TEST_CONFIG.CLI_PATH}${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}⚠ CLI binary not found, using development version${colors.reset}`);
      // Fallback to development version
      TEST_CONFIG.CLI_PATH = 'node';
    }

    this.setupComplete = true;
    console.log(`${colors.green}✓ Test environment setup complete${colors.reset}\n`);
  }

  async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }

  async runCommand(args, options = {}) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const timeout = options.timeout || TEST_CONFIG.TIMEOUT;
      
      // Prepare command arguments
      let command, commandArgs;
      if (TEST_CONFIG.CLI_PATH === 'node') {
        command = 'node';
        commandArgs = [path.join(__dirname, 'packages', 'cli', 'dist', 'index.js'), ...args];
      } else {
        command = TEST_CONFIG.CLI_PATH;
        commandArgs = args;
      }

      const process = spawn(command, commandArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: options.cwd || TEST_CONFIG.TEMP_DIR,
        env: { 
          ...process.env, 
          NODE_ENV: 'test',
          RESEARCH_TEST_MODE: 'true',
          ...options.env 
        }
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        process.kill('SIGTERM');
      }, timeout);

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        clearTimeout(timer);
        const executionTime = Date.now() - startTime;
        
        resolve({
          exitCode: code,
          stdout,
          stderr,
          executionTime,
          timedOut,
          command: `${command} ${commandArgs.join(' ')}`
        });
      });

      process.on('error', (error) => {
        clearTimeout(timer);
        resolve({
          exitCode: -1,
          stdout,
          stderr: stderr + error.message,
          executionTime: Date.now() - startTime,
          timedOut,
          error: error.message,
          command: `${command} ${commandArgs.join(' ')}`
        });
      });

      // Send input if provided
      if (options.input) {
        process.stdin.write(options.input);
      }
      process.stdin.end();
    });
  }

  async testCommand(testName, args, expectedResults = {}) {
    testResults.total++;
    console.log(`${colors.blue}Testing: ${testName}${colors.reset}`);
    console.log(`${colors.cyan}Command: ${args.join(' ')}${colors.reset}`);

    try {
      const result = await this.runCommand(args, expectedResults.options);
      
      const testDetail = {
        name: testName,
        command: args.join(' '),
        ...result,
        expected: expectedResults,
        status: 'unknown'
      };

      // Validate results
      let passed = true;
      const validations = [];

      // Check exit code
      if (expectedResults.exitCode !== undefined) {
        const exitCodeValid = result.exitCode === expectedResults.exitCode;
        validations.push(`Exit Code: ${exitCodeValid ? '✓' : '✗'} (expected: ${expectedResults.exitCode}, got: ${result.exitCode})`);
        if (!exitCodeValid) passed = false;
      }

      // Check stdout contains
      if (expectedResults.stdoutContains) {
        for (const text of expectedResults.stdoutContains) {
          const contains = result.stdout.includes(text);
          validations.push(`Stdout contains "${text}": ${contains ? '✓' : '✗'}`);
          if (!contains) passed = false;
        }
      }

      // Check stderr contains
      if (expectedResults.stderrContains) {
        for (const text of expectedResults.stderrContains) {
          const contains = result.stderr.includes(text);
          validations.push(`Stderr contains "${text}": ${contains ? '✓' : '✗'}`);
          if (!contains) passed = false;
        }
      }

      // Check execution time
      if (expectedResults.maxExecutionTime) {
        const timeValid = result.executionTime <= expectedResults.maxExecutionTime;
        validations.push(`Execution Time: ${timeValid ? '✓' : '✗'} (${result.executionTime}ms <= ${expectedResults.maxExecutionTime}ms)`);
        if (!timeValid) passed = false;
      }

      // Check file creation
      if (expectedResults.createsFiles) {
        for (const filePath of expectedResults.createsFiles) {
          const fullPath = path.join(TEST_CONFIG.TEMP_DIR, filePath);
          try {
            await fs.access(fullPath);
            validations.push(`Creates file "${filePath}": ✓`);
          } catch {
            validations.push(`Creates file "${filePath}": ✗`);
            passed = false;
          }
        }
      }

      testDetail.validations = validations;
      testDetail.status = passed ? 'passed' : 'failed';

      if (passed) {
        testResults.passed++;
        console.log(`${colors.green}✓ PASSED${colors.reset}`);
      } else {
        testResults.failed++;
        console.log(`${colors.red}✗ FAILED${colors.reset}`);
        testResults.errors.push({
          test: testName,
          command: args.join(' '),
          validations: validations.filter(v => v.includes('✗'))
        });
      }

      // Show validations
      validations.forEach(v => {
        const color = v.includes('✓') ? colors.green : colors.red;
        console.log(`  ${color}${v}${colors.reset}`);
      });

      testResults.details.push(testDetail);
      console.log(`  Execution time: ${result.executionTime}ms\n`);

    } catch (error) {
      testResults.failed++;
      console.log(`${colors.red}✗ ERROR: ${error.message}${colors.reset}\n`);
      testResults.errors.push({
        test: testName,
        command: args.join(' '),
        error: error.message
      });
    }
  }

  async runAllTests() {
    if (!this.setupComplete) {
      await this.setup();
    }

    console.log(`${colors.bold}${colors.magenta}=== STARTING COMPREHENSIVE CLI TESTS ===${colors.reset}\n`);

    // Core CLI Commands
    await this.testCoreCommands();
    
    // Research Commands
    await this.testResearchCommands();
    
    // Paper Commands
    await this.testPaperCommands();
    
    // Submit Commands
    await this.testSubmitCommands();
    
    // Integration Tests
    await this.testIntegrationWorkflows();
    
    // Error Handling Tests
    await this.testErrorHandling();

    // Generate final report
    await this.generateReport();
  }

  async testCoreCommands() {
    console.log(`${colors.bold}${colors.yellow}=== CORE CLI COMMANDS ===${colors.reset}\n`);

    await this.testCommand(
      'Help Command - Basic',
      ['--help'],
      {
        exitCode: 0,
        stdoutContains: ['Research CLI', 'options'],
        maxExecutionTime: 5000
      }
    );

    await this.testCommand(
      'Version Information',
      ['--version'],
      {
        exitCode: 0,
        stdoutContains: ['0.2'],
        maxExecutionTime: 5000
      }
    );

    await this.testCommand(
      'Non-interactive Mode - Simple Prompt',
      ['-p', 'What is the current directory?'],
      {
        exitCode: 0,
        maxExecutionTime: 15000
      }
    );
  }

  async testResearchCommands() {
    console.log(`${colors.bold}${colors.yellow}=== RESEARCH COMMANDS ===${colors.reset}\n`);

    // Create test data file
    const testDataPath = path.join(TEST_CONFIG.TEMP_DIR, 'test_data.csv');
    const testData = 'name,age,score\nAlice,25,85\nBob,30,92\nCharlie,35,78';
    await fs.writeFile(testDataPath, testData);

    await this.testCommand(
      'Research Help',
      ['-p', '/research help'],
      {
        exitCode: 0,
        stdoutContains: ['research', 'commands'],
        maxExecutionTime: 10000
      }
    );

    await this.testCommand(
      'Research Search - arXiv',
      ['-p', '/research search "machine learning" --source=arxiv --limit=3'],
      {
        exitCode: 0,
        maxExecutionTime: 20000
      }
    );

    await this.testCommand(
      'Research Data Analysis',
      ['-p', `/research data describe ${testDataPath}`],
      {
        exitCode: 0,
        maxExecutionTime: 15000
      }
    );
  }

  async testPaperCommands() {
    console.log(`${colors.bold}${colors.yellow}=== PAPER COMMANDS ===${colors.reset}\n`);

    await this.testCommand(
      'Paper Outline Generation',
      ['-p', '/paper outline "AI in Healthcare" --type=research'],
      {
        exitCode: 0,
        maxExecutionTime: 15000
      }
    );

    // Create test document
    const testDoc = path.join(TEST_CONFIG.TEMP_DIR, 'test_paper.md');
    const docContent = '# Test Paper\n## Abstract\nThis is a test.\n## Introduction\nIntroduction content.';
    await fs.writeFile(testDoc, docContent);

    await this.testCommand(
      'Paper Analysis',
      ['-p', `/research analyze ${testDoc} --type=structure`],
      {
        exitCode: 0,
        maxExecutionTime: 15000
      }
    );
  }

  async testSubmitCommands() {
    console.log(`${colors.bold}${colors.yellow}=== SUBMISSION COMMANDS ===${colors.reset}\n`);

    await this.testCommand(
      'Journal Matching',
      ['-p', '/submit journal --topic="machine learning" --field="computer science"'],
      {
        exitCode: 0,
        maxExecutionTime: 15000
      }
    );

    await this.testCommand(
      'LaTeX Project Creation',
      ['-p', '/submit latex create --project=test_project --template=ieee'],
      {
        exitCode: 0,
        maxExecutionTime: 15000
      }
    );
  }

  async testIntegrationWorkflows() {
    console.log(`${colors.bold}${colors.yellow}=== INTEGRATION WORKFLOWS ===${colors.reset}\n`);

    // Test complete research workflow
    await this.testCommand(
      'Complete Research Workflow',
      ['-p', `
        /research search "artificial intelligence" --source=arxiv --limit=2
        /paper outline "AI Research Paper" --type=research
        /submit journal --topic="artificial intelligence"
      `],
      {
        exitCode: 0,
        maxExecutionTime: 30000
      }
    );
  }

  async testErrorHandling() {
    console.log(`${colors.bold}${colors.yellow}=== ERROR HANDLING ===${colors.reset}\n`);

    await this.testCommand(
      'Invalid Command',
      ['-p', '/invalid_command'],
      {
        exitCode: 0, // CLI should handle gracefully
        maxExecutionTime: 10000
      }
    );

    await this.testCommand(
      'Missing File Analysis',
      ['-p', '/research analyze nonexistent_file.pdf'],
      {
        exitCode: 0, // Should handle gracefully
        maxExecutionTime: 10000
      }
    );

    await this.testCommand(
      'Empty Search Query',
      ['-p', '/research search ""'],
      {
        exitCode: 0, // Should handle gracefully
        maxExecutionTime: 10000
      }
    );
  }

  async generateReport() {
    console.log(`${colors.bold}${colors.magenta}=== TEST RESULTS SUMMARY ===${colors.reset}\n`);

    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    
    console.log(`${colors.bold}Total Tests: ${testResults.total}${colors.reset}`);
    console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
    console.log(`${colors.yellow}Skipped: ${testResults.skipped}${colors.reset}`);
    console.log(`${colors.cyan}Pass Rate: ${passRate}%${colors.reset}\n`);

    if (testResults.errors.length > 0) {
      console.log(`${colors.bold}${colors.red}=== FAILED TESTS ===${colors.reset}`);
      testResults.errors.forEach((error, index) => {
        console.log(`${colors.red}${index + 1}. ${error.test}${colors.reset}`);
        console.log(`   Command: ${error.command}`);
        if (error.validations) {
          error.validations.forEach(v => console.log(`   ${v}`));
        }
        if (error.error) {
          console.log(`   Error: ${error.error}`);
        }
        console.log();
      });
    }

    // Save detailed report
    const reportPath = path.join(TEST_CONFIG.TEST_DIR, 'test-report.json');
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        skipped: testResults.skipped,
        passRate: passRate
      },
      errors: testResults.errors,
      details: testResults.details
    }, null, 2));

    console.log(`${colors.cyan}Detailed report saved to: ${reportPath}${colors.reset}`);

    // Generate HTML report
    await this.generateHtmlReport();
  }

  async generateHtmlReport() {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Research CLI Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e8f4f8; padding: 15px; border-radius: 5px; text-align: center; }
        .passed { background: #d4edda; }
        .failed { background: #f8d7da; }
        .test-detail { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .test-passed { border-left: 5px solid #28a745; }
        .test-failed { border-left: 5px solid #dc3545; }
        .validation { margin: 5px 0; }
        .validation.passed { color: #28a745; }
        .validation.failed { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Research CLI Comprehensive Test Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div style="font-size: 2em; font-weight: bold;">${testResults.total}</div>
        </div>
        <div class="metric passed">
            <h3>Passed</h3>
            <div style="font-size: 2em; font-weight: bold;">${testResults.passed}</div>
        </div>
        <div class="metric failed">
            <h3>Failed</h3>
            <div style="font-size: 2em; font-weight: bold;">${testResults.failed}</div>
        </div>
        <div class="metric">
            <h3>Pass Rate</h3>
            <div style="font-size: 2em; font-weight: bold;">${((testResults.passed / testResults.total) * 100).toFixed(2)}%</div>
        </div>
    </div>

    <h2>Test Details</h2>
    ${testResults.details.map(test => `
        <div class="test-detail test-${test.status}">
            <h3>${test.name}</h3>
            <p><strong>Command:</strong> <code>${test.command}</code></p>
            <p><strong>Execution Time:</strong> ${test.executionTime}ms</p>
            <p><strong>Exit Code:</strong> ${test.exitCode}</p>
            ${test.validations ? `
                <div>
                    <strong>Validations:</strong>
                    ${test.validations.map(v => `
                        <div class="validation ${v.includes('✓') ? 'passed' : 'failed'}">${v}</div>
                    `).join('')}
                </div>
            ` : ''}
            ${test.stdout ? `<details><summary>Stdout</summary><pre>${test.stdout}</pre></details>` : ''}
            ${test.stderr ? `<details><summary>Stderr</summary><pre>${test.stderr}</pre></details>` : ''}
        </div>
    `).join('')}
</body>
</html>`;

    const htmlPath = path.join(TEST_CONFIG.TEST_DIR, 'test-report.html');
    await fs.writeFile(htmlPath, htmlContent);
    console.log(`${colors.cyan}HTML report saved to: ${htmlPath}${colors.reset}`);
  }

  async cleanup() {
    console.log(`${colors.blue}Cleaning up test environment...${colors.reset}`);
    try {
      await fs.rm(TEST_CONFIG.TEMP_DIR, { recursive: true, force: true });
      console.log(`${colors.green}✓ Cleanup complete${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}⚠ Cleanup warning: ${error.message}${colors.reset}`);
    }
  }
}

// Main execution
async function main() {
  const framework = new CLITestFramework();
  
  try {
    await framework.runAllTests();
  } catch (error) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    await framework.cleanup();
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CLITestFramework, TEST_CONFIG };