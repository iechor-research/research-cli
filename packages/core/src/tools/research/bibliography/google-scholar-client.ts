/**
 * Google Scholar Client - Integration with Google Scholar via multiple APIs
 * Provides academic paper search capabilities using Google Scholar
 */

import { BibliographyEntry } from '../types.js';

export interface GoogleScholarSearchOptions {
  maxResults?: number;
  yearRange?: {
    start: number;
    end: number;
  };
  language?: string;
  sortBy?: 'relevance' | 'date';
  includePatents?: boolean;
  includeCitations?: boolean;
}

export interface GoogleScholarPaper {
  title: string;
  link?: string;
  snippet?: string;
  publication_info?: {
    summary?: string;
    authors?: Array<{ name: string; link?: string }>;
  };
  inline_links?: {
    cited_by?: {
      total: number;
      link: string;
    };
    versions?: {
      total: number;
      link: string;
    };
  };
  resources?: Array<{
    title: string;
    file_format?: string;
    link: string;
  }>;
  result_id?: string;
}

export interface GoogleCustomSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  htmlTitle: string;
  htmlSnippet: string;
  cacheId?: string;
  pagemap?: {
    cse_thumbnail?: Array<{
      src: string;
      width: string;
      height: string;
    }>;
    metatags?: Array<{
      [key: string]: string;
    }>;
  };
}

/**
 * Google Scholar Client for academic paper search
 */
export class GoogleScholarClient {
  private apiKey: string;
  private baseUrl: string = 'https://serpapi.com/search';
  private customSearchEngineId: string = '000000000000000000000:aaaaaaaaaaa'; // Default CSE ID for Google Scholar

  constructor(apiKey?: string) {
    this.apiKey =
      apiKey ||
      this.getConfiguredApiKey() ||
      process.env.SERPAPI_KEY ||
      process.env.GOOGLE_API_KEY ||
      '082111056d72a84aec957a8211707fdc072d2655d6df8050fc95a0ddb8f45497';
  }

  /**
   * Get API key from configuration file
   */
  private getConfiguredApiKey(): string | undefined {
    try {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');

      const configFile = path.join(
        os.homedir(),
        '.research-cli',
        'api-config.json',
      );

      if (fs.existsSync(configFile)) {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

        // 优先使用 SerpAPI key，然后是 Google API key
        return config.apis?.serpapi?.apiKey || config.apis?.google?.apiKey;
      }
    } catch (error) {
      // 静默失败，回退到环境变量
    }

    return undefined;
  }

  /**
   * Detect if the API key is a Google API key or SERPAPI key
   */
  private isGoogleApiKey(key: string): boolean {
    // Google API keys typically start with "AIza" and are 39 characters long
    return key.startsWith('AIza') && key.length === 39;
  }

  /**
   * Search using Google Custom Search API
   */
  private async searchWithGoogleCustomSearch(
    query: string,
    options: GoogleScholarSearchOptions = {},
  ): Promise<BibliographyEntry[]> {
    const searchParams = new URLSearchParams({
      key: this.apiKey,
      cx: this.customSearchEngineId,
      q: `site:scholar.google.com ${query}`,
      num: Math.min(options.maxResults || 10, 10).toString(), // Google CSE max is 10
      hl: options.language || 'en',
    });

    // Add date range if specified
    if (options.yearRange) {
      searchParams.append(
        'dateRestrict',
        `y${new Date().getFullYear() - options.yearRange.start}`,
      );
    }

    const url = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Google Custom Search API error: ${response.status} ${response.statusText}`,
        );
      }

      if (data.error) {
        throw new Error(
          `Google Custom Search API error: ${data.error.message}`,
        );
      }

      return this.parseGoogleCustomSearchResults(data.items || []);
    } catch (error) {
      console.error('Google Custom Search error:', error);
      throw new Error(
        `Failed to search Google Scholar via Custom Search: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Search using SERPAPI
   */
  private async searchWithSerpApi(
    query: string,
    options: GoogleScholarSearchOptions = {},
  ): Promise<BibliographyEntry[]> {
    const searchParams = new URLSearchParams({
      engine: 'google_scholar',
      q: query,
      api_key: this.apiKey,
      num: (options.maxResults || 20).toString(),
      hl: options.language || 'en',
    });

    // Add year range filter
    if (options.yearRange) {
      searchParams.append('as_ylo', options.yearRange.start.toString());
      searchParams.append('as_yhi', options.yearRange.end.toString());
    }

    // Add sort parameter
    if (options.sortBy === 'date') {
      searchParams.append('scisbd', '1');
    }

    // Add filters
    if (options.includePatents === false) {
      searchParams.append('as_sdt', '0');
    }

    if (options.includeCitations === false) {
      searchParams.append('as_vis', '1');
    }

    const url = `${this.baseUrl}?${searchParams.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `SERPAPI error: ${response.status} ${response.statusText}`,
        );
      }

      if (data.error) {
        throw new Error(`SERPAPI error: ${data.error}`);
      }

      return this.parseSerpApiResults(data.organic_results || []);
    } catch (error) {
      console.error('SERPAPI search error:', error);
      throw new Error(
        `Failed to search Google Scholar via SERPAPI: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Search Google Scholar for academic papers
   */
  async searchPapers(
    query: string,
    options: GoogleScholarSearchOptions = {},
  ): Promise<BibliographyEntry[]> {
    if (!this.apiKey) {
      throw new Error('API key is required for Google Scholar search');
    }

    try {
      // Determine which API to use based on the key format
      if (this.isGoogleApiKey(this.apiKey)) {
        return await this.searchWithGoogleCustomSearch(query, options);
      } else {
        return await this.searchWithSerpApi(query, options);
      }
    } catch (error) {
      console.error('Google Scholar search error:', error);
      throw new Error(
        `Failed to search Google Scholar: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Parse Google Custom Search results into BibliographyEntry format
   */
  private parseGoogleCustomSearchResults(
    results: GoogleCustomSearchResult[],
  ): BibliographyEntry[] {
    return results.map((result, index) => {
      // Extract author and year from snippet or title
      const authorYearMatch = result.snippet.match(
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*-\s*(\d{4})/,
      );
      const authors = authorYearMatch
        ? [authorYearMatch[1]]
        : ['Unknown Author'];
      const year = authorYearMatch
        ? parseInt(authorYearMatch[2])
        : new Date().getFullYear();

      const entry: BibliographyEntry = {
        id: `google_scholar_${index}`,
        title: result.title.replace(/<[^>]*>/g, ''), // Remove HTML tags
        authors,
        year,
        abstract: result.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
        url: result.link,
        source: 'Google Scholar',
        citationCount: 0, // Not available in Custom Search
        dateAdded: new Date(),
        tags: [],
        notes: JSON.stringify({
          displayLink: result.displayLink,
          formattedUrl: result.formattedUrl,
          searchEngine: 'Google Custom Search',
        }),
        citationFormats: {
          apa: '',
          mla: '',
          ieee: '',
        },
        metadata: {
          id: `google_scholar_${index}`,
          title: result.title.replace(/<[^>]*>/g, ''),
          authors,
          abstract: result.snippet.replace(/<[^>]*>/g, ''),
          publishedDate: `${year}-01-01`,
          keywords: [],
          url: result.link,
        },
      };

      // Generate citation formats
      entry.citationFormats.apa = this.generateCitation(entry, 'APA');
      entry.citationFormats.mla = this.generateCitation(entry, 'MLA');
      entry.citationFormats.ieee = this.generateCitation(entry, 'IEEE');

      return entry;
    });
  }

  /**
   * Parse SERPAPI results into BibliographyEntry format
   */
  private parseSerpApiResults(
    results: GoogleScholarPaper[],
  ): BibliographyEntry[] {
    return results.map((result, index) => {
      // Extract authors from publication info
      const authors =
        result.publication_info?.authors?.map((author) => author.name) ||
        this.extractAuthorsFromSummary(result.publication_info?.summary || '');

      // Extract year from publication info
      const year = this.extractYearFromSummary(
        result.publication_info?.summary || '',
      );

      // Extract citation count
      const citationCount = result.inline_links?.cited_by?.total || 0;

      const entry: BibliographyEntry = {
        id: result.result_id || `serpapi_${index}`,
        title: result.title,
        authors,
        year,
        abstract: result.snippet || '',
        url: result.link,
        source: 'Google Scholar',
        citationCount,
        dateAdded: new Date(),
        tags: [],
        notes: JSON.stringify({
          publicationInfo: result.publication_info?.summary,
          resources: result.resources,
          versionsCount: result.inline_links?.versions?.total,
          searchEngine: 'SERPAPI',
        }),
        citationFormats: {
          apa: '',
          mla: '',
          ieee: '',
        },
        metadata: {
          id: result.result_id || `serpapi_${index}`,
          title: result.title,
          authors,
          abstract: result.snippet || '',
          publishedDate: `${year}-01-01`,
          keywords: [],
          url: result.link,
        },
      };

      // Generate citation formats
      entry.citationFormats.apa = this.generateCitation(entry, 'APA');
      entry.citationFormats.mla = this.generateCitation(entry, 'MLA');
      entry.citationFormats.ieee = this.generateCitation(entry, 'IEEE');

      return entry;
    });
  }

  /**
   * Extract authors from publication summary string
   */
  private extractAuthorsFromSummary(summary: string): string[] {
    const authorMatch = summary.match(/^([^-]+)-/);
    if (authorMatch) {
      return authorMatch[1].split(',').map((author) => author.trim());
    }
    return ['Unknown Author'];
  }

  /**
   * Extract year from publication summary string
   */
  private extractYearFromSummary(summary: string): number {
    const yearMatch = summary.match(/(\d{4})/);
    return yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  }

  /**
   * Generate citation in various formats
   */
  generateCitation(
    entry: BibliographyEntry,
    format: 'APA' | 'MLA' | 'IEEE' = 'APA',
  ): string {
    const authorsStr = entry.authors.join(', ');
    const title = entry.title;
    const year = entry.year;
    const url = entry.url;

    switch (format) {
      case 'APA':
        return `${authorsStr} (${year}). ${title}. Retrieved from ${url}`;

      case 'MLA':
        return `${authorsStr}. "${title}." Web. ${new Date().toLocaleDateString()}.`;

      case 'IEEE':
        return `${authorsStr}, "${title}," [Online]. Available: ${url}. [Accessed: ${new Date().toLocaleDateString()}].`;

      default:
        return `${authorsStr} (${year}). ${title}. ${url}`;
    }
  }

  /**
   * Get paper details by ID (for SERPAPI results)
   */
  async getPaperDetails(resultId: string): Promise<any> {
    if (!this.isGoogleApiKey(this.apiKey)) {
      const url = `https://serpapi.com/search?engine=google_scholar_cite&q=${resultId}&api_key=${this.apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            `SERPAPI error: ${response.status} ${response.statusText}`,
          );
        }

        return data;
      } catch (error) {
        console.error('Failed to get paper details:', error);
        return null;
      }
    }

    return null;
  }
}
