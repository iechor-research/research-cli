/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseResearchTool } from '../base-tool.js';
import {
  ResearchToolParams,
  ResearchToolCategory,
} from '../types.js';
import { KeywordSequenceGenerator, ResearchTopic, KeywordSequence } from './keyword-generator.js';

/**
 * Keyword sequence generation parameters
 */
export interface KeywordSequenceParams extends ResearchToolParams {
  topic: ResearchTopic;
  maxSequences?: number;
}

/**
 * Keyword sequence generation result
 */
export interface KeywordSequenceResult {
  topic: ResearchTopic;
  sequences: KeywordSequence[];
  totalGenerated: number;
  recommendations: {
    topSequences: KeywordSequence[];
    diversityScore: number;
    coverageAnalysis: string;
  };
}

/**
 * Keyword sequence generation tool
 */
export class KeywordSequenceTool extends BaseResearchTool<
  KeywordSequenceParams,
  KeywordSequenceResult
> {
  private generator: KeywordSequenceGenerator;

  constructor() {
    super(
      'keyword_sequence_generator',
      'Generate weighted keyword sequences for comprehensive literature research',
      ResearchToolCategory.ANALYSIS,
      '1.0.0'
    );
    this.generator = new KeywordSequenceGenerator();
  }

  getName(): string {
    return 'keyword_sequence_generator';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'Generate weighted keyword sequences for comprehensive literature research';
  }

  getCategory(): ResearchToolCategory {
    return ResearchToolCategory.ANALYSIS;
  }

  validate(params: ResearchToolParams): boolean {
    const keywordParams = params as KeywordSequenceParams;
    
    if (!keywordParams.topic) {
      return false;
    }
    
    if (!keywordParams.topic.title || keywordParams.topic.title.trim().length === 0) {
      return false;
    }
    
    if (!keywordParams.topic.domain || keywordParams.topic.domain.trim().length === 0) {
      return false;
    }

    return true;
  }

  getHelp(): string {
    return `
Keyword Sequence Generator Tool

DESCRIPTION:
  Generate weighted keyword sequences for comprehensive literature research
  across multiple research perspectives and domains.

PARAMETERS:
  topic: Research topic object (required)
    - title: Main research question or topic (required)
    - domain: Research domain (required)
    - description: Detailed description (optional)
    - subdomains: Related subdomains (optional)
    - timeframe: Time constraints (optional)
    - methodology: Preferred methodologies (optional)
    - context: Research context (optional)

  maxSequences: Maximum number of sequences to generate (default: 10)

EXAMPLE:
{
  "topic": {
    "title": "Machine learning applications in medical diagnosis",
    "domain": "artificial_intelligence",
    "description": "Application of ML algorithms for medical image analysis",
    "methodology": ["supervised_learning", "deep_learning"]
  },
  "maxSequences": 8
}

OUTPUT:
  Generated keyword sequences with:
  - Multi-perspective coverage (theoretical, empirical, methodological, applied, review)
  - Domain-specific terminology
  - Weighted keywords with synonyms
  - Relevance scoring and recommendations
    `;
  }

  protected async executeImpl(
    params: KeywordSequenceParams,
  ): Promise<KeywordSequenceResult> {
    // Generate keyword sequences
    const sequences = await this.generator.generateSequences(params.topic);
    
    // Limit to requested number
    const maxSequences = params.maxSequences || 10;
    const limitedSequences = sequences.slice(0, maxSequences);
    
    // Generate recommendations
    const topSequences = limitedSequences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(5, limitedSequences.length));
    
    // Calculate diversity score
    const categories = new Set(limitedSequences.map(s => s.category));
    const diversityScore = (categories.size / Object.keys(sequences[0]?.category || {}).length) * 100;
    
    // Generate coverage analysis
    const coverageAnalysis = this.generateCoverageAnalysis(limitedSequences, params.topic);

    return {
      topic: params.topic,
      sequences: limitedSequences,
      totalGenerated: limitedSequences.length,
      recommendations: {
        topSequences,
        diversityScore,
        coverageAnalysis,
      },
    };
  }

  /**
   * Generate coverage analysis text
   */
  private generateCoverageAnalysis(sequences: KeywordSequence[], topic: ResearchTopic): string {
    const totalKeywords = sequences.reduce((sum, seq) => sum + seq.keywords.length, 0);
    const uniqueKeywords = new Set();
    
    sequences.forEach(seq => {
      seq.keywords.forEach(kw => uniqueKeywords.add(kw.term.toLowerCase()));
    });

    const categories = sequences.map(s => s.category);
    const categoryCount = new Set(categories).size;

    return `Generated ${sequences.length} sequences with ${totalKeywords} total keywords (${uniqueKeywords.size} unique). ` +
           `Coverage includes ${categoryCount} research perspectives for comprehensive literature investigation.`;
  }
}
