/**
 * Enhanced Bibliography Manager with ArXiv MCP Integration
 * Extends the base BibliographyManager with advanced arXiv capabilities
 */

import { BaseResearchTool } from '../base-tool.js';
import { 
  ResearchToolParams, 
  ResearchToolResult, 
  PaperMetadata, 
  BibliographyEntry,
  CitationFormat,
  ResearchToolCategory
} from '../types.js';
import { ArXivMCPClient, ArXivSearchOptions, DownloadResult, SyncResult, CitationNetwork } from './arxiv-mcp-client.js';

export interface EnhancedBibliographyParams extends ResearchToolParams {
  operation: 'search' | 'download' | 'read' | 'cache' | 'sync' | 'network' | 'batch';
  query?: string;
  paperId?: string;
  paperIds?: string[];
  searchOptions?: ArXivSearchOptions;
  cacheOptions?: {
    olderThan?: string; // Date string
    export?: boolean;
    import?: boolean;
    data?: any;
  };
}

export interface EnhancedBibliographyResult extends ResearchToolResult {
  papers?: PaperMetadata[];
  downloadResult?: DownloadResult;
  downloadResults?: DownloadResult[];
  content?: string;
  cachedPapers?: any[];
  syncResult?: SyncResult;
  citationNetwork?: CitationNetwork;
  cacheSize?: number;
  exportData?: any;
}

/**
 * Enhanced Bibliography Manager with ArXiv MCP integration
 * Provides advanced paper search, download, and management capabilities
 */
export class EnhancedBibliographyManager extends BaseResearchTool {
  readonly name = 'enhanced_bibliography_manager';
  readonly description = 'Enhanced bibliography management with arXiv MCP integration for paper search, download, and content analysis';
  
  private arxivClient: ArXivMCPClient;
  private localBibliography: Map<string, BibliographyEntry> = new Map();

  constructor() {
    super(
      'enhanced_bibliography',
      'Enhanced bibliography management with arXiv integration',
      ResearchToolCategory.ANALYSIS,
      '1.0.0'
    );
    this.arxivClient = new ArXivMCPClient();
    this.initializeBibliography();
  }

  /**
   * Validate parameters
   */
  validate(params: EnhancedBibliographyParams): boolean {
    if (!params.operation) return false;
    
    switch (params.operation) {
      case 'search':
        return !!params.query;
      case 'download':
      case 'read':
      case 'network':
        return !!params.paperId;
      case 'batch':
        return !!(params.paperIds && params.paperIds.length > 0);
      case 'cache':
      case 'sync':
        return true;
      default:
        return false;
    }
  }

  /**
   * Get help information
   */
  getHelp(): string {
    return `Enhanced Bibliography Manager with ArXiv MCP Integration

Operations:
- search: Search for papers using query
- download: Download a specific paper by ID
- read: Read paper content in markdown format
- cache: Manage cache (list, export, import, clear)
- sync: Sync with arXiv for updates
- network: Analyze citation network
- batch: Batch download multiple papers

Examples:
- Search: { operation: "search", query: "machine learning" }
- Download: { operation: "download", paperId: "2301.00001" }
- Cache list: { operation: "cache" }
- Batch download: { operation: "batch", paperIds: ["2301.00001", "2301.00002"] }`;
  }

  /**
   * Internal implementation method
   */
  async executeImpl(params: EnhancedBibliographyParams): Promise<EnhancedBibliographyResult> {
    return this.execute(params);
  }

  /**
   * Get parameter schema for the tool
   */
  getParameterSchema(): any {
    return {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['search', 'download', 'read', 'cache', 'sync', 'network', 'batch'],
          description: 'Operation to perform'
        },
        query: {
          type: 'string',
          description: 'Search query for papers'
        },
        paperId: {
          type: 'string',
          description: 'ArXiv paper ID (e.g., 2301.00001)'
        },
        paperIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of paper IDs for batch operations'
        },
        searchOptions: {
          type: 'object',
          properties: {
            maxResults: { type: 'number', minimum: 1, maximum: 100 },
            categories: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'ArXiv categories to filter by'
            },
            dateFrom: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
            dateTo: { type: 'string', description: 'End date (YYYY-MM-DD)' },
            sortBy: {
              type: 'string',
              enum: ['relevance', 'lastUpdatedDate', 'submittedDate']
            }
          }
        },
        cacheOptions: {
          type: 'object',
          properties: {
            olderThan: { type: 'string', description: 'Clear cache older than this date' },
            export: { type: 'boolean', description: 'Export cache data' },
            import: { type: 'boolean', description: 'Import cache data' },
            data: { type: 'object', description: 'Cache data to import' }
          }
        }
      },
      required: ['operation']
    };
  }

  /**
   * Execute the bibliography management operation
   */
  async execute(params: EnhancedBibliographyParams): Promise<EnhancedBibliographyResult> {
    try {
      await this.validateParameters(params);

      switch (params.operation) {
        case 'search':
          return await this.searchPapers(params);
        
        case 'download':
          return await this.downloadPaper(params);
        
        case 'read':
          return await this.readPaper(params);
        
        case 'cache':
          return await this.manageCache(params);
        
        case 'sync':
          return await this.syncWithArXiv(params);
        
        case 'network':
          return await this.analyzeCitationNetwork(params);
        
        case 'batch':
          return await this.batchDownload(params);
        
        default:
          throw new Error(`Unknown operation: ${params.operation}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  /**
   * Search papers using enhanced arXiv capabilities
   */
  private async searchPapers(params: EnhancedBibliographyParams): Promise<EnhancedBibliographyResult> {
    if (!params.query) {
      throw new Error('Query is required for search operation');
    }

    const papers = await this.arxivClient.searchPapers(params.query, params.searchOptions);
    
    // Convert to PaperMetadata format
    const paperMetadata: PaperMetadata[] = papers.map((paper: any) => ({
      id: paper.id,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      publishedDate: paper.publishedDate,
      journal: paper.journalRef || 'arXiv',
      doi: paper.doi,
      keywords: paper.categories,
      url: `https://arxiv.org/abs/${paper.id}`
    }));

    // Add to local bibliography
    for (const metadata of paperMetadata) {
      await this.addToBibliography(metadata);
    }

    return {
      success: true,
      papers: paperMetadata,
      message: `Found ${papers.length} papers for query: "${params.query}"`,
      timestamp: new Date()
    };
  }

  /**
   * Download a specific paper
   */
  private async downloadPaper(params: EnhancedBibliographyParams): Promise<EnhancedBibliographyResult> {
    if (!params.paperId) {
      throw new Error('Paper ID is required for download operation');
    }

    const downloadResult = await this.arxivClient.downloadPaper(params.paperId);
    
    if (downloadResult.status === 'success') {
      // Update local bibliography with download info
      const metadata = await this.arxivClient.getPaperMetadata(params.paperId);
      await this.addToBibliography(metadata);
    }

    return {
      success: downloadResult.status === 'success',
      downloadResult,
      message: downloadResult.status === 'success' 
        ? `Successfully downloaded paper ${params.paperId}`
        : `Failed to download paper: ${downloadResult.error}`,
      timestamp: new Date()
    };
  }

  /**
   * Read paper content
   */
  private async readPaper(params: EnhancedBibliographyParams): Promise<EnhancedBibliographyResult> {
    if (!params.paperId) {
      throw new Error('Paper ID is required for read operation');
    }

    const content = await this.arxivClient.readPaper(params.paperId);

    return {
      success: true,
      content,
      message: `Successfully read paper ${params.paperId}`,
      timestamp: new Date()
    };
  }

  /**
   * Manage cache operations
   */
  private async manageCache(params: EnhancedBibliographyParams): Promise<EnhancedBibliographyResult> {
    const options = params.cacheOptions || {};

    if (options.export) {
      const exportData = await this.arxivClient.exportCache();
      return {
        success: true,
        exportData,
        message: `Exported ${exportData.totalSize} papers from cache`,
        timestamp: new Date()
      };
    }

    if (options.import && options.data) {
      await this.arxivClient.importCache(options.data);
      return {
        success: true,
        message: `Imported cache data`,
        timestamp: new Date()
      };
    }

    if (options.olderThan) {
      const cutoffDate = new Date(options.olderThan);
      await this.arxivClient.clearCache(cutoffDate);
      return {
        success: true,
        message: `Cleared cache entries older than ${options.olderThan}`,
        timestamp: new Date()
      };
    }

    // List cached papers
    const cachedPapers = await this.arxivClient.listCachedPapers();
    const cacheSize = this.arxivClient.getCacheSize();

    return {
      success: true,
      cachedPapers,
      cacheSize,
      message: `Cache contains ${cacheSize} papers`,
      timestamp: new Date()
    };
  }

  /**
   * Sync with arXiv for updates
   */
  private async syncWithArXiv(params: EnhancedBibliographyParams): Promise<EnhancedBibliographyResult> {
    // Get all papers in local bibliography
    const localPapers = Array.from(this.localBibliography.values());
    const syncResult: SyncResult = {
      totalPapers: localPapers.length,
      updated: 0,
      added: 0,
      failed: 0,
      errors: []
    };

    for (const entry of localPapers) {
      try {
        if (entry.source === 'arXiv' && entry.metadata?.id) {
          // Check for updates
          const updatedMetadata = await this.arxivClient.getPaperMetadata(entry.metadata.id);
          
          // Compare dates to see if there are updates
          if (updatedMetadata.publishedDate !== entry.metadata.publishedDate) {
            await this.addToBibliography(updatedMetadata);
            syncResult.updated++;
          }
        }
      } catch (error) {
        syncResult.failed++;
        syncResult.errors.push(`Failed to sync ${entry.metadata?.id || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: true,
      syncResult,
      message: `Sync completed: ${syncResult.updated} updated, ${syncResult.failed} failed`,
      timestamp: new Date()
    };
  }

  /**
   * Analyze citation network
   */
  private async analyzeCitationNetwork(params: EnhancedBibliographyParams): Promise<EnhancedBibliographyResult> {
    if (!params.paperId) {
      throw new Error('Paper ID is required for citation network analysis');
    }

    // In a real implementation, this would analyze citations
    // For now, we'll create a simplified network based on related papers
    const papers = await this.arxivClient.searchPapers(`id:${params.paperId}`, { maxResults: 1 });
    if (papers.length === 0) {
      throw new Error(`Paper ${params.paperId} not found`);
    }

    const paper = papers[0];
    
    // Find related papers based on categories and authors
    const relatedByCategory = await this.arxivClient.searchPapers(
      `cat:${paper.categories[0]}`, 
      { maxResults: 10 }
    );
    
    const relatedByAuthor = paper.authors.length > 0 
      ? await this.arxivClient.searchPapers(
          `au:"${paper.authors[0]}"`, 
          { maxResults: 10 }
        )
      : [];

    const citationNetwork: CitationNetwork = {
      paperId: params.paperId,
      references: [], // Would be extracted from paper content
      citedBy: [], // Would require citation database
      relatedPapers: relatedByCategory.map(p => p.id).filter(id => id !== params.paperId),
      coAuthors: relatedByAuthor.map(p => p.id).filter(id => id !== params.paperId)
    };

    return {
      success: true,
      citationNetwork,
      message: `Generated citation network for ${params.paperId}`,
      timestamp: new Date()
    };
  }

  /**
   * Batch download multiple papers
   */
  private async batchDownload(params: EnhancedBibliographyParams): Promise<EnhancedBibliographyResult> {
    if (!params.paperIds || params.paperIds.length === 0) {
      throw new Error('Paper IDs are required for batch download');
    }

    const downloadResults: DownloadResult[] = [];
    
    // Download papers in parallel (with reasonable concurrency)
    const concurrency = 3;
    for (let i = 0; i < params.paperIds.length; i += concurrency) {
      const batch = params.paperIds.slice(i, i + concurrency);
      const batchPromises = batch.map(paperId => this.arxivClient.downloadPaper(paperId));
      const batchResults = await Promise.all(batchPromises);
      downloadResults.push(...batchResults);
    }

    const successful = downloadResults.filter(r => r.status === 'success').length;
    const failed = downloadResults.filter(r => r.status === 'failed').length;

    return {
      success: successful > 0,
      downloadResults,
      message: `Batch download completed: ${successful} successful, ${failed} failed`,
      timestamp: new Date()
    };
  }

  /**
   * Add paper to local bibliography
   */
  private async addToBibliography(metadata: PaperMetadata): Promise<void> {
    const entry: BibliographyEntry = {
      id: metadata.id,
      title: metadata.title,
      authors: metadata.authors,
      year: new Date(metadata.publishedDate).getFullYear(),
      abstract: metadata.abstract,
      arxivId: metadata.id,
      url: metadata.url,
      keywords: metadata.keywords,
      metadata,
      source: 'arXiv',
      dateAdded: new Date(),
      tags: metadata.keywords || [],
      notes: '',
      citationFormats: {
        apa: this.formatCitation(metadata, 'apa'),
        mla: this.formatCitation(metadata, 'mla'),
        ieee: this.formatCitation(metadata, 'ieee')
      }
    };

    this.localBibliography.set(metadata.id, entry);
    await this.saveBibliography();
  }

  /**
   * Format citation in specified style
   */
  private formatCitation(metadata: PaperMetadata, format: CitationFormat): string {
    const authors = metadata.authors.join(', ');
    const year = new Date(metadata.publishedDate).getFullYear();
    
    switch (format) {
      case 'apa':
        return `${authors} (${year}). ${metadata.title}. arXiv preprint arXiv:${metadata.id}.`;
      
      case 'mla':
        return `${authors}. "${metadata.title}." arXiv preprint arXiv:${metadata.id} (${year}).`;
      
      case 'ieee':
        return `${authors}, "${metadata.title}," arXiv preprint arXiv:${metadata.id}, ${year}.`;
      
      default:
        return `${authors}. ${metadata.title}. arXiv:${metadata.id}, ${year}.`;
    }
  }

  /**
   * Initialize bibliography from storage
   */
  private async initializeBibliography(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const bibFile = path.join('.arxiv-cache', 'bibliography.json');
      const bibData = await fs.readFile(bibFile, 'utf-8');
      const entries: BibliographyEntry[] = JSON.parse(bibData);
      
      for (const entry of entries) {
        this.localBibliography.set(entry.id, {
          ...entry,
          dateAdded: new Date(entry.dateAdded)
        });
      }
    } catch (error) {
      // Bibliography file doesn't exist, start fresh
      console.log('Starting with empty bibliography');
    }
  }

  /**
   * Save bibliography to storage
   */
  private async saveBibliography(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      await fs.mkdir('.arxiv-cache', { recursive: true });
      const bibFile = path.join('.arxiv-cache', 'bibliography.json');
      const entries = Array.from(this.localBibliography.values());
      await fs.writeFile(bibFile, JSON.stringify(entries, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save bibliography:', error);
    }
  }

  /**
   * Validate parameters
   */
  private async validateParameters(params: EnhancedBibliographyParams): Promise<void> {
    if (!params.operation) {
      throw new Error('Operation is required');
    }

    switch (params.operation) {
      case 'search':
        if (!params.query) {
          throw new Error('Query is required for search operation');
        }
        break;
      
      case 'download':
      case 'read':
      case 'network':
        if (!params.paperId) {
          throw new Error(`Paper ID is required for ${params.operation} operation`);
        }
        break;
      
      case 'batch':
        if (!params.paperIds || params.paperIds.length === 0) {
          throw new Error('Paper IDs are required for batch operation');
        }
        break;
    }
  }
} 