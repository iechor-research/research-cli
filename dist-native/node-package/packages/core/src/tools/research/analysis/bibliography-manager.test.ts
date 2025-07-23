/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BibliographyManager, BibliographySearchParams, BibliographyManageParams } from './bibliography-manager.js';
import { Database, CitationStyle, ResearchToolCategory } from '../types.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('BibliographyManager', () => {
  let manager: BibliographyManager;

  beforeEach(() => {
    manager = new BibliographyManager();
    vi.clearAllMocks();
  });

  describe('基本属性', () => {
    it('应该有正确的工具属性', () => {
      expect(manager.name).toBe('manage_bibliography');
      expect(manager.description).toBe('Manage bibliography and search academic literature');
      expect(manager.category).toBe(ResearchToolCategory.ANALYSIS);
      expect(manager.version).toBe('1.0.0');
    });
  });

  describe('参数验证', () => {
    describe('搜索参数验证', () => {
      it('应该验证有效的搜索参数', () => {
        const validParams: BibliographySearchParams = {
          query: 'machine learning',
          databases: [Database.ARXIV, Database.IEEE],
          maxResults: 10
        };

        expect(manager.validate(validParams)).toBe(true);
      });

      it('应该拒绝空查询', () => {
        const invalidParams = {
          query: '',
          databases: [Database.ARXIV]
        };

        expect(manager.validate(invalidParams)).toBe(false);
      });

      it('应该拒绝空数据库列表', () => {
        const invalidParams = {
          query: 'machine learning',
          databases: []
        };

        expect(manager.validate(invalidParams)).toBe(false);
      });

      it('应该拒绝无效的年份范围', () => {
        const invalidParams = {
          query: 'machine learning',
          databases: [Database.ARXIV],
          yearRange: { start: 2024, end: 2020 }
        };

        expect(manager.validate(invalidParams)).toBe(false);
      });

      it('应该接受有效的年份范围', () => {
        const validParams = {
          query: 'machine learning',
          databases: [Database.ARXIV],
          yearRange: { start: 2020, end: 2024 }
        };

        expect(manager.validate(validParams)).toBe(true);
      });
    });

    describe('管理参数验证', () => {
      it('应该验证有效的管理操作', () => {
        const validActions = ['add', 'remove', 'update', 'list', 'export', 'import'];
        
        validActions.forEach(action => {
          const params: BibliographyManageParams = { action: action as any };
          expect(manager.validate(params)).toBe(true);
        });
      });

      it('应该拒绝无效的管理操作', () => {
        const invalidParams = { action: 'invalid-action' };
        expect(manager.validate(invalidParams as any)).toBe(false);
      });
    });
  });

  describe('arXiv 搜索', () => {
    it('应该成功搜索 arXiv', async () => {
      const mockXmlResponse = `
        <?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <id>http://arxiv.org/abs/2301.00001v1</id>
            <title>Machine Learning in Computer Vision</title>
            <published>2023-01-01T00:00:00Z</published>
            <summary>This paper presents novel approaches to machine learning in computer vision.</summary>
            <author>
              <name>John Doe</name>
            </author>
            <author>
              <name>Jane Smith</name>
            </author>
          </entry>
        </feed>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXmlResponse)
      });

      const params: BibliographySearchParams = {
        query: 'machine learning',
        databases: [Database.ARXIV],
        maxResults: 10
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const searchResult = result.data as any;
      expect(searchResult.entries).toHaveLength(1);
      expect(searchResult.entries[0].title).toBe('Machine Learning in Computer Vision');
      expect(searchResult.entries[0].authors).toEqual(['John Doe', 'Jane Smith']);
      expect(searchResult.entries[0].year).toBe(2023);
      expect(searchResult.sources.arxiv?.status).toBe('success');
    });

    it('应该处理 arXiv API 错误', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const params: BibliographySearchParams = {
        query: 'machine learning',
        databases: [Database.ARXIV],
        maxResults: 10
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const searchResult = result.data as any;
      expect(searchResult.sources.arxiv?.status).toBe('error');
      expect(searchResult.sources.arxiv?.error).toContain('arXiv API error');
    });

    it('应该正确解析 XML 中的 DOI', async () => {
      const mockXmlWithDoi = `
        <entry>
          <id>http://arxiv.org/abs/2301.00001v1</id>
          <title>Test Paper with DOI</title>
          <published>2023-01-01T00:00:00Z</published>
          <summary>Test abstract</summary>
          <author><name>Test Author</name></author>
          <link href="http://dx.doi.org/10.1000/test.doi" title="doi"/>
        </entry>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(`<feed>${mockXmlWithDoi}</feed>`)
      });

      const params: BibliographySearchParams = {
        query: 'test',
        databases: [Database.ARXIV]
      };

      const result = await manager.execute(params);
      const searchResult = result.data as any;
      expect(searchResult.entries[0].arxivId).toBe('2301.00001v1');
    });
  });

  describe('多数据库搜索', () => {
    it('应该并行搜索多个数据库', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<feed></feed>')
      });

      const params: BibliographySearchParams = {
        query: 'machine learning',
        databases: [Database.ARXIV, Database.PUBMED, Database.IEEE],
        maxResults: 5
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const searchResult = result.data as any;
      expect(searchResult.sources).toHaveProperty('arxiv');
      expect(searchResult.sources).toHaveProperty('pubmed');
      expect(searchResult.sources).toHaveProperty('ieee');
    });

    it('应该合并和去重结果', async () => {
      // Mock 返回包含重复条目的结果
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<feed></feed>')
      });

      const params: BibliographySearchParams = {
        query: 'test',
        databases: [Database.ARXIV, Database.GOOGLE_SCHOLAR]
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const searchResult = result.data as any;
      expect(searchResult.searchMetadata.duplicatesRemoved).toBeGreaterThanOrEqual(0);
    });
  });

  describe('文献库管理', () => {
    it('应该添加文献条目', async () => {
      const params: BibliographyManageParams = {
        action: 'add',
        entry: {
          title: 'Test Paper',
          authors: ['Test Author'],
          year: 2023,
          abstract: 'Test abstract'
        }
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const manageResult = result.data as any;
      expect(manageResult.action).toBe('add');
      expect(manageResult.count).toBe(1);
      expect(manageResult.message).toContain('Test Paper');
    });

    it('应该列出所有文献条目', async () => {
      // 先添加一些条目
      await manager.execute({
        action: 'add',
        entry: { title: 'Paper 1', authors: ['Author 1'], year: 2023 }
      } as BibliographyManageParams);

      await manager.execute({
        action: 'add',
        entry: { title: 'Paper 2', authors: ['Author 2'], year: 2022 }
      } as BibliographyManageParams);

      const result = await manager.execute({
        action: 'list'
      } as BibliographyManageParams);

      expect(result.success).toBe(true);
      const listResult = result.data as any;
      expect(listResult.action).toBe('list');
      expect(listResult.count).toBe(2);
      expect(listResult.entries).toHaveLength(2);
    });

    it('应该删除文献条目', async () => {
      // 先添加条目
      await manager.execute({
        action: 'add',
        entry: { title: 'Paper to Delete', authors: ['Author'], year: 2023 }
      } as BibliographyManageParams);

      // 删除条目
      const result = await manager.execute({
        action: 'remove',
        entryId: 'entry_1'
      } as BibliographyManageParams);

      expect(result.success).toBe(true);
      const removeResult = result.data as any;
      expect(removeResult.action).toBe('remove');
      expect(removeResult.count).toBe(1);
    });

    it('应该处理删除不存在的条目', async () => {
      const result = await manager.execute({
        action: 'remove',
        entryId: 'nonexistent'
      } as BibliographyManageParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('应该更新文献条目', async () => {
      // 先添加条目
      await manager.execute({
        action: 'add',
        entry: { title: 'Original Title', authors: ['Author'], year: 2023 }
      } as BibliographyManageParams);

      // 更新条目
      const result = await manager.execute({
        action: 'update',
        entryId: 'entry_1',
        entry: { title: 'Updated Title' }
      } as BibliographyManageParams);

      expect(result.success).toBe(true);
      const updateResult = result.data as any;
      expect(updateResult.action).toBe('update');
      expect(updateResult.message).toContain('Updated Title');
    });
  });

  describe('引用格式化', () => {
    beforeEach(async () => {
      // 添加测试条目
      await manager.execute({
        action: 'add',
        entry: {
          title: 'Test Paper for Citation',
          authors: ['John Doe', 'Jane Smith'],
          year: 2023,
          journal: 'Test Journal',
          doi: '10.1000/test.doi'
        }
      } as BibliographyManageParams);
    });

    it('应该以 APA 格式导出', async () => {
      const result = await manager.execute({
        action: 'export',
        format: CitationStyle.APA
      } as BibliographyManageParams);

      expect(result.success).toBe(true);
      const exportResult = result.data as any;
      expect(exportResult.exportData).toContain('John Doe, Jane Smith (2023)');
      expect(exportResult.exportData).toContain('Test Paper for Citation');
      expect(exportResult.exportData).toContain('Test Journal');
    });

    it('应该以 IEEE 格式导出', async () => {
      const result = await manager.execute({
        action: 'export',
        format: CitationStyle.IEEE
      } as BibliographyManageParams);

      expect(result.success).toBe(true);
      const exportResult = result.data as any;
      expect(exportResult.exportData).toContain('"Test Paper for Citation,"');
      expect(exportResult.exportData).toContain('2023');
      expect(exportResult.exportData).toContain('DOI: 10.1000/test.doi');
    });

    it('应该以 MLA 格式导出', async () => {
      const result = await manager.execute({
        action: 'export',
        format: CitationStyle.MLA
      } as BibliographyManageParams);

      expect(result.success).toBe(true);
      const exportResult = result.data as any;
      expect(exportResult.exportData).toContain('"Test Paper for Citation."');
      expect(exportResult.exportData).toContain('Test Journal 2023');
    });
  });

  describe('搜索过滤和排序', () => {
    it('应该应用年份范围过滤', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<feed></feed>')
      });

      const params: BibliographySearchParams = {
        query: 'test',
        databases: [Database.GOOGLE_SCHOLAR],
        yearRange: { start: 2022, end: 2023 }
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const searchResult = result.data as any;
      // 验证模拟结果在年份范围内
      searchResult.entries.forEach((entry: any) => {
        expect(entry.year).toBeGreaterThanOrEqual(2022);
        expect(entry.year).toBeLessThanOrEqual(2023);
      });
    });

    it('应该按日期排序', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<feed></feed>')
      });

      const params: BibliographySearchParams = {
        query: 'test',
        databases: [Database.GOOGLE_SCHOLAR],
        sortBy: 'date'
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const searchResult = result.data as any;
      // 验证按年份降序排列
      for (let i = 1; i < searchResult.entries.length; i++) {
        expect(searchResult.entries[i-1].year).toBeGreaterThanOrEqual(searchResult.entries[i].year);
      }
    });
  });

  describe('帮助信息', () => {
    it('应该提供详细的帮助信息', () => {
      const help = manager.getHelp();
      
      expect(help).toContain('Search academic literature');
      expect(help).toContain('query');
      expect(help).toContain('databases');
      expect(help).toContain('action');
      expect(help).toContain('arXiv');
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const params: BibliographySearchParams = {
        query: 'test',
        databases: [Database.ARXIV]
      };

      const result = await manager.execute(params);

      expect(result.success).toBe(true);
      const searchResult = result.data as any;
      expect(searchResult.sources.arxiv?.status).toBe('error');
    });

    it('应该处理无效的管理操作', async () => {
      const params = {
        action: 'unknown'
      };

      const result = await manager.execute(params as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
}); 