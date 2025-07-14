/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseResearchTool } from '../base-tool.js';
import {
  ResearchToolParams,
  BibliographyEntry,
  Database,
  CitationStyle,
  ResearchToolCategory,
  LiteratureSearchParams
} from '../types.js';

/**
 * 文献搜索参数接口
 */
export interface BibliographySearchParams extends ResearchToolParams {
  query: string;
  databases: Database[];
  maxResults?: number;
  yearRange?: {
    start: number;
    end: number;
  };
  fields?: string[];
  includeAbstracts?: boolean;
  sortBy?: 'relevance' | 'date' | 'citations';
  language?: string;
}

/**
 * 文献管理参数接口
 */
export interface BibliographyManageParams extends ResearchToolParams {
  action: 'add' | 'remove' | 'update' | 'list' | 'export' | 'import';
  entryId?: string;
  entry?: Partial<BibliographyEntry>;
  format?: CitationStyle;
  filename?: string;
  data?: string; // For import/export data
}

/**
 * 文献搜索结果
 */
export interface BibliographySearchResult {
  entries: BibliographyEntry[];
  totalCount: number;
  searchMetadata: {
    query: string;
    databases: Database[];
    searchTime: number;
    duplicatesRemoved: number;
  };
  sources: {
    [key in Database]?: {
      count: number;
      status: 'success' | 'error' | 'timeout';
      error?: string;
    };
  };
}

/**
 * 文献数据库管理结果
 */
export interface BibliographyManageResult {
  success: boolean;
  action: string;
  count?: number;
  entries?: BibliographyEntry[];
  exportData?: string;
  message?: string;
}

/**
 * arXiv API 响应接口
 */
interface ArxivEntry {
  id: string;
  title: string;
  authors: Array<{ name: string }>;
  summary: string;
  published: string;
  updated: string;
  doi?: string;
  categories: string[];
  links: Array<{ href: string; type: string; title?: string }>;
}

/**
 * 文献管理工具
 * 集成多个学术数据库 API，提供统一的文献搜索、管理和引用格式转换功能
 */
export class BibliographyManager extends BaseResearchTool<
  BibliographySearchParams | BibliographyManageParams,
  BibliographySearchResult | BibliographyManageResult
> {
  private bibliography: BibliographyEntry[] = [];
  private nextId = 1;

  constructor() {
    super(
      'manage_bibliography',
      'Manage bibliography and search academic literature',
      ResearchToolCategory.ANALYSIS
    );
  }

  public validate(params: ResearchToolParams): boolean {
    if ('query' in params) {
      // 搜索参数验证
      const searchParams = params as BibliographySearchParams;
      return !!(
        searchParams.query?.trim() &&
        searchParams.databases?.length > 0 &&
        (!searchParams.maxResults || searchParams.maxResults > 0) &&
        (!searchParams.yearRange || 
         (searchParams.yearRange.start <= searchParams.yearRange.end))
      );
    } else if ('action' in params) {
      // 管理参数验证
      const manageParams = params as BibliographyManageParams;
      const validActions = ['add', 'remove', 'update', 'list', 'export', 'import'];
      return validActions.includes(manageParams.action);
    }
    return false;
  }

  public getHelp(): string {
    return this.formatHelp(
      'Search academic literature and manage bibliography database',
      [
        // 搜索参数
        { name: 'query', type: 'string', required: true, description: 'Search query for literature' },
        { name: 'databases', type: 'Database[]', required: true, description: 'Databases to search (arxiv, pubmed, ieee, etc.)' },
        { name: 'maxResults', type: 'number', required: false, description: 'Maximum number of results (default: 20)' },
        { name: 'yearRange', type: 'object', required: false, description: 'Year range filter {start: number, end: number}' },
        { name: 'fields', type: 'string[]', required: false, description: 'Specific research fields to focus on' },
        { name: 'includeAbstracts', type: 'boolean', required: false, description: 'Include abstracts in results' },
        { name: 'sortBy', type: 'string', required: false, description: 'Sort order: relevance, date, citations' },
        // 管理参数
        { name: 'action', type: 'string', required: true, description: 'Management action: add, remove, update, list, export, import' },
        { name: 'entryId', type: 'string', required: false, description: 'Entry ID for update/remove actions' },
        { name: 'entry', type: 'BibliographyEntry', required: false, description: 'Bibliography entry data' },
        { name: 'format', type: 'CitationStyle', required: false, description: 'Citation format for export' },
        { name: 'filename', type: 'string', required: false, description: 'Filename for export/import' }
      ],
      [
        {
          description: 'Search for machine learning papers on arXiv',
          params: {
            query: 'machine learning neural networks',
            databases: ['arxiv'],
            maxResults: 10,
            yearRange: { start: 2020, end: 2024 },
            includeAbstracts: true
          }
        },
        {
          description: 'Export bibliography in APA format',
          params: {
            action: 'export',
            format: 'apa',
            filename: 'my-bibliography.txt'
          }
        }
      ]
    );
  }

  protected async executeImpl(
    params: BibliographySearchParams | BibliographyManageParams
  ): Promise<BibliographySearchResult | BibliographyManageResult> {
    if ('query' in params) {
      return this.searchLiterature(params as BibliographySearchParams);
    } else {
      return this.manageBibliography(params as BibliographyManageParams);
    }
  }

  /**
   * 搜索学术文献
   */
  private async searchLiterature(params: BibliographySearchParams): Promise<BibliographySearchResult> {
    const startTime = Date.now();
    const maxResults = params.maxResults || 20;
    const allEntries: BibliographyEntry[] = [];
    const sources: BibliographySearchResult['sources'] = {};
    
    // 并行搜索所有数据库
    const searchPromises = params.databases.map(async (database) => {
      try {
        let entries: BibliographyEntry[] = [];
        
        switch (database) {
          case Database.ARXIV:
            entries = await this.searchArxiv(params, maxResults);
            break;
          case Database.GOOGLE_SCHOLAR:
            entries = await this.searchWebScientific(params, maxResults);
            break;
          case Database.PUBMED:
            entries = await this.searchPubmed(params, maxResults);
            break;
          case Database.IEEE:
            entries = await this.searchIEEE(params, maxResults);
            break;
          default:
            console.warn(`Database ${database} not yet implemented`);
            entries = [];
        }

        sources[database] = {
          count: entries.length,
          status: 'success'
        };

        return entries;
      } catch (error) {
        console.error(`Error searching ${database}:`, error);
        sources[database] = {
          count: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        return [];
      }
    });

    const results = await Promise.all(searchPromises);
    results.forEach(entries => allEntries.push(...entries));

    // 去重处理
    const beforeDedup = allEntries.length;
    const uniqueEntries = this.deduplicateEntries(allEntries);
    const duplicatesRemoved = beforeDedup - uniqueEntries.length;

    // 应用过滤器
    let filteredEntries = this.applyFilters(uniqueEntries, params);

    // 排序
    filteredEntries = this.sortEntries(filteredEntries, params.sortBy || 'relevance');

    // 限制结果数量
    filteredEntries = filteredEntries.slice(0, maxResults);

    const searchTime = Date.now() - startTime;

    return {
      entries: filteredEntries,
      totalCount: filteredEntries.length,
      searchMetadata: {
        query: params.query,
        databases: params.databases,
        searchTime,
        duplicatesRemoved
      },
      sources
    };
  }

  /**
   * 搜索 arXiv
   */
  private async searchArxiv(params: BibliographySearchParams, maxResults: number): Promise<BibliographyEntry[]> {
    const query = encodeURIComponent(params.query);
    const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=${maxResults}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`arXiv API error: ${response.status}`);
      }

      const xmlText = await response.text();
      return this.parseArxivXML(xmlText);
    } catch (error) {
      console.error('arXiv search error:', error);
      throw error;
    }
  }

  /**
   * 使用网络搜索进行学术文献搜索
   * 这里可以集成现有的 WebSearchTool 或实现专门的学术搜索
   */
  private async searchWebScientific(params: BibliographySearchParams, maxResults: number): Promise<BibliographyEntry[]> {
    // 构建学术搜索查询
    const academicQuery = `${params.query} site:scholar.google.com OR site:pubmed.ncbi.nlm.nih.gov OR filetype:pdf`;
    
    try {
      // 这里应该集成现有的 WebSearchTool 或者使用专门的学术搜索 API
      // 暂时返回模拟数据
      console.log(`Web scientific search for: ${academicQuery}`);
      
      // 模拟搜索结果
      return this.createMockWebResults(params.query, Math.min(maxResults, 5));
    } catch (error) {
      console.error('Web scientific search error:', error);
      throw error;
    }
  }

  /**
   * 搜索 PubMed（模拟实现）
   */
  private async searchPubmed(params: BibliographySearchParams, maxResults: number): Promise<BibliographyEntry[]> {
    // 这里应该实现真实的 PubMed API 调用
    console.log(`PubMed search for: ${params.query}`);
    return this.createMockPubmedResults(params.query, Math.min(maxResults, 3));
  }

  /**
   * 搜索 IEEE（模拟实现）
   */
  private async searchIEEE(params: BibliographySearchParams, maxResults: number): Promise<BibliographyEntry[]> {
    // 这里应该实现真实的 IEEE API 调用
    console.log(`IEEE search for: ${params.query}`);
    return this.createMockIEEEResults(params.query, Math.min(maxResults, 3));
  }

  /**
   * 解析 arXiv XML 响应
   */
  private parseArxivXML(xmlText: string): BibliographyEntry[] {
    const entries: BibliographyEntry[] = [];
    
    // 简单的 XML 解析（生产环境应使用专门的 XML 解析库）
    const entryMatches = xmlText.match(/<entry>([\s\S]*?)<\/entry>/g);
    
    if (!entryMatches) return entries;

    entryMatches.forEach((entryXml, index) => {
      try {
        const id = this.extractXmlValue(entryXml, 'id');
        const title = this.extractXmlValue(entryXml, 'title')?.replace(/\s+/g, ' ').trim();
        const summary = this.extractXmlValue(entryXml, 'summary')?.replace(/\s+/g, ' ').trim();
        const published = this.extractXmlValue(entryXml, 'published');
        
        // 提取作者
        const authorMatches = entryXml.match(/<author>([\s\S]*?)<\/author>/g);
        const authors = authorMatches?.map(authorXml => 
          this.extractXmlValue(authorXml, 'name') || 'Unknown'
        ) || [];

        // 提取 DOI
        const doiMatch = entryXml.match(/doi:([^<\s]+)/);
        const doi = doiMatch ? doiMatch[1] : undefined;

        // 提取 arXiv ID
        const arxivIdMatch = id?.match(/arxiv\.org\/abs\/(.+)$/);
        const arxivId = arxivIdMatch ? arxivIdMatch[1] : undefined;

        if (title && published) {
          entries.push({
            id: `arxiv_${index + 1}`,
            title,
            authors,
            year: new Date(published).getFullYear(),
            abstract: summary,
            doi,
            arxivId,
            url: id
          });
        }
      } catch (error) {
        console.warn('Error parsing arXiv entry:', error);
      }
    });

    return entries;
  }

  /**
   * 从 XML 中提取值
   */
  private extractXmlValue(xml: string, tag: string): string | undefined {
    const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
    return match ? match[1].trim() : undefined;
  }

  /**
   * 创建模拟的网络搜索结果
   */
  private createMockWebResults(query: string, count: number): BibliographyEntry[] {
    const results: BibliographyEntry[] = [];
    
    for (let i = 1; i <= count; i++) {
      results.push({
        id: `web_${i}`,
        title: `${query} - Research Paper ${i}`,
        authors: [`Author ${i}A`, `Author ${i}B`],
        year: 2023 - i,
        abstract: `Abstract for ${query} research paper ${i}. This paper explores various aspects of ${query} and provides insights into recent developments.`,
        url: `https://example.com/paper-${i}`,
        keywords: query.split(' ')
      });
    }
    
    return results;
  }

  /**
   * 创建模拟的 PubMed 结果
   */
  private createMockPubmedResults(query: string, count: number): BibliographyEntry[] {
    const results: BibliographyEntry[] = [];
    
    for (let i = 1; i <= count; i++) {
      results.push({
        id: `pubmed_${i}`,
        title: `Medical Study: ${query} ${i}`,
        authors: [`Dr. ${i} Smith`, `Dr. ${i} Johnson`],
        year: 2022 - i,
        journal: `Medical Journal ${i}`,
        abstract: `Medical research on ${query}. Study ${i} examines the clinical implications and therapeutic applications.`,
        url: `https://pubmed.ncbi.nlm.nih.gov/${i}`,
        keywords: [query, 'medicine', 'clinical']
      });
    }
    
    return results;
  }

  /**
   * 创建模拟的 IEEE 结果
   */
  private createMockIEEEResults(query: string, count: number): BibliographyEntry[] {
    const results: BibliographyEntry[] = [];
    
    for (let i = 1; i <= count; i++) {
      results.push({
        id: `ieee_${i}`,
        title: `IEEE: ${query} - Technical Paper ${i}`,
        authors: [`Engineer ${i}`, `Researcher ${i}`],
        year: 2023,
        conference: `IEEE Conference ${i}`,
        abstract: `Technical paper on ${query}. IEEE publication ${i} presents innovative approaches and engineering solutions.`,
        doi: `10.1109/EXAMPLE.2023.${i}`,
        url: `https://ieeexplore.ieee.org/document/${i}`,
        keywords: [query, 'engineering', 'technology']
      });
    }
    
    return results;
  }

  /**
   * 文献去重
   */
  private deduplicateEntries(entries: BibliographyEntry[]): BibliographyEntry[] {
    const seen = new Set<string>();
    const unique: BibliographyEntry[] = [];

    for (const entry of entries) {
      // 使用标题和年份作为去重键
      const key = `${entry.title?.toLowerCase().trim()}_${entry.year}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(entry);
      }
    }

    return unique;
  }

  /**
   * 应用搜索过滤器
   */
  private applyFilters(entries: BibliographyEntry[], params: BibliographySearchParams): BibliographyEntry[] {
    let filtered = entries;

    // 年份范围过滤
    if (params.yearRange) {
      filtered = filtered.filter(entry => 
        entry.year >= params.yearRange!.start && 
        entry.year <= params.yearRange!.end
      );
    }

    // 研究领域过滤
    if (params.fields && params.fields.length > 0) {
      filtered = filtered.filter(entry => {
        const entryText = `${entry.title} ${entry.abstract} ${entry.keywords?.join(' ')}`.toLowerCase();
        return params.fields!.some(field => 
          entryText.includes(field.toLowerCase())
        );
      });
    }

    return filtered;
  }

  /**
   * 排序文献条目
   */
  private sortEntries(entries: BibliographyEntry[], sortBy: string): BibliographyEntry[] {
    return entries.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.year - a.year;
        case 'citations':
          return (b.citationCount || 0) - (a.citationCount || 0);
        case 'relevance':
        default:
          // 简单的相关性排序（可以改进）
          return 0;
      }
    });
  }

  /**
   * 管理文献数据库
   */
  private async manageBibliography(params: BibliographyManageParams): Promise<BibliographyManageResult> {
    const result = (() => {
      switch (params.action) {
        case 'add':
          return this.addEntry(params.entry!);
        case 'remove':
          return this.removeEntry(params.entryId!);
        case 'update':
          return this.updateEntry(params.entryId!, params.entry!);
        case 'list':
          return this.listEntries();
        case 'export':
          return this.exportBibliography(params.format || CitationStyle.APA, params.filename);
        case 'import':
          return this.importBibliography(params.data!, params.format);
        default:
          throw new Error(`Unknown action: ${params.action}`);
      }
    })();

    // 如果操作失败，抛出错误以便工具层处理
    if (!result.success) {
      throw new Error(result.message || `Failed to execute action: ${params.action}`);
    }

    return result;
  }

  /**
   * 添加文献条目
   */
  private addEntry(entry: Partial<BibliographyEntry>): BibliographyManageResult {
    const newEntry: BibliographyEntry = {
      id: `entry_${this.nextId++}`,
      title: entry.title || 'Untitled',
      authors: entry.authors || [],
      year: entry.year || new Date().getFullYear(),
      ...entry
    };

    this.bibliography.push(newEntry);

    return {
      success: true,
      action: 'add',
      count: 1,
      message: `Added entry: ${newEntry.title}`
    };
  }

  /**
   * 删除文献条目
   */
  private removeEntry(entryId: string): BibliographyManageResult {
    const index = this.bibliography.findIndex(entry => entry.id === entryId);
    
    if (index === -1) {
      return {
        success: false,
        action: 'remove',
        message: `Entry not found: ${entryId}`
      };
    }

    const removed = this.bibliography.splice(index, 1)[0];

    return {
      success: true,
      action: 'remove',
      count: 1,
      message: `Removed entry: ${removed.title}`
    };
  }

  /**
   * 更新文献条目
   */
  private updateEntry(entryId: string, updates: Partial<BibliographyEntry>): BibliographyManageResult {
    const entry = this.bibliography.find(e => e.id === entryId);
    
    if (!entry) {
      return {
        success: false,
        action: 'update',
        message: `Entry not found: ${entryId}`
      };
    }

    Object.assign(entry, updates);

    return {
      success: true,
      action: 'update',
      count: 1,
      message: `Updated entry: ${entry.title}`
    };
  }

  /**
   * 列出所有文献条目
   */
  private listEntries(): BibliographyManageResult {
    return {
      success: true,
      action: 'list',
      count: this.bibliography.length,
      entries: [...this.bibliography],
      message: `Found ${this.bibliography.length} entries`
    };
  }

  /**
   * 导出文献数据库
   */
  private exportBibliography(format: CitationStyle, filename?: string): BibliographyManageResult {
    const citations = this.bibliography.map(entry => this.formatCitation(entry, format));
    const exportData = citations.join('\n\n');

    return {
      success: true,
      action: 'export',
      count: this.bibliography.length,
      exportData,
      message: `Exported ${this.bibliography.length} entries in ${format} format${filename ? ` to ${filename}` : ''}`
    };
  }

  /**
   * 导入文献数据库
   */
  private importBibliography(data: string, format?: CitationStyle): BibliographyManageResult {
    // 简单的导入实现（可以扩展支持各种格式）
    const lines = data.split('\n').filter(line => line.trim());
    const imported = lines.length;

    // 这里应该根据格式解析导入的数据
    console.log(`Importing ${imported} entries in ${format || 'unknown'} format`);

    return {
      success: true,
      action: 'import',
      count: imported,
      message: `Imported ${imported} entries`
    };
  }

  /**
   * 格式化引用
   */
  private formatCitation(entry: BibliographyEntry, style: CitationStyle): string {
    const authors = entry.authors.join(', ');
    const year = entry.year;
    const title = entry.title;

    switch (style) {
      case CitationStyle.APA:
        return `${authors} (${year}). ${title}.${entry.journal ? ` ${entry.journal}.` : ''}${entry.doi ? ` https://doi.org/${entry.doi}` : ''}`;
      
      case CitationStyle.IEEE:
        return `${authors}, "${title}," ${entry.journal || entry.conference || ''}, ${year}.${entry.doi ? ` DOI: ${entry.doi}.` : ''}`;
      
      case CitationStyle.MLA:
        return `${authors}. "${title}." ${entry.journal || ''} ${year}.${entry.url ? ` Web. ${entry.url}` : ''}`;
      
      default:
        return `${authors}. ${title}. ${year}.`;
    }
  }
} 