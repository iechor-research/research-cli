/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArXivMCPClient, ArXivPaper, CachedPaper } from './arxiv-mcp-client.js';

// Mock the file system operations
vi.mock('fs/promises', () => ({
  mkdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('ArXivMCPClient', () => {
  let client: ArXivMCPClient;

  beforeEach(() => {
    client = new ArXivMCPClient();
    vi.clearAllMocks();

    // Setup default fetch mock to simulate successful MCP server connection
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
      text: vi.fn().mockResolvedValue('mock response'),
    });
  });

  describe('Connection Management', () => {
    it('should check connection status', async () => {
      // Mock successful connection
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      const isConnected = await client.checkConnection();
      expect(isConnected).toBe(true);
    });

    it('should handle connection failure', async () => {
      // Mock connection failure
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const isConnected = await client.checkConnection();
      expect(isConnected).toBe(false);
    });
  });

  describe('Paper Search', () => {
    it('should search papers successfully', async () => {
      const mockArXivResponse = `
        <feed>
          <entry>
            <id>http://arxiv.org/abs/2301.00001</id>
            <title>Test Paper Title</title>
            <summary>Test abstract content</summary>
            <published>2023-01-01T00:00:00Z</published>
            <updated>2023-01-01T00:00:00Z</updated>
            <author><name>Test Author</name></author>
            <category term="cs.AI"/>
          </entry>
        </feed>
      `;

      // Mock fetch responses
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true }) // Connection check
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockArXivResponse),
        }); // Search request

      const papers = await client.searchPapers('machine learning');

      expect(papers).toHaveLength(1);
      expect(papers[0]).toMatchObject({
        id: '2301.00001',
        title: 'Test Paper Title',
        authors: ['Test Author'],
        categories: ['cs.AI'],
      });
    });

    it('should handle search with options', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('<feed></feed>'),
        });

      const options = {
        maxResults: 5,
        categories: ['cs.AI'],
        sortBy: 'lastUpdatedDate' as const,
      };

      await client.searchPapers('test query', options);

      // Verify the search URL was constructed with options
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('max_results=5'),
      );
    });

    it('should throw error when not connected', async () => {
      (global.fetch as any).mockResolvedValueOnce({ ok: false });

      await expect(client.searchPapers('test')).rejects.toThrow(
        'ArXiv MCP server is not available',
      );
    });
  });

  describe('Paper Download', () => {
    it('should download paper successfully', async () => {
      // Mock successful download
      const mockPdfData = new ArrayBuffer(1024);

      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true }) // Connection check
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(mockPdfData),
        }); // Download request

      const result = await client.downloadPaper('2301.00001');

      expect(result.status).toBe('success');
      expect(result.paperId).toBe('2301.00001');
      expect(result.fileSize).toBe(1024);
    });

    it('should handle download failure', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

      const result = await client.downloadPaper('invalid-id');

      expect(result.status).toBe('failed');
      expect(result.error).toContain('Not Found');
    });

    it('should return cached paper if already downloaded', async () => {
      // First, simulate a cached paper
      const cachedPaper = {
        id: '2301.00001',
        metadata: {} as any,
        cachedAt: new Date(),
        lastAccessed: new Date(),
        filePath: '/path/to/cached.pdf',
        accessCount: 1,
      };

      // Mock the cache to contain our paper
      client['cache'].set('2301.00001', cachedPaper);

      const result = await client.downloadPaper('2301.00001');

      expect(result.status).toBe('success');
      expect(result.filePath).toBe('/path/to/cached.pdf');
    });
  });

  describe('Paper Reading', () => {
    it('should read paper content', async () => {
      // Mock fs operations
      const fs = await import('fs/promises');
      (fs.writeFile as any).mockResolvedValue(undefined);

      // Pre-populate cache to avoid searchPapers call
      const mockPaper: ArXivPaper = {
        id: '2301.00001',
        title: 'Test Paper',
        authors: ['Test Author'],
        abstract: 'Test abstract',
        categories: ['cs.AI'],
        publishedDate: '2023-01-01T00:00:00Z',
        updatedDate: '2023-01-01T00:00:00Z',
        pdfUrl: 'https://arxiv.org/pdf/2301.00001.pdf',
      };

      const cachedPaper: CachedPaper = {
        id: '2301.00001',
        metadata: mockPaper,
        cachedAt: new Date(),
        lastAccessed: new Date(),
        filePath: '/test/path/2301.00001.pdf',
        accessCount: 0,
      };

      // Set cache directly
      client['cache'].set('2301.00001', cachedPaper);

      // Mock getting metadata first - fix XML structure
      const mockArXivResponse = `
        <feed>
          <entry>
            <id>http://arxiv.org/abs/2301.00001</id>
            <title>Test Paper</title>
            <summary>Test abstract</summary>
            <published>2023-01-01T00:00:00Z</published>
            <updated>2023-01-01T00:00:00Z</updated>
            <author><n>Test Author</n></author>
          </entry>
        </feed>
      `;

      // Mock fetch calls: PDF download, then metadata search
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(mockArXivResponse),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
        });

      const content = await client.readPaper('2301.00001');

      expect(content).toContain('# Test Paper');
      expect(content).toContain('## Authors');
      expect(content).toContain('Test Author');
      expect(content).toContain('## Abstract');
      expect(content).toContain('Test abstract');
    });

    it('should return cached markdown if available', async () => {
      const mockMarkdown = '# Cached Paper Content';
      const fs = await import('fs/promises');

      (fs.readFile as any).mockResolvedValue(mockMarkdown);

      // Set up cached paper with markdown path
      const cachedPaper = {
        id: '2301.00001',
        metadata: {} as any,
        cachedAt: new Date(),
        lastAccessed: new Date(),
        markdownPath: '/path/to/cached.md',
        accessCount: 1,
      };

      client['cache'].set('2301.00001', cachedPaper);

      const content = await client.readPaper('2301.00001');

      expect(content).toBe(mockMarkdown);
      expect(fs.readFile).toHaveBeenCalledWith('/path/to/cached.md', 'utf-8');
    });
  });

  describe('Cache Management', () => {
    it('should list cached papers', async () => {
      const cachedPaper = {
        id: '2301.00001',
        metadata: { title: 'Test Paper' } as any,
        cachedAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 1,
      };

      client['cache'].set('2301.00001', cachedPaper);

      const papers = await client.listCachedPapers();

      expect(papers).toHaveLength(1);
      expect(papers[0].id).toBe('2301.00001');
    });

    it('should clear cache by date', async () => {
      const oldDate = new Date('2022-01-01');
      const newDate = new Date();

      const oldPaper = {
        id: 'old-paper',
        metadata: {} as any,
        cachedAt: oldDate,
        lastAccessed: oldDate,
        accessCount: 1,
      };

      const newPaper = {
        id: 'new-paper',
        metadata: {} as any,
        cachedAt: newDate,
        lastAccessed: newDate,
        accessCount: 1,
      };

      client['cache'].set('old-paper', oldPaper);
      client['cache'].set('new-paper', newPaper);

      const cutoffDate = new Date('2023-01-01');
      await client.clearCache(cutoffDate);

      expect(client['cache'].has('old-paper')).toBe(false);
      expect(client['cache'].has('new-paper')).toBe(true);
    });

    it('should export cache data', async () => {
      const cachedPaper = {
        id: '2301.00001',
        metadata: {} as any,
        cachedAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 1,
      };

      client['cache'].set('2301.00001', cachedPaper);

      const exportData = await client.exportCache();

      expect(exportData.version).toBe('1.0.0');
      expect(exportData.totalSize).toBe(1);
      expect(exportData.papers).toHaveLength(1);
    });

    it('should import cache data', async () => {
      const importData = {
        version: '1.0.0',
        exportedAt: new Date(),
        papers: [
          {
            id: 'imported-paper',
            metadata: {} as any,
            cachedAt: new Date(),
            lastAccessed: new Date(),
            accessCount: 1,
          },
        ],
        totalSize: 1,
      };

      await client.importCache(importData);

      expect(client['cache'].has('imported-paper')).toBe(true);
    });
  });

  describe('Cache Size', () => {
    it('should return correct cache size', () => {
      expect(client.getCacheSize()).toBe(0);

      client['cache'].set('paper1', {} as any);
      client['cache'].set('paper2', {} as any);

      expect(client.getCacheSize()).toBe(2);
    });
  });
});
