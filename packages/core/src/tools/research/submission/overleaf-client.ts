import {
  TemplateData,
  TemplateSearchOptions,
  TemplateFile,
  TemplateMetadata,
} from './types.js';

/**
 * Overleaf 客户端 - 用于获取期刊模板
 *
 * 注意：由于 Overleaf 没有公开的 API，这个实现模拟了模板获取功能
 * 在实际生产环境中，可能需要通过网页抓取或其他方式实现
 */
export class OverleafClient {
  private baseUrl = 'https://www.overleaf.com';
  private templateCache = new Map<string, TemplateData>();

  constructor() {
    this.initializeCommonTemplates();
  }

  /**
   * 搜索 Overleaf 模板
   */
  async searchTemplates(
    options: TemplateSearchOptions,
  ): Promise<TemplateData[]> {
    try {
      // 从缓存中搜索匹配的模板
      const allTemplates = Array.from(this.templateCache.values());
      let filteredTemplates = allTemplates;

      // 按期刊名称筛选
      if (options.journal) {
        filteredTemplates = filteredTemplates.filter(
          (template) =>
            template.journalName
              ?.toLowerCase()
              .includes(options.journal!.toLowerCase()) ||
            template.name
              .toLowerCase()
              .includes(options.journal!.toLowerCase()),
        );
      }

      // 按出版商筛选
      if (options.publisher) {
        filteredTemplates = filteredTemplates.filter((template) =>
          template.publisher
            ?.toLowerCase()
            .includes(options.publisher!.toLowerCase()),
        );
      }

      // 按类别筛选
      if (options.category && options.category.length > 0) {
        filteredTemplates = filteredTemplates.filter((template) =>
          options.category!.some((cat) => template.category.includes(cat)),
        );
      }

      // 按关键词筛选
      if (options.keywords && options.keywords.length > 0) {
        filteredTemplates = filteredTemplates.filter((template) => {
          const searchText =
            `${template.name} ${template.description} ${template.metadata.tags?.join(' ') || ''}`.toLowerCase();
          return options.keywords!.some((keyword) =>
            searchText.includes(keyword.toLowerCase()),
          );
        });
      }

      // 排序
      if (options.sortBy) {
        filteredTemplates.sort((a, b) => {
          switch (options.sortBy) {
            case 'date':
              return b.lastUpdated.getTime() - a.lastUpdated.getTime();
            case 'popularity':
              return (
                (b.metadata.downloadCount || 0) -
                (a.metadata.downloadCount || 0)
              );
            case 'relevance':
            default:
              return (b.metadata.rating || 0) - (a.metadata.rating || 0);
          }
        });
      }

      // 限制结果数量
      if (options.limit) {
        filteredTemplates = filteredTemplates.slice(0, options.limit);
      }

      return filteredTemplates;
    } catch (error) {
      throw new Error(
        `Failed to search Overleaf templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * 获取特定模板
   */
  async fetchTemplate(templateId: string): Promise<TemplateData> {
    try {
      // 先从缓存中查找
      if (this.templateCache.has(templateId)) {
        return this.templateCache.get(templateId)!;
      }

      // 如果是 Overleaf URL 格式，提取 ID
      const id = this.extractTemplateId(templateId);
      if (this.templateCache.has(id)) {
        return this.templateCache.get(id)!;
      }

      // 模拟从 Overleaf 获取模板（实际实现需要网页抓取）
      const template = await this.simulateFetchFromOverleaf(id);
      this.templateCache.set(id, template);
      return template;
    } catch (error) {
      throw new Error(
        `Failed to fetch template ${templateId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * 获取缓存的模板列表
   */
  getCachedTemplates(): TemplateData[] {
    return Array.from(this.templateCache.values());
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.templateCache.clear();
    this.initializeCommonTemplates();
  }

  /**
   * 提取模板 ID
   */
  private extractTemplateId(templateId: string): string {
    // 处理 Overleaf URL 格式
    if (templateId.includes('overleaf.com')) {
      const match = templateId.match(/\/latex\/templates\/([^\/]+)/);
      return match ? match[1] : templateId;
    }

    // 处理 overleaf: 前缀
    if (templateId.startsWith('overleaf:')) {
      return templateId.replace('overleaf:', '');
    }

    return templateId;
  }

  /**
   * 模拟从 Overleaf 获取模板
   * 实际实现需要网页抓取或 API 调用
   */
  private async simulateFetchFromOverleaf(
    templateId: string,
  ): Promise<TemplateData> {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 返回模拟的模板数据
    return {
      id: templateId,
      name: `Template ${templateId}`,
      description: `A LaTeX template fetched from Overleaf (ID: ${templateId})`,
      source: 'overleaf',
      category: ['academic', 'article'],
      files: [
        {
          path: 'main.tex',
          content: this.generateBasicLatexTemplate(),
          type: 'tex',
          required: true,
        },
        {
          path: 'references.bib',
          content: this.generateBasicBibliography(),
          type: 'bib',
          required: false,
        },
      ],
      metadata: {
        version: '1.0',
        authors: ['Overleaf Team'],
        license: 'MIT',
        tags: ['academic', 'article', 'research'],
        lastModified: new Date(),
        downloadCount: Math.floor(Math.random() * 1000),
        rating: 4 + Math.random(),
      },
      lastUpdated: new Date(),
    };
  }

  /**
   * 初始化常用模板缓存
   */
  private initializeCommonTemplates(): void {
    const templates: TemplateData[] = [
      {
        id: 'nature-template',
        name: 'Nature Journal Template',
        description: 'Official template for Nature journal submissions',
        source: 'overleaf',
        journalName: 'Nature',
        publisher: 'Nature Publishing Group',
        category: ['academic', 'biology', 'multidisciplinary'],
        files: [
          {
            path: 'main.tex',
            content: this.generateNatureTemplate(),
            type: 'tex',
            required: true,
          },
          {
            path: 'naturemag.bst',
            content: '% Nature bibliography style',
            type: 'other',
            required: true,
          },
        ],
        metadata: {
          version: '2.0',
          authors: ['Nature Editorial'],
          license: 'Custom',
          tags: ['nature', 'biology', 'multidisciplinary', 'high-impact'],
          downloadCount: 15000,
          rating: 4.8,
        },
        lastUpdated: new Date('2024-01-15'),
      },
      {
        id: 'ieee-template',
        name: 'IEEE Conference Template',
        description: 'Standard template for IEEE conference papers',
        source: 'overleaf',
        publisher: 'IEEE',
        category: ['academic', 'engineering', 'computer-science'],
        files: [
          {
            path: 'main.tex',
            content: this.generateIEEETemplate(),
            type: 'tex',
            required: true,
          },
          {
            path: 'IEEEtran.cls',
            content: '% IEEE document class',
            type: 'cls',
            required: true,
          },
        ],
        metadata: {
          version: '1.8',
          authors: ['IEEE'],
          license: 'LPPL',
          tags: ['ieee', 'conference', 'engineering', 'computer-science'],
          downloadCount: 25000,
          rating: 4.6,
        },
        lastUpdated: new Date('2024-02-01'),
      },
      {
        id: 'acs-template',
        name: 'ACS Journal Template',
        description: 'American Chemical Society journal template',
        source: 'overleaf',
        publisher: 'American Chemical Society',
        category: ['academic', 'chemistry'],
        files: [
          {
            path: 'main.tex',
            content: this.generateACSTemplate(),
            type: 'tex',
            required: true,
          },
        ],
        metadata: {
          version: '3.1',
          authors: ['ACS Publications'],
          license: 'Custom',
          tags: ['acs', 'chemistry', 'organic', 'inorganic'],
          downloadCount: 8000,
          rating: 4.4,
        },
        lastUpdated: new Date('2024-01-20'),
      },
    ];

    templates.forEach((template) => {
      this.templateCache.set(template.id, template);
    });
  }

  /**
   * 生成基础 LaTeX 模板
   */
  private generateBasicLatexTemplate(): string {
    return `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{cite}

\\title{Your Paper Title}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
Your abstract goes here.
\\end{abstract}

\\section{Introduction}

Your introduction goes here.

\\section{Methods}

Your methods section goes here.

\\section{Results}

Your results section goes here.

\\section{Discussion}

Your discussion goes here.

\\section{Conclusion}

Your conclusion goes here.

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`;
  }

  /**
   * 生成基础参考文献
   */
  private generateBasicBibliography(): string {
    return `@article{example2024,
  title={An Example Research Paper},
  author={Smith, John and Doe, Jane},
  journal={Journal of Example Research},
  volume={1},
  number={1},
  pages={1--10},
  year={2024},
  publisher={Example Publisher}
}`;
  }

  /**
   * 生成 Nature 模板
   */
  private generateNatureTemplate(): string {
    return `\\documentclass{article}
\\usepackage{nature}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}
\\usepackage{cite}

\\title{Your Nature Paper Title}
\\author{Author One\\thanks{Corresponding author} \\and Author Two}

\\begin{document}

\\maketitle

\\begin{abstract}
Your abstract for Nature (150 words maximum).
\\end{abstract}

\\section*{Introduction}

Your introduction following Nature guidelines.

\\section*{Results}

Your results section.

\\section*{Discussion}

Your discussion section.

\\section*{Methods}

Your methods section.

\\bibliographystyle{naturemag}
\\bibliography{references}

\\end{document}`;
  }

  /**
   * 生成 IEEE 模板
   */
  private generateIEEETemplate(): string {
    return `\\documentclass[conference]{IEEEtran}
\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}

\\begin{document}

\\title{Your IEEE Conference Paper Title}

\\author{\\IEEEauthorblockN{First Author}
\\IEEEauthorblockA{\\textit{Department} \\\\
\\textit{University}\\\\
City, Country \\\\
email@university.edu}
\\and
\\IEEEauthorblockN{Second Author}
\\IEEEauthorblockA{\\textit{Department} \\\\
\\textit{University}\\\\
City, Country \\\\
email@university.edu}
}

\\maketitle

\\begin{abstract}
Your abstract goes here.
\\end{abstract}

\\begin{IEEEkeywords}
keyword1, keyword2, keyword3
\\end{IEEEkeywords}

\\section{Introduction}

Your introduction.

\\section{Related Work}

Your related work section.

\\section{Methodology}

Your methodology.

\\section{Results}

Your results.

\\section{Conclusion}

Your conclusion.

\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}`;
  }

  /**
   * 生成 ACS 模板
   */
  private generateACSTemplate(): string {
    return `\\documentclass[journal=jacsat,manuscript=article]{achemso}
\\usepackage[version=3]{mhchem}
\\usepackage{graphicx}

\\author{First Author}
\\affiliation{Department of Chemistry, University}
\\author{Second Author}
\\affiliation{Department of Chemistry, University}

\\title{Your ACS Paper Title}

\\begin{document}

\\begin{abstract}
Your abstract for ACS journal.
\\end{abstract}

\\section{Introduction}

Your introduction following ACS guidelines.

\\section{Experimental Section}

Your experimental procedures.

\\section{Results and Discussion}

Your results and discussion.

\\section{Conclusion}

Your conclusion.

\\bibliography{references}

\\end{document}`;
  }
}
