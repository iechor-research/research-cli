#!/usr/bin/env node
/**
 * Individual Command Testing Script for Research CLI
 * Tests each command individually with detailed validation
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Individual command test definitions
const COMMAND_TESTS = {
  'Core CLI Commands': [
    {
      name: 'Help Command',
      args: ['--help'],
      expectation: {
        exitCode: 0,
        stdoutContains: ['Research CLI', 'Usage:', 'Options:'],
        maxTime: 5000
      }
    },
    {
      name: 'Version Command',
      args: ['--version'],
      expectation: {
        exitCode: 0,
        stdoutContains: ['0.2'],
        maxTime: 3000
      }
    },
    {
      name: 'Basic Prompt Mode',
      args: ['-p', 'Hello, can you help me?'],
      expectation: {
        exitCode: 0,
        maxTime: 15000
      }
    }
  ],

  'Slash Commands': [
    {
      name: 'Help Slash Command',
      args: ['-p', '/help'],
      expectation: {
        exitCode: 0,
        stdoutContains: ['help', 'commands'],
        maxTime: 10000
      }
    },
    {
      name: 'About Command',
      args: ['-p', '/about'],
      expectation: {
        exitCode: 0,
        stdoutContains: ['version', 'Research CLI'],
        maxTime: 10000
      }
    },
    {
      name: 'Tools Command',
      args: ['-p', '/tools'],
      expectation: {
        exitCode: 0,
        stdoutContains: ['tools', 'available'],
        maxTime: 10000
      }
    }
  ],

  'Research Commands': [
    {
      name: 'Research Help',
      args: ['-p', '/research help'],
      expectation: {
        exitCode: 0,
        stdoutContains: ['research', 'subcommand'],
        maxTime: 10000
      }
    },
    {
      name: 'Research Search - Basic',
      args: ['-p', '/research search "test query" --limit=1'],
      expectation: {
        exitCode: 0,
        maxTime: 20000
      }
    },
    {
      name: 'Research Search - arXiv',
      args: ['-p', '/research search "machine learning" --source=arxiv --limit=2'],
      expectation: {
        exitCode: 0,
        maxTime: 25000
      }
    }
  ],

  'Paper Commands': [
    {
      name: 'Paper Outline - Basic',
      args: ['-p', '/paper outline "Test Paper Title"'],
      expectation: {
        exitCode: 0,
        maxTime: 15000
      }
    },
    {
      name: 'Paper Outline - Research Type',
      args: ['-p', '/paper outline "AI Research" --type=research'],
      expectation: {
        exitCode: 0,
        maxTime: 15000
      }
    }
  ],

  'Submit Commands': [
    {
      name: 'Submit Journal Matching',
      args: ['-p', '/submit journal --topic="artificial intelligence"'],
      expectation: {
        exitCode: 0,
        maxTime: 15000
      }
    },
    {
      name: 'Submit LaTeX Help',
      args: ['-p', '/submit latex --help'],
      expectation: {
        exitCode: 0,
        stdoutContains: ['latex', 'project'],
        maxTime: 10000
      }
    }
  ],

  'File Operations': [
    {
      name: 'At Command - Current Directory',
      args: ['-p', '@. What files are in this directory?'],
      expectation: {
        exitCode: 0,
        maxTime: 15000
      }
    },
    {
      name: 'At Command - Specific File',
      args: ['-p', '@package.json What is this file about?'],
      expectation: {
        exitCode: 0,
        stdoutContains: ['package', 'research-cli'],
        maxTime: 15000
      }
    }
  ],

  'Error Handling': [
    {
      name: 'Invalid Command',
      args: ['-p', '/nonexistent_command'],
      expectation: {
        exitCode: 0, // Should handle gracefully
        maxTime: 10000
      }
    },
    {
      name: 'Invalid File Reference',
      args: ['-p', '@nonexistent_file.txt What is this?'],
      expectation: {
        exitCode: 0, // Should handle gracefully
        maxTime: 10000
      }
    },
    {
      name: 'Empty Research Query',
      args: ['-p', '/research search ""'],
      expectation: {
        exitCode: 0, // Should handle gracefully
        maxTime: 10000
      }
    }
  ]
};

class IndividualCommandTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      categories: {},
      details: []
    };
    this.cliPath = this.determineCLIPath();
  }

  determineCLIPath() {
    // Try to find the best CLI path
    const possiblePaths = [
      path.join(__dirname, 'bundle', 'research.js'),
      path.join(__dirname, 'packages', 'cli', 'dist', 'index.js'),
      'npx @iechor/research-cli'
    ];

    return 'node'; // Default to node with package path
  }

  async runSingleCommand(args, timeout = 30000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      let command, commandArgs;
      if (this.cliPath === 'node') {
        command = 'node';
        commandArgs = [path.join(__dirname, 'packages', 'cli', 'dist', 'index.js'), ...args];
      } else {
        command = this.cliPath;
        commandArgs = args;
      }

      const childProcess = spawn(command, commandArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { 
          ...process.env, 
          NODE_ENV: 'test',
          RESEARCH_TEST_MODE: 'true'
        }
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        childProcess.kill('SIGTERM');
      }, timeout);

      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          exitCode: code,
          stdout,
          stderr,
          executionTime: Date.now() - startTime,
          timedOut,
          command: `${command} ${commandArgs.join(' ')}`
        });
      });

      childProcess.on('error', (error) => {
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

      // End stdin immediately
      childProcess.stdin.end();
    });
  }

  validateResult(result, expectation) {
    const validations = [];
    let passed = true;

    // Check exit code
    if (expectation.exitCode !== undefined) {
      const exitCodeValid = result.exitCode === expectation.exitCode;
      validations.push({
        check: 'Exit Code',
        expected: expectation.exitCode,
        actual: result.exitCode,
        passed: exitCodeValid
      });
      if (!exitCodeValid) passed = false;
    }

    // Check stdout contains
    if (expectation.stdoutContains) {
      for (const text of expectation.stdoutContains) {
        const contains = result.stdout.toLowerCase().includes(text.toLowerCase());
        validations.push({
          check: `Stdout contains "${text}"`,
          expected: true,
          actual: contains,
          passed: contains
        });
        if (!contains) passed = false;
      }
    }

    // Check stderr contains
    if (expectation.stderrContains) {
      for (const text of expectation.stderrContains) {
        const contains = result.stderr.toLowerCase().includes(text.toLowerCase());
        validations.push({
          check: `Stderr contains "${text}"`,
          expected: true,
          actual: contains,
          passed: contains
        });
        if (!contains) passed = false;
      }
    }

    // Check execution time
    if (expectation.maxTime) {
      const timeValid = result.executionTime <= expectation.maxTime;
      validations.push({
        check: 'Execution Time',
        expected: `<= ${expectation.maxTime}ms`,
        actual: `${result.executionTime}ms`,
        passed: timeValid
      });
      if (!timeValid) passed = false;
    }

    return { passed, validations };
  }

  async testCategory(categoryName, tests) {
    console.log(`\n🔍 Testing Category: ${categoryName}`);
    console.log('='.repeat(50));

    const categoryResults = {
      total: tests.length,
      passed: 0,
      failed: 0,
      tests: []
    };

    for (const test of tests) {
      this.results.total++;
      console.log(`\n📋 Test: ${test.name}`);
      console.log(`💻 Command: ${test.args.join(' ')}`);

      try {
        const result = await this.runSingleCommand(test.args, test.expectation.maxTime);
        const validation = this.validateResult(result, test.expectation);

        const testResult = {
          name: test.name,
          command: test.args.join(' '),
          ...result,
          ...validation,
          category: categoryName
        };

        if (validation.passed) {
          this.results.passed++;
          categoryResults.passed++;
          console.log('✅ PASSED');
        } else {
          this.results.failed++;
          categoryResults.failed++;
          console.log('❌ FAILED');
        }

        // Show validation details
        validation.validations.forEach(v => {
          const status = v.passed ? '✅' : '❌';
          console.log(`   ${status} ${v.check}: ${v.actual} ${v.expected ? `(expected: ${v.expected})` : ''}`);
        });

        console.log(`   ⏱️  Execution time: ${result.executionTime}ms`);

        categoryResults.tests.push(testResult);
        this.results.details.push(testResult);

      } catch (error) {
        this.results.failed++;
        categoryResults.failed++;
        console.log(`❌ ERROR: ${error.message}`);
        
        const errorResult = {
          name: test.name,
          command: test.args.join(' '),
          error: error.message,
          passed: false,
          category: categoryName
        };
        
        categoryResults.tests.push(errorResult);
        this.results.details.push(errorResult);
      }
    }

    this.results.categories[categoryName] = categoryResults;
    
    const passRate = ((categoryResults.passed / categoryResults.total) * 100).toFixed(1);
    console.log(`\n📊 Category Summary: ${categoryResults.passed}/${categoryResults.total} passed (${passRate}%)`);
  }

  async runAllTests() {
    console.log('🚀 Starting Individual Command Tests for Research CLI');
    console.log('=' .repeat(60));
    console.log(`📍 CLI Path: ${this.cliPath}`);
    console.log(`📁 Working Directory: ${process.cwd()}`);

    const startTime = Date.now();

    for (const [categoryName, tests] of Object.entries(COMMAND_TESTS)) {
      await this.testCategory(categoryName, tests);
    }

    const totalTime = Date.now() - startTime;
    await this.generateSummaryReport(totalTime);
  }

  async generateSummaryReport(totalTime) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 FINAL TEST SUMMARY');
    console.log('='.repeat(60));

    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    
    console.log(`📊 Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`🎯 Pass Rate: ${passRate}%`);
    console.log(`⏱️  Total Time: ${(totalTime / 1000).toFixed(2)}s`);

    console.log('\n📋 Category Breakdown:');
    for (const [categoryName, categoryResult] of Object.entries(this.results.categories)) {
      const categoryPassRate = ((categoryResult.passed / categoryResult.total) * 100).toFixed(1);
      console.log(`   ${categoryName}: ${categoryResult.passed}/${categoryResult.total} (${categoryPassRate}%)`);
    }

    // Show failed tests
    const failedTests = this.results.details.filter(t => !t.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.name} (${test.category})`);
        console.log(`      Command: ${test.command}`);
        if (test.validations) {
          const failedValidations = test.validations.filter(v => !v.passed);
          failedValidations.forEach(v => {
            console.log(`      ❌ ${v.check}: got ${v.actual}, expected ${v.expected}`);
          });
        }
        if (test.error) {
          console.log(`      Error: ${test.error}`);
        }
      });
    }

    // Save detailed JSON report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        passRate: passRate,
        totalTimeMs: totalTime
      },
      categories: this.results.categories,
      details: this.results.details
    };

    const reportPath = path.join(__dirname, 'individual-command-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);

    console.log('\n🎉 Individual Command Testing Complete!');
    return this.results.failed === 0;
  }
}

// Main execution
async function main() {
  const tester = new IndividualCommandTester();
  
  try {
    const success = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`💥 Fatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { IndividualCommandTester, COMMAND_TESTS };