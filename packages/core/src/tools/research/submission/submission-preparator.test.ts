import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubmissionPreparator } from './submission-preparator.js';
import { ArXivMCPClient } from '../bibliography/arxiv-mcp-client.js';
import { LaTeXManager } from '../latex/latex-manager.js';
import { JournalMatcher } from '../journals/journal-matcher.js';

// Mock dependencies
vi.mock('../bibliography/arxiv-mcp-client.js');
vi.mock('../latex/latex-manager.js');
vi.mock('../journals/journal-matcher.js');
vi.mock('fs/promises');

describe('SubmissionPreparator', () => {
  let submissionPreparator: SubmissionPreparator;
  let mockArxivClient: vi.Mocked<ArXivMCPClient>;
  let mockLatexManager: vi.Mocked<LaTeXManager>;
  let mockJournalMatcher: vi.Mocked<JournalMatcher>;

  beforeEach(() => {
    mockArxivClient = new ArXivMCPClient() as vi.Mocked<ArXivMCPClient>;
    mockLatexManager = new LaTeXManager() as vi.Mocked<LaTeXManager>;
    mockJournalMatcher = new JournalMatcher() as vi.Mocked<JournalMatcher>;
    
    submissionPreparator = new SubmissionPreparator(
      mockArxivClient,
      mockLatexManager,
      mockJournalMatcher
    );
  });

  describe('validation', () => {
    it('should require operation parameter', async () => {
      const result = await submissionPreparator.execute({} as any);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Operation is required');
    });

    it('should validate operation types', async () => {
      const result = await submissionPreparator.execute({
        operation: 'invalid_operation' as any
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid operation');
    });

    it('should require project name for init operation', async () => {
      const result = await submissionPreparator.execute({
        operation: 'init'
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Project name is required');
    });

    it('should require arXiv ID for extract operation', async () => {
      const result = await submissionPreparator.execute({
        operation: 'extract'
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('arXiv ID is required');
    });

    it('should require project path for project operations', async () => {
      const operations = ['validate', 'prepare', 'package', 'checklist', 'clean'];
      
      for (const operation of operations) {
        const result = await submissionPreparator.execute({
          operation: operation as any
        });
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('Project path is required');
      }
    });
  });

  describe('template operations', () => {
    it('should handle template search', async () => {
      const result = await submissionPreparator.execute({
        operation: 'template',
        journalName: 'Nature'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('templates');
    });

    it('should handle template fetch', async () => {
      const result = await submissionPreparator.execute({
        operation: 'template',
        templateId: 'nature-template'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Template');
    });
  });

  describe('project initialization', () => {
    it('should initialize project with template', async () => {
      const result = await submissionPreparator.execute({
        operation: 'init',
        projectName: 'test-project',
        templateId: 'nature-template'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('initialized successfully');
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock template manager to throw error
      const result = await submissionPreparator.execute({
        operation: 'init',
        projectName: 'test-project',
        templateId: 'non-existent-template'
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('arXiv extraction', () => {
    it('should extract template from arXiv', async () => {
      // Mock successful arXiv extraction
      mockArxivClient.downloadPaper = vi.fn().mockResolvedValue({
        status: 'success',
        paperId: '2301.12345'
      });
      
      mockArxivClient.searchPapers = vi.fn().mockResolvedValue([{
        id: '2301.12345',
        title: 'Test Paper',
        authors: ['Test Author'],
        abstract: 'Test abstract'
      }]);

      const result = await submissionPreparator.execute({
        operation: 'extract',
        arxivId: '2301.12345'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('extracted from arXiv');
    });

    it('should handle arXiv extraction errors', async () => {
      // Mock failed arXiv download
      mockArxivClient.downloadPaper = vi.fn().mockResolvedValue({
        status: 'failed',
        error: 'Paper not found'
      });

      const result = await submissionPreparator.execute({
        operation: 'extract',
        arxivId: 'invalid-id'
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('project validation', () => {
    it('should validate project successfully', async () => {
      // Mock successful LaTeX compilation
      mockLatexManager.compile = vi.fn().mockResolvedValue({
        success: true,
        errors: [],
        warnings: []
      });

      const result = await submissionPreparator.execute({
        operation: 'validate',
        projectPath: './test-project'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Validation completed');
    });

    it('should report validation failures', async () => {
      // Mock failed LaTeX compilation
      mockLatexManager.compile = vi.fn().mockResolvedValue({
        success: false,
        errors: ['LaTeX compilation error'],
        warnings: []
      });

      const result = await submissionPreparator.execute({
        operation: 'validate',
        projectPath: './test-project'
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('submission preparation', () => {
    it('should prepare submission package', async () => {
      // Mock successful LaTeX compilation
      mockLatexManager.compile = vi.fn().mockResolvedValue({
        success: true,
        errors: [],
        warnings: []
      });

      const result = await submissionPreparator.execute({
        operation: 'prepare',
        projectPath: './test-project',
        journalName: 'Nature'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Submission package prepared');
    });

    it('should fail if LaTeX compilation fails', async () => {
      // Mock failed LaTeX compilation
      mockLatexManager.compile = vi.fn().mockResolvedValue({
        success: false,
        errors: ['Compilation error'],
        warnings: []
      });

      const result = await submissionPreparator.execute({
        operation: 'prepare',
        projectPath: './test-project'
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('LaTeX compilation failed');
    });
  });

  describe('package creation', () => {
    it('should create submission package', async () => {
      const result = await submissionPreparator.execute({
        operation: 'package',
        projectPath: './test-project'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Package created successfully');
    });
  });

  describe('checklist generation', () => {
    it('should generate submission checklist', async () => {
      const result = await submissionPreparator.execute({
        operation: 'checklist',
        projectPath: './test-project'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Checklist generated');
      expect(result.data.checklist).toBeDefined();
    });
  });

  describe('project cleanup', () => {
    it('should clean project files', async () => {
      const result = await submissionPreparator.execute({
        operation: 'clean',
        projectPath: './test-project'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Cleaned');
    });
  });

  describe('help information', () => {
    it('should provide comprehensive help', () => {
      const help = submissionPreparator.getHelp();
      
      expect(help).toContain('Submission Preparator Tool');
      expect(help).toContain('OPERATIONS:');
      expect(help).toContain('init');
      expect(help).toContain('template');
      expect(help).toContain('extract');
      expect(help).toContain('validate');
      expect(help).toContain('prepare');
      expect(help).toContain('EXAMPLES:');
    });
  });

  describe('error handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Mock an operation that throws an unexpected error
      const originalExecuteImpl = (submissionPreparator as any).executeImpl;
      (submissionPreparator as any).executeImpl = vi.fn().mockRejectedValue(new Error('Unexpected error'));

      const result = await submissionPreparator.execute({
        operation: 'validate',
        projectPath: './test-project'
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Submission preparation failed');
      
      // Restore original method
      (submissionPreparator as any).executeImpl = originalExecuteImpl;
    });
  });
}); 