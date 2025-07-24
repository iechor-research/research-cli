/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  JournalMatcher,
  JournalMatcherParams,
  JournalMatcherResult,
} from './journal-matcher.js';
import { ResearchField, CitationStyle } from '../types.js';

describe('JournalMatcher', () => {
  let journalMatcher: JournalMatcher;

  beforeEach(() => {
    journalMatcher = new JournalMatcher();
  });

  describe('Basic Properties', () => {
    it('should have correct tool name', () => {
      expect(journalMatcher.name).toBe('match_journal');
    });

    it('should have correct description', () => {
      expect(journalMatcher.description).toContain('智能期刊匹配器');
    });

    it('should provide detailed help', () => {
      const help = journalMatcher.getHelp();
      expect(help).toContain('期刊匹配器');
      expect(help).toContain('action');
    });
  });

  describe('Parameter Validation', () => {
    it('should validate match action with paper info', () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Deep Learning for Computer Vision',
        abstract: 'This paper presents...',
        keywords: ['deep learning', 'computer vision', 'neural networks'],
        researchField: ResearchField.COMPUTER_SCIENCE,
      };

      expect(journalMatcher.validate(params)).toBe(true);
    });

    it('should validate match action with keywords', () => {
      const params: JournalMatcherParams = {
        action: 'match',
        keywords: ['machine learning', 'artificial intelligence'],
      };

      expect(journalMatcher.validate(params)).toBe(true);
    });

    it('should validate search action without specific params', () => {
      const params: JournalMatcherParams = {
        action: 'search',
        researchField: ResearchField.COMPUTER_SCIENCE,
      };

      expect(journalMatcher.validate(params)).toBe(true);
    });

    it('should validate compare action with journal names', () => {
      const params: JournalMatcherParams = {
        action: 'compare',
        journalNames: ['Nature', 'Science'],
      };

      expect(journalMatcher.validate(params)).toBe(true);
    });

    it('should fail validation for match without paper info', () => {
      const params: JournalMatcherParams = {
        action: 'match',
      };

      expect(journalMatcher.validate(params)).toBe(false);
    });

    it('should fail validation for compare without journals', () => {
      const params: JournalMatcherParams = {
        action: 'compare',
      };

      expect(journalMatcher.validate(params)).toBe(false);
    });

    it('should fail validation without action', () => {
      const params = {} as JournalMatcherParams;

      expect(journalMatcher.validate(params)).toBe(false);
    });
  });

  describe('Journal Matching', () => {
    it('should match journals based on title and keywords', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Deep Learning Applications in Computer Vision',
        keywords: ['deep learning', 'computer vision', 'neural networks'],
        researchField: ResearchField.COMPUTER_SCIENCE,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      expect(data.action).toBe('match');
      expect(data.matches).toBeDefined();
      expect(data.matches!.length).toBeGreaterThan(0);
    });

    it('should provide detailed match scores', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Machine Learning in Healthcare',
        abstract:
          'This study explores the application of machine learning techniques in healthcare diagnosis.',
        keywords: ['machine learning', 'healthcare', 'diagnosis'],
        researchField: ResearchField.COMPUTER_SCIENCE,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      const firstMatch = data.matches![0];

      expect(firstMatch.matchScore).toBeGreaterThan(0);
      expect(firstMatch.scores).toBeDefined();
      expect(firstMatch.scores.titleMatch).toBeGreaterThanOrEqual(0);
      expect(firstMatch.scores.abstractMatch).toBeGreaterThanOrEqual(0);
      expect(firstMatch.scores.keywordMatch).toBeGreaterThanOrEqual(0);
      expect(firstMatch.scores.fieldMatch).toBeGreaterThanOrEqual(0);
      expect(firstMatch.matchReasons.length).toBeGreaterThan(0);
    });

    it('should filter by impact factor range', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'High Impact Research',
        keywords: ['research', 'innovation'],
        impactFactorRange: {
          min: 10.0,
        },
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;

      for (const match of data.matches!) {
        if (match.journal.impactFactor) {
          expect(match.journal.impactFactor).toBeGreaterThanOrEqual(10.0);
        }
      }
    });

    it('should filter by quartile', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Quality Research',
        keywords: ['research'],
        quartile: ['Q1'],
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;

      for (const match of data.matches!) {
        expect(match.journal.quartile).toBe('Q1');
      }
    });

    it('should filter by open access requirement', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Open Science Research',
        keywords: ['research'],
        openAccess: true,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;

      for (const match of data.matches!) {
        expect(match.journal.openAccess || match.journal.hybridOA).toBe(true);
      }
    });
  });

  describe('Journal Search', () => {
    it('should search journals by research field', async () => {
      const params: JournalMatcherParams = {
        action: 'search',
        researchField: ResearchField.COMPUTER_SCIENCE,
        maxResults: 10,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      expect(data.action).toBe('search');
      expect(data.journals).toBeDefined();
      expect(data.journals!.length).toBeGreaterThan(0);
      expect(data.journals!.length).toBeLessThanOrEqual(10);
    });

    it('should sort search results by impact factor', async () => {
      const params: JournalMatcherParams = {
        action: 'search',
        researchField: ResearchField.COMPUTER_SCIENCE,
        sortBy: 'impact_factor',
        sortOrder: 'desc',
        maxResults: 5,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      const journals = data.journals!;

      // Check descending order of impact factors
      for (let i = 1; i < journals.length; i++) {
        const prevIF = journals[i - 1].impactFactor || 0;
        const currentIF = journals[i].impactFactor || 0;
        expect(prevIF).toBeGreaterThanOrEqual(currentIF);
      }
    });

    it('should search open access journals', async () => {
      const params: JournalMatcherParams = {
        action: 'search',
        openAccess: true,
        maxResults: 5,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;

      // 数据库中只有PLOS ONE是开放获取的，应该包含开放获取期刊
      expect(data.journals!.length).toBeGreaterThan(0);

      for (const journal of data.journals!) {
        expect(journal.openAccess || journal.hybridOA).toBe(true);
      }
    });
  });

  describe('Journal Comparison', () => {
    it('should compare journals by name', async () => {
      const params: JournalMatcherParams = {
        action: 'compare',
        journalNames: [
          'IEEE Transactions on Pattern Analysis and Machine Intelligence',
          'ACM Computing Surveys',
        ],
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      expect(data.action).toBe('compare');
      expect(data.comparison).toBeDefined();
      expect(data.comparison!.journals.length).toBe(2);
    });

    it('should find similarities between journals', async () => {
      const params: JournalMatcherParams = {
        action: 'compare',
        journalNames: ['IEEE Transactions on Pattern Analysis', 'IEEE TPAMI'], // 使用同一期刊的名称和缩写
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      const similarities = data.comparison!.similarities;

      // 应该找到期刊相似性
      expect(similarities.length).toBeGreaterThan(0);
    });

    it('should handle insufficient journals for comparison', async () => {
      const params: JournalMatcherParams = {
        action: 'compare',
        journalNames: ['Nature'],
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'At least 2 journals are required for comparison',
      );
    });
  });

  describe('Journal Analysis', () => {
    it('should analyze journal distribution by field', async () => {
      const params: JournalMatcherParams = {
        action: 'analyze',
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      expect(data.action).toBe('analyze');
      expect(data.analysis).toBeDefined();
      expect(data.analysis!.fieldDistribution).toBeDefined();
    });

    it('should provide impact factor statistics', async () => {
      const params: JournalMatcherParams = {
        action: 'analyze',
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      const stats = data.analysis!.impactFactorStats;

      expect(stats.mean).toBeGreaterThan(0);
      expect(stats.median).toBeGreaterThan(0);
      expect(stats.min).toBeGreaterThanOrEqual(0);
      expect(stats.max).toBeGreaterThan(stats.min);
    });

    it('should analyze publisher distribution', async () => {
      const params: JournalMatcherParams = {
        action: 'analyze',
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      const publisherStats = data.analysis!.publisherStats;

      expect(Object.keys(publisherStats).length).toBeGreaterThan(0);
      expect(publisherStats['IEEE']).toBeGreaterThan(0);
    });
  });

  describe('Advanced Filtering', () => {
    it('should filter by multiple criteria', async () => {
      const params: JournalMatcherParams = {
        action: 'search',
        researchField: ResearchField.COMPUTER_SCIENCE,
        quartile: ['Q1', 'Q2'],
        openAccess: false, // Allow any access type
        publisher: ['IEEE', 'ACM'],
        maxResults: 10,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;

      for (const journal of data.journals!) {
        expect(journal.researchFields).toContain(
          ResearchField.COMPUTER_SCIENCE,
        );
        expect(['Q1', 'Q2']).toContain(journal.quartile);
        expect(['IEEE', 'ACM']).toContain(journal.publisher);
      }
    });

    it('should handle empty filter results', async () => {
      const params: JournalMatcherParams = {
        action: 'search',
        researchField: ResearchField.COMPUTER_SCIENCE,
        publisher: ['NonExistentPublisher'],
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      expect(data.journals!.length).toBe(0);
    });
  });

  describe('Recommendation Generation', () => {
    it('should provide match recommendations', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Machine Learning Applications',
        keywords: ['machine learning', 'applications'],
        researchField: ResearchField.COMPUTER_SCIENCE,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      const firstMatch = data.matches![0];

      expect(firstMatch.recommendations.length).toBeGreaterThan(0);
      expect(firstMatch.matchReasons.length).toBeGreaterThan(0);
    });

    it('should identify concerns for mismatched papers', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Biology Research',
        keywords: ['biology', 'genetics'],
        researchField: ResearchField.BIOLOGY,
        openAccess: true,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;

      // Find a non-open access journal in results
      const nonOAMatch = data.matches!.find(
        (match: any) => !match.journal.openAccess && !match.journal.hybridOA,
      );

      if (nonOAMatch) {
        expect(nonOAMatch.concerns.length).toBeGreaterThan(0);
        expect(
          nonOAMatch.concerns.some(
            (concern: any) =>
              concern.includes('开放获取') || concern.includes('open access'),
          ),
        ).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unknown action', async () => {
      const params = {
        action: 'unknown_action',
      } as any;

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown action');
    });

    it('should handle missing journal data gracefully', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Test Paper',
        keywords: ['test'],
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      expect(data.matches).toBeDefined();
      expect(data.matches!.length).toBeGreaterThan(0);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate meaningful match scores', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Artificial Intelligence in Software Engineering',
        abstract:
          'This paper explores AI applications in software development.',
        keywords: [
          'artificial intelligence',
          'software engineering',
          'machine learning',
        ],
        researchField: ResearchField.COMPUTER_SCIENCE,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      const match = data.matches![0];

      // All scores should be between 0 and 1
      expect(match.matchScore).toBeGreaterThanOrEqual(0);
      expect(match.matchScore).toBeLessThanOrEqual(1);
      expect(match.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(match.relevanceScore).toBeLessThanOrEqual(1);
      expect(match.qualityScore).toBeGreaterThanOrEqual(0);
      expect(match.qualityScore).toBeLessThanOrEqual(1);
      expect(match.feasibilityScore).toBeGreaterThanOrEqual(0);
      expect(match.feasibilityScore).toBeLessThanOrEqual(1);
    });

    it('should score computer science papers higher for CS journals', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Computer Science Research',
        keywords: ['computer science', 'algorithms'],
        researchField: ResearchField.COMPUTER_SCIENCE,
        maxResults: 10,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;

      // Find a computer science journal
      const csMatch = data.matches!.find((match: any) =>
        match.journal.researchFields.includes(ResearchField.COMPUTER_SCIENCE),
      );

      expect(csMatch).toBeDefined();
      expect(csMatch!.scores.fieldMatch).toBeGreaterThan(0.5);
    });
  });

  describe('Performance and Limits', () => {
    it('should respect maxResults parameter', async () => {
      const maxResults = 3;
      const params: JournalMatcherParams = {
        action: 'search',
        researchField: ResearchField.COMPUTER_SCIENCE,
        maxResults,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      expect(data.journals!.length).toBeLessThanOrEqual(maxResults);
    });

    it('should provide totalFound count', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Research Paper',
        keywords: ['research'],
        maxResults: 5,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      expect(data.totalFound).toBeDefined();
      expect(data.totalFound).toBeGreaterThanOrEqual(data.matches!.length);
    });

    it('should handle large keyword lists', async () => {
      const largeKeywordList = Array.from(
        { length: 20 },
        (_, i) => `keyword${i}`,
      );
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Multi-keyword Research',
        keywords: largeKeywordList,
      };

      const result = await journalMatcher.execute(params);
      expect(result.success).toBe(true);
      const data = result.data as JournalMatcherResult;
      expect(data.matches).toBeDefined();
      expect(data.matches!.length).toBeGreaterThan(0);
    });
  });
});
