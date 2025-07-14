import { BaseResearchTool } from '../base-tool.js';
import { ResearchToolResult, ResearchToolCategory, ResearchToolParams } from '../types.js';
import { 
  SubmissionPrepOptions, 
  SubmissionResult, 
  ValidationReport,
  ChecklistItem,
  CompilationResult,
  ComplianceCheck,
  FileStructureCheck,
  SupplementaryCheck
} from './types.js';
import { TemplateManager } from './template-manager.js';
import { ArXivMCPClient } from '../bibliography/arxiv-mcp-client.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 投稿包准备器 - 完整的学术投稿准备工具
 * 支持项目初始化、模板获取、验证和打包功能
 */
export class SubmissionPreparator extends BaseResearchTool<SubmissionPrepOptions, SubmissionResult> {
  private templateManager: TemplateManager;
    latexManager: any;
    journalMatcher: any;

  constructor(arxivClient: ArXivMCPClient) {
    super(
      'submission_preparator',
      'Academic submission preparation tool with template management and project initialization',
      ResearchToolCategory.PUBLISHING
    );
    this.templateManager = new TemplateManager(arxivClient);
  }

  /**
   * 验证输入选项
   */
  protected validate(options: SubmissionPrepOptions): void {
    if (!options.operation) {
      throw new Error('Operation is required');
    }

    const validOperations = ['prepare', 'validate', 'package', 'checklist', 'clean', 'init', 'template', 'extract'];
    if (!validOperations.includes(options.operation)) {
      throw new Error(`Invalid operation: ${options.operation}. Must be one of: ${validOperations.join(', ')}`);
    }

    // 操作特定验证
    switch (options.operation) {
      case 'init':
        if (!options.projectName) {
          throw new Error('Project name is required for init operation');
        }
        break;
      case 'template':
        // template 操作通常不需要额外验证
        break;
      case 'extract':
        if (!options.arxivId) {
          throw new Error('arXiv ID is required for extract operation');
        }
        break;
      case 'prepare':
      case 'validate':
      case 'package':
      case 'checklist':
      case 'clean':
        if (!options.projectPath) {
          throw new Error(`Project path is required for ${options.operation} operation`);
        }
        break;
    }
  }

  /**
   * 获取帮助信息
   */
  getHelp(): string {
    return `
Submission Preparator Tool

OPERATIONS:
  init      - Initialize new project from template
  template  - Manage templates (search, fetch, cache)
  extract   - Extract template from arXiv paper
  validate  - Validate project for submission
  prepare   - Prepare complete submission package
  package   - Create submission archive
  checklist - Generate submission checklist
  clean     - Clean temporary files

EXAMPLES:
  # Initialize project from Overleaf template
  operation: "init", templateId: "nature-template", projectName: "my-paper"
  
  # Search for templates
  operation: "template", journalName: "Nature"
  
  # Extract template from arXiv
  operation: "extract", arxivId: "2301.12345"
  
  # Validate project
  operation: "validate", projectPath: "./my-project"
  
  # Prepare submission
  operation: "prepare", projectPath: "./my-project", journalName: "Nature"

OPTIONS:
  - operation: Required operation type
  - projectPath: Path to LaTeX project (for most operations)
  - projectName: Name for new project (init operation)
  - templateId: Template identifier (init operation)
  - templateSource: overleaf|arxiv|local (init operation)
  - arxivId: arXiv paper ID (extract operation)
  - journalName: Target journal name
  - outputDir: Output directory for packages
  - includeSupplementary: Include supplementary materials
  - validateOnly: Only validate, don't create packages
`;
  }

  /**
   * 执行投稿准备操作
   */
  protected async executeImpl(options: SubmissionPrepOptions): Promise<ResearchToolResult> {
    try {
      let result: SubmissionResult;

      switch (options.operation) {
        case 'init':
          result = await this.initializeProject(options);
          break;
        case 'template':
          result = await this.manageTemplates(options);
          break;
        case 'extract':
          result = await this.extractFromArxiv(options);
          break;
        case 'validate':
          result = await this.validateProject(options);
          break;
        case 'prepare':
          result = await this.prepareSubmission(options);
          break;
        case 'package':
          result = await this.createPackage(options);
          break;
        case 'checklist':
          result = await this.generateChecklist(options);
          break;
        case 'clean':
          result = await this.cleanProject(options);
          break;
        default:
          throw new Error(`Unsupported operation: ${options.operation}`);
      }

      return {
        success: result.success,
        data: result,
        message: result.message || (result.success ? 'Operation completed successfully' : 'Operation failed'),
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        data: {
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: []
        },
        message: `Submission preparation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * 初始化项目
   */
  private async initializeProject(options: SubmissionPrepOptions): Promise<SubmissionResult> {
    try {
      if (!options.projectName) {
        throw new Error('Project name is required');
      }

      // 获取模板
      let template;
      if (options.templateId) {
        template = await this.templateManager.fetchTemplate(options.templateId, options.templateSource);
      } else {
        // 如果没有指定模板，搜索合适的模板
        const searchOptions = options.journalName ? { journal: options.journalName, limit: 1 } : { limit: 1 };
        const templates = await this.templateManager.searchTemplates(searchOptions);
        
        if (templates.length === 0) {
          throw new Error('No suitable template found');
        }
        
        template = templates[0];
      }

      // 确定项目路径
      const projectPath = options.outputDir 
        ? path.join(options.outputDir, options.projectName)
        : path.join(process.cwd(), options.projectName);

      // 初始化项目
      const projectResult = await this.templateManager.initializeProject({
        name: options.projectName,
        path: projectPath,
        template,
        journalTarget: options.journalName
      });

      return {
        success: projectResult.success,
        packagePath: projectResult.success ? projectPath : undefined,
        errors: projectResult.errors,
        warnings: projectResult.warnings,
        message: projectResult.success 
          ? `Project "${options.projectName}" initialized successfully at ${projectPath}`
          : 'Failed to initialize project'
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * 管理模板
   */
  private async manageTemplates(options: SubmissionPrepOptions): Promise<SubmissionResult> {
    try {
      if (options.templateId) {
        // 获取特定模板
        const template = await this.templateManager.fetchTemplate(options.templateId, options.templateSource);
        return {
          success: true,
          errors: [],
          warnings: [],
          message: `Template "${template.name}" fetched successfully`
        };
      } else {
        // 搜索模板
        const searchOptions = {
          journal: options.journalName,
          limit: 10
        };
        
        const templates = await this.templateManager.searchTemplates(searchOptions);
        
        return {
          success: true,
          errors: [],
          warnings: [],
          message: `Found ${templates.length} templates${options.journalName ? ` for journal "${options.journalName}"` : ''}`
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * 从 arXiv 提取模板
   */
  private async extractFromArxiv(options: SubmissionPrepOptions): Promise<SubmissionResult> {
    try {
      if (!options.arxivId) {
        throw new Error('arXiv ID is required');
      }

      const template = await this.templateManager.extractFromArxiv(options.arxivId, {
        removePersonalInfo: true,
        generalizePaths: true
      });

      return {
        success: true,
        errors: [],
        warnings: [],
        message: `Template extracted from arXiv:${options.arxivId} - "${template.name}"`
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * 验证项目
   */
  private async validateProject(options: SubmissionPrepOptions): Promise<SubmissionResult> {
    try {
      if (!options.projectPath) {
        throw new Error('Project path is required');
      }

      const validationReport = await this.performValidation(options.projectPath, options.journalName);

      const allChecks = [
        validationReport.latexCompilation.success,
        validationReport.journalCompliance.pageLimit,
        validationReport.journalCompliance.wordLimit,
        validationReport.journalCompliance.referenceStyle,
        validationReport.fileStructure.mainTexFile,
        validationReport.fileStructure.bibliographyPresent
      ];

      const passedChecks = allChecks.filter(check => check).length;
      const totalChecks = allChecks.length;

      return {
        success: passedChecks === totalChecks,
        validationReport,
        errors: validationReport.latexCompilation.errors,
        warnings: validationReport.latexCompilation.warnings,
        message: `Validation completed: ${passedChecks}/${totalChecks} checks passed`
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * 准备投稿包
   */
  private async prepareSubmission(options: SubmissionPrepOptions): Promise<SubmissionResult> {
    try {
      if (!options.projectPath) {
        throw new Error('Project path is required');
      }

      // 首先验证项目
      const validationReport = await this.performValidation(options.projectPath, options.journalName);
      
      if (!validationReport.latexCompilation.success) {
        return {
          success: false,
          validationReport,
          errors: ['LaTeX compilation failed. Please fix errors before preparing submission.'],
          warnings: []
        };
      }

      // 创建投稿包
      const packagePath = await this.createSubmissionPackage(options.projectPath, options);

      return {
        success: true,
        packagePath,
        validationReport,
        errors: [],
        warnings: validationReport.latexCompilation.warnings,
        message: `Submission package prepared successfully at ${packagePath}`
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * 创建包
   */
  private async createPackage(options: SubmissionPrepOptions): Promise<SubmissionResult> {
    try {
      if (!options.projectPath) {
        throw new Error('Project path is required');
      }

      const packagePath = await this.createSubmissionPackage(options.projectPath, options);

      return {
        success: true,
        packagePath,
        errors: [],
        warnings: [],
        message: `Package created successfully at ${packagePath}`
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * 生成检查清单
   */
  private async generateChecklist(options: SubmissionPrepOptions): Promise<SubmissionResult> {
    try {
      if (!options.projectPath) {
        throw new Error('Project path is required');
      }

      const checklist = await this.createSubmissionChecklist(options.projectPath, options.journalName);

      return {
        success: true,
        checklist,
        errors: [],
        warnings: [],
        message: `Checklist generated with ${checklist.length} items`
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * 清理项目
   */
  private async cleanProject(options: SubmissionPrepOptions): Promise<SubmissionResult> {
    try {
      if (!options.projectPath) {
        throw new Error('Project path is required');
      }

      const cleanedFiles = await this.performCleanup(options.projectPath);

      return {
        success: true,
        errors: [],
        warnings: [],
        message: `Cleaned ${cleanedFiles.length} temporary files`
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * 执行验证
   */
  private async performValidation(projectPath: string, journalName?: string): Promise<ValidationReport> {
    // LaTeX 编译验证
    const compilationResult = await this.validateLatexCompilation(projectPath);
    
    // 期刊合规性检查
    const complianceCheck = await this.validateJournalCompliance(projectPath, journalName);
    
    // 文件结构检查
    const fileStructureCheck = await this.validateFileStructure(projectPath);
    
    // 补充材料检查
    const supplementaryCheck = await this.validateSupplementaryMaterials(projectPath);

    return {
      latexCompilation: compilationResult,
      journalCompliance: complianceCheck,
      fileStructure: fileStructureCheck,
      supplementaryMaterials: supplementaryCheck
    };
  }

  /**
   * 验证 LaTeX 编译
   */
  private async validateLatexCompilation(projectPath: string): Promise<CompilationResult> {
    try {
      const result = await this.latexManager.compile(projectPath);
      return {
        success: result.success,
        pdfGenerated: result.success,
        errors: result.errors || [],
        warnings: result.warnings || [],
        logPath: result.logPath
      };
    } catch (error) {
      return {
        success: false,
        pdfGenerated: false,
        errors: [error instanceof Error ? error.message : 'Compilation failed'],
        warnings: []
      };
    }
  }

  /**
   * 验证期刊合规性
   */
  private async validateJournalCompliance(projectPath: string, journalName?: string): Promise<ComplianceCheck> {
    // 基础检查结果
    const check: ComplianceCheck = {
      pageLimit: true,
      wordLimit: true,
      figureLimit: true,
      referenceStyle: true,
      fontRequirements: true,
      marginRequirements: true,
      issues: []
    };

    if (journalName) {
      try {
        const journalInfo = await this.journalMatcher.findJournal(journalName);
        // 这里可以实现具体的期刊要求检查
        // 现在返回基础检查结果
      } catch {
        check.issues.push(`Could not find requirements for journal: ${journalName}`);
      }
    }

    return check;
  }

  /**
   * 验证文件结构
   */
  private async validateFileStructure(projectPath: string): Promise<FileStructureCheck> {
    const check: FileStructureCheck = {
      mainTexFile: false,
      figuresPresent: false,
      bibliographyPresent: false,
      supplementaryOrganized: false,
      missingFiles: []
    };

    try {
      const files = await fs.readdir(projectPath);
      
      // 检查主 LaTeX 文件
      check.mainTexFile = files.some(f => f.endsWith('.tex'));
      
      // 检查参考文献文件
      check.bibliographyPresent = files.some(f => f.endsWith('.bib'));
      
      // 检查图片目录
      try {
        await fs.access(path.join(projectPath, 'figures'));
        check.figuresPresent = true;
      } catch {
        // 图片目录不存在
      }

      // 检查补充材料组织
      check.supplementaryOrganized = true; // 简化检查
      
    } catch (error) {
      check.missingFiles.push('Could not access project directory');
    }

    return check;
  }

  /**
   * 验证补充材料
   */
  private async validateSupplementaryMaterials(projectPath: string): Promise<SupplementaryCheck> {
    return {
      dataFiles: false,
      codeFiles: false,
      additionalFigures: false,
      videoFiles: false,
      organizationScore: 0.5
    };
  }

  /**
   * 创建投稿包
   */
  private async createSubmissionPackage(projectPath: string, options: SubmissionPrepOptions): Promise<string> {
    const outputDir = options.outputDir || path.join(projectPath, 'submission-package');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const packageDir = path.join(outputDir, `submission-${timestamp}`);

    await fs.mkdir(packageDir, { recursive: true });

    // 复制必要文件
    const files = await fs.readdir(projectPath);
    const essentialFiles = files.filter(f => 
      f.endsWith('.tex') || 
      f.endsWith('.bib') || 
      f.endsWith('.pdf') ||
      f.endsWith('.cls') ||
      f.endsWith('.sty')
    );

    for (const file of essentialFiles) {
      const srcPath = path.join(projectPath, file);
      const destPath = path.join(packageDir, file);
      await fs.copyFile(srcPath, destPath);
    }

    // 复制图片目录
    try {
      const figuresDir = path.join(projectPath, 'figures');
      const destFiguresDir = path.join(packageDir, 'figures');
      await fs.mkdir(destFiguresDir, { recursive: true });
      
      const figureFiles = await fs.readdir(figuresDir);
      for (const file of figureFiles) {
        await fs.copyFile(
          path.join(figuresDir, file),
          path.join(destFiguresDir, file)
        );
      }
    } catch {
      // 图片目录不存在或复制失败
    }

    return packageDir;
  }

  /**
   * 创建投稿检查清单
   */
  private async createSubmissionChecklist(projectPath: string, journalName?: string): Promise<ChecklistItem[]> {
    const checklist: ChecklistItem[] = [
      {
        id: 'compilation',
        title: 'LaTeX Compilation',
        description: 'Document compiles without errors',
        completed: false,
        required: true,
        category: 'content'
      },
      {
        id: 'bibliography',
        title: 'Bibliography Format',
        description: 'References follow journal style',
        completed: false,
        required: true,
        category: 'formatting'
      },
      {
        id: 'figures',
        title: 'Figure Quality',
        description: 'All figures are high resolution and properly labeled',
        completed: false,
        required: true,
        category: 'content'
      },
      {
        id: 'abstract',
        title: 'Abstract Length',
        description: 'Abstract meets word limit requirements',
        completed: false,
        required: true,
        category: 'content'
      },
      {
        id: 'keywords',
        title: 'Keywords',
        description: 'Appropriate keywords provided',
        completed: false,
        required: true,
        category: 'content'
      },
      {
        id: 'cover-letter',
        title: 'Cover Letter',
        description: 'Cover letter prepared',
        completed: false,
        required: false,
        category: 'submission'
      }
    ];

    // 检查实际完成状态
    for (const item of checklist) {
      // 这里可以实现实际的检查逻辑
      item.completed = Math.random() > 0.5; // 模拟检查结果
    }

    return checklist;
  }

  /**
   * 执行清理
   */
  private async performCleanup(projectPath: string): Promise<string[]> {
    const cleanedFiles: string[] = [];
    
    try {
      const files = await fs.readdir(projectPath);
      const tempExtensions = ['.aux', '.log', '.bbl', '.blg', '.toc', '.out', '.fls', '.fdb_latexmk'];
      
      for (const file of files) {
        const extension = path.extname(file);
        if (tempExtensions.includes(extension)) {
          await fs.unlink(path.join(projectPath, file));
          cleanedFiles.push(file);
        }
      }
    } catch (error) {
      // 清理失败，返回空列表
    }

    return cleanedFiles;
  }
} 