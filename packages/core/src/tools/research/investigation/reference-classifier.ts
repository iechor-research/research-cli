/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestigatedPaper } from './literature-investigator.js';
import { ResearchTopic } from './keyword-generator.js';

/**
 * Classification categories for research papers
 */
export enum ClassificationCategory {
  RESEARCH_TYPE = 'research_type',
  METHODOLOGY = 'methodology',
  DOMAIN = 'domain',
  TEMPORAL = 'temporal',
  IMPACT = 'impact',
  EVIDENCE_LEVEL = 'evidence_level',
  CONTRIBUTION_TYPE = 'contribution_type'
}

/**
 * Research type classifications
 */
export enum ResearchType {
  THEORETICAL = 'theoretical',
  EMPIRICAL = 'empirical',
  METHODOLOGICAL = 'methodological',
  APPLIED = 'applied',
  REVIEW = 'review',
  META_ANALYSIS = 'meta_analysis',
  CASE_STUDY = 'case_study',
  SURVEY = 'survey'
}

/**
 * Methodology classifications
 */
export enum MethodologyType {
  QUANTITATIVE = 'quantitative',
  QUALITATIVE = 'qualitative',
  MIXED_METHODS = 'mixed_methods',
  EXPERIMENTAL = 'experimental',
  OBSERVATIONAL = 'observational',
  COMPUTATIONAL = 'computational',
  SIMULATION = 'simulation',
  LONGITUDINAL = 'longitudinal',
  CROSS_SECTIONAL = 'cross_sectional'
}

/**
 * Evidence level classifications (based on medical research hierarchy)
 */
export enum EvidenceLevel {
  LEVEL_1 = 'systematic_review_meta_analysis',
  LEVEL_2 = 'randomized_controlled_trial',
  LEVEL_3 = 'controlled_trial',
  LEVEL_4 = 'case_control_cohort',
  LEVEL_5 = 'case_series_reports',
  LEVEL_6 = 'expert_opinion',
  LEVEL_7 = 'theoretical_framework'
}

/**
 * Contribution type classifications
 */
export enum ContributionType {
  NOVEL_THEORY = 'novel_theory',
  NOVEL_METHOD = 'novel_method',
  NOVEL_APPLICATION = 'novel_application',
  EMPIRICAL_VALIDATION = 'empirical_validation',
  COMPARATIVE_ANALYSIS = 'comparative_analysis',
  REPLICATION_STUDY = 'replication_study',
  EXTENSION_STUDY = 'extension_study',
  CRITIQUE_ANALYSIS = 'critique_analysis'
}

/**
 * Impact level classifications
 */
export enum ImpactLevel {
  FOUNDATIONAL = 'foundational',
  HIGH_IMPACT = 'high_impact',
  MODERATE_IMPACT = 'moderate_impact',
  EMERGING = 'emerging',
  NICHE = 'niche'
}

/**
 * Temporal classifications
 */
export enum TemporalCategory {
  HISTORICAL = 'historical',
  ESTABLISHED = 'established',
  RECENT = 'recent',
  CUTTING_EDGE = 'cutting_edge'
}

/**
 * Classification result for a paper
 */
export interface PaperClassification {
  paperId: string;
  classifications: {
    [ClassificationCategory.RESEARCH_TYPE]: ResearchType;
    [ClassificationCategory.METHODOLOGY]: MethodologyType[];
    [ClassificationCategory.EVIDENCE_LEVEL]: EvidenceLevel;
    [ClassificationCategory.CONTRIBUTION_TYPE]: ContributionType[];
    [ClassificationCategory.IMPACT]: ImpactLevel;
    [ClassificationCategory.TEMPORAL]: TemporalCategory;
    [ClassificationCategory.DOMAIN]: string[];
  };
  confidence: {
    [key in ClassificationCategory]: number;
  };
  reasoning: {
    [key in ClassificationCategory]: string;
  };
}

/**
 * Aggregated classification results for a set of papers
 */
export interface ClassificationSummary {
  totalPapers: number;
  distributionByType: { [key in ResearchType]: number };
  distributionByMethodology: { [key in MethodologyType]: number };
  distributionByEvidence: { [key in EvidenceLevel]: number };
  distributionByImpact: { [key in ImpactLevel]: number };
  distributionByTemporal: { [key in TemporalCategory]: number };
  domainClusters: DomainCluster[];
  methodologyTrends: MethodologyTrend[];
  gapAnalysis: ClassificationGap[];
}

/**
 * Domain cluster analysis
 */
export interface DomainCluster {
  name: string;
  papers: InvestigatedPaper[];
  keywords: string[];
  averageRelevance: number;
  representativePapers: InvestigatedPaper[];
}

/**
 * Methodology trend analysis
 */
export interface MethodologyTrend {
  methodology: MethodologyType;
  trend: 'increasing' | 'decreasing' | 'stable';
  timeframe: string;
  evidence: string;
  papers: InvestigatedPaper[];
}

/**
 * Classification gap analysis
 */
export interface ClassificationGap {
  category: ClassificationCategory;
  gap: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  suggestedSearchTerms: string[];
}

/**
 * Advanced reference classifier that categorizes papers across multiple dimensions
 */
export class ReferenceClassifier {
  private classificationRules: ClassificationRuleSet;
  private domainKnowledge: Map<string, DomainClassificationRules>;

  constructor() {
    this.classificationRules = new ClassificationRuleSet();
    this.domainKnowledge = new Map();
    this.initializeDomainKnowledge();
  }

  /**
   * Classify a single paper across all dimensions
   */
  async classifyPaper(paper: InvestigatedPaper): Promise<PaperClassification> {
    const classifications = {
      [ClassificationCategory.RESEARCH_TYPE]: this.classifyResearchType(paper),
      [ClassificationCategory.METHODOLOGY]: this.classifyMethodology(paper),
      [ClassificationCategory.EVIDENCE_LEVEL]: this.classifyEvidenceLevel(paper),
      [ClassificationCategory.CONTRIBUTION_TYPE]: this.classifyContributionType(paper),
      [ClassificationCategory.IMPACT]: this.classifyImpact(paper),
      [ClassificationCategory.TEMPORAL]: this.classifyTemporal(paper),
      [ClassificationCategory.DOMAIN]: this.classifyDomain(paper),
    };

    const confidence = this.calculateConfidence(paper, classifications);
    const reasoning = this.generateReasoning(paper, classifications);

    return {
      paperId: paper.id || paper.title,
      classifications,
      confidence,
      reasoning,
    };
  }

  /**
   * Classify multiple papers and generate summary
   */
  async classifyPapers(papers: InvestigatedPaper[]): Promise<{
    classifications: PaperClassification[];
    summary: ClassificationSummary;
  }> {
    const classifications = await Promise.all(
      papers.map(paper => this.classifyPaper(paper))
    );

    const summary = this.generateClassificationSummary(papers, classifications);

    return { classifications, summary };
  }

  /**
   * Classify research type
   */
  private classifyResearchType(paper: InvestigatedPaper): ResearchType {
    const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
    
    // Review indicators
    if (this.containsPatterns(text, [
      'systematic review', 'meta-analysis', 'literature review',
      'review of', 'survey of', 'overview of'
    ])) {
      if (text.includes('meta-analysis') || text.includes('meta analysis')) {
        return ResearchType.META_ANALYSIS;
      }
      return ResearchType.REVIEW;
    }

    // Theoretical indicators
    if (this.containsPatterns(text, [
      'theoretical framework', 'conceptual model', 'theory of',
      'theoretical analysis', 'mathematical model', 'formal model'
    ])) {
      return ResearchType.THEORETICAL;
    }

    // Methodological indicators
    if (this.containsPatterns(text, [
      'new method', 'novel approach', 'methodology for',
      'algorithm for', 'technique for', 'framework for'
    ])) {
      return ResearchType.METHODOLOGICAL;
    }

    // Applied indicators
    if (this.containsPatterns(text, [
      'application of', 'implementation of', 'case study',
      'real-world', 'practical', 'industrial application'
    ])) {
      if (text.includes('case study')) {
        return ResearchType.CASE_STUDY;
      }
      return ResearchType.APPLIED;
    }

    // Survey indicators
    if (this.containsPatterns(text, [
      'survey study', 'questionnaire', 'interview study',
      'survey of', 'cross-sectional survey'
    ])) {
      return ResearchType.SURVEY;
    }

    // Default to empirical if contains experimental indicators
    if (this.containsPatterns(text, [
      'experiment', 'study', 'analysis', 'investigation',
      'evaluation', 'assessment', 'measurement'
    ])) {
      return ResearchType.EMPIRICAL;
    }

    return ResearchType.EMPIRICAL; // Default
  }

  /**
   * Classify methodology
   */
  private classifyMethodology(paper: InvestigatedPaper): MethodologyType[] {
    const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
    const methodologies: MethodologyType[] = [];

    // Quantitative indicators
    if (this.containsPatterns(text, [
      'statistical', 'numerical', 'quantitative', 'measurement',
      'survey', 'questionnaire', 'regression', 'correlation'
    ])) {
      methodologies.push(MethodologyType.QUANTITATIVE);
    }

    // Qualitative indicators
    if (this.containsPatterns(text, [
      'qualitative', 'interview', 'ethnography', 'case study',
      'content analysis', 'thematic analysis', 'grounded theory'
    ])) {
      methodologies.push(MethodologyType.QUALITATIVE);
    }

    // Mixed methods
    if (methodologies.includes(MethodologyType.QUANTITATIVE) && 
        methodologies.includes(MethodologyType.QUALITATIVE)) {
      methodologies.push(MethodologyType.MIXED_METHODS);
    }

    // Experimental indicators
    if (this.containsPatterns(text, [
      'experiment', 'controlled trial', 'randomized', 'control group',
      'treatment group', 'intervention', 'rct'
    ])) {
      methodologies.push(MethodologyType.EXPERIMENTAL);
    }

    // Observational indicators
    if (this.containsPatterns(text, [
      'observational', 'cohort', 'longitudinal', 'cross-sectional',
      'prospective', 'retrospective', 'natural experiment'
    ])) {
      methodologies.push(MethodologyType.OBSERVATIONAL);
      
      if (text.includes('longitudinal') || text.includes('cohort')) {
        methodologies.push(MethodologyType.LONGITUDINAL);
      }
      if (text.includes('cross-sectional')) {
        methodologies.push(MethodologyType.CROSS_SECTIONAL);
      }
    }

    // Computational indicators
    if (this.containsPatterns(text, [
      'computational', 'simulation', 'modeling', 'algorithm',
      'machine learning', 'artificial intelligence', 'data mining'
    ])) {
      methodologies.push(MethodologyType.COMPUTATIONAL);
      
      if (text.includes('simulation') || text.includes('monte carlo')) {
        methodologies.push(MethodologyType.SIMULATION);
      }
    }

    return methodologies.length > 0 ? methodologies : [MethodologyType.QUANTITATIVE];
  }

  /**
   * Classify evidence level
   */
  private classifyEvidenceLevel(paper: InvestigatedPaper): EvidenceLevel {
    const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase();

    // Level 1: Systematic reviews and meta-analyses
    if (this.containsPatterns(text, [
      'systematic review', 'meta-analysis', 'cochrane review'
    ])) {
      return EvidenceLevel.LEVEL_1;
    }

    // Level 2: Randomized controlled trials
    if (this.containsPatterns(text, [
      'randomized controlled trial', 'rct', 'randomized trial',
      'double-blind', 'placebo-controlled'
    ])) {
      return EvidenceLevel.LEVEL_2;
    }

    // Level 3: Controlled trials without randomization
    if (this.containsPatterns(text, [
      'controlled trial', 'quasi-experimental', 'controlled study',
      'intervention study'
    ])) {
      return EvidenceLevel.LEVEL_3;
    }

    // Level 4: Case-control and cohort studies
    if (this.containsPatterns(text, [
      'case-control', 'cohort study', 'longitudinal study',
      'prospective study', 'retrospective study'
    ])) {
      return EvidenceLevel.LEVEL_4;
    }

    // Level 5: Case series and case reports
    if (this.containsPatterns(text, [
      'case series', 'case report', 'case study',
      'descriptive study', 'cross-sectional'
    ])) {
      return EvidenceLevel.LEVEL_5;
    }

    // Level 6: Expert opinion
    if (this.containsPatterns(text, [
      'expert opinion', 'consensus', 'guideline',
      'recommendation', 'position paper'
    ])) {
      return EvidenceLevel.LEVEL_6;
    }

    // Level 7: Theoretical frameworks
    if (this.containsPatterns(text, [
      'theoretical', 'conceptual', 'framework',
      'model', 'theory'
    ])) {
      return EvidenceLevel.LEVEL_7;
    }

    return EvidenceLevel.LEVEL_5; // Default to case series level
  }

  /**
   * Classify contribution type
   */
  private classifyContributionType(paper: InvestigatedPaper): ContributionType[] {
    const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
    const contributions: ContributionType[] = [];

    // Novel theory
    if (this.containsPatterns(text, [
      'new theory', 'novel theory', 'theoretical framework',
      'conceptual model', 'new model'
    ])) {
      contributions.push(ContributionType.NOVEL_THEORY);
    }

    // Novel method
    if (this.containsPatterns(text, [
      'new method', 'novel method', 'new approach',
      'novel approach', 'new algorithm', 'new technique'
    ])) {
      contributions.push(ContributionType.NOVEL_METHOD);
    }

    // Novel application
    if (this.containsPatterns(text, [
      'new application', 'novel application', 'first application',
      'applying', 'implementation'
    ])) {
      contributions.push(ContributionType.NOVEL_APPLICATION);
    }

    // Empirical validation
    if (this.containsPatterns(text, [
      'validation', 'verification', 'empirical study',
      'experimental validation', 'testing'
    ])) {
      contributions.push(ContributionType.EMPIRICAL_VALIDATION);
    }

    // Comparative analysis
    if (this.containsPatterns(text, [
      'comparison', 'comparative', 'versus', 'vs',
      'benchmark', 'evaluation'
    ])) {
      contributions.push(ContributionType.COMPARATIVE_ANALYSIS);
    }

    // Replication study
    if (this.containsPatterns(text, [
      'replication', 'reproduction', 'replicate',
      'reproduce', 'replicating'
    ])) {
      contributions.push(ContributionType.REPLICATION_STUDY);
    }

    // Extension study
    if (this.containsPatterns(text, [
      'extension', 'extending', 'building on',
      'based on', 'improvement'
    ])) {
      contributions.push(ContributionType.EXTENSION_STUDY);
    }

    // Critique analysis
    if (this.containsPatterns(text, [
      'critique', 'criticism', 'limitations',
      'problems with', 'issues with'
    ])) {
      contributions.push(ContributionType.CRITIQUE_ANALYSIS);
    }

    return contributions.length > 0 ? contributions : [ContributionType.EMPIRICAL_VALIDATION];
  }

  /**
   * Classify impact level
   */
  private classifyImpact(paper: InvestigatedPaper): ImpactLevel {
    const citations = paper.citationCount || 0;
    const yearsOld = new Date().getFullYear() - (paper.year || new Date().getFullYear());
    const citationsPerYear = yearsOld > 0 ? citations / yearsOld : citations;

    // Foundational papers (high citations, older papers)
    if (citations > 500 || (citationsPerYear > 50 && yearsOld > 5)) {
      return ImpactLevel.FOUNDATIONAL;
    }

    // High impact papers
    if (citations > 100 || citationsPerYear > 20) {
      return ImpactLevel.HIGH_IMPACT;
    }

    // Moderate impact papers
    if (citations > 20 || citationsPerYear > 5) {
      return ImpactLevel.MODERATE_IMPACT;
    }

    // Emerging papers (recent with some citations)
    if (yearsOld <= 3 && citations > 0) {
      return ImpactLevel.EMERGING;
    }

    // Niche papers
    return ImpactLevel.NICHE;
  }

  /**
   * Classify temporal category
   */
  private classifyTemporal(paper: InvestigatedPaper): TemporalCategory {
    const currentYear = new Date().getFullYear();
    const paperYear = paper.year || currentYear;
    const yearsOld = currentYear - paperYear;

    if (yearsOld <= 2) {
      return TemporalCategory.CUTTING_EDGE;
    } else if (yearsOld <= 5) {
      return TemporalCategory.RECENT;
    } else if (yearsOld <= 15) {
      return TemporalCategory.ESTABLISHED;
    } else {
      return TemporalCategory.HISTORICAL;
    }
  }

  /**
   * Classify domain
   */
  private classifyDomain(paper: InvestigatedPaper): string[] {
    const text = `${paper.title} ${paper.abstract || ''} ${paper.keywords?.join(' ') || ''}`.toLowerCase();
    const domains: string[] = [];

    // Use domain knowledge for classification
    for (const [domain, rules] of this.domainKnowledge) {
      if (rules.matches(text)) {
        domains.push(domain);
      }
    }

    return domains.length > 0 ? domains : ['general'];
  }

  /**
   * Calculate confidence scores for classifications
   */
  private calculateConfidence(
    paper: InvestigatedPaper,
    classifications: PaperClassification['classifications']
  ): PaperClassification['confidence'] {
    const text = `${paper.title} ${paper.abstract || ''}`;
    const textLength = text.length;
    
    // Base confidence on text length and quality
    const baseConfidence = Math.min(0.9, textLength / 1000);
    
    return {
      [ClassificationCategory.RESEARCH_TYPE]: Math.max(0.6, baseConfidence),
      [ClassificationCategory.METHODOLOGY]: Math.max(0.7, baseConfidence),
      [ClassificationCategory.EVIDENCE_LEVEL]: Math.max(0.6, baseConfidence),
      [ClassificationCategory.CONTRIBUTION_TYPE]: Math.max(0.5, baseConfidence),
      [ClassificationCategory.IMPACT]: paper.citationCount ? 0.9 : 0.6,
      [ClassificationCategory.TEMPORAL]: paper.year ? 1.0 : 0.3,
      [ClassificationCategory.DOMAIN]: Math.max(0.7, baseConfidence),
    };
  }

  /**
   * Generate reasoning for classifications
   */
  private generateReasoning(
    paper: InvestigatedPaper,
    classifications: PaperClassification['classifications']
  ): PaperClassification['reasoning'] {
    const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
    
    return {
      [ClassificationCategory.RESEARCH_TYPE]: this.getResearchTypeReasoning(text, classifications.research_type),
      [ClassificationCategory.METHODOLOGY]: this.getMethodologyReasoning(text, classifications.methodology),
      [ClassificationCategory.EVIDENCE_LEVEL]: this.getEvidenceReasoning(text, classifications.evidence_level),
      [ClassificationCategory.CONTRIBUTION_TYPE]: this.getContributionReasoning(text, classifications.contribution_type),
      [ClassificationCategory.IMPACT]: this.getImpactReasoning(paper, classifications.impact),
      [ClassificationCategory.TEMPORAL]: this.getTemporalReasoning(paper, classifications.temporal),
      [ClassificationCategory.DOMAIN]: this.getDomainReasoning(text, classifications.domain),
    };
  }

  /**
   * Generate classification summary
   */
  private generateClassificationSummary(
    papers: InvestigatedPaper[],
    classifications: PaperClassification[]
  ): ClassificationSummary {
    const summary: ClassificationSummary = {
      totalPapers: papers.length,
      distributionByType: this.calculateTypeDistribution(classifications),
      distributionByMethodology: this.calculateMethodologyDistribution(classifications),
      distributionByEvidence: this.calculateEvidenceDistribution(classifications),
      distributionByImpact: this.calculateImpactDistribution(classifications),
      distributionByTemporal: this.calculateTemporalDistribution(classifications),
      domainClusters: this.generateDomainClusters(papers, classifications),
      methodologyTrends: this.analyzeMethodologyTrends(papers, classifications),
      gapAnalysis: this.performGapAnalysis(classifications),
    };

    return summary;
  }

  /**
   * Helper method to check if text contains any of the patterns
   */
  private containsPatterns(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  /**
   * Calculate research type distribution
   */
  private calculateTypeDistribution(classifications: PaperClassification[]): { [key in ResearchType]: number } {
    const distribution = Object.values(ResearchType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as { [key in ResearchType]: number });

    classifications.forEach(c => {
      distribution[c.classifications.research_type]++;
    });

    return distribution;
  }

  /**
   * Calculate methodology distribution
   */
  private calculateMethodologyDistribution(classifications: PaperClassification[]): { [key in MethodologyType]: number } {
    const distribution = Object.values(MethodologyType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as { [key in MethodologyType]: number });

    classifications.forEach(c => {
      c.classifications.methodology.forEach(method => {
        distribution[method]++;
      });
    });

    return distribution;
  }

  /**
   * Calculate evidence level distribution
   */
  private calculateEvidenceDistribution(classifications: PaperClassification[]): { [key in EvidenceLevel]: number } {
    const distribution = Object.values(EvidenceLevel).reduce((acc, level) => {
      acc[level] = 0;
      return acc;
    }, {} as { [key in EvidenceLevel]: number });

    classifications.forEach(c => {
      distribution[c.classifications.evidence_level]++;
    });

    return distribution;
  }

  /**
   * Calculate impact distribution
   */
  private calculateImpactDistribution(classifications: PaperClassification[]): { [key in ImpactLevel]: number } {
    const distribution = Object.values(ImpactLevel).reduce((acc, level) => {
      acc[level] = 0;
      return acc;
    }, {} as { [key in ImpactLevel]: number });

    classifications.forEach(c => {
      distribution[c.classifications.impact]++;
    });

    return distribution;
  }

  /**
   * Calculate temporal distribution
   */
  private calculateTemporalDistribution(classifications: PaperClassification[]): { [key in TemporalCategory]: number } {
    const distribution = Object.values(TemporalCategory).reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as { [key in TemporalCategory]: number });

    classifications.forEach(c => {
      distribution[c.classifications.temporal]++;
    });

    return distribution;
  }

  /**
   * Generate domain clusters
   */
  private generateDomainClusters(
    papers: InvestigatedPaper[],
    classifications: PaperClassification[]
  ): DomainCluster[] {
    const domainMap = new Map<string, InvestigatedPaper[]>();

    classifications.forEach((c, index) => {
      c.classifications.domain.forEach(domain => {
        if (!domainMap.has(domain)) {
          domainMap.set(domain, []);
        }
        domainMap.get(domain)!.push(papers[index]);
      });
    });

    return Array.from(domainMap.entries()).map(([domain, domainPapers]) => {
      const keywords = this.extractDomainKeywords(domainPapers);
      const averageRelevance = domainPapers.reduce((sum, p) => sum + p.relevanceScore, 0) / domainPapers.length;
      const representativePapers = domainPapers
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 3);

      return {
        name: domain,
        papers: domainPapers,
        keywords,
        averageRelevance,
        representativePapers,
      };
    });
  }

  /**
   * Analyze methodology trends
   */
  private analyzeMethodologyTrends(
    papers: InvestigatedPaper[],
    classifications: PaperClassification[]
  ): MethodologyTrend[] {
    const trends: MethodologyTrend[] = [];
    const currentYear = new Date().getFullYear();
    
    Object.values(MethodologyType).forEach(methodology => {
      const methodPapers = papers.filter((_, index) => 
        classifications[index].classifications.methodology.includes(methodology)
      );

      if (methodPapers.length >= 3) {
        const recentPapers = methodPapers.filter(p => p.year && p.year >= currentYear - 3);
        const olderPapers = methodPapers.filter(p => p.year && p.year < currentYear - 3);
        
        const recentRatio = recentPapers.length / methodPapers.length;
        const olderRatio = olderPapers.length / methodPapers.length;
        
        let trend: 'increasing' | 'decreasing' | 'stable';
        if (recentRatio > 0.6) {
          trend = 'increasing';
        } else if (recentRatio < 0.3) {
          trend = 'decreasing';
        } else {
          trend = 'stable';
        }

        trends.push({
          methodology,
          trend,
          timeframe: `${currentYear - 5}-${currentYear}`,
          evidence: `${recentPapers.length} recent papers, ${olderPapers.length} older papers`,
          papers: methodPapers.slice(0, 5),
        });
      }
    });

    return trends;
  }

  /**
   * Perform gap analysis
   */
  private performGapAnalysis(classifications: PaperClassification[]): ClassificationGap[] {
    const gaps: ClassificationGap[] = [];
    
    // Check for methodology gaps
    const methodCounts = this.calculateMethodologyDistribution(classifications);
    const totalPapers = classifications.length;
    
    Object.entries(methodCounts).forEach(([method, count]) => {
      const percentage = (count / totalPapers) * 100;
      if (percentage < 10 && count < 3) {
        gaps.push({
          category: ClassificationCategory.METHODOLOGY,
          gap: `Limited ${method} research`,
          impact: 'medium' as const,
          recommendation: `Consider conducting more ${method} studies`,
          suggestedSearchTerms: [method, 'methodology', 'approach'],
        });
      }
    });

    // Check for evidence level gaps
    const evidenceCounts = this.calculateEvidenceDistribution(classifications);
    if (evidenceCounts[EvidenceLevel.LEVEL_1] === 0 && evidenceCounts[EvidenceLevel.LEVEL_2] < 2) {
      gaps.push({
        category: ClassificationCategory.EVIDENCE_LEVEL,
        gap: 'Lack of high-quality evidence',
        impact: 'high' as const,
        recommendation: 'Systematic reviews and RCTs needed',
        suggestedSearchTerms: ['systematic review', 'meta-analysis', 'RCT'],
      });
    }

    return gaps.slice(0, 5);
  }

  /**
   * Extract domain keywords
   */
  private extractDomainKeywords(papers: InvestigatedPaper[]): string[] {
    const keywordMap = new Map<string, number>();
    
    papers.forEach(paper => {
      paper.matchedKeywords.forEach(keyword => {
        keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
      });
    });

    return Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  /**
   * Get research type reasoning
   */
  private getResearchTypeReasoning(text: string, type: ResearchType): string {
    const indicators = {
      [ResearchType.THEORETICAL]: ['theoretical', 'model', 'framework'],
      [ResearchType.EMPIRICAL]: ['study', 'analysis', 'experiment'],
      [ResearchType.METHODOLOGICAL]: ['method', 'approach', 'technique'],
      [ResearchType.APPLIED]: ['application', 'implementation', 'practical'],
      [ResearchType.REVIEW]: ['review', 'survey', 'overview'],
      [ResearchType.META_ANALYSIS]: ['meta-analysis', 'systematic review'],
      [ResearchType.CASE_STUDY]: ['case study', 'case report'],
      [ResearchType.SURVEY]: ['survey', 'questionnaire', 'interview']
    };

    const typeIndicators = indicators[type] || [];
    const foundIndicators = typeIndicators.filter(indicator => text.includes(indicator));
    
    return `Classified as ${type} based on indicators: ${foundIndicators.join(', ')}`;
  }

  /**
   * Get methodology reasoning
   */
  private getMethodologyReasoning(text: string, methodologies: MethodologyType[]): string {
    return `Identified methodologies: ${methodologies.join(', ')} based on text analysis`;
  }

  /**
   * Get evidence level reasoning
   */
  private getEvidenceReasoning(text: string, level: EvidenceLevel): string {
    return `Evidence level ${level} determined by study design indicators`;
  }

  /**
   * Get contribution reasoning
   */
  private getContributionReasoning(text: string, contributions: ContributionType[]): string {
    return `Contribution types: ${contributions.join(', ')} based on content analysis`;
  }

  /**
   * Get impact reasoning
   */
  private getImpactReasoning(paper: InvestigatedPaper, impact: ImpactLevel): string {
    const citations = paper.citationCount || 0;
    const years = new Date().getFullYear() - (paper.year || new Date().getFullYear());
    return `Impact level ${impact} based on ${citations} citations over ${years} years`;
  }

  /**
   * Get temporal reasoning
   */
  private getTemporalReasoning(paper: InvestigatedPaper, temporal: TemporalCategory): string {
    const years = new Date().getFullYear() - (paper.year || new Date().getFullYear());
    return `Temporal category ${temporal} based on publication ${years} years ago`;
  }

  /**
   * Get domain reasoning
   */
  private getDomainReasoning(text: string, domains: string[]): string {
    return `Domains ${domains.join(', ')} identified through keyword and content analysis`;
  }

  /**
   * Initialize domain knowledge
   */
  private initializeDomainKnowledge(): void {
    this.domainKnowledge.set('computer_science', new ComputerScienceDomainRules());
    this.domainKnowledge.set('machine_learning', new MachineLearningDomainRules());
    this.domainKnowledge.set('artificial_intelligence', new AIDomainRules());
    this.domainKnowledge.set('biology', new BiologyDomainRules());
    this.domainKnowledge.set('medicine', new MedicineDomainRules());
    this.domainKnowledge.set('physics', new PhysicsDomainRules());
    this.domainKnowledge.set('chemistry', new ChemistryDomainRules());
    this.domainKnowledge.set('psychology', new PsychologyDomainRules());
    this.domainKnowledge.set('economics', new EconomicsDomainRules());
  }
}

/**
 * Base classification rule set
 */
class ClassificationRuleSet {
  // Implementation of classification rules would go here
}

/**
 * Base domain classification rules
 */
abstract class DomainClassificationRules {
  abstract matches(text: string): boolean;
}

/**
 * Computer Science domain rules
 */
class ComputerScienceDomainRules extends DomainClassificationRules {
  matches(text: string): boolean {
    return this.containsAny(text, [
      'computer science', 'algorithm', 'data structure', 'programming',
      'software', 'computing', 'computational', 'database', 'network'
    ]);
  }

  private containsAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term));
  }
}

/**
 * Machine Learning domain rules
 */
class MachineLearningDomainRules extends DomainClassificationRules {
  matches(text: string): boolean {
    return this.containsAny(text, [
      'machine learning', 'deep learning', 'neural network', 'supervised learning',
      'unsupervised learning', 'reinforcement learning', 'classification', 'regression'
    ]);
  }

  private containsAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term));
  }
}

/**
 * AI domain rules
 */
class AIDomainRules extends DomainClassificationRules {
  matches(text: string): boolean {
    return this.containsAny(text, [
      'artificial intelligence', 'ai', 'expert system', 'natural language processing',
      'computer vision', 'robotics', 'cognitive computing'
    ]);
  }

  private containsAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term));
  }
}

/**
 * Biology domain rules
 */
class BiologyDomainRules extends DomainClassificationRules {
  matches(text: string): boolean {
    return this.containsAny(text, [
      'biology', 'molecular biology', 'cell biology', 'genetics', 'genomics',
      'proteomics', 'bioinformatics', 'ecology', 'evolution'
    ]);
  }

  private containsAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term));
  }
}

/**
 * Medicine domain rules
 */
class MedicineDomainRules extends DomainClassificationRules {
  matches(text: string): boolean {
    return this.containsAny(text, [
      'medicine', 'medical', 'clinical', 'patient', 'treatment', 'therapy',
      'diagnosis', 'disease', 'health', 'pharmaceutical'
    ]);
  }

  private containsAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term));
  }
}

/**
 * Physics domain rules
 */
class PhysicsDomainRules extends DomainClassificationRules {
  matches(text: string): boolean {
    return this.containsAny(text, [
      'physics', 'quantum', 'particle', 'thermodynamics', 'mechanics',
      'electromagnetism', 'optics', 'atomic', 'nuclear'
    ]);
  }

  private containsAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term));
  }
}

/**
 * Chemistry domain rules
 */
class ChemistryDomainRules extends DomainClassificationRules {
  matches(text: string): boolean {
    return this.containsAny(text, [
      'chemistry', 'chemical', 'organic chemistry', 'inorganic chemistry',
      'biochemistry', 'reaction', 'synthesis', 'catalyst', 'molecule'
    ]);
  }

  private containsAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term));
  }
}

/**
 * Psychology domain rules
 */
class PsychologyDomainRules extends DomainClassificationRules {
  matches(text: string): boolean {
    return this.containsAny(text, [
      'psychology', 'psychological', 'cognitive', 'behavioral', 'mental health',
      'psychotherapy', 'personality', 'emotion', 'perception'
    ]);
  }

  private containsAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term));
  }
}

/**
 * Economics domain rules
 */
class EconomicsDomainRules extends DomainClassificationRules {
  matches(text: string): boolean {
    return this.containsAny(text, [
      'economics', 'economic', 'market', 'finance', 'financial', 'monetary',
      'fiscal', 'trade', 'investment', 'econometrics'
    ]);
  }

  private containsAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term));
  }
}
