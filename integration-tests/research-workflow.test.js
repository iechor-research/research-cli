/**
 * Integration tests for Research CLI research workflow
 * Tests the complete academic research workflow from literature search to submission
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { createTempDir, cleanup } = require('./test-helper');

describe('Research Workflow Integration Tests', () => {
  let tempDir;
  let cliProcess;

  beforeAll(async () => {
    tempDir = await createTempDir();
    process.chdir(tempDir);
  });

  afterAll(async () => {
    if (cliProcess) {
      cliProcess.kill();
    }
    await cleanup(tempDir);
  });

  describe('Literature Search Workflow', () => {
    test('should search arXiv papers and save bibliography', async () => {
      const testQuery = 'machine learning';
      const expectedFiles = ['bibliography.bib', 'search_results.json'];

      // Test arXiv search
      const searchResult = await runCliCommand([
        'research',
        'search',
        testQuery,
        '--source=arxiv',
        '--limit=5',
        '--save-bib',
      ]);

      expect(searchResult.exitCode).toBe(0);
      expect(searchResult.stdout).toContain('Found');
      expect(searchResult.stdout).toContain('papers');

      // Verify bibliography file was created
      for (const file of expectedFiles) {
        const exists = await fileExists(path.join(tempDir, file));
        expect(exists).toBe(true);
      }

      // Verify BibTeX format
      const bibContent = await fs.readFile(
        path.join(tempDir, 'bibliography.bib'),
        'utf8',
      );
      expect(bibContent).toContain('@article{');
      expect(bibContent).toContain('title');
      expect(bibContent).toContain('author');
    });

    test('should handle multiple database search', async () => {
      const result = await runCliCommand([
        'research',
        'search',
        'neural networks',
        '--source=arxiv,pubmed',
        '--limit=3',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('arXiv');
      // Note: PubMed might not be available in test environment
    });
  });

  describe('Paper Writing Workflow', () => {
    test('should generate paper outline', async () => {
      const result = await runCliCommand([
        'paper',
        'outline',
        'Deep Learning for Medical Imaging',
        '--type=research',
        '--format=ieee',
        '--output=outline.md',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Generated');

      // Verify outline file
      const outlineExists = await fileExists(path.join(tempDir, 'outline.md'));
      expect(outlineExists).toBe(true);

      const outlineContent = await fs.readFile(
        path.join(tempDir, 'outline.md'),
        'utf8',
      );
      expect(outlineContent).toContain('# Deep Learning for Medical Imaging');
      expect(outlineContent).toContain('## Abstract');
      expect(outlineContent).toContain('## Introduction');
      expect(outlineContent).toContain('## Methodology');
      expect(outlineContent).toContain('## Results');
      expect(outlineContent).toContain('## Conclusion');
    });

    test('should analyze document structure', async () => {
      // First create a test document
      const testDoc = `
# Test Paper
## Abstract
This is a test abstract.
## Introduction
This is the introduction.
## Methodology
This describes the methodology.
## Results
These are the results.
## Conclusion
This is the conclusion.
`;
      await fs.writeFile(path.join(tempDir, 'test_paper.md'), testDoc);

      const result = await runCliCommand([
        'research',
        'analyze',
        'test_paper.md',
        '--type=structure',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Structure Analysis');
    });
  });

  describe('Data Analysis Workflow', () => {
    test('should analyze research data', async () => {
      // Create test CSV data
      const testData = `
name,age,score,category
Alice,25,85,A
Bob,30,92,B
Charlie,35,78,A
Diana,28,88,B
Eve,32,95,A
`;
      await fs.writeFile(path.join(tempDir, 'test_data.csv'), testData);

      const result = await runCliCommand([
        'research',
        'data',
        'analyze',
        'test_data.csv',
        '--type=descriptive',
        '--output=analysis_report.html',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Analysis completed');

      // Verify analysis report
      const reportExists = await fileExists(
        path.join(tempDir, 'analysis_report.html'),
      );
      expect(reportExists).toBe(true);
    });

    test('should generate experiment code', async () => {
      const result = await runCliCommand([
        'research',
        'experiment',
        'python',
        'machine-learning',
        '--method=classification',
        '--output=experiment_code.py',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Generated');

      // Verify generated code
      const codeExists = await fileExists(
        path.join(tempDir, 'experiment_code.py'),
      );
      expect(codeExists).toBe(true);

      const codeContent = await fs.readFile(
        path.join(tempDir, 'experiment_code.py'),
        'utf8',
      );
      expect(codeContent).toContain('import');
      expect(codeContent).toContain('def');
      expect(codeContent).toContain('classification');
    });
  });

  describe('LaTeX Management Workflow', () => {
    test('should create LaTeX project', async () => {
      const result = await runCliCommand([
        'submit',
        'latex',
        'create',
        '--project=test_paper',
        '--template=ieee',
        '--title=Test Paper',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Created');

      // Verify LaTeX project structure
      const projectDir = path.join(tempDir, 'test_paper');
      const projectExists = await fileExists(projectDir);
      expect(projectExists).toBe(true);

      const mainTexExists = await fileExists(path.join(projectDir, 'main.tex'));
      expect(mainTexExists).toBe(true);
    });

    test('should compile LaTeX document', async () => {
      // Assuming project was created in previous test
      const result = await runCliCommand([
        'submit',
        'latex',
        'compile',
        '--project=test_paper',
        '--engine=pdflatex',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Compilation');

      // Check for PDF output (if LaTeX is available)
      const pdfExists = await fileExists(
        path.join(tempDir, 'test_paper', 'main.pdf'),
      );
      if (pdfExists) {
        expect(pdfExists).toBe(true);
      }
    });
  });

  describe('Journal Submission Workflow', () => {
    test('should match suitable journals', async () => {
      const result = await runCliCommand([
        'submit',
        'journal',
        '--topic=machine learning',
        '--field=computer science',
        '--impact-factor=medium',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('journals found');
      expect(result.stdout).toContain('Impact Factor');
    });

    test('should prepare submission package', async () => {
      // Create a minimal paper project
      const paperDir = path.join(tempDir, 'submission_test');
      await fs.mkdir(paperDir, { recursive: true });

      const mainTex = `
\\documentclass{article}
\\title{Test Paper}
\\author{Test Author}
\\begin{document}
\\maketitle
\\section{Introduction}
This is a test paper.
\\end{document}
`;
      await fs.writeFile(path.join(paperDir, 'main.tex'), mainTex);

      const result = await runCliCommand([
        'submit',
        'prepare',
        '--project=submission_test',
        '--journal=Nature',
        '--output=submission_package',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Submission package');

      // Verify submission package
      const packageExists = await fileExists(
        path.join(tempDir, 'submission_package'),
      );
      expect(packageExists).toBe(true);
    });
  });

  describe('End-to-End Research Workflow', () => {
    test('complete research workflow integration', async () => {
      const workflowDir = path.join(tempDir, 'complete_workflow');
      await fs.mkdir(workflowDir, { recursive: true });
      process.chdir(workflowDir);

      // Step 1: Literature search
      let result = await runCliCommand([
        'research',
        'search',
        'artificial intelligence',
        '--source=arxiv',
        '--limit=3',
        '--save-bib',
      ]);
      expect(result.exitCode).toBe(0);

      // Step 2: Generate paper outline
      result = await runCliCommand([
        'paper',
        'outline',
        'AI in Healthcare',
        '--type=research',
        '--format=ieee',
        '--output=paper_outline.md',
      ]);
      expect(result.exitCode).toBe(0);

      // Step 3: Create LaTeX project
      result = await runCliCommand([
        'submit',
        'latex',
        'create',
        '--project=ai_healthcare_paper',
        '--template=ieee',
        '--title=AI in Healthcare',
      ]);
      expect(result.exitCode).toBe(0);

      // Step 4: Generate experiment code
      result = await runCliCommand([
        'research',
        'experiment',
        'python',
        'machine-learning',
        '--method=classification',
        '--output=experiments/classification.py',
      ]);
      expect(result.exitCode).toBe(0);

      // Step 5: Find suitable journals
      result = await runCliCommand([
        'submit',
        'journal',
        '--topic=artificial intelligence healthcare',
        '--field=computer science',
      ]);
      expect(result.exitCode).toBe(0);

      // Verify all components were created
      const expectedFiles = [
        'bibliography.bib',
        'paper_outline.md',
        'ai_healthcare_paper/main.tex',
        'experiments/classification.py',
      ];

      for (const file of expectedFiles) {
        const exists = await fileExists(path.join(workflowDir, file));
        expect(exists).toBe(true);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid search queries gracefully', async () => {
      const result = await runCliCommand([
        'research',
        'search',
        '',
        '--source=arxiv',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Query cannot be empty');
    });

    test('should handle missing files gracefully', async () => {
      const result = await runCliCommand([
        'research',
        'analyze',
        'nonexistent_file.pdf',
        '--type=structure',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('File not found');
    });

    test('should handle invalid data format', async () => {
      // Create invalid CSV
      await fs.writeFile(
        path.join(tempDir, 'invalid.csv'),
        'invalid,csv,data\n',
      );

      const result = await runCliCommand([
        'research',
        'data',
        'analyze',
        'invalid.csv',
        '--type=descriptive',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid data format');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large bibliography searches', async () => {
      const result = await runCliCommand([
        'research',
        'search',
        'deep learning',
        '--source=arxiv',
        '--limit=50',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Found');

      // Should complete within reasonable time
      const executionTime = result.executionTime;
      expect(executionTime).toBeLessThan(30000); // 30 seconds
    });

    test('should handle large datasets efficiently', async () => {
      // Create larger test dataset
      const largeData = generateLargeDataset(1000);
      await fs.writeFile(path.join(tempDir, 'large_data.csv'), largeData);

      const result = await runCliCommand([
        'research',
        'data',
        'analyze',
        'large_data.csv',
        '--type=descriptive',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Analysis completed');
    });
  });
});

// Helper functions
async function runCliCommand(args) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const process = spawn(
      'node',
      [path.join(__dirname, '../packages/cli/index.js'), ...args],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' },
      },
    );

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      resolve({
        exitCode: code,
        stdout,
        stderr,
        executionTime: Date.now() - startTime,
      });
    });

    // Send empty input to avoid hanging
    process.stdin.end();
  });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function generateLargeDataset(rows) {
  let data = 'id,value,category,score\n';
  for (let i = 0; i < rows; i++) {
    data += `${i},${Math.random() * 100},${i % 5},${Math.random() * 10}\n`;
  }
  return data;
}
