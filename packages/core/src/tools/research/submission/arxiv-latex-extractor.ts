import { LatexTemplate, DocumentStructure, SectionInfo, FigureInfo, TableInfo, BibliographyInfo, TemplateMetadata, TemplateData, TemplateFile } from './types.js';
import { ArXivMCPClient } from '../bibliography/arxiv-mcp-client.js';

/**
 * arXiv LaTeX 提取器 - 从 arXiv 论文提取 LaTeX 源码并转换为模板
 */
export class ArxivLatexExtractor {
  private arxivClient: ArXivMCPClient;

  constructor(arxivClient: ArXivMCPClient) {
    this.arxivClient = arxivClient;
  }

  /**
   * 从 arXiv 论文提取 LaTeX 源码
   */
  async extractLatexSource(arxivId: string): Promise<LatexTemplate> {
    try {
      // 首先尝试下载 LaTeX 源码
      const downloadResult = await this.arxivClient.downloadPaper(arxivId);
      
      if (downloadResult.status === 'failed') {
        throw new Error(`Failed to download arXiv paper ${arxivId}: ${downloadResult.error}`);
      }

      // 获取论文元数据
      const searchResults = await this.arxivClient.searchPapers(`id:${arxivId}`, { maxResults: 1 });
      const paperMetadata = searchResults.length > 0 ? searchResults[0] : null;

      // 模拟读取 LaTeX 文件（实际实现需要解压和读取文件）
      const latexFiles = await this.simulateExtractLatexFiles(arxivId);
      
      // 找到主文件
      const mainFile = this.findMainTexFile(latexFiles);
      if (!mainFile) {
        throw new Error('No main LaTeX file found in the downloaded source');
      }

      // 分析文档结构
      const structure = this.extractDocumentStructure(latexFiles.get(mainFile) || '');

      // 创建模板元数据
      const templateMetadata: TemplateMetadata = {
        version: '1.0',
        authors: paperMetadata?.authors || ['Unknown'],
        license: 'arXiv Non-exclusive License',
        tags: this.extractTagsFromStructure(structure),
        lastModified: new Date(),
        downloadCount: 1,
        rating: 4.0
      };

      return {
        mainFile,
        files: latexFiles,
        structure,
        dependencies: this.extractDependencies(latexFiles),
        metadata: templateMetadata
      };
    } catch (error) {
      throw new Error(`Failed to extract LaTeX from arXiv ${arxivId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 将 arXiv LaTeX 转换为通用模板
   */
  async convertToTemplate(arxivId: string, options?: { removePersonalInfo?: boolean, generalizePaths?: boolean }): Promise<TemplateData> {
    const latexTemplate = await this.extractLatexSource(arxivId);
    
    const templateFiles: TemplateFile[] = [];
    
    // 处理每个文件
    for (const [filePath, content] of latexTemplate.files.entries()) {
      let processedContent = content;
      
      // 可选：移除个人信息
      if (options?.removePersonalInfo !== false) {
        processedContent = this.removePersonalInfo(processedContent);
      }
      
      // 可选：泛化路径
      if (options?.generalizePaths !== false) {
        processedContent = this.generalizePaths(processedContent);
      }
      
      templateFiles.push({
        path: filePath,
        content: processedContent,
        type: this.determineFileType(filePath),
        required: filePath === latexTemplate.mainFile
      });
    }

    // 获取论文元数据以生成模板名称和描述
    const searchResults = await this.arxivClient.searchPapers(`id:${arxivId}`, { maxResults: 1 });
    const paperMetadata = searchResults.length > 0 ? searchResults[0] : null;

    return {
      id: `arxiv-${arxivId}`,
      name: paperMetadata?.title ? `Template from: ${paperMetadata.title}` : `arXiv Template ${arxivId}`,
      description: `LaTeX template extracted from arXiv paper ${arxivId}${paperMetadata?.abstract ? `. Abstract: ${paperMetadata.abstract.substring(0, 200)}...` : ''}`,
      source: 'arxiv',
      category: this.categorizePaper(latexTemplate.structure, paperMetadata),
      files: templateFiles,
      metadata: {
        ...latexTemplate.metadata,
        tags: [...(latexTemplate.metadata.tags || []), 'arxiv', 'extracted', arxivId]
      },
      lastUpdated: new Date()
    };
  }

  /**
   * 清理 LaTeX 代码，移除个人特定信息
   */
  private removePersonalInfo(latex: string): string {
    let cleaned = latex;

    // 替换具体的作者信息为占位符
    cleaned = cleaned.replace(/\\author\{[^}]+\}/g, '\\author{Your Name}');
    
    // 替换具体的邮箱
    cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'your.email@university.edu');
    
    // 替换具体的机构信息
    cleaned = cleaned.replace(/\\affiliation\{[^}]+\}/g, '\\affiliation{Your Institution}');
    cleaned = cleaned.replace(/\\address\{[^}]+\}/g, '\\address{Your Address}');
    
    // 替换具体的标题为占位符（保留结构）
    const titleMatch = cleaned.match(/\\title\{([^}]+)\}/);
    if (titleMatch) {
      cleaned = cleaned.replace(/\\title\{[^}]+\}/, '\\title{Your Paper Title}');
    }

    // 替换具体的致谢信息
    cleaned = cleaned.replace(/\\thanks\{[^}]+\}/g, '\\thanks{Corresponding author}');

    return cleaned;
  }

  /**
   * 泛化文件路径和引用
   */
  private generalizePaths(latex: string): string {
    let generalized = latex;

    // 泛化图片路径
    generalized = generalized.replace(/\\includegraphics(?:\[[^\]]*\])?\{[^}]*\/([^}\/]+)\}/g, '\\includegraphics{figures/$1}');
    
    // 泛化输入文件路径
    generalized = generalized.replace(/\\input\{[^}]*\/([^}\/]+)\}/g, '\\input{$1}');
    
    // 泛化包含文件路径
    generalized = generalized.replace(/\\include\{[^}]*\/([^}\/]+)\}/g, '\\include{$1}');

    return generalized;
  }

  /**
   * 提取文档结构
   */
  private extractDocumentStructure(latex: string): DocumentStructure {
    const lines = latex.split('\n');
    
    // 提取文档类
    const documentClassMatch = latex.match(/\\documentclass(?:\[[^\]]*\])?\{([^}]+)\}/);
    const documentClass = documentClassMatch ? documentClassMatch[1] : 'article';

    // 提取包
    const packages: string[] = [];
    const packageRegex = /\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}/g;
    let packageMatch;
    while ((packageMatch = packageRegex.exec(latex)) !== null) {
      packages.push(packageMatch[1]);
    }

    // 提取章节
    const sections = this.extractSections(lines);
    
    // 提取图片
    const figures = this.extractFigures(latex);
    
    // 提取表格
    const tables = this.extractTables(latex);
    
    // 提取参考文献信息
    const bibliography = this.extractBibliographyInfo(latex);

    return {
      documentClass,
      packages,
      sections,
      figures,
      tables,
      bibliography
    };
  }

  /**
   * 提取章节信息
   */
  private extractSections(lines: string[]): SectionInfo[] {
    const sections: SectionInfo[] = [];
    const sectionRegex = /\\(chapter|section|subsection|subsubsection)\*?\{([^}]+)\}/;

    lines.forEach((line, index) => {
      const match = line.match(sectionRegex);
      if (match) {
        const level = this.getSectionLevel(match[1]);
        sections.push({
          level,
          title: match[2],
          startLine: index + 1
        });
      }
    });

    return sections;
  }

  /**
   * 获取章节级别
   */
  private getSectionLevel(sectionType: string): number {
    const levels: { [key: string]: number } = {
      'chapter': 0,
      'section': 1,
      'subsection': 2,
      'subsubsection': 3
    };
    return levels[sectionType] || 1;
  }

  /**
   * 提取图片信息
   */
  private extractFigures(latex: string): FigureInfo[] {
    const figures: FigureInfo[] = [];
    const figureRegex = /\\begin\{figure\}[\s\S]*?\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}[\s\S]*?\\caption\{([^}]+)\}[\s\S]*?\\label\{([^}]+)\}[\s\S]*?\\end\{figure\}/g;
    
    let match;
    while ((match = figureRegex.exec(latex)) !== null) {
      figures.push({
        fileName: match[1],
        caption: match[2],
        label: match[3]
      });
    }

    return figures;
  }

  /**
   * 提取表格信息
   */
  private extractTables(latex: string): TableInfo[] {
    const tables: TableInfo[] = [];
    const tableRegex = /\\begin\{table\}[\s\S]*?\\caption\{([^}]+)\}[\s\S]*?\\label\{([^}]+)\}[\s\S]*?\\begin\{tabular\}\{([^}]+)\}[\s\S]*?\\end\{tabular\}[\s\S]*?\\end\{table\}/g;
    
    let match;
    while ((match = tableRegex.exec(latex)) !== null) {
      const columnSpec = match[3];
      const columns = columnSpec.replace(/[^clr]/g, '').length;
      
      tables.push({
        caption: match[1],
        label: match[2],
        columns,
        rows: 0 // 实际实现中可以进一步解析行数
      });
    }

    return tables;
  }

  /**
   * 提取参考文献信息
   */
  private extractBibliographyInfo(latex: string): BibliographyInfo {
    const styleMatch = latex.match(/\\bibliographystyle\{([^}]+)\}/);
    const fileMatch = latex.match(/\\bibliography\{([^}]+)\}/);
    
    return {
      style: styleMatch ? styleMatch[1] : 'plain',
      file: fileMatch ? fileMatch[1] + '.bib' : undefined,
      entries: 0 // 实际实现中需要解析 .bib 文件
    };
  }

  /**
   * 提取依赖项
   */
  private extractDependencies(files: Map<string, string>): string[] {
    const dependencies = new Set<string>();
    
    files.forEach((content) => {
      // 提取包依赖
      const packageRegex = /\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}/g;
      let match;
      while ((match = packageRegex.exec(content)) !== null) {
        dependencies.add(match[1]);
      }
    });

    return Array.from(dependencies);
  }

  /**
   * 从结构中提取标签
   */
  private extractTagsFromStructure(structure: DocumentStructure): string[] {
    const tags = ['latex', 'academic'];
    
    // 根据文档类添加标签
    switch (structure.documentClass) {
      case 'article':
        tags.push('article');
        break;
      case 'book':
        tags.push('book');
        break;
      case 'report':
        tags.push('report');
        break;
      case 'beamer':
        tags.push('presentation');
        break;
    }

    // 根据包添加标签
    if (structure.packages.includes('amsmath')) {
      tags.push('mathematics');
    }
    if (structure.packages.includes('graphicx')) {
      tags.push('figures');
    }
    if (structure.packages.includes('algorithm')) {
      tags.push('algorithms');
    }

    return tags;
  }

  /**
   * 对论文进行分类
   */
  private categorizePaper(structure: DocumentStructure, metadata: any): string[] {
    const categories = ['academic'];
    
    // 根据元数据分类
    if (metadata?.subject) {
      const subject = metadata.subject.toLowerCase();
      if (subject.includes('computer science')) {
        categories.push('computer-science');
      }
      if (subject.includes('mathematics')) {
        categories.push('mathematics');
      }
      if (subject.includes('physics')) {
        categories.push('physics');
      }
      if (subject.includes('biology')) {
        categories.push('biology');
      }
    }

    // 根据结构分类
    if (structure.figures.length > 5) {
      categories.push('experimental');
    }
    if (structure.packages.includes('algorithm')) {
      categories.push('computational');
    }

    return categories;
  }

  /**
   * 确定文件类型
   */
  private determineFileType(filePath: string): 'tex' | 'cls' | 'sty' | 'bib' | 'figure' | 'other' {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'tex':
        return 'tex';
      case 'cls':
        return 'cls';
      case 'sty':
        return 'sty';
      case 'bib':
        return 'bib';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'pdf':
      case 'eps':
        return 'figure';
      default:
        return 'other';
    }
  }

  /**
   * 查找主 LaTeX 文件
   */
  private findMainTexFile(files: Map<string, string>): string | null {
    // 优先查找包含 \documentclass 的文件
    for (const [filePath, content] of files.entries()) {
      if (content.includes('\\documentclass') && filePath.endsWith('.tex')) {
        return filePath;
      }
    }

    // 如果没找到，返回第一个 .tex 文件
    for (const filePath of files.keys()) {
      if (filePath.endsWith('.tex')) {
        return filePath;
      }
    }

    return null;
  }

  /**
   * 模拟从 arXiv 提取 LaTeX 文件
   * 实际实现需要解压下载的文件并读取内容
   */
  private async simulateExtractLatexFiles(arxivId: string): Promise<Map<string, string>> {
    const files = new Map<string, string>();

    // 模拟主文件
    files.set('main.tex', this.generateSampleArxivLatex(arxivId));
    
    // 模拟参考文献文件
    files.set('references.bib', this.generateSampleBibliography());
    
    // 模拟样式文件
    if (Math.random() > 0.5) {
      files.set('custom.sty', '% Custom style file');
    }

    return files;
  }

  /**
   * 生成示例 arXiv LaTeX 内容
   */
  private generateSampleArxivLatex(arxivId: string): string {
    return `\\documentclass[11pt]{article}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{cite}
\\usepackage{url}

\\title{Sample Paper from arXiv:${arxivId}}
\\author{John Doe\\thanks{Department of Computer Science, Example University} \\and Jane Smith\\thanks{Department of Mathematics, Example University}}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
This is a sample abstract extracted from arXiv paper ${arxivId}. The abstract provides a brief overview of the research presented in this paper.
\\end{abstract}

\\section{Introduction}

This is the introduction section where the problem is introduced and motivated.

\\section{Related Work}

This section discusses previous work related to the current research.

\\section{Methodology}

This section describes the methodology used in the research.

\\subsection{Data Collection}

Details about data collection methods.

\\subsection{Analysis}

Details about analysis methods.

\\section{Results}

This section presents the results of the research.

\\begin{figure}[htbp]
\\centering
\\includegraphics[width=0.8\\textwidth]{results_plot.png}
\\caption{Results visualization}
\\label{fig:results}
\\end{figure}

\\section{Discussion}

Discussion of the results and their implications.

\\section{Conclusion}

Concluding remarks and future work.

\\section*{Acknowledgments}

The authors thank the anonymous reviewers for their valuable comments.

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`;
  }

  /**
   * 生成示例参考文献
   */
  private generateSampleBibliography(): string {
    return `@article{smith2023example,
  title={An Example Research Paper},
  author={Smith, John and Doe, Jane},
  journal={Journal of Example Research},
  volume={15},
  number={3},
  pages={123--145},
  year={2023},
  publisher={Example Publisher}
}

@inproceedings{brown2022conference,
  title={Conference Paper Example},
  author={Brown, Alice and Wilson, Bob},
  booktitle={Proceedings of the Example Conference},
  pages={67--82},
  year={2022},
  organization={ACM}
}

@book{johnson2021book,
  title={Example Textbook},
  author={Johnson, Carol},
  year={2021},
  publisher={Example Press}
}`;
  }
} 