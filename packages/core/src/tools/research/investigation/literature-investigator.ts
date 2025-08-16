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
  ResearchToolCategory,
} from '../types.js';
import { KeywordSequence, KeywordSequenceGenerator, ResearchTopic } from './keyword-generator.js';
import { BibliographyManager } from '../analysis/bibliography-manager.js';
import { cached, monitored, ParallelProcessor } from '../utils/performance-optimizer.js';

/**
 * Literature investigation parameters
 */
export interface LiteratureInvestigationParams extends ResearchToolParams {
  topic: ResearchTopic;
  selectedSequenceIds?: string[];
  maxPapersPerSequence?: number;
  totalMaxPapers?: number;
  databases?: Database[];
  timeframe?: {
    start: number;
    end: number;
  };
  includeReviews?: boolean;
  minCitationCount?: number;
  sortBy?: 'relevance' | 'citations' | 'date' | 'impact';
}

/**
 * Enhanced paper entry with investigation metrics
 */
export interface InvestigatedPaper extends BibliographyEntry {
  relevanceScore: number;
  temporalScore: number;
  citationImpact: number;
  overallScore: number;
  matchedKeywords: string[];
  researchCategory: string;
  methodology?: string[];
  keyFindings?: string;
  limitations?: string;
  futureWork?: string;
  relatedWorks?: string[];
  // Additional publication details
  volume?: string;
  pages?: string;
  type?: string;
}

/**
 * Investigation result with comprehensive analysis
 */
export interface LiteratureInvestigationResult {
  topic: ResearchTopic;
  keywordSequences: KeywordSequence[];
  papers: InvestigatedPaper[];
  analysis: {
    totalPapers: number;
    averageRelevanceScore: number;
    temporalDistribution: TemporalDistribution;
    citationAnalysis: CitationAnalysis;
    methodologyBreakdown: MethodologyBreakdown;
    topAuthors: AuthorAnalysis[];
    researchTrends: ResearchTrend[];
    gapAnalysis: ResearchGap[];
  };
  categorizedPapers: {
    theoretical: InvestigatedPaper[];
    empirical: InvestigatedPaper[];
    methodological: InvestigatedPaper[];
    applied: InvestigatedPaper[];
    reviews: InvestigatedPaper[];
  };
  recommendations: {
    keyPapers: InvestigatedPaper[];
    emergingTrends: string[];
    researchOpportunities: string[];
    methodologicalGaps: string[];
  };
  exportFormats: {
    markdown: string;
    bibtex: string;
    ris: string;
    csv: string;
  };
}

/**
 * Temporal distribution analysis
 */
interface TemporalDistribution {
  yearlyCount: { [year: number]: number };
  trends: {
    increasing: boolean;
    peakYear: number;
    recentActivity: 'high' | 'medium' | 'low';
  };
}

/**
 * Citation analysis metrics
 */
interface CitationAnalysis {
  totalCitations: number;
  averageCitations: number;
  highlycited: InvestigatedPaper[];
  citationDistribution: { [range: string]: number };
  hIndex: number;
}

/**
 * Methodology breakdown
 */
interface MethodologyBreakdown {
  [methodology: string]: {
    count: number;
    papers: InvestigatedPaper[];
    averageScore: number;
  };
}

/**
 * Author analysis
 */
interface AuthorAnalysis {
  name: string;
  paperCount: number;
  totalCitations: number;
  averageRelevance: number;
  topPapers: InvestigatedPaper[];
}

/**
 * Research trend identification
 */
interface ResearchTrend {
  trend: string;
  strength: number;
  timeframe: string;
  papers: InvestigatedPaper[];
  keywords: string[];
}

/**
 * Research gap identification
 */
interface ResearchGap {
  gap: string;
  evidence: string;
  opportunity: string;
  suggestedKeywords: string[];
}

/**
 * Advanced literature investigator that performs comprehensive research analysis
 */
export class LiteratureInvestigator extends BaseResearchTool<
  LiteratureInvestigationParams,
  LiteratureInvestigationResult
> {
  private keywordGenerator: KeywordSequenceGenerator;
  private bibliographyManager: BibliographyManager;

  constructor() {
    super(
      'literature_investigator',
      'Comprehensive literature investigation tool with keyword-driven search, relevance scoring, and research gap analysis',
      ResearchToolCategory.ANALYSIS,
      '1.0.0'
    );
    this.keywordGenerator = new KeywordSequenceGenerator();
    this.bibliographyManager = new BibliographyManager();
  }

  getName(): string {
    return 'literature_investigator';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getDescription(): string {
    return 'Comprehensive literature investigation tool with keyword-driven search, relevance scoring, and research gap analysis';
  }

  getCategory(): ResearchToolCategory {
    return ResearchToolCategory.ANALYSIS;
  }

  validate(params: ResearchToolParams): boolean {
    const investigationParams = params as LiteratureInvestigationParams;
    
    if (!investigationParams.topic) {
      return false;
    }
    
    if (!investigationParams.topic.title || investigationParams.topic.title.trim().length === 0) {
      return false;
    }
    
    if (!investigationParams.topic.domain || investigationParams.topic.domain.trim().length === 0) {
      return false;
    }

    return true;
  }

  getHelp(): string {
    return `
Literature Investigator Tool

DESCRIPTION:
  Performs comprehensive literature investigation with keyword-driven search,
  relevance scoring, temporal analysis, and research gap identification.

PARAMETERS:
  topic: Research topic object with title, domain, and optional metadata
    - title: Main research question or topic (required)
    - domain: Research domain (required)
    - description: Detailed description (optional)
    - subdomains: Related subdomains (optional)
    - timeframe: Time constraints (optional)
    - methodology: Preferred methodologies (optional)
    - context: Research context (optional)

  selectedSequenceIds: Pre-selected keyword sequence IDs (optional)
  maxPapersPerSequence: Maximum papers per keyword sequence (default: 20)
  totalMaxPapers: Total maximum papers to investigate (default: 100)
  databases: Databases to search (default: all available)
  timeframe: Publication timeframe (optional)
  includeReviews: Include review papers (default: true)
  minCitationCount: Minimum citation threshold (default: 0)
  sortBy: Result sorting method (default: 'relevance')

EXAMPLE:
{
  "topic": {
    "title": "Machine learning applications in medical diagnosis",
    "domain": "artificial_intelligence",
    "subdomains": ["medical_ai", "diagnostic_systems"],
    "methodology": ["supervised_learning", "deep_learning"],
    "timeframe": {"start": 2020, "end": 2024}
  },
  "maxPapersPerSequence": 15,
  "totalMaxPapers": 80,
  "databases": ["arxiv", "pubmed", "ieee"],
  "sortBy": "relevance"
}

OUTPUT:
  Comprehensive investigation result with:
  - Analyzed papers with relevance scores
  - Temporal and citation analysis
  - Research trends and gaps
  - Categorized references
  - Export formats (Markdown, BibTeX, RIS, CSV)
    `;
  }

  protected async executeImpl(
    params: LiteratureInvestigationParams,
  ): Promise<LiteratureInvestigationResult> {
    // Step 1: Generate keyword sequences if not provided
    let keywordSequences: KeywordSequence[];
    if (params.selectedSequenceIds && params.selectedSequenceIds.length > 0) {
      // Use pre-selected sequences (this would require a sequence store)
      keywordSequences = await this.getStoredSequences(params.selectedSequenceIds);
    } else {
      keywordSequences = await this.keywordGenerator.generateSequences(params.topic);
    }

    // Step 2: Search literature using keyword sequences
    const allPapers = await this.searchWithKeywordSequences(
      keywordSequences,
      params
    );

    // Step 3: Analyze and score papers
    const investigatedPapers = await this.analyzePapers(
      allPapers,
      keywordSequences,
      params
    );

    // Step 4: Perform comprehensive analysis
    const analysis = await this.performComprehensiveAnalysis(
      investigatedPapers,
      params.topic
    );

    // Step 5: Categorize papers
    const categorizedPapers = this.categorizePapers(investigatedPapers);

    // Step 6: Generate recommendations
    const recommendations = this.generateRecommendations(
      investigatedPapers,
      analysis,
      params.topic
    );

    // Step 7: Generate export formats
    const exportFormats = this.generateExportFormats(
      investigatedPapers,
      params.topic,
      keywordSequences
    );

    return {
      topic: params.topic,
      keywordSequences,
      papers: investigatedPapers,
      analysis,
      categorizedPapers,
      recommendations,
      exportFormats,
    };
  }

  /**
   * Search literature using multiple keyword sequences
   */
  private async searchWithKeywordSequences(
    sequences: KeywordSequence[],
    params: LiteratureInvestigationParams
  ): Promise<BibliographyEntry[]> {
    const allPapers: BibliographyEntry[] = [];
    const processor = new ParallelProcessor<KeywordSequence, BibliographyEntry[]>(3);

    const searchTasks = sequences.map(sequence => async () => {
      const query = this.buildSearchQuery(sequence);
      const searchParams = {
        query,
        databases: params.databases || [Database.ARXIV, Database.GOOGLE_SCHOLAR, Database.PUBMED],
        maxResults: params.maxPapersPerSequence || 20,
        yearRange: params.timeframe,
        sortBy: 'relevance' as const,
        includeAbstracts: true
      };

      const result = await this.bibliographyManager.execute(searchParams);
      return 'entries' in result ? result.entries : [];
    });

    const results = await processor.process(sequences, async (sequence) => {
      const taskIndex = sequences.indexOf(sequence);
      return await searchTasks[taskIndex]() as BibliographyEntry[];
    });

    results.forEach(papers => allPapers.push(...papers));

    // Remove duplicates based on title similarity
    return this.deduplicatePapers(allPapers);
  }

  /**
   * Build search query from keyword sequence
   */
  private buildSearchQuery(sequence: KeywordSequence): string {
    const coreKeywords = sequence.keywords
      .filter(kw => kw.weight > 0.8)
      .slice(0, 5)
      .map(kw => `"${kw.term}"`)
      .join(' OR ');

    const supportKeywords = sequence.keywords
      .filter(kw => kw.weight > 0.5 && kw.weight <= 0.8)
      .slice(0, 3)
      .map(kw => kw.term)
      .join(' ');

    return `(${coreKeywords}) AND (${supportKeywords})`;
  }

  /**
   * Analyze papers with comprehensive scoring
   */
  private async analyzePapers(
    papers: BibliographyEntry[],
    sequences: KeywordSequence[],
    params: LiteratureInvestigationParams
  ): Promise<InvestigatedPaper[]> {
    const investigatedPapers: InvestigatedPaper[] = [];

    for (const paper of papers) {
      const investigatedPaper = await this.analyzeSinglePaper(
        paper,
        sequences,
        params
      );
      investigatedPapers.push(investigatedPaper);
    }

    // Sort by overall score and limit to max papers
    investigatedPapers.sort((a, b) => b.overallScore - a.overallScore);
    
    const maxPapers = params.totalMaxPapers || 100;
    return investigatedPapers.slice(0, maxPapers);
  }

  /**
   * Analyze a single paper comprehensively
   */
  private async analyzeSinglePaper(
    paper: BibliographyEntry,
    sequences: KeywordSequence[],
    params: LiteratureInvestigationParams
  ): Promise<InvestigatedPaper> {
    // Calculate relevance score
    const relevanceScore = this.calculateRelevanceScore(paper, sequences);
    
    // Calculate temporal score
    const temporalScore = this.calculateTemporalScore(paper, params.timeframe);
    
    // Calculate citation impact
    const citationImpact = this.calculateCitationImpact(paper);
    
    // Find matched keywords
    const matchedKeywords = this.findMatchedKeywords(paper, sequences);
    
    // Determine research category
    const researchCategory = this.determineResearchCategory(paper, sequences);
    
    // Extract methodology
    const methodology = this.extractMethodology(paper);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(
      relevanceScore,
      temporalScore,
      citationImpact
    );

    return {
      ...paper,
      relevanceScore,
      temporalScore,
      citationImpact,
      overallScore,
      matchedKeywords,
      researchCategory,
      methodology,
      keyFindings: this.extractKeyFindings(paper),
      limitations: this.extractLimitations(paper),
      futureWork: this.extractFutureWork(paper),
      relatedWorks: this.extractRelatedWorks(paper),
    };
  }

  /**
   * Calculate relevance score based on keyword matching
   */
  private calculateRelevanceScore(
    paper: BibliographyEntry,
    sequences: KeywordSequence[]
  ): number {
    const paperText = `${paper.title} ${paper.abstract || ''} ${paper.keywords?.join(' ') || ''}`.toLowerCase();
    
    let maxScore = 0;
    
    for (const sequence of sequences) {
      let sequenceScore = 0;
      let matchCount = 0;
      
      for (const keyword of sequence.keywords) {
        const term = keyword.term.toLowerCase();
        
        // Exact match in title gets highest weight
        if (paper.title.toLowerCase().includes(term)) {
          sequenceScore += keyword.weight * 2.0;
          matchCount++;
        }
        // Match in abstract gets medium weight
        else if (paper.abstract?.toLowerCase().includes(term)) {
          sequenceScore += keyword.weight * 1.5;
          matchCount++;
        }
        // Match in keywords gets base weight
        else if (paper.keywords?.some(kw => kw.toLowerCase().includes(term))) {
          sequenceScore += keyword.weight * 1.0;
          matchCount++;
        }
        
        // Check synonyms
        if (keyword.synonyms) {
          for (const synonym of keyword.synonyms) {
            if (paperText.includes(synonym.toLowerCase())) {
              sequenceScore += keyword.weight * 0.8;
              matchCount++;
              break;
            }
          }
        }
      }
      
      // Normalize by number of keywords and apply coverage bonus
      const normalizedScore = sequenceScore / sequence.keywords.length;
      const coverageBonus = (matchCount / sequence.keywords.length) * 10;
      const totalScore = normalizedScore + coverageBonus;
      
      maxScore = Math.max(maxScore, totalScore);
    }
    
    return Math.min(100, Math.round(maxScore * 100) / 100);
  }

  /**
   * Calculate temporal score based on publication date
   */
  private calculateTemporalScore(
    paper: BibliographyEntry,
    timeframe?: { start: number; end: number }
  ): number {
    if (!paper.year) {
      return 50; // Neutral score for unknown dates
    }
    
    const currentYear = new Date().getFullYear();
    const paperYear = paper.year;
    
    // If timeframe specified, score based on relevance to timeframe
    if (timeframe) {
      if (paperYear >= timeframe.start && paperYear <= timeframe.end) {
        return 100; // Perfect match
      }
      
      const distanceFromRange = Math.min(
        Math.abs(paperYear - timeframe.start),
        Math.abs(paperYear - timeframe.end)
      );
      
      return Math.max(0, 100 - (distanceFromRange * 10));
    }
    
    // Otherwise, favor recent papers with exponential decay
    const yearsOld = currentYear - paperYear;
    if (yearsOld <= 2) return 100;
    if (yearsOld <= 5) return 80;
    if (yearsOld <= 10) return 60;
    if (yearsOld <= 15) return 40;
    return 20;
  }

  /**
   * Calculate citation impact score
   */
  private calculateCitationImpact(paper: BibliographyEntry): number {
    const citations = paper.citationCount || 0;
    const yearsOld = new Date().getFullYear() - (paper.year || new Date().getFullYear());
    
    // Calculate citations per year
    const citationsPerYear = yearsOld > 0 ? citations / yearsOld : citations;
    
    // Logarithmic scale for citation impact
    if (citationsPerYear >= 50) return 100;
    if (citationsPerYear >= 20) return 90;
    if (citationsPerYear >= 10) return 80;
    if (citationsPerYear >= 5) return 70;
    if (citationsPerYear >= 2) return 60;
    if (citationsPerYear >= 1) return 50;
    if (citations > 0) return 40;
    return 30; // No citations yet
  }

  /**
   * Find matched keywords for a paper
   */
  private findMatchedKeywords(
    paper: BibliographyEntry,
    sequences: KeywordSequence[]
  ): string[] {
    const paperText = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
    const matchedKeywords = new Set<string>();
    
    for (const sequence of sequences) {
      for (const keyword of sequence.keywords) {
        const term = keyword.term.toLowerCase();
        if (paperText.includes(term)) {
          matchedKeywords.add(keyword.term);
        }
        
        if (keyword.synonyms) {
          for (const synonym of keyword.synonyms) {
            if (paperText.includes(synonym.toLowerCase())) {
              matchedKeywords.add(keyword.term);
              break;
            }
          }
        }
      }
    }
    
    return Array.from(matchedKeywords);
  }

  /**
   * Determine research category
   */
  private determineResearchCategory(
    paper: BibliographyEntry,
    sequences: KeywordSequence[]
  ): string {
    const paperText = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
    
    const categoryScores = {
      theoretical: 0,
      empirical: 0,
      methodological: 0,
      applied: 0,
      review: 0
    };
    
    // Theoretical indicators
    if (paperText.includes('theory') || paperText.includes('model') || paperText.includes('framework')) {
      categoryScores.theoretical += 2;
    }
    
    // Empirical indicators
    if (paperText.includes('experiment') || paperText.includes('study') || paperText.includes('analysis')) {
      categoryScores.empirical += 2;
    }
    
    // Methodological indicators
    if (paperText.includes('method') || paperText.includes('approach') || paperText.includes('algorithm')) {
      categoryScores.methodological += 2;
    }
    
    // Applied indicators
    if (paperText.includes('application') || paperText.includes('implementation') || paperText.includes('system')) {
      categoryScores.applied += 2;
    }
    
    // Review indicators
    if (paperText.includes('review') || paperText.includes('survey') || paperText.includes('meta-analysis')) {
      categoryScores.review += 3;
    }
    
    // Find category with highest score
    const maxCategory = Object.entries(categoryScores).reduce((a, b) => 
      categoryScores[a[0] as keyof typeof categoryScores] > categoryScores[b[0] as keyof typeof categoryScores] ? a : b
    );
    
    return maxCategory[0];
  }

  /**
   * Extract methodology from paper
   */
  private extractMethodology(paper: BibliographyEntry): string[] {
    const paperText = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
    const methodologies: string[] = [];
    
    const methodologyPatterns = {
      'quantitative': /quantitative|statistical|numerical|survey|questionnaire/,
      'qualitative': /qualitative|interview|case study|ethnography|content analysis/,
      'experimental': /experiment|controlled|randomized|trial|hypothesis/,
      'computational': /simulation|modeling|algorithm|computational|numerical/,
      'observational': /observational|longitudinal|cross-sectional|cohort/,
      'meta-analysis': /meta-analysis|systematic review|literature review/
    };
    
    for (const [method, pattern] of Object.entries(methodologyPatterns)) {
      if (pattern.test(paperText)) {
        methodologies.push(method);
      }
    }
    
    return methodologies;
  }

  /**
   * Calculate overall score combining all metrics
   */
  private calculateOverallScore(
    relevanceScore: number,
    temporalScore: number,
    citationImpact: number
  ): number {
    // Weighted combination
    const weights = {
      relevance: 0.5,
      temporal: 0.2,
      citation: 0.3
    };
    
    return Math.round(
      (relevanceScore * weights.relevance +
       temporalScore * weights.temporal +
       citationImpact * weights.citation) * 100
    ) / 100;
  }

  /**
   * Extract key findings from paper
   */
  private extractKeyFindings(paper: BibliographyEntry): string {
    if (!paper.abstract) return '';
    
    // Simple extraction - look for result indicators
    const resultPatterns = /(?:results?|findings?|conclusion|discovered|demonstrated|showed|found that)([^.]*\.)/gi;
    const matches = paper.abstract.match(resultPatterns);
    
    return matches ? matches.slice(0, 2).join(' ') : '';
  }

  /**
   * Extract limitations from paper
   */
  private extractLimitations(paper: BibliographyEntry): string {
    if (!paper.abstract) return '';
    
    const limitationPatterns = /(?:limitation|constraint|drawback|weakness|however|but|although)([^.]*\.)/gi;
    const matches = paper.abstract.match(limitationPatterns);
    
    return matches ? matches.slice(0, 1).join(' ') : '';
  }

  /**
   * Extract future work from paper
   */
  private extractFutureWork(paper: BibliographyEntry): string {
    if (!paper.abstract) return '';
    
    const futurePatterns = /(?:future work|future research|next step|further study|ongoing|continue)([^.]*\.)/gi;
    const matches = paper.abstract.match(futurePatterns);
    
    return matches ? matches.slice(0, 1).join(' ') : '';
  }

  /**
   * Extract related works
   */
  private extractRelatedWorks(paper: BibliographyEntry): string[] {
    // This would ideally parse references, but for now return empty
    return [];
  }

  /**
   * Remove duplicate papers based on title similarity
   */
  private deduplicatePapers(papers: BibliographyEntry[]): BibliographyEntry[] {
    const uniquePapers: BibliographyEntry[] = [];
    const seenTitles = new Set<string>();
    
    for (const paper of papers) {
      const normalizedTitle = paper.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniquePapers.push(paper);
      }
    }
    
    return uniquePapers;
  }

  /**
   * Perform comprehensive analysis of investigated papers
   */
  private async performComprehensiveAnalysis(
    papers: InvestigatedPaper[],
    topic: ResearchTopic
  ): Promise<LiteratureInvestigationResult['analysis']> {
    // Temporal distribution
    const temporalDistribution = this.analyzeTemporalDistribution(papers);
    
    // Citation analysis
    const citationAnalysis = this.analyzeCitations(papers);
    
    // Methodology breakdown
    const methodologyBreakdown = this.analyzeMethodologies(papers);
    
    // Author analysis
    const topAuthors = this.analyzeAuthors(papers);
    
    // Research trends
    const researchTrends = this.identifyTrends(papers);
    
    // Gap analysis
    const gapAnalysis = this.identifyGaps(papers, topic);
    
    return {
      totalPapers: papers.length,
      averageRelevanceScore: papers.reduce((sum, p) => sum + p.relevanceScore, 0) / papers.length,
      temporalDistribution,
      citationAnalysis,
      methodologyBreakdown,
      topAuthors,
      researchTrends,
      gapAnalysis,
    };
  }

  /**
   * Analyze temporal distribution of papers
   */
  private analyzeTemporalDistribution(papers: InvestigatedPaper[]): TemporalDistribution {
    const yearlyCount: { [year: number]: number } = {};
    
    papers.forEach(paper => {
      if (paper.year) {
        yearlyCount[paper.year] = (yearlyCount[paper.year] || 0) + 1;
      }
    });
    
    const years = Object.keys(yearlyCount).map(Number).sort();
    const counts = years.map(year => yearlyCount[year]);
    
    // Determine if trend is increasing
    const recentYears = years.slice(-3);
    const olderYears = years.slice(0, -3);
    const recentAvg = recentYears.reduce((sum, year) => sum + yearlyCount[year], 0) / recentYears.length;
    const olderAvg = olderYears.reduce((sum, year) => sum + yearlyCount[year], 0) / olderYears.length;
    
    const peakYear = years[counts.indexOf(Math.max(...counts))];
    const currentYear = new Date().getFullYear();
    const recentActivity = recentAvg > 10 ? 'high' : recentAvg > 5 ? 'medium' : 'low';
    
    return {
      yearlyCount,
      trends: {
        increasing: recentAvg > olderAvg,
        peakYear,
        recentActivity,
      },
    };
  }

  /**
   * Analyze citation metrics
   */
  private analyzeCitations(papers: InvestigatedPaper[]): CitationAnalysis {
    const citations = papers.map(p => p.citationCount || 0);
    const totalCitations = citations.reduce((sum, c) => sum + c, 0);
    const averageCitations = totalCitations / papers.length;
    
    // Highly cited papers (top 10% or >50 citations)
    const citationThreshold = Math.max(50, citations.sort((a, b) => b - a)[Math.floor(papers.length * 0.1)]);
    const highlycited = papers.filter(p => (p.citationCount || 0) >= citationThreshold);
    
    // Citation distribution
    const citationDistribution = {
      '0': papers.filter(p => (p.citationCount || 0) === 0).length,
      '1-10': papers.filter(p => (p.citationCount || 0) >= 1 && (p.citationCount || 0) <= 10).length,
      '11-50': papers.filter(p => (p.citationCount || 0) >= 11 && (p.citationCount || 0) <= 50).length,
      '51-100': papers.filter(p => (p.citationCount || 0) >= 51 && (p.citationCount || 0) <= 100).length,
      '100+': papers.filter(p => (p.citationCount || 0) > 100).length,
    };
    
    // Calculate h-index
    const sortedCitations = citations.sort((a, b) => b - a);
    let hIndex = 0;
    for (let i = 0; i < sortedCitations.length; i++) {
      if (sortedCitations[i] >= i + 1) {
        hIndex = i + 1;
      } else {
        break;
      }
    }
    
    return {
      totalCitations,
      averageCitations: Math.round(averageCitations * 100) / 100,
      highlycited,
      citationDistribution,
      hIndex,
    };
  }

  /**
   * Analyze methodology distribution
   */
  private analyzeMethodologies(papers: InvestigatedPaper[]): MethodologyBreakdown {
    const methodologyBreakdown: MethodologyBreakdown = {};
    
    papers.forEach(paper => {
      if (paper.methodology) {
        paper.methodology.forEach(method => {
          if (!methodologyBreakdown[method]) {
            methodologyBreakdown[method] = {
              count: 0,
              papers: [],
              averageScore: 0,
            };
          }
          
          methodologyBreakdown[method].count++;
          methodologyBreakdown[method].papers.push(paper);
        });
      }
    });
    
    // Calculate average scores
    Object.keys(methodologyBreakdown).forEach(method => {
      const papers = methodologyBreakdown[method].papers;
      const averageScore = papers.reduce((sum, p) => sum + p.overallScore, 0) / papers.length;
      methodologyBreakdown[method].averageScore = Math.round(averageScore * 100) / 100;
    });
    
    return methodologyBreakdown;
  }

  /**
   * Analyze top authors
   */
  private analyzeAuthors(papers: InvestigatedPaper[]): AuthorAnalysis[] {
    const authorMap = new Map<string, AuthorAnalysis>();
    
    papers.forEach(paper => {
      paper.authors.forEach(author => {
        const authorName = author;
        
        if (!authorMap.has(authorName)) {
          authorMap.set(authorName, {
            name: authorName,
            paperCount: 0,
            totalCitations: 0,
            averageRelevance: 0,
            topPapers: [],
          });
        }
        
        const authorData = authorMap.get(authorName)!;
        authorData.paperCount++;
        authorData.totalCitations += paper.citationCount || 0;
        authorData.topPapers.push(paper);
      });
    });
    
    // Calculate averages and sort top papers
    authorMap.forEach(author => {
      author.averageRelevance = author.topPapers.reduce((sum, p) => sum + p.relevanceScore, 0) / author.topPapers.length;
      author.topPapers = author.topPapers
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 3);
    });
    
    return Array.from(authorMap.values())
      .sort((a, b) => b.paperCount - a.paperCount)
      .slice(0, 10);
  }

  /**
   * Identify research trends
   */
  private identifyTrends(papers: InvestigatedPaper[]): ResearchTrend[] {
    // This is a simplified trend identification
    // In practice, would use more sophisticated NLP techniques
    
    const trends: ResearchTrend[] = [];
    const currentYear = new Date().getFullYear();
    
    // Identify emerging keywords in recent papers
    const recentPapers = papers.filter(p => p.year && p.year >= currentYear - 3);
    const keywordFrequency = new Map<string, number>();
    
    recentPapers.forEach(paper => {
      paper.matchedKeywords.forEach(keyword => {
        keywordFrequency.set(keyword, (keywordFrequency.get(keyword) || 0) + 1);
      });
    });
    
    // Convert to trends
    Array.from(keywordFrequency.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([keyword, count]) => {
        const trendPapers = recentPapers.filter(p => p.matchedKeywords.includes(keyword));
        trends.push({
          trend: keyword,
          strength: count / recentPapers.length,
          timeframe: `${currentYear - 3}-${currentYear}`,
          papers: trendPapers.slice(0, 3),
          keywords: [keyword],
        });
      });
    
    return trends;
  }

  /**
   * Identify research gaps
   */
  private identifyGaps(papers: InvestigatedPaper[], topic: ResearchTopic): ResearchGap[] {
    const gaps: ResearchGap[] = [];
    
    // Methodology gaps
    const methodologies = new Set<string>();
    papers.forEach(paper => {
      if (paper.methodology) {
        paper.methodology.forEach(method => methodologies.add(method));
      }
    });
    
    const expectedMethodologies = ['quantitative', 'qualitative', 'experimental', 'computational'];
    const missingMethodologies = expectedMethodologies.filter(method => !methodologies.has(method));
    
    missingMethodologies.forEach(method => {
      gaps.push({
        gap: `Limited ${method} research`,
        evidence: `Only ${Array.from(methodologies).join(', ')} methodologies found`,
        opportunity: `Explore ${method} approaches to ${topic.title}`,
        suggestedKeywords: [method, topic.title.split(' ')[0]],
      });
    });
    
    // Temporal gaps
    const yearRange = papers.map(p => p.year || 0).filter(y => y > 0);
    if (yearRange.length > 0) {
      const minYear = Math.min(...yearRange);
      const maxYear = Math.max(...yearRange);
      const currentYear = new Date().getFullYear();
      
      if (currentYear - maxYear > 2) {
        gaps.push({
          gap: 'Lack of recent research',
          evidence: `Most recent paper from ${maxYear}`,
          opportunity: `Investigate current state of ${topic.title}`,
          suggestedKeywords: ['recent', 'current', topic.title],
        });
      }
    }
    
    return gaps.slice(0, 5);
  }

  /**
   * Categorize papers by research type
   */
  private categorizePapers(papers: InvestigatedPaper[]): LiteratureInvestigationResult['categorizedPapers'] {
    return {
      theoretical: papers.filter(p => p.researchCategory === 'theoretical'),
      empirical: papers.filter(p => p.researchCategory === 'empirical'),
      methodological: papers.filter(p => p.researchCategory === 'methodological'),
      applied: papers.filter(p => p.researchCategory === 'applied'),
      reviews: papers.filter(p => p.researchCategory === 'review'),
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    papers: InvestigatedPaper[],
    analysis: LiteratureInvestigationResult['analysis'],
    topic: ResearchTopic
  ): LiteratureInvestigationResult['recommendations'] {
    // Key papers - top 10 by overall score
    const keyPapers = papers
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 10);
    
    // Emerging trends from trend analysis
    const emergingTrends = analysis.researchTrends
      .filter(trend => trend.strength > 0.1)
      .map(trend => trend.trend);
    
    // Research opportunities from gap analysis
    const researchOpportunities = analysis.gapAnalysis.map(gap => gap.opportunity);
    
    // Methodological gaps
    const methodologicalGaps = analysis.gapAnalysis
      .filter(gap => gap.gap.includes('methodology') || gap.gap.includes('method'))
      .map(gap => gap.gap);
    
    return {
      keyPapers,
      emergingTrends,
      researchOpportunities,
      methodologicalGaps,
    };
  }

  /**
   * Generate export formats
   */
  private generateExportFormats(
    papers: InvestigatedPaper[],
    topic: ResearchTopic,
    sequences: KeywordSequence[]
  ): LiteratureInvestigationResult['exportFormats'] {
    return {
      markdown: this.generateMarkdownExport(papers, topic, sequences),
      bibtex: this.generateBibTeXExport(papers),
      ris: this.generateRISExport(papers),
      csv: this.generateCSVExport(papers),
    };
  }

  /**
   * Generate Markdown export
   */
  private generateMarkdownExport(
    papers: InvestigatedPaper[],
    topic: ResearchTopic,
    sequences: KeywordSequence[]
  ): string {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let markdown = `# Literature Investigation: ${topic.title}\n\n`;
    markdown += `**Generated:** ${timestamp}\n`;
    markdown += `**Domain:** ${topic.domain}\n`;
    markdown += `**Total Papers:** ${papers.length}\n\n`;
    
    // Keyword sequences
    markdown += `## Keyword Sequences Used\n\n`;
    sequences.forEach((seq, i) => {
      markdown += `### ${i + 1}. ${seq.name}\n`;
      markdown += `**Category:** ${seq.category}\n`;
      markdown += `**Score:** ${seq.score}\n`;
      markdown += `**Keywords:** ${seq.keywords.map(kw => `${kw.term} (${kw.weight})`).join(', ')}\n\n`;
    });
    
    // Top papers
    markdown += `## Key Papers\n\n`;
    papers.slice(0, 20).forEach((paper, i) => {
      markdown += `### ${i + 1}. ${paper.title}\n`;
      markdown += `**Authors:** ${paper.authors.join(', ')}\n`;
      markdown += `**Year:** ${paper.year || 'Unknown'}\n`;
      markdown += `**Relevance Score:** ${paper.relevanceScore}/100\n`;
      markdown += `**Overall Score:** ${paper.overallScore}/100\n`;
      markdown += `**Citations:** ${paper.citationCount || 0}\n`;
      markdown += `**Category:** ${paper.researchCategory}\n`;
      if (paper.methodology && paper.methodology.length > 0) {
        markdown += `**Methodology:** ${paper.methodology.join(', ')}\n`;
      }
      markdown += `**Matched Keywords:** ${paper.matchedKeywords.join(', ')}\n`;
      if (paper.abstract) {
        markdown += `**Abstract:** ${paper.abstract.substring(0, 300)}...\n`;
      }
      if (paper.doi) {
        markdown += `**DOI:** [${paper.doi}](https://doi.org/${paper.doi})\n`;
      }
      markdown += `\n---\n\n`;
    });
    
    return markdown;
  }

  /**
   * Generate BibTeX export
   */
  private generateBibTeXExport(papers: InvestigatedPaper[]): string {
    return papers.map(paper => {
      const type = 'article';
      const key = `${paper.authors[0]?.split(' ').pop() || 'unknown'}${paper.year || ''}`;
      
      let bibtex = `@${type}{${key},\n`;
      bibtex += `  title={${paper.title}},\n`;
      bibtex += `  author={${paper.authors.join(' and ')}},\n`;
      if (paper.year) bibtex += `  year={${paper.year}},\n`;
      if (paper.journal) bibtex += `  journal={${paper.journal}},\n`;
      if (paper.volume) bibtex += `  volume={${paper.volume}},\n`;
      if (paper.pages) bibtex += `  pages={${paper.pages}},\n`;
      if (paper.doi) bibtex += `  doi={${paper.doi}},\n`;
      bibtex += `}\n\n`;
      
      return bibtex;
    }).join('');
  }

  /**
   * Generate RIS export
   */
  private generateRISExport(papers: InvestigatedPaper[]): string {
    return papers.map(paper => {
      let ris = `TY  - JOUR\n`;
      ris += `TI  - ${paper.title}\n`;
      paper.authors.forEach(author => {
        const name = author;
        ris += `AU  - ${name}\n`;
      });
      if (paper.year) ris += `PY  - ${paper.year}\n`;
      if (paper.journal) ris += `JO  - ${paper.journal}\n`;
      if (paper.volume) ris += `VL  - ${paper.volume}\n`;
      if (paper.pages) ris += `SP  - ${paper.pages}\n`;
      if (paper.doi) ris += `DO  - ${paper.doi}\n`;
      if (paper.abstract) ris += `AB  - ${paper.abstract}\n`;
      ris += `ER  - \n\n`;
      
      return ris;
    }).join('');
  }

  /**
   * Generate CSV export
   */
  private generateCSVExport(papers: InvestigatedPaper[]): string {
    const headers = [
      'Title', 'Authors', 'Year', 'Journal', 'DOI', 'Citations',
      'Relevance Score', 'Overall Score', 'Category', 'Methodology', 'Matched Keywords'
    ];
    
    let csv = headers.join(',') + '\n';
    
    papers.forEach(paper => {
      const row = [
        `"${paper.title.replace(/"/g, '""')}"`,
        `"${paper.authors.join('; ')}"`,
        paper.year || '',
        `"${paper.journal || ''}"`,
        paper.doi || '',
        paper.citationCount || 0,
        paper.relevanceScore,
        paper.overallScore,
        paper.researchCategory,
        `"${paper.methodology?.join('; ') || ''}"`,
        `"${paper.matchedKeywords.join('; ')}"`
      ];
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }

  /**
   * Get stored keyword sequences (placeholder)
   */
  private async getStoredSequences(sequenceIds: string[]): Promise<KeywordSequence[]> {
    // This would retrieve sequences from a storage system
    // For now, return empty array
    return [];
  }
}
