/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JournalMatcher, JournalMatcherParams, JournalInfo } from './journal-matcher.js';
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
      expect(journalMatcher.description).toBe('Intelligent journal matching and recommendation system');
    });

    it('should provide detailed help', () => {
      const help = journalMatcher.getHelp();
      expect(help).toContain('journal matching');
      expect(help).toContain('action');
      expect(help).toContain('match');
      expect(help).toContain('search');
      expect(help).toContain('compare');
    });
  });

  describe('Parameter Validation', () => {
    it('should validate match action with paper info', () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Machine Learning Research'
      };
      expect(journalMatcher.validate(params)).toBe(true);
    });

    it('should validate match action with keywords', () => {
      const params: JournalMatcherParams = {
        action: 'match',
        keywords: ['machine learning', 'AI']
      };
      expect(journalMatcher.validate(params)).toBe(true);
    });

    it('should validate search action without specific params', () => {
      const params: JournalMatcherParams = {
        action: 'search'
      };
      expect(journalMatcher.validate(params)).toBe(true);
    });

    it('should validate compare action with journal names', () => {
      const params: JournalMatcherParams = {
        action: 'compare',
        journalNames: ['Nature', 'Science']
      };
      expect(journalMatcher.validate(params)).toBe(true);
    });

    it('should fail validation for match without paper info', () => {
      const params: JournalMatcherParams = {
        action: 'match'
      };
      expect(journalMatcher.validate(params)).toBe(false);
    });

    it('should fail validation for compare without journals', () => {
      const params: JournalMatcherParams = {
        action: 'compare'
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
        title: 'Deep Learning for Computer Vision',
        keywords: ['deep learning', 'computer vision', 'neural networks'],
        researchField: ResearchField.COMPUTER_SCIENCE,
        maxResults: 5
      };

      const result = await journalMatcher.execute(params);
      expect(result.action).toBe('match');
      expect(result.matches).toBeDefined();
      expect(result.matches!.length).toBeGreaterThan(0);
      expect(result.matches!.length).toBeLessThanOrEqual(5);
      
      // Check that results are sorted by match score
      for (let i = 1; i < result.matches!.length; i++) {
        expect(result.matches![i].matchScore).toBeLessThanOrEqual(result.matches![i-1].matchScore);
      }
    });

    it('should provide detailed match scores', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Machine Learning Applications',
        abstract: 'This paper presents novel deep learning approaches for computer vision tasks',
        keywords: ['machine learning', 'deep learning'],
        researchField: ResearchField.COMPUTER_SCIENCE
      };

      const result = await journalMatcher.execute(params);
      const firstMatch = result.matches![0];
      
      expect(firstMatch.matchScore).toBeGreaterThan(0);
      expect(firstMatch.relevanceScore).toBeGreaterThan(0);
      expect(firstMatch.qualityScore).toBeGreaterThan(0);
      expect(firstMatch.feasibilityScore).toBeGreaterThan(0);
      
      expect(firstMatch.scores).toBeDefined();
      expect(firstMatch.scores.titleMatch).toBeGreaterThanOrEqual(0);
      expect(firstMatch.scores.keywordMatch).toBeGreaterThanOrEqual(0);
      expect(firstMatch.scores.fieldMatch).toBeGreaterThanOrEqual(0);
      
      expect(firstMatch.matchReasons).toBeDefined();
      expect(firstMatch.concerns).toBeDefined();
      expect(firstMatch.recommendations).toBeDefined();
    });

    it('should filter by impact factor range', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Research Paper',
        impactFactorRange: { min: 10.0, max: 30.0 },
        maxResults: 10
      };

      const result = await journalMatcher.execute(params);
      
      for (const match of result.matches!) {
        if (match.journal.impactFactor) {
          expect(match.journal.impactFactor).toBeGreaterThanOrEqual(10.0);
          expect(match.journal.impactFactor).toBeLessThanOrEqual(30.0);
        }
      }
    });

    it('should filter by quartile', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'High Quality Research',
        quartile: ['Q1'],
        maxResults: 10
      };

      const result = await journalMatcher.execute(params);
      
      for (const match of result.matches!) {
        expect(match.journal.quartile).toBe('Q1');
      }
    });

    it('should filter by open access requirement', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Open Science Research',
        openAccess: true,
        maxResults: 10
      };

      const result = await journalMatcher.execute(params);
      
      for (const match of result.matches!) {
        expect(match.journal.openAccess || match.journal.hybridOA).toBe(true);
      }
    });
  });

  describe('Journal Search', () => {
    it('should search journals by research field', async () => {
      const params: JournalMatcherParams = {
        action: 'search',
        researchField: ResearchField.COMPUTER_SCIENCE,
        maxResults: 5
      };

      const result = await journalMatcher.execute(params);
      expect(result.action).toBe('search');
      expect(result.journals).toBeDefined();
      expect(result.journals!.length).toBeGreaterThan(0);
      
      for (const journal of result.journals!) {
        expect(journal.researchFields).toContain(ResearchField.COMPUTER_SCIENCE);
      }
    });

    it('should sort search results by impact factor', async () => {
      const params: JournalMatcherParams = {
        action: 'search',
        researchField: ResearchField.COMPUTER_SCIENCE,
        sortBy: 'impact_factor',
        sortOrder: 'desc',
        maxResults: 5
      };

      const result = await journalMatcher.execute(params);
      const journals = result.journals!;
      
      // Check descending order of impact factors
      for (let i = 1; i < journals.length; i++) {
        const prevIF = journals[i-1].impactFactor || 0;
        const currentIF = journals[i].impactFactor || 0;
        expect(currentIF).toBeLessThanOrEqual(prevIF);
      }
    });

    it('should search open access journals', async () => {
      const params: JournalMatcherParams = {
        action: 'search',
        openAccess: true,
        maxResults: 10
      };

      const result = await journalMatcher.execute(params);
      
      for (const journal of result.journals!) {
        expect(journal.openAccess).toBe(true);
      }
    });
  });

  describe('Journal Comparison', () => {
    it('should compare journals by name', async () => {
      const params: JournalMatcherParams = {
        action: 'compare',
        journalNames: ['IEEE Transactions on Pattern Analysis', 'ACM Computing Surveys']
      };

      const result = await journalMatcher.execute(params);
      expect(result.action).toBe('compare');
      expect(result.comparison).toBeDefined();
      expect(result.comparison!.journals.length).toBe(2);
      expect(result.comparison!.similarities).toBeDefined();
      expect(result.comparison!.differences).toBeDefined();
      expect(result.comparison!.recommendations).toBeDefined();
    });

    it('should find similarities between journals', async () => {
      const params: JournalMatcherParams = {
        action: 'compare',
        journalNames: ['IEEE Transactions on Pattern Analysis', 'IEEE Transactions on Industrial']
      };

      const result = await journalMatcher.execute(params);
      const similarities = result.comparison!.similarities;
      
      // Should find IEEE as common publisher
      const hasPublisherSimilarity = similarities.some(sim => 
        sim.toLowerCase().includes('ieee')
      );
      expect(hasPublisherSimilarity).toBe(true);
    });

    it('should handle insufficient journals for comparison', async () => {
      const params: JournalMatcherParams = {
        action: 'compare',
        journalNames: ['Nonexistent Journal']
      };

      await expect(journalMatcher.execute(params)).rejects.toThrow('At least 2 journals are required');
    });
  });

  describe('Journal Analysis', () => {
    it('should analyze journal distribution by field', async () => {
      const params: JournalMatcherParams = {
        action: 'analyze',
        researchField: ResearchField.COMPUTER_SCIENCE
      };

      const result = await journalMatcher.execute(params);
      expect(result.action).toBe('analyze');
      expect(result.analysis).toBeDefined();
      expect(result.analysis!.fieldDistribution).toBeDefined();
      expect(result.analysis!.impactFactorStats).toBeDefined();
      expect(result.analysis!.publisherStats).toBeDefined();
      expect(result.analysis!.recommendations).toBeDefined();
    });

    it('should provide impact factor statistics', async () => {
      const params: JournalMatcherParams = {
        action: 'analyze'
      };

      const result = await journalMatcher.execute(params);
      const stats = result.analysis!.impactFactorStats;
      
      expect(stats.mean).toBeGreaterThan(0);
      expect(stats.median).toBeGreaterThan(0);
      expect(stats.min).toBeGreaterThan(0);
      expect(stats.max).toBeGreaterThan(stats.min);
    });

    it('should analyze publisher distribution', async () => {
      const params: JournalMatcherParams = {
        action: 'analyze'
      };

      const result = await journalMatcher.execute(params);
      const publisherStats = result.analysis!.publisherStats;
      
      expect(Object.keys(publisherStats).length).toBeGreaterThan(0);
      expect(publisherStats['IEEE']).toBeGreaterThan(0);
      expect(publisherStats['Springer Nature']).toBeGreaterThan(0);
    });
  });

  describe('Advanced Filtering', () => {
    it('should filter by multiple criteria', async () => {
      const params: JournalMatcherParams = {
        action: 'search',
        researchField: ResearchField.COMPUTER_SCIENCE,
        quartile: ['Q1', 'Q2'],
        publisher: ['IEEE', 'ACM'],
        language: ['English'],
        maxResults: 10
      };

      const result = await journalMatcher.execute(params);
      
      for (const journal of result.journals!) {
        expect(journal.researchFields).toContain(ResearchField.COMPUTER_SCIENCE);
        expect(['Q1', 'Q2']).toContain(journal.quartile);
        expect(['IEEE', 'ACM']).toContain(journal.publisher);
        expect(journal.language).toContain('English');
      }
    });

    it('should handle empty filter results', async () => {
      const params: JournalMatcherParams = {
        action: 'search',
        impactFactorRange: { min: 1000, max: 2000 }, // Impossible range
        maxResults: 10
      };

      const result = await journalMatcher.execute(params);
      expect(result.journals!.length).toBe(0);
    });
  });

  describe('Recommendation Generation', () => {
    it('should provide match recommendations', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Novel AI Algorithm',
        abstract: 'This paper presents a new approach to machine learning',
        keywords: ['AI', 'machine learning'],
        researchField: ResearchField.COMPUTER_SCIENCE,
        maxResults: 3
      };

      const result = await journalMatcher.execute(params);
      const firstMatch = result.matches![0];
      
      expect(firstMatch.recommendations.length).toBeGreaterThan(0);
      expect(typeof firstMatch.recommendations[0]).toBe('string');
    });

    it('should identify concerns for mismatched papers', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Computer Science Research',
        researchField: ResearchField.COMPUTER_SCIENCE,
        openAccess: true, // This will create concerns for non-OA journals
        maxResults: 10
      };

      const result = await journalMatcher.execute(params);
      
      // Find a non-open access journal in results
      const nonOAMatch = result.matches!.find(match => 
        !match.journal.openAccess && !match.journal.hybridOA
      );
      
      if (nonOAMatch) {
        expect(nonOAMatch.concerns.length).toBeGreaterThan(0);
        const hasOAConcern = nonOAMatch.concerns.some(concern =>
          concern.toLowerCase().includes('open access')
        );
        expect(hasOAConcern).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unknown action', async () => {
      const params = {
        action: 'unknown_action'
      } as any;

      await expect(journalMatcher.execute(params)).rejects.toThrow('Unknown action');
    });

    it('should handle missing journal data gracefully', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Test Paper',
        impactFactorRange: { min: 0, max: 1000 } // Include all journals
      };

      const result = await journalMatcher.execute(params);
      expect(result.matches).toBeDefined();
      expect(result.matches!.length).toBeGreaterThan(0);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate meaningful match scores', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Deep Learning for Computer Vision Applications',
        abstract: 'This research presents novel neural network architectures for image recognition tasks',
        keywords: ['deep learning', 'computer vision', 'neural networks'],
        researchField: ResearchField.COMPUTER_SCIENCE
      };

      const result = await journalMatcher.execute(params);
      const match = result.matches![0];
      
      // All scores should be between 0 and 1
      expect(match.matchScore).toBeGreaterThanOrEqual(0);
      expect(match.matchScore).toBeLessThanOrEqual(1);
      expect(match.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(match.relevanceScore).toBeLessThanOrEqual(1);
      expect(match.qualityScore).toBeGreaterThanOrEqual(0);
      expect(match.qualityScore).toBeLessThanOrEqual(1);
      expect(match.feasibilityScore).toBeGreaterThanOrEqual(0);
      expect(match.feasibilityScore).toBeLessThanOrEqual(1);
      
      // Individual scores should also be in valid range
      Object.values(match.scores).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    });

    it('should score computer science papers higher for CS journals', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Machine Learning Research',
        researchField: ResearchField.COMPUTER_SCIENCE,
        maxResults: 10
      };

      const result = await journalMatcher.execute(params);
      
      // Find a computer science journal
      const csMatch = result.matches!.find(match =>
        match.journal.researchFields.includes(ResearchField.COMPUTER_SCIENCE)
      );
      
      // Find a non-computer science journal
      const nonCSMatch = result.matches!.find(match =>
        !match.journal.researchFields.includes(ResearchField.COMPUTER_SCIENCE)
      );
      
      if (csMatch && nonCSMatch) {
        expect(csMatch.scores.fieldMatch).toBeGreaterThan(nonCSMatch.scores.fieldMatch);
      }
    });
  });

  describe('Performance and Limits', () => {
    it('should respect maxResults parameter', async () => {
      const maxResults = 3;
      const params: JournalMatcherParams = {
        action: 'search',
        maxResults
      };

      const result = await journalMatcher.execute(params);
      expect(result.journals!.length).toBeLessThanOrEqual(maxResults);
    });

    it('should provide totalFound count', async () => {
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Research Paper',
        maxResults: 5
      };

      const result = await journalMatcher.execute(params);
      expect(result.totalFound).toBeDefined();
      expect(result.totalFound).toBeGreaterThanOrEqual(result.matches!.length);
    });

    it('should handle large keyword lists', async () => {
      const manyKeywords = Array.from({length: 20}, (_, i) => `keyword${i}`);
      const params: JournalMatcherParams = {
        action: 'match',
        title: 'Research with Many Keywords',
        keywords: manyKeywords,
        maxResults: 5
      };

      const result = await journalMatcher.execute(params);
      expect(result.matches).toBeDefined();
      expect(result.matches!.length).toBeGreaterThan(0);
    });
  });
}); 