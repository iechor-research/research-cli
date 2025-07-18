/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseResearchTool } from '../base-tool.js';
import {
  ResearchToolParams,
  DocumentType,
  LaTeXEngine,
  ResearchToolCategory
} from '../types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * LaTeX 项目配置参数
 */
export interface LaTeXManagerParams extends ResearchToolParams {
  action: 'create' | 'compile' | 'clean' | 'template' | 'diagnose' | 'package';
  projectName?: string;
  projectPath?: string;
  documentType?: DocumentType;
  templateName?: string;
  engine?: LaTeXEngine;
  outputFormat?: 'pdf' | 'dvi' | 'ps';
  includeBibliography?: boolean;
  customPackages?: string[];
  compileOptions?: string[];
  journalStyle?: string;
  authorInfo?: {
    name: string;
    email: string;
    affiliation: string;
  };
}

/**
 * LaTeX 模板定义
 */
export interface LaTeXTemplate {
  name: string;
  description: string;
  documentType: DocumentType;
  files: {
    filename: string;
    content: string;
    type: 'main' | 'style' | 'bibliography' | 'figure' | 'data';
  }[];
  packages: string[];
  compileInstructions: string[];
  features: string[];
}

/**
 * LaTeX 编译结果
 */
export interface LaTeXCompileResult {
  success: boolean;
  outputFiles: string[];
  errors: LaTeXError[];
  warnings: LaTeXWarning[];
  compilationTime: number;
  logFile?: string;
}

/**
 * LaTeX 错误信息
 */
export interface LaTeXError {
  line: number;
  file: string;
  message: string;
  severity: 'error' | 'fatal';
  suggestion?: string;
}

/**
 * LaTeX 警告信息
 */
export interface LaTeXWarning {
  line: number;
  file: string;
  message: string;
  type: 'overfull' | 'underfull' | 'citation' | 'reference' | 'package';
}

/**
 * LaTeX 管理器结果
 */
export interface LaTeXManagerResult {
  action: string;
  projectPath?: string;
  files?: { filename: string; content: string }[];
  compileResult?: LaTeXCompileResult;
  templates?: LaTeXTemplate[];
  diagnostics?: {
    errors: LaTeXError[];
    warnings: LaTeXWarning[];
    suggestions: string[];
  };
  packageInfo?: {
    installed: string[];
    missing: string[];
    recommendations: string[];
  };
}

/**
 * LaTeX 管理器工具
 * 提供完整的 LaTeX 项目管理、编译和诊断功能
 */
export class LaTeXManager extends BaseResearchTool<LaTeXManagerParams, LaTeXManagerResult> {
  constructor() {
    super(
      'latex_manager',
      'Comprehensive LaTeX project management and compilation tool',
      ResearchToolCategory.SUBMISSION
    );
  }

  public validate(params: ResearchToolParams): boolean {
    const latexParams = params as LaTeXManagerParams;
    
    if (!latexParams.action) {
      return false;
    }

    // 根据不同操作验证必需参数
    switch (latexParams.action) {
      case 'create':
        return !!(latexParams.projectName && latexParams.documentType);
      case 'compile':
      case 'diagnose':
      case 'clean':
        return !!latexParams.projectPath;
      case 'template':
        return true; // 列出模板不需要额外参数
      case 'package':
        return true; // 包管理不需要额外参数
      default:
        // 对于未知操作，返回 true 让 executeImpl 处理错误
        return true;
    }
  }

  public getHelp(): string {
    return this.formatHelp(
      'Comprehensive LaTeX project management, compilation, and diagnostic tool',
      [
        { name: 'action', type: 'string', required: true, description: 'Action to perform (create, compile, clean, template, diagnose, package)' },
        { name: 'projectName', type: 'string', required: false, description: 'Name for new LaTeX project' },
        { name: 'projectPath', type: 'string', required: false, description: 'Path to existing LaTeX project' },
        { name: 'documentType', type: 'DocumentType', required: false, description: 'Type of document (article, book, thesis, etc.)' },
        { name: 'templateName', type: 'string', required: false, description: 'Specific template name to use' },
        { name: 'engine', type: 'LaTeXEngine', required: false, description: 'LaTeX engine (pdflatex, xelatex, lualatex)' },
        { name: 'outputFormat', type: 'string', required: false, description: 'Output format (pdf, dvi, ps)' },
        { name: 'includeBibliography', type: 'boolean', required: false, description: 'Include bibliography setup' },
        { name: 'customPackages', type: 'string[]', required: false, description: 'Additional LaTeX packages to include' },
        { name: 'compileOptions', type: 'string[]', required: false, description: 'Custom compilation options' },
        { name: 'journalStyle', type: 'string', required: false, description: 'Journal-specific style (ieee, acm, springer, etc.)' },
        { name: 'authorInfo', type: 'object', required: false, description: 'Author information (name, email, affiliation)' }
      ],
      [
        {
          description: 'Create new IEEE conference paper project',
          params: {
            action: 'create',
            projectName: 'my-ieee-paper',
            documentType: 'conference_paper',
            journalStyle: 'ieee',
            includeBibliography: true,
            authorInfo: {
              name: 'John Doe',
              email: 'john@university.edu',
              affiliation: 'University of Research'
            }
          }
        },
        {
          description: 'Compile LaTeX project with XeLaTeX',
          params: {
            action: 'compile',
            projectPath: './my-paper/',
            engine: 'xelatex',
            outputFormat: 'pdf'
          }
        },
        {
          description: 'Diagnose compilation errors',
          params: {
            action: 'diagnose',
            projectPath: './my-paper/'
          }
        }
      ]
    );
  }

  protected async executeImpl(params: LaTeXManagerParams): Promise<LaTeXManagerResult> {
    switch (params.action) {
      case 'create':
        return this.createProject(params);
      case 'compile':
        return this.compileProject(params);
      case 'clean':
        return this.cleanProject(params);
      case 'template':
        return this.listTemplates(params);
      case 'diagnose':
        return this.diagnoseProject(params);
      case 'package':
        return this.managePackages(params);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  /**
   * 创建新的 LaTeX 项目
   */
  private async createProject(params: LaTeXManagerParams): Promise<LaTeXManagerResult> {
    const projectPath = params.projectPath || `./${params.projectName}`;
    
    // 创建项目目录结构
    await this.createProjectStructure(projectPath);
    
    // 选择和生成模板
    const template = await this.selectTemplate(params);
    
    // 生成项目文件
    const files = await this.generateProjectFiles(template, params);
    
    // 写入文件到磁盘
    for (const file of files) {
      const filePath = path.join(projectPath, file.filename);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    return {
      action: 'create',
      projectPath,
      files: files.map(f => ({ filename: f.filename, content: f.content }))
    };
  }

  /**
   * 编译 LaTeX 项目
   */
  private async compileProject(params: LaTeXManagerParams): Promise<LaTeXManagerResult> {
    const projectPath = params.projectPath!;
    const engine = params.engine || LaTeXEngine.PDFLATEX;
    const outputFormat = params.outputFormat || 'pdf';
    
    const startTime = Date.now();
    
    try {
      // 查找主 .tex 文件
      const mainFile = await this.findMainTexFile(projectPath);
      
      // 构建编译命令
      const compileCommand = this.buildCompileCommand(engine, mainFile, outputFormat, params.compileOptions);
      
      // 执行编译
      const compileResult = await this.executeCompilation(compileCommand, projectPath);
      
      // 处理编译结果
      const result = await this.processCompileResult(compileResult, projectPath);
      
      result.compilationTime = Date.now() - startTime;
      
      return {
        action: 'compile',
        projectPath,
        compileResult: result
      };
    } catch (error) {
      throw new Error(`Compilation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 清理项目临时文件
   */
  private async cleanProject(params: LaTeXManagerParams): Promise<LaTeXManagerResult> {
    const projectPath = params.projectPath!;
    
    // 定义要清理的文件扩展名
    const cleanExtensions = ['.aux', '.log', '.bbl', '.blg', '.toc', '.lof', '.lot', 
                           '.fls', '.fdb_latexmk', '.synctex.gz', '.out', '.bcf', 
                           '.run.xml', '.figlist', '.makefile', '.fls'];
    
    const cleanedFiles: string[] = [];
    
    try {
      const files = await fs.readdir(projectPath);
      
      for (const file of files) {
        const filePath = path.join(projectPath, file);
        const ext = path.extname(file);
        
        if (cleanExtensions.includes(ext)) {
          await fs.unlink(filePath);
          cleanedFiles.push(file);
        }
      }
      
      return {
        action: 'clean',
        projectPath,
        files: cleanedFiles.map(f => ({ filename: f, content: 'deleted' }))
      };
    } catch (error) {
      throw new Error(`Clean failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 列出可用模板
   */
  private async listTemplates(params: LaTeXManagerParams): Promise<LaTeXManagerResult> {
    const templates = this.getBuiltInTemplates();
    
    return {
      action: 'template',
      templates
    };
  }

  /**
   * 诊断项目问题
   */
  private async diagnoseProject(params: LaTeXManagerParams): Promise<LaTeXManagerResult> {
    const projectPath = params.projectPath!;
    
    const errors: LaTeXError[] = [];
    const warnings: LaTeXWarning[] = [];
    const suggestions: string[] = [];
    
    try {
      // 检查项目结构
      await this.checkProjectStructure(projectPath, errors, warnings, suggestions);
      
      // 检查 .tex 文件语法
      await this.checkTexSyntax(projectPath, errors, warnings);
      
      // 检查包依赖
      await this.checkPackageDependencies(projectPath, warnings, suggestions);
      
      // 检查引用
      await this.checkReferences(projectPath, warnings, suggestions);
      
      return {
        action: 'diagnose',
        projectPath,
        diagnostics: {
          errors,
          warnings,
          suggestions
        }
      };
    } catch (error) {
      throw new Error(`Diagnosis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 管理 LaTeX 包
   */
  private async managePackages(params: LaTeXManagerParams): Promise<LaTeXManagerResult> {
    // 检查已安装的包
    const installed = await this.getInstalledPackages();
    
    // 检查缺失的包（如果提供了项目路径）
    const missing: string[] = [];
    if (params.projectPath) {
      const required = await this.getRequiredPackages(params.projectPath);
      missing.push(...required.filter(pkg => !installed.includes(pkg)));
    }
    
    // 生成推荐包列表
    const recommendations = this.getRecommendedPackages(params.documentType);
    
    return {
      action: 'package',
      packageInfo: {
        installed,
        missing,
        recommendations
      }
    };
  }

  /**
   * 创建项目目录结构
   */
  private async createProjectStructure(projectPath: string): Promise<void> {
    const directories = [
      '',
      'sections',
      'figures',
      'tables',
      'bibliography',
      'appendix',
      'build'
    ];
    
    for (const dir of directories) {
      const fullPath = path.join(projectPath, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  /**
   * 选择模板
   */
  private async selectTemplate(params: LaTeXManagerParams): Promise<LaTeXTemplate> {
    const templates = this.getBuiltInTemplates();
    
    if (params.templateName) {
      const template = templates.find(t => t.name === params.templateName);
      if (!template) {
        throw new Error(`Template not found: ${params.templateName}`);
      }
      return template;
    }
    
    // 根据文档类型选择默认模板
    const template = templates.find(t => t.documentType === params.documentType);
    if (!template) {
      throw new Error(`No template available for document type: ${params.documentType}`);
    }
    
    return template;
  }

  /**
   * 生成项目文件
   */
  private async generateProjectFiles(template: LaTeXTemplate, params: LaTeXManagerParams): Promise<{ filename: string; content: string; type: string }[]> {
    const files = [];
    
    for (const templateFile of template.files) {
      let content = templateFile.content;
      
      // 替换模板变量
      if (params.authorInfo) {
        content = content.replace(/\{\{AUTHOR_NAME\}\}/g, params.authorInfo.name);
        content = content.replace(/\{\{AUTHOR_EMAIL\}\}/g, params.authorInfo.email);
        content = content.replace(/\{\{AUTHOR_AFFILIATION\}\}/g, params.authorInfo.affiliation);
      }
      
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, params.projectName || 'Untitled');
      content = content.replace(/\{\{DATE\}\}/g, new Date().toISOString().split('T')[0]);
      
      // 添加自定义包
      if (params.customPackages && templateFile.type === 'main') {
        const packageIncludes = params.customPackages
          .map(pkg => `\\usepackage{${pkg}}`)
          .join('\n');
        // 如果找到占位符就替换，否则在文档类后添加
        if (content.includes('% CUSTOM_PACKAGES')) {
          content = content.replace(/(%\s*CUSTOM_PACKAGES)/, packageIncludes);
        } else {
          // 在 \begin{document} 前添加自定义包
          content = content.replace(/\\begin\{document\}/, `${packageIncludes}\n\n\\begin{document}`);
        }
      }
      
      // 处理期刊样式
      if (params.journalStyle && templateFile.type === 'main') {
        content = this.applyJournalStyle(content, params.journalStyle);
      }
      
      files.push({
        filename: templateFile.filename,
        content,
        type: templateFile.type
      });
    }
    
    // 添加 .gitignore 文件
    files.push({
      filename: '.gitignore',
      content: this.generateGitIgnore(),
      type: 'config'
    });
    
    // 添加 Makefile
    files.push({
      filename: 'Makefile',
      content: this.generateMakefile(params),
      type: 'config'
    });
    
    return files;
  }

  /**
   * 获取内置模板
   */
  private getBuiltInTemplates(): LaTeXTemplate[] {
    return [
      {
        name: 'ieee-conference',
        description: 'IEEE Conference Paper Template',
        documentType: DocumentType.CONFERENCE_PAPER,
        files: [
          {
            filename: 'main.tex',
            content: this.getIEEEConferenceTemplate(),
            type: 'main'
          },
          {
            filename: 'bibliography/references.bib',
            content: this.getDefaultBibliography(),
            type: 'bibliography'
          }
        ],
        packages: ['cite', 'amsmath', 'algorithmic', 'array'],
        compileInstructions: ['pdflatex main.tex', 'bibtex main', 'pdflatex main.tex', 'pdflatex main.tex'],
        features: ['IEEE format', 'Bibliography support', 'Figure/table templates']
      },
      {
        name: 'acm-article',
        description: 'ACM Article Template',
        documentType: DocumentType.JOURNAL_ARTICLE,
        files: [
          {
            filename: 'main.tex',
            content: this.getACMArticleTemplate(),
            type: 'main'
          },
          {
            filename: 'bibliography/references.bib',
            content: this.getDefaultBibliography(),
            type: 'bibliography'
          }
        ],
        packages: ['acmart', 'booktabs', 'ccicons'],
        compileInstructions: ['pdflatex main.tex', 'bibtex main', 'pdflatex main.tex', 'pdflatex main.tex'],
        features: ['ACM format', 'Modern layout', 'Accessibility features']
      },
      {
        name: 'thesis',
        description: 'PhD Thesis Template',
        documentType: DocumentType.THESIS,
        files: [
          {
            filename: 'main.tex',
            content: this.getThesisTemplate(),
            type: 'main'
          },
          {
            filename: 'chapters/introduction.tex',
            content: this.getChapterTemplate('Introduction'),
            type: 'main'
          },
          {
            filename: 'chapters/conclusion.tex',
            content: this.getChapterTemplate('Conclusion'),
            type: 'main'
          },
          {
            filename: 'bibliography/references.bib',
            content: this.getDefaultBibliography(),
            type: 'bibliography'
          }
        ],
        packages: ['book', 'fancyhdr', 'setspace', 'tocloft'],
        compileInstructions: ['pdflatex main.tex', 'bibtex main', 'pdflatex main.tex', 'pdflatex main.tex'],
        features: ['Multi-chapter structure', 'Table of contents', 'Bibliography']
      },
      {
        name: 'springer-article',
        description: 'Springer Journal Article Template',
        documentType: DocumentType.JOURNAL_ARTICLE,
        files: [
          {
            filename: 'main.tex',
            content: this.getSpringerTemplate(),
            type: 'main'
          },
          {
            filename: 'bibliography/references.bib',
            content: this.getDefaultBibliography(),
            type: 'bibliography'
          }
        ],
        packages: ['svjour3', 'graphicx', 'mathptmx'],
        compileInstructions: ['pdflatex main.tex', 'bibtex main', 'pdflatex main.tex', 'pdflatex main.tex'],
        features: ['Springer format', 'Professional layout', 'Math support']
      }
    ];
  }

  /**
   * IEEE 会议论文模板
   */
  private getIEEEConferenceTemplate(): string {
    return `\\documentclass[conference]{IEEEtran}
\\IEEEoverridecommandlockouts
% The preceding line is only needed to identify funding in the first footnote. If that is unneeded, please comment it out.
\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
% CUSTOM_PACKAGES

\\def\\BibTeX{{\\rm B\\kern-.05em{\\sc i\\kern-.025em b}\\kern-.08em
    T\\kern-.1667em\\lower.7ex\\hbox{E}\\kern-.125emX}}

\\begin{document}

\\title{{{PROJECT_NAME}}*\\\\
{\\footnotesize \\textsuperscript{*}Note: Sub-titles are not captured in Xplore and
should not be used}
\\thanks{Identify applicable funding agency here. If none, delete this.}
}

\\author{\\IEEEauthorblockN{1st {{AUTHOR_NAME}}}
\\IEEEauthorblockA{\\textit{dept. name of organization (of aff.)} \\\\
\\textit{name of organization (of aff.)}\\\\
City, Country \\\\
{{AUTHOR_EMAIL}}}
\\and
\\IEEEauthorblockN{2nd Given Name Surname}
\\IEEEauthorblockA{\\textit{dept. name of organization (of aff.)} \\\\
\\textit{name of organization (of aff.)}\\\\
City, Country \\\\
email address or ORCID}
}

\\maketitle

\\begin{abstract}
This document is a model and instructions for \\LaTeX.
This and the IEEEtran.cls file define the components of your paper [title, text, heads, etc.]. *CRITICAL: Do Not Use Symbols, Special Characters, Footnotes, 
or Math in Paper Title or Abstract.
\\end{abstract}

\\begin{IEEEkeywords}
component, formatting, style, styling, insert
\\end{IEEEkeywords}

\\section{Introduction}
This document is a model and instructions for \\LaTeX. Please observe the conference page limits.

\\section{Related Work}
Cite references using the \\cite{} command. For example \\cite{ref1}.

\\section{Methodology}
Describe your methodology here.

\\section{Results}
Present your results here.

\\section{Conclusion}
The conclusion goes here.

\\section*{Acknowledgment}
The authors would like to thank...

\\begin{thebibliography}{00}
\\bibitem{ref1} Author, A.A.; Author, B.B. Title of Paper. \\textit{Journal Name} \\textbf{2016}, \\textit{1}, 1-10.
\\end{thebibliography}

\\end{document}`;
  }

  /**
   * ACM 文章模板
   */
  private getACMArticleTemplate(): string {
    return `\\documentclass[acmsmall]{acmart}

\\usepackage{booktabs} % For formal tables

% Copyright
\\setcopyright{acmlicensed}

% DOI
\\acmDOI{10.1145/1122445.1122456}

% ISBN
\\acmISBN{978-1-4503-9999-9/18/06}

%Conference
\\acmConference[WOODSTOCK'18]{Woodstock '18: ACM Symposium on Neural Gaze Detection}{June 03--05, 2018}{Woodstock, NY}
\\acmYear{2018}
\\copyrightyear{2018}

\\acmPrice{15.00}

\\begin{document}

\\title{{{PROJECT_NAME}}}

\\author{{{AUTHOR_NAME}}}
\\email{{{AUTHOR_EMAIL}}}
\\affiliation{%
  \\institution{{{AUTHOR_AFFILIATION}}}
  \\streetaddress{P.O. Box 1212}
  \\city{Dublin} 
  \\state{Ohio} 
  \\postcode{43017-6221}
}

\\begin{abstract}
This paper provides a sample of a \\LaTeX\\ document which conforms,
somewhat loosely, to the formatting guidelines for
ACM SIG Proceedings.
\\end{abstract}

\\begin{CCSXML}
<ccs2012>
<concept>
<concept_id>10010520.10010553.10010562</concept_id>
<concept_desc>Computer systems organization~Embedded systems</concept_desc>
<concept_significance>500</concept_significance>
</concept>
</ccs2012>
\\end{CCSXML}

\\ccsdesc[500]{Computer systems organization~Embedded systems}

\\keywords{datasets, neural networks, gaze detection, text tagging}

\\maketitle

\\section{Introduction}
ACM's consolidated article template, introduced in 2017, provides a
consistent \\LaTeX\\ style for use across ACM publications.

\\section{Related Work}
This section should review related work in your field.

\\section{Method}
Describe your methodology here.

\\section{Results}
Present your experimental results.

\\section{Conclusion}
Summarize your contributions and future work.

\\bibliographystyle{ACM-Reference-Format}
\\bibliography{bibliography/references}

\\end{document}`;
  }

  /**
   * 论文模板
   */
  private getThesisTemplate(): string {
    return `\\documentclass[12pt,oneside]{book}

% Packages
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{microtype}
\\usepackage{graphicx}
\\usepackage{fancyhdr}
\\usepackage{setspace}
\\usepackage{tocloft}
\\usepackage{research-cliref}
\\usepackage[margin=1in]{geometry}
% CUSTOM_PACKAGES

% Page style
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[R]{\\thepage}
\\renewcommand{\\headrulewidth}{0pt}

% Double spacing
\\doublespacing

\\begin{document}

% Title page
\\begin{titlepage}
\\centering
\\vspace*{1cm}

\\Huge
\\textbf{{{PROJECT_NAME}}}

\\vspace{0.5cm}
\\LARGE
Subtitle if applicable

\\vspace{1.5cm}

\\textbf{{{AUTHOR_NAME}}}

\\vfill

A thesis presented to the faculty of\\\\
{{AUTHOR_AFFILIATION}}\\\\
in partial fulfillment of\\\\
the requirements for the degree of\\\\
Doctor of Philosophy

\\vspace{0.8cm}

\\Large
Department Name\\\\
{{AUTHOR_AFFILIATION}}\\\\
{{DATE}}

\\end{titlepage}

% Abstract
\\chapter*{Abstract}
\\addcontentsline{toc}{chapter}{Abstract}

This is the abstract of the thesis. It should provide a concise summary
of the research problem, methodology, key findings, and contributions.

% Table of contents
\\tableofcontents
\\listoffigures
\\listoftables

% Main content
\\input{chapters/introduction}
\\input{chapters/conclusion}

% Bibliography
\\bibliographystyle{plain}
\\bibliography{bibliography/references}

\\end{document}`;
  }

  /**
   * Springer 模板
   */
  private getSpringerTemplate(): string {
    return `\\documentclass{svjour3}

\\smartqed  % flush right qed marks, e.g. at end of proof

\\usepackage{graphicx}
\\usepackage{mathptmx}      % use Times fonts if available on your TeX system
% CUSTOM_PACKAGES

\\journalname{Journal Name}

\\begin{document}

\\title{{{PROJECT_NAME}}%\\thanks{Grants or other notes
%about the article that should go on the front page should be
%placed here. General acknowledgments should be placed at the end of the article.}
}
\\titlerunning{Short form of title}        % if too long for running head

\\author{{{AUTHOR_NAME}} \\and
         Second Author %etc.
}
\\authorrunning{Short form of author list} % if too long for running head

\\institute{{{AUTHOR_NAME}} \\at
              {{AUTHOR_AFFILIATION}} \\\\
              Tel.: +123-45-678910\\\\
              Fax: +123-45-678910\\\\
              \\email{{{AUTHOR_EMAIL}}}           %  \\\\
%             \\emph{Present address:} of F. Author  %  if needed
           \\and
           S. Author \\at
              second address
}

\\date{Received: date / Accepted: date}
% The correct dates will be entered by the editor

\\maketitle

\\begin{abstract}
Insert your abstract here. Include keywords, PACS and mathematical
subject classification numbers as needed.
\\keywords{First keyword \\and Second keyword \\and More}
% \\PACS{PACS code1 \\and PACS code2 \\and more}
% \\subclass{MSC code1 \\and MSC code2 \\and more}
\\end{abstract}

\\section{Introduction}
\\label{intro}
Your text comes here. Separate text sections with

\\section{Section title}
\\label{sec:1}
Text with citations \\cite{RefJ}.

\\subsection{Subsection title}
\\label{sec:2}
as required. Don't forget to give each section
and subsection a unique label (see Sect.~\\ref{sec:1}).

\\section{Conclusion}
\\label{sec:conclusion}
Summarize your findings here.

\\begin{acknowledgements}
If you'd like to thank anyone, place your comments here
and remove the percent signs.
\\end{acknowledgements}

% BibTeX users please use one of
%\\bibliographystyle{spbasic}      % basic style, author-year citations
%\\bibliographystyle{spmpsci}      % mathematics and physical sciences
%\\bibliographystyle{spphys}       % APS-like style for physics
\\bibliography{bibliography/references}   % name your BibTeX data base

\\end{document}`;
  }

  /**
   * 章节模板
   */
  private getChapterTemplate(chapterName: string): string {
    return `\\chapter{${chapterName}}
\\label{chap:${chapterName.toLowerCase()}}

This is the ${chapterName.toLowerCase()} chapter.

\\section{Section Title}
\\label{sec:${chapterName.toLowerCase()}_section}

Content goes here.

\\subsection{Subsection Title}
\\label{subsec:${chapterName.toLowerCase()}_subsection}

More content here.
`;
  }

  /**
   * 默认参考文献
   */
  private getDefaultBibliography(): string {
    return `@article{example2021,
  title={Example Article Title},
  author={Author, A. and Another, B.},
  journal={Journal of Examples},
  volume={1},
  number={1},
  pages={1--10},
  year={2021},
  publisher={Example Publisher}
}

@inproceedings{conference2020,
  title={Conference Paper Example},
  author={Speaker, C. and Presenter, D.},
  booktitle={Proceedings of the Example Conference},
  pages={100--110},
  year={2020},
  organization={IEEE}
}

@book{textbook2019,
  title={Example Textbook},
  author={Writer, E.},
  year={2019},
  publisher={Academic Press}
}
`;
  }

  /**
   * 生成 .gitignore 文件
   */
  private generateGitIgnore(): string {
    return `# LaTeX auxiliary files
*.aux
*.lof
*.log
*.lot
*.fls
*.out
*.toc
*.fmt
*.fot
*.cb
*.cb2
.*.lb

# Intermediate documents
*.dvi
*.xdv
*-converted-to.*
# these rules might exclude image files for figures etc.
# *.ps
# *.eps
# *.pdf

# latexmk
.fdb_latexmk
.fls

# auctex
*.el

# RefTeX
*.rel

# chktex
*.fix

# bibtex
*.bbl
*.bcf
*.blg
*-blx.aux
*-blx.bib
*.run.xml

# biblatex
*.bbl
*.bcf
*.blg
*-blx.aux
*-blx.bib
*.run.xml

# Build folder
build/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;
  }

  /**
   * 生成 Makefile
   */
  private generateMakefile(params: LaTeXManagerParams): string {
    const engine = params.engine || LaTeXEngine.PDFLATEX;
    const engineCmd = engine.toLowerCase();
    
    return `# LaTeX Makefile
LATEX = ${engineCmd}
BIBTEX = bibtex
TARGET = main
BUILDDIR = build

.PHONY: all clean pdf view

all: pdf

pdf: \$(BUILDDIR)/\$(TARGET).pdf

\$(BUILDDIR)/\$(TARGET).pdf: \$(TARGET).tex
\t@mkdir -p \$(BUILDDIR)
\t\$(LATEX) -output-directory=\$(BUILDDIR) \$(TARGET).tex
\t@if grep -q "\\\\bibliography" \$(TARGET).tex; then \\
\t\t\$(BIBTEX) \$(BUILDDIR)/\$(TARGET); \\
\t\t\$(LATEX) -output-directory=\$(BUILDDIR) \$(TARGET).tex; \\
\tfi
\t\$(LATEX) -output-directory=\$(BUILDDIR) \$(TARGET).tex

view: \$(BUILDDIR)/\$(TARGET).pdf
\t@if command -v open >/dev/null 2>&1; then \\
\t\topen \$(BUILDDIR)/\$(TARGET).pdf; \\
\telif command -v xdg-open >/dev/null 2>&1; then \\
\t\txdg-open \$(BUILDDIR)/\$(TARGET).pdf; \\
\tfi

clean:
\t@rm -rf \$(BUILDDIR)
\t@find . -name "*.aux" -type f -delete
\t@find . -name "*.log" -type f -delete
\t@find . -name "*.bbl" -type f -delete
\t@find . -name "*.blg" -type f -delete
\t@find . -name "*.toc" -type f -delete
\t@find . -name "*.out" -type f -delete

help:
\t@echo "Available targets:"
\t@echo "  pdf    - Build PDF (default)"
\t@echo "  view   - Build and open PDF"
\t@echo "  clean  - Remove build files"
\t@echo "  help   - Show this help"
`;
  }

  /**
   * 应用期刊样式
   */
  private applyJournalStyle(content: string, journalStyle: string): string {
    // 根据期刊添加特定的包和设置
    switch (journalStyle.toLowerCase()) {
      case 'ieee':
        return content.replace(/\\documentclass\{[^}]+\}/, '\\documentclass[conference]{IEEEtran}');
      case 'acm':
        return content.replace(/\\documentclass\{[^}]+\}/, '\\documentclass[acmsmall]{acmart}');
      case 'springer':
        return content.replace(/\\documentclass\{[^}]+\}/, '\\documentclass{svjour3}');
      case 'elsevier':
        return content.replace(/\\documentclass\{[^}]+\}/, '\\documentclass[review]{elsarticle}');
      default:
        return content;
    }
  }

  /**
   * 查找主 .tex 文件
   */
  private async findMainTexFile(projectPath: string): Promise<string> {
    const files = await fs.readdir(projectPath);
    
    // 优先查找 main.tex
    if (files.includes('main.tex')) {
      return path.join(projectPath, 'main.tex');
    }
    
    // 查找任何 .tex 文件
    const texFiles = files.filter(f => f.endsWith('.tex'));
    if (texFiles.length === 0) {
      throw new Error('No .tex files found in project');
    }
    
    return path.join(projectPath, texFiles[0]);
  }

  /**
   * 构建编译命令
   */
  private buildCompileCommand(engine: LaTeXEngine, mainFile: string, outputFormat: string, customOptions?: string[]): string[] {
    const engineCmd = engine.toLowerCase();
    const filename = path.basename(mainFile, '.tex');
    
    const baseCmd = [engineCmd];
    
    // 添加标准选项
    baseCmd.push('-interaction=nonstopmode');
    
    if (outputFormat !== 'pdf' && engine === LaTeXEngine.PDFLATEX) {
      baseCmd.push('-output-format=dvi');
    }
    
    // 添加自定义选项
    if (customOptions) {
      baseCmd.push(...customOptions);
    }
    
    baseCmd.push(filename);
    
    return baseCmd;
  }

  /**
   * 执行编译命令（模拟）
   */
  private async executeCompilation(command: string[], cwd: string): Promise<any> {
    // 这里应该实际执行编译命令，现在返回模拟结果
    return {
      success: true,
      stdout: 'LaTeX compilation successful',
      stderr: '',
      code: 0
    };
  }

  /**
   * 处理编译结果
   */
  private async processCompileResult(result: any, projectPath: string): Promise<LaTeXCompileResult> {
    const outputFiles = ['main.pdf']; // 模拟输出文件
    const errors: LaTeXError[] = [];
    const warnings: LaTeXWarning[] = [];
    
    // 这里应该解析真实的 LaTeX 日志文件
    // 现在返回模拟结果
    
    return {
      success: result.success,
      outputFiles,
      errors,
      warnings,
      compilationTime: 0,
      logFile: 'main.log'
    };
  }

  /**
   * 检查项目结构
   */
  private async checkProjectStructure(projectPath: string, errors: LaTeXError[], warnings: LaTeXWarning[], suggestions: string[]): Promise<void> {
    try {
      const files = await fs.readdir(projectPath);
      
      // 检查是否有 .tex 文件
      const texFiles = files.filter(f => f.endsWith('.tex'));
      if (texFiles.length === 0) {
        errors.push({
          line: 0,
          file: projectPath,
          message: 'No .tex files found in project',
          severity: 'fatal'
        });
      }
      
      // 检查是否有 bibliography 目录
      if (!files.includes('bibliography') && !files.some(f => f.endsWith('.bib'))) {
        suggestions.push('Consider adding a bibliography directory or .bib file for references');
      }
      
      // 检查是否有 figures 目录
      if (!files.includes('figures')) {
        suggestions.push('Consider creating a figures directory for organizing images');
      }
    } catch (error) {
      errors.push({
        line: 0,
        file: projectPath,
        message: `Cannot read project directory: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'fatal'
      });
      // 重新抛出错误以便上层捕获
      throw error;
    }
  }

  /**
   * 检查 .tex 文件语法
   */
  private async checkTexSyntax(projectPath: string, errors: LaTeXError[], warnings: LaTeXWarning[]): Promise<void> {
    try {
      const files = await fs.readdir(projectPath);
      const texFiles = files.filter(f => f.endsWith('.tex'));
      
      for (const texFile of texFiles) {
        const filePath = path.join(projectPath, texFile);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // 简单的语法检查
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // 检查未配对的括号
          const openBraces = (line.match(/\{/g) || []).length;
          const closeBraces = (line.match(/\}/g) || []).length;
          if (openBraces !== closeBraces) {
            warnings.push({
              line: i + 1,
              file: texFile,
              message: 'Unmatched braces in line',
              type: 'reference'
            });
          }
          
          // 检查未定义的引用
          const citeMatch = line.match(/\\cite\{([^}]+)\}/g);
          if (citeMatch) {
            warnings.push({
              line: i + 1,
              file: texFile,
              message: 'Citation found - ensure bibliography is properly configured',
              type: 'citation'
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        line: 0,
        file: 'syntax check',
        message: `Syntax check failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error'
      });
    }
  }

  /**
   * 检查包依赖
   */
  private async checkPackageDependencies(projectPath: string, warnings: LaTeXWarning[], suggestions: string[]): Promise<void> {
    try {
      const mainFile = await this.findMainTexFile(projectPath);
      const content = await fs.readFile(mainFile, 'utf-8');
      
      // 提取使用的包
      const packageMatches = content.match(/\\usepackage(\[[^\]]*\])?\{([^}]+)\}/g) || [];
      const packages = packageMatches.map(match => {
        const pkgMatch = match.match(/\{([^}]+)\}/);
        return pkgMatch ? pkgMatch[1] : '';
      }).filter(pkg => pkg);
      
      // 检查常见的包组合
      if (packages.includes('graphicx') && !packages.includes('float')) {
        suggestions.push('Consider adding \\usepackage{float} for better figure placement control');
      }
      
      if (packages.includes('amsmath') && !packages.includes('amssymb')) {
        suggestions.push('Consider adding \\usepackage{amssymb} for additional math symbols');
      }
    } catch (error) {
      // 忽略错误，这只是建议性检查
    }
  }

  /**
   * 检查引用
   */
  private async checkReferences(projectPath: string, warnings: LaTeXWarning[], suggestions: string[]): Promise<void> {
    try {
      const files = await fs.readdir(projectPath);
      const texFiles = files.filter(f => f.endsWith('.tex'));
      
      let hasCitations = false;
      let hasBibliography = false;
      
      for (const texFile of texFiles) {
        const filePath = path.join(projectPath, texFile);
        const content = await fs.readFile(filePath, 'utf-8');
        
        if (content.includes('\\cite{') || content.includes('\\citep{') || content.includes('\\citet{')) {
          hasCitations = true;
        }
        
        if (content.includes('\\bibliography{') || content.includes('\\bibliographystyle{')) {
          hasBibliography = true;
        }
      }
      
      if (hasCitations && !hasBibliography) {
        warnings.push({
          line: 0,
          file: 'main.tex',
          message: 'Citations found but no bibliography configuration detected',
          type: 'citation'
        });
      }
      
      if (!hasCitations && hasBibliography) {
        suggestions.push('Bibliography is configured but no citations found in text');
      }
    } catch (error) {
      // 忽略错误
    }
  }

  /**
   * 获取已安装的包（模拟）
   */
  private async getInstalledPackages(): Promise<string[]> {
    // 这里应该检查实际的 LaTeX 安装
    // 返回一些常见的包
    return [
      'amsmath', 'amssymb', 'amsfonts', 'graphicx', 'color', 'xcolor',
      'research-cliref', 'cite', 'natbib', 'biblatex', 'algorithm', 'algorithmic',
      'listings', 'fancyhdr', 'geometry', 'setspace', 'microtype'
    ];
  }

  /**
   * 获取项目所需的包
   */
  private async getRequiredPackages(projectPath: string): Promise<string[]> {
    try {
      const mainFile = await this.findMainTexFile(projectPath);
      const content = await fs.readFile(mainFile, 'utf-8');
      
      const packageMatches = content.match(/\\usepackage(\[[^\]]*\])?\{([^}]+)\}/g) || [];
      return packageMatches.map(match => {
        const pkgMatch = match.match(/\{([^}]+)\}/);
        return pkgMatch ? pkgMatch[1] : '';
      }).filter(pkg => pkg);
    } catch (error) {
      return [];
    }
  }

  /**
   * 获取推荐的包
   */
  private getRecommendedPackages(documentType?: DocumentType): string[] {
    const base = ['amsmath', 'amssymb', 'graphicx', 'research-cliref', 'cite'];
    
    switch (documentType) {
      case DocumentType.JOURNAL_ARTICLE:
      case DocumentType.CONFERENCE_PAPER:
        return [...base, 'algorithm', 'algorithmic', 'booktabs', 'microtype'];
      case DocumentType.THESIS:
        return [...base, 'fancyhdr', 'setspace', 'tocloft', 'appendix'];
      case DocumentType.TECHNICAL_REPORT:
        return [...base, 'listings', 'color', 'fancyvrb'];
      default:
        return base;
    }
  }
} 