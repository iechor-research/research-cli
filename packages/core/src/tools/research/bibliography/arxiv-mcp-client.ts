/**
 * ArXiv MCP Client - Integration with arXiv MCP Server
 * Provides paper search, download, and content management capabilities
 */

import { ResearchTool, PaperMetadata, SearchOptions as BaseSearchOptions } from '../types.js';

export interface ArXivSearchOptions extends BaseSearchOptions {
  maxResults?: number;
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
}

export interface ArXivPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  categories: string[];
  publishedDate: string;
  updatedDate: string;
  pdfUrl: string;
  journalRef?: string;
  doi?: string;
  comments?: string;
}

export interface DownloadResult {
  paperId: string;
  status: 'success' | 'failed' | 'processing';
  filePath?: string;
  error?: string;
  conversionStatus?: 'pending' | 'completed' | 'failed';
  downloadedAt?: Date;
  fileSize?: number;
}

export interface CachedPaper {
  id: string;
  metadata: ArXivPaper;
  cachedAt: Date;
  lastAccessed: Date;
  filePath?: string;
  markdownPath?: string;
  accessCount: number;
}

export interface SyncResult {
  totalPapers: number;
  updated: number;
  added: number;
  failed: number;
  errors: string[];
}

export interface CitationNetwork {
  paperId: string;
  references: string[];
  citedBy: string[];
  relatedPapers: string[];
  coAuthors: string[];
}

export interface CacheExport {
  version: string;
  exportedAt: Date;
  papers: CachedPaper[];
  totalSize: number;
}

/**
 * ArXiv MCP Client for integrating with arXiv MCP server
 */
export class ArXivMCPClient {
  private mcpServerUrl: string;
  private isConnected: boolean = false;
  private cache: Map<string, CachedPaper> = new Map();
  private cacheDir: string;

  constructor(serverUrl: string = 'http://localhost:3000', cacheDir: string = '.arxiv-cache') {
    this.mcpServerUrl = serverUrl;
    this.cacheDir = cacheDir;
    this.initializeCache();
  }

  /**
   * Initialize local cache directory and load existing cache
   */
  private async initializeCache(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Create cache directory if it doesn't exist
      await fs.mkdir(this.cacheDir, { recursive: true });
      
      // Load existing cache metadata
      const cacheMetaFile = path.join(this.cacheDir, 'cache-metadata.json');
      try {
        const cacheData = await fs.readFile(cacheMetaFile, 'utf-8');
        const cachedPapers: CachedPaper[] = JSON.parse(cacheData);
        
        for (const paper of cachedPapers) {
          this.cache.set(paper.id, {
            ...paper,
            cachedAt: new Date(paper.cachedAt),
            lastAccessed: new Date(paper.lastAccessed)
          });
        }
      } catch (error) {
        // Cache file doesn't exist or is invalid, start fresh
        console.log('Starting with empty cache');
      }
    } catch (error) {
      console.error('Failed to initialize cache:', error);
    }
  }

  /**
   * Check connection to arXiv MCP server
   */
  async checkConnection(): Promise<boolean> {
    try {
      // In a real implementation, this would use the MCP protocol
      // For now, we'll simulate the connection check
      const response = await fetch(`${this.mcpServerUrl}/health`).catch(() => null);
      this.isConnected = response?.ok || false;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Search papers using arXiv MCP server
   */
  async searchPapers(query: string, options: ArXivSearchOptions = {}): Promise<ArXivPaper[]> {
    if (!this.isConnected && !(await this.checkConnection())) {
      throw new Error('ArXiv MCP server is not available');
    }

    try {
      // In a real implementation, this would use MCP protocol calls
      // For demonstration, we'll simulate the search with arXiv API
      const searchUrl = this.buildSearchUrl(query, options);
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const papers = await this.parseArXivResponse(xmlText);
      
      // Cache search results
      for (const paper of papers) {
        await this.updateCache(paper);
      }

      return papers;
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error(`Failed to search papers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download paper using MCP server
   */
  async downloadPaper(paperId: string): Promise<DownloadResult> {
    if (!this.isConnected && !(await this.checkConnection())) {
      throw new Error('ArXiv MCP server is not available');
    }

    try {
      // Check if already cached
      const cached = this.cache.get(paperId);
      if (cached?.filePath) {
        return {
          paperId,
          status: 'success',
          filePath: cached.filePath,
          conversionStatus: 'completed',
          downloadedAt: cached.cachedAt
        };
      }

      // In a real MCP implementation, this would call the download_paper function
      // For now, we'll simulate the download process
      const downloadUrl = `https://arxiv.org/pdf/${paperId}.pdf`;
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        return {
          paperId,
          status: 'failed',
          error: `Download failed: ${response.statusText}`
        };
      }

      // Save to cache directory
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const pdfPath = path.join(this.cacheDir, `${paperId}.pdf`);
      const arrayBuffer = await response.arrayBuffer();
      await fs.writeFile(pdfPath, Buffer.from(arrayBuffer));

      // Update cache
      const cachedPaper = this.cache.get(paperId);
      if (cachedPaper) {
        cachedPaper.filePath = pdfPath;
        cachedPaper.lastAccessed = new Date();
        await this.saveCacheMetadata();
      }

      return {
        paperId,
        status: 'success',
        filePath: pdfPath,
        conversionStatus: 'pending',
        downloadedAt: new Date(),
        fileSize: arrayBuffer.byteLength
      };
    } catch (error) {
      return {
        paperId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get paper metadata
   */
  async getPaperMetadata(paperId: string): Promise<PaperMetadata> {
    // Check cache first
    const cached = this.cache.get(paperId);
    if (cached) {
      cached.lastAccessed = new Date();
      cached.accessCount++;
      await this.saveCacheMetadata();
      
      return {
        id: cached.metadata.id,
        title: cached.metadata.title,
        authors: cached.metadata.authors,
        abstract: cached.metadata.abstract,
        publishedDate: cached.metadata.publishedDate,
        journal: cached.metadata.journalRef || 'arXiv',
        doi: cached.metadata.doi,
        keywords: cached.metadata.categories,
        url: `https://arxiv.org/abs/${paperId}`
      };
    }

    // Search for the paper if not cached
    const papers = await this.searchPapers(`id:${paperId}`, { maxResults: 1 });
    if (papers.length === 0) {
      throw new Error(`Paper ${paperId} not found`);
    }

    const paper = papers[0];
    return {
      id: paper.id,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      publishedDate: paper.publishedDate,
      journal: paper.journalRef || 'arXiv',
      doi: paper.doi,
      keywords: paper.categories,
      url: `https://arxiv.org/abs/${paperId}`
    };
  }

  /**
   * Read paper content in markdown format
   */
  async readPaper(paperId: string): Promise<string> {
    const cached = this.cache.get(paperId);
    
    // Check if markdown version exists
    if (cached?.markdownPath) {
      try {
        const fs = await import('fs/promises');
        const content = await fs.readFile(cached.markdownPath, 'utf-8');
        cached.lastAccessed = new Date();
        cached.accessCount++;
        await this.saveCacheMetadata();
        return content;
      } catch (error) {
        // Markdown file doesn't exist, continue to conversion
      }
    }

    // Download paper if not available
    if (!cached?.filePath) {
      const downloadResult = await this.downloadPaper(paperId);
      if (downloadResult.status !== 'success') {
        throw new Error(`Failed to download paper: ${downloadResult.error}`);
      }
    }

    // In a real MCP implementation, this would call the read_paper function
    // For now, we'll return a placeholder markdown content
    const metadata = await this.getPaperMetadata(paperId);
    const markdownContent = this.generateMarkdownContent(metadata);
    
    // Save markdown to cache
    if (cached) {
      const path = await import('path');
      const fs = await import('fs/promises');
      
      const markdownPath = path.join(this.cacheDir, `${paperId}.md`);
      await fs.writeFile(markdownPath, markdownContent, 'utf-8');
      
      cached.markdownPath = markdownPath;
      await this.saveCacheMetadata();
    }

    return markdownContent;
  }

  /**
   * List all cached papers
   */
  async listCachedPapers(): Promise<CachedPaper[]> {
    return Array.from(this.cache.values()).sort((a, b) => 
      b.lastAccessed.getTime() - a.lastAccessed.getTime()
    );
  }

  /**
   * Get cache statistics
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Clear cache based on criteria
   */
  async clearCache(olderThan?: Date): Promise<void> {
    const fs = await import('fs/promises');
    const cutoffDate = olderThan || new Date(0);
    const toDelete: string[] = [];

    for (const [paperId, cached] of this.cache.entries()) {
      if (cached.lastAccessed < cutoffDate) {
        toDelete.push(paperId);
        
        // Delete files
        if (cached.filePath) {
          try {
            await fs.unlink(cached.filePath);
          } catch (error) {
            console.warn(`Failed to delete PDF file: ${cached.filePath}`);
          }
        }
        if (cached.markdownPath) {
          try {
            await fs.unlink(cached.markdownPath);
          } catch (error) {
            console.warn(`Failed to delete markdown file: ${cached.markdownPath}`);
          }
        }
      }
    }

    // Remove from cache
    for (const paperId of toDelete) {
      this.cache.delete(paperId);
    }

    await this.saveCacheMetadata();
    console.log(`Cleared ${toDelete.length} papers from cache`);
  }

  /**
   * Export cache data
   */
  async exportCache(): Promise<CacheExport> {
    const papers = Array.from(this.cache.values());
    return {
      version: '1.0.0',
      exportedAt: new Date(),
      papers,
      totalSize: papers.length
    };
  }

  /**
   * Import cache data
   */
  async importCache(data: CacheExport): Promise<void> {
    for (const paper of data.papers) {
      this.cache.set(paper.id, {
        ...paper,
        cachedAt: new Date(paper.cachedAt),
        lastAccessed: new Date(paper.lastAccessed)
      });
    }
    await this.saveCacheMetadata();
  }

  // Helper methods

  private buildSearchUrl(query: string, options: ArXivSearchOptions): string {
    const baseUrl = 'http://export.arxiv.org/api/query';
    const params = new URLSearchParams();
    
    params.set('search_query', query);
    params.set('start', '0');
    params.set('max_results', (options.maxResults || 10).toString());
    
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'lastUpdatedDate':
          params.set('sortBy', 'lastUpdatedDate');
          break;
        case 'submittedDate':
          params.set('sortBy', 'submittedDate');
          break;
        default:
          params.set('sortBy', 'relevance');
      }
    }

    return `${baseUrl}?${params.toString()}`;
  }

  private async parseArXivResponse(xmlText: string): Promise<ArXivPaper[]> {
    // Simple XML parsing for arXiv API response
    // In a real implementation, you'd use a proper XML parser
    const papers: ArXivPaper[] = [];
    
    // Extract entries using regex (simplified)
    const entryRegex = /<entry>(.*?)<\/entry>/gs;
    const entries = xmlText.match(entryRegex) || [];

    for (const entry of entries) {
      try {
        const id = this.extractXmlValue(entry, 'id')?.replace('http://arxiv.org/abs/', '') || '';
        const title = this.extractXmlValue(entry, 'title')?.trim() || '';
        const abstract = this.extractXmlValue(entry, 'summary')?.trim() || '';
        const published = this.extractXmlValue(entry, 'published') || '';
        const updated = this.extractXmlValue(entry, 'updated') || '';
        
        // Extract authors
        const authorRegex = /<author><name>(.*?)<\/name><\/author>/g;
        const authors: string[] = [];
        let authorMatch;
        while ((authorMatch = authorRegex.exec(entry)) !== null) {
          authors.push(authorMatch[1]);
        }

        // Extract categories
        const categoryRegex = /<category term="([^"]+)"/g;
        const categories: string[] = [];
        let categoryMatch;
        while ((categoryMatch = categoryRegex.exec(entry)) !== null) {
          categories.push(categoryMatch[1]);
        }

        if (id && title) {
          papers.push({
            id,
            title,
            authors,
            abstract,
            categories,
            publishedDate: published,
            updatedDate: updated,
            pdfUrl: `https://arxiv.org/pdf/${id}.pdf`,
            journalRef: this.extractXmlValue(entry, 'arxiv:journal_ref'),
            doi: this.extractXmlValue(entry, 'arxiv:doi'),
            comments: this.extractXmlValue(entry, 'arxiv:comment')
          });
        }
      } catch (error) {
        console.warn('Failed to parse entry:', error);
      }
    }

    return papers;
  }

  private extractXmlValue(xml: string, tag: string): string | undefined {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's');
    const match = xml.match(regex);
    return match?.[1];
  }

  private async updateCache(paper: ArXivPaper): Promise<void> {
    const existing = this.cache.get(paper.id);
    const now = new Date();

    const cached: CachedPaper = {
      id: paper.id,
      metadata: paper,
      cachedAt: existing?.cachedAt || now,
      lastAccessed: now,
      filePath: existing?.filePath,
      markdownPath: existing?.markdownPath,
      accessCount: (existing?.accessCount || 0) + 1
    };

    this.cache.set(paper.id, cached);
    await this.saveCacheMetadata();
  }

  private async saveCacheMetadata(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const cacheMetaFile = path.join(this.cacheDir, 'cache-metadata.json');
      const cacheData = Array.from(this.cache.values());
      await fs.writeFile(cacheMetaFile, JSON.stringify(cacheData, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save cache metadata:', error);
    }
  }

  private generateMarkdownContent(metadata: PaperMetadata): string {
    return `# ${metadata.title}

## Authors
${metadata.authors.join(', ')}

## Abstract
${metadata.abstract}

## Metadata
- **Published:** ${metadata.publishedDate}
- **Journal:** ${metadata.journal}
- **DOI:** ${metadata.doi || 'N/A'}
- **URL:** ${metadata.url}
- **Keywords:** ${metadata.keywords?.join(', ') || 'N/A'}

---

*Note: This is a placeholder content. In a real implementation, the full paper content would be extracted and converted from PDF.*
`;
  }
} 