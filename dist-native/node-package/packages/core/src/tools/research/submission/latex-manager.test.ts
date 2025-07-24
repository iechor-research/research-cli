/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LaTeXManager, LaTeXManagerParams } from './latex-manager.js';
import { DocumentType, LaTeXEngine, ResearchToolCategory } from '../types.js';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue(['main.tex', 'references.bib']),
  readFile: vi
    .fn()
    .mockResolvedValue(
      '\\documentclass{article}\\begin{document}\\end{document}',
    ),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

describe('LaTeXManager', () => {
  let manager: LaTeXManager;

  beforeEach(() => {
    manager = new LaTeXManager();
    vi.clearAllMocks();
  });

  describe('基本属性', () => {
    it('应该有正确的工具属性', () => {
      expect(manager.name).toBe('latex_manager');
      expect(manager.description).toBe(
        'Comprehensive LaTeX project management and compilation tool',
      );
      expect(manager.category).toBe(ResearchToolCategory.SUBMISSION);
      expect(manager.version).toBe('1.0.0');
    });
  });

  describe('参数验证', () => {
    it('应该验证创建项目的有效参数', () => {
      const validParams: LaTeXManagerParams = {
        action: 'create',
        projectName: 'my-paper',
        documentType: DocumentType.JOURNAL_ARTICLE,
      };

      expect(manager.validate(validParams)).toBe(true);
    });

    it('应该验证编译项目的有效参数', () => {
      const validParams: LaTeXManagerParams = {
        action: 'compile',
        projectPath: './my-paper/',
      };

      expect(manager.validate(validParams)).toBe(true);
    });

    it('应该验证模板列表操作', () => {
      const validParams: LaTeXManagerParams = {
        action: 'template',
      };

      expect(manager.validate(validParams)).toBe(true);
    });

    it('应该拒绝缺少必需参数的创建操作', () => {
      const invalidParams = {
        action: 'create',
        // 缺少 projectName 和 documentType
      };

      expect(manager.validate(invalidParams as any)).toBe(false);
    });

    it('应该拒绝缺少项目路径的编译操作', () => {
      const invalidParams = {
        action: 'compile',
        // 缺少 projectPath
      };

      expect(manager.validate(invalidParams as any)).toBe(false);
    });

    it('应该允许无效的操作通过验证（在执行时处理）', () => {
      const invalidParams = {
        action: 'invalid_action',
      };

      // 验证应该通过，错误在执行时处理
      expect(manager.validate(invalidParams as any)).toBe(true);
    });
  });

  describe('项目创建', () => {
    it('应该创建 IEEE 会议论文项目', async () => {
      const params: LaTeXManagerParams = {
        action: 'create',
        projectName: 'ieee-paper',
        documentType: DocumentType.CONFERENCE_PAPER,
        journalStyle: 'ieee',
        includeBibliography: true,
        authorInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          affiliation: 'University of Test',
        },
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      expect(latexResult.action).toBe('create');
      expect(latexResult.projectPath).toBeDefined();
      expect(latexResult.files).toBeInstanceOf(Array);
      expect(latexResult.files.length).toBeGreaterThan(0);

      // 检查主文件
      const mainFile = latexResult.files.find(
        (f: any) => f.filename === 'main.tex',
      );
      expect(mainFile).toBeDefined();
      expect(mainFile.content).toContain('IEEEtran');
      expect(mainFile.content).toContain('John Doe');

      // 检查配置文件
      const makeFile = latexResult.files.find(
        (f: any) => f.filename === 'Makefile',
      );
      expect(makeFile).toBeDefined();

      // 检查 gitignore
      const gitignore = latexResult.files.find(
        (f: any) => f.filename === '.gitignore',
      );
      expect(gitignore).toBeDefined();
    });

    it('应该创建 ACM 期刊文章项目', async () => {
      const params: LaTeXManagerParams = {
        action: 'create',
        projectName: 'acm-article',
        documentType: DocumentType.JOURNAL_ARTICLE,
        templateName: 'acm-article',
        customPackages: ['algorithm2e', 'listings'],
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      const mainFile = latexResult.files.find(
        (f: any) => f.filename === 'main.tex',
      );
      expect(mainFile.content).toContain('acmart');
    });

    it('应该创建博士论文项目', async () => {
      const params: LaTeXManagerParams = {
        action: 'create',
        projectName: 'phd-thesis',
        documentType: DocumentType.THESIS,
        templateName: 'thesis',
        authorInfo: {
          name: 'Jane Doe',
          email: 'jane@university.edu',
          affiliation: 'Research University',
        },
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      const mainFile = latexResult.files.find(
        (f: any) => f.filename === 'main.tex',
      );
      expect(mainFile.content).toContain('book');
      expect(mainFile.content).toContain('Jane Doe');

      // 检查章节文件
      const introFile = latexResult.files.find(
        (f: any) => f.filename === 'chapters/introduction.tex',
      );
      expect(introFile).toBeDefined();
    });

    it('应该创建 Springer 期刊文章项目', async () => {
      const params: LaTeXManagerParams = {
        action: 'create',
        projectName: 'springer-paper',
        documentType: DocumentType.JOURNAL_ARTICLE,
        templateName: 'springer-article',
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      const mainFile = latexResult.files.find(
        (f: any) => f.filename === 'main.tex',
      );
      expect(mainFile.content).toContain('svjour3');
    });

    it('应该处理自定义包', async () => {
      const params: LaTeXManagerParams = {
        action: 'create',
        projectName: 'custom-paper',
        documentType: DocumentType.JOURNAL_ARTICLE,
        customPackages: ['tikz', 'pgfplots', 'algorithm2e'],
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      const mainFile = latexResult.files.find(
        (f: any) => f.filename === 'main.tex',
      );
      expect(mainFile.content).toContain('tikz');
      expect(mainFile.content).toContain('pgfplots');
      expect(mainFile.content).toContain('algorithm2e');
    });
  });

  describe('模板管理', () => {
    it('应该列出所有可用模板', async () => {
      const params: LaTeXManagerParams = {
        action: 'template',
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      expect(latexResult.action).toBe('template');
      expect(latexResult.templates).toBeInstanceOf(Array);
      expect(latexResult.templates.length).toBeGreaterThan(0);

      // 检查是否包含基本模板
      const templateNames = latexResult.templates.map((t: any) => t.name);
      expect(templateNames).toContain('ieee-conference');
      expect(templateNames).toContain('acm-article');
      expect(templateNames).toContain('thesis');
      expect(templateNames).toContain('springer-article');

      // 检查模板结构
      const ieeeTemplate = latexResult.templates.find(
        (t: any) => t.name === 'ieee-conference',
      );
      expect(ieeeTemplate.description).toBeDefined();
      expect(ieeeTemplate.documentType).toBe(DocumentType.CONFERENCE_PAPER);
      expect(ieeeTemplate.files).toBeInstanceOf(Array);
      expect(ieeeTemplate.packages).toBeInstanceOf(Array);
      expect(ieeeTemplate.features).toBeInstanceOf(Array);
    });
  });

  describe('项目编译', () => {
    it('应该编译 LaTeX 项目', async () => {
      const params: LaTeXManagerParams = {
        action: 'compile',
        projectPath: './test-project/',
        engine: LaTeXEngine.PDFLATEX,
        outputFormat: 'pdf',
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      expect(latexResult.action).toBe('compile');
      expect(latexResult.projectPath).toBe('./test-project/');
      expect(latexResult.compileResult).toBeDefined();
      expect(latexResult.compileResult.success).toBe(true);
      expect(latexResult.compileResult.outputFiles).toBeInstanceOf(Array);
    });

    it('应该使用 XeLaTeX 引擎编译', async () => {
      const params: LaTeXManagerParams = {
        action: 'compile',
        projectPath: './test-project/',
        engine: LaTeXEngine.XELATEX,
        compileOptions: ['-shell-escape'],
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      expect(latexResult.compileResult.success).toBe(true);
    });

    it('应该处理编译错误', async () => {
      // Mock fs to simulate missing files
      const fs = await import('fs/promises');
      vi.mocked(fs.readdir).mockRejectedValueOnce(
        new Error('Directory not found'),
      );

      const params: LaTeXManagerParams = {
        action: 'compile',
        projectPath: './nonexistent-project/',
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Compilation failed');
    });
  });

  describe('项目清理', () => {
    it('应该清理项目临时文件', async () => {
      // Mock fs to return some auxiliary files
      const fs = await import('fs/promises');
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        'main.tex',
        'main.pdf',
        'main.aux',
        'main.log',
        'main.bbl',
        'main.toc',
      ] as any);

      const params: LaTeXManagerParams = {
        action: 'clean',
        projectPath: './test-project/',
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      expect(latexResult.action).toBe('clean');
      expect(latexResult.files).toBeInstanceOf(Array);

      // 检查是否删除了辅助文件
      const deletedFiles = latexResult.files.map((f: any) => f.filename);
      expect(deletedFiles).toContain('main.aux');
      expect(deletedFiles).toContain('main.log');
      expect(deletedFiles).not.toContain('main.tex');
      expect(deletedFiles).not.toContain('main.pdf');
    });

    it('应该处理清理错误', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.readdir).mockRejectedValueOnce(
        new Error('Permission denied'),
      );

      const params: LaTeXManagerParams = {
        action: 'clean',
        projectPath: './protected-project/',
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Clean failed');
    });
  });

  describe('项目诊断', () => {
    it('应该诊断项目问题', async () => {
      const params: LaTeXManagerParams = {
        action: 'diagnose',
        projectPath: './test-project/',
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      expect(latexResult.action).toBe('diagnose');
      expect(latexResult.diagnostics).toBeDefined();
      expect(latexResult.diagnostics.errors).toBeInstanceOf(Array);
      expect(latexResult.diagnostics.warnings).toBeInstanceOf(Array);
      expect(latexResult.diagnostics.suggestions).toBeInstanceOf(Array);
    });

    it('应该检测缺失的 .tex 文件', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        'README.md',
        'data.csv',
      ] as any);

      const params: LaTeXManagerParams = {
        action: 'diagnose',
        projectPath: './no-tex-project/',
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      const fatalError = latexResult.diagnostics.errors.find(
        (e: any) =>
          e.severity === 'fatal' && e.message.includes('No .tex files found'),
      );
      expect(fatalError).toBeDefined();
    });

    it('应该处理诊断错误', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.readdir).mockRejectedValueOnce(new Error('Access denied'));

      const params: LaTeXManagerParams = {
        action: 'diagnose',
        projectPath: './inaccessible-project/',
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Diagnosis failed');
    });
  });

  describe('包管理', () => {
    it('应该列出包信息', async () => {
      const params: LaTeXManagerParams = {
        action: 'package',
        projectPath: './test-project/',
        documentType: DocumentType.JOURNAL_ARTICLE,
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      expect(latexResult.action).toBe('package');
      expect(latexResult.packageInfo).toBeDefined();
      expect(latexResult.packageInfo.installed).toBeInstanceOf(Array);
      expect(latexResult.packageInfo.missing).toBeInstanceOf(Array);
      expect(latexResult.packageInfo.recommendations).toBeInstanceOf(Array);

      // 检查是否包含常见包
      expect(latexResult.packageInfo.installed).toContain('amsmath');
      expect(latexResult.packageInfo.installed).toContain('graphicx');
    });

    it('应该为不同文档类型提供推荐包', async () => {
      const params: LaTeXManagerParams = {
        action: 'package',
        documentType: DocumentType.THESIS,
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const latexResult = result.data as any;

      const recommendations = latexResult.packageInfo.recommendations;
      expect(recommendations).toContain('fancyhdr');
      expect(recommendations).toContain('setspace');
      expect(recommendations).toContain('tocloft');
    });
  });

  describe('错误处理', () => {
    it('应该处理未知操作', async () => {
      const params = {
        action: 'unknown_action',
      };

      const result = await manager.execute(params as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown action');
    });

    it('应该处理无效模板名称', async () => {
      const params: LaTeXManagerParams = {
        action: 'create',
        projectName: 'test-project',
        documentType: DocumentType.JOURNAL_ARTICLE,
        templateName: 'nonexistent-template',
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Template not found');
    });

    it('应该处理无模板文档类型', async () => {
      const params: LaTeXManagerParams = {
        action: 'create',
        projectName: 'test-project',
        documentType: 'unsupported_type' as any,
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No template available');
    });
  });

  describe('引擎和选项', () => {
    it('应该支持不同的 LaTeX 引擎', async () => {
      const engines = [
        LaTeXEngine.PDFLATEX,
        LaTeXEngine.XELATEX,
        LaTeXEngine.LUALATEX,
      ];

      for (const engine of engines) {
        const params: LaTeXManagerParams = {
          action: 'compile',
          projectPath: './test-project/',
          engine,
        };

        const result = await manager.execute(params);
        expect(result.success).toBe(true);
      }
    });

    it('应该处理自定义编译选项', async () => {
      const params: LaTeXManagerParams = {
        action: 'compile',
        projectPath: './test-project/',
        engine: LaTeXEngine.PDFLATEX,
        compileOptions: ['-shell-escape', '-synctex=1'],
      };

      const result = await manager.execute(params);
      expect(result.success).toBe(true);
    });
  });

  describe('帮助信息', () => {
    it('应该提供详细的帮助信息', () => {
      const help = manager.getHelp();

      expect(help).toContain('Comprehensive LaTeX project management');
      expect(help).toContain('action');
      expect(help).toContain('projectName');
      expect(help).toContain('documentType');
      expect(help).toContain('engine');

      // 检查示例
      expect(help).toContain('IEEE conference paper');
      expect(help).toContain('XeLaTeX');
    });
  });
});
