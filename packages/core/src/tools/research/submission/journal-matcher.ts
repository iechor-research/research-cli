/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseResearchTool } from '../base-tool.js';
import {
  ResearchToolParams,
  ResearchField,
  CitationStyle,
  ResearchToolCategory
} from '../types.js';

/**
 * 期刊匹配参数接口
 */
export interface JournalMatcherParams extends ResearchToolParams {
  action: 'match' | 'search' | 'compare' | 'analyze' | 'recommend';
  
  // 论文信息
  title?: string;
  abstract?: string;
  keywords?: string[];
  researchField?: ResearchField;
  paperType?: 'research' | 'review' | 'survey' | 'case_study' | 'short_paper';
  
  // 筛选条件
  impactFactorRange?: {
    min?: number;
    max?: number;
  };
  quartile?: ('Q1' | 'Q2' | 'Q3' | 'Q4')[];
  openAccess?: boolean;
  publisher?: string[];
  language?: string[];
  
  // 期刊列表（用于比较）
  journalNames?: string[];
  journalIds?: string[];
  
  // 排序和限制
  sortBy?: 'relevance' | 'impact_factor' | 'acceptance_rate' | 'review_time';
  sortOrder?: 'asc' | 'desc';
  maxResults?: number;
  
  // 分析选项
  includeRequirements?: boolean;
  includeSimilarJournals?: boolean;
  includeEditorialBoard?: boolean;
}

/**
 * 期刊信息接口
 */
export interface JournalInfo {
  id: string;
  name: string;
  abbreviation?: string;
  issn?: string;
  eIssn?: string;
  
  // 期刊指标
  impactFactor?: number;
  fiveYearImpactFactor?: number;
  citationScore?: number;
  hIndex?: number;
  quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  jcrRank?: number;
  jcrCategory?: string;
  
  // 出版信息
  publisher: string;
  frequency?: string; // 'monthly', 'quarterly', etc.
  language: string[];
  country?: string;
  
  // 内容和范围
  scope: string;
  researchFields: ResearchField[];
  subjects: string[];
  keywords: string[];
  
  // 投稿信息
  acceptanceRate?: number;
  averageReviewTime?: number; // days
  publicationFee?: number;
  openAccess: boolean;
  hybridOA?: boolean;
  
  // 格式要求
  citationStyle: CitationStyle;
  wordLimit?: number;
  pageLimit?: number;
  figureLimit?: number;
  formatRequirements: string[];
  
  // 联系信息
  website?: string;
  submissionSystem?: string;
  editorInChief?: string;
  editorialBoard?: string[];
  
  // 其他信息
  founded?: number;
  indexedIn: string[]; // ['SCI', 'Scopus', 'PubMed', etc.]
  specialIssues?: string[];
  recentTopics?: string[];
}

/**
 * 期刊匹配结果
 */
export interface JournalMatchResult {
  journal: JournalInfo;
  matchScore: number;
  relevanceScore: number;
  qualityScore: number;
  feasibilityScore: number;
  
  // 详细评分
  scores: {
    titleMatch: number;
    abstractMatch: number;
    keywordMatch: number;
    fieldMatch: number;
    scopeMatch: number;
    impactAlignment: number;
    requirementFit: number;
  };
  
  // 匹配原因
  matchReasons: string[];
  concerns: string[];
  recommendations: string[];
}

/**
 * 期刊匹配器结果
 */
export interface JournalMatcherResult {
  action: string;
  
  // 匹配结果
  matches?: JournalMatchResult[];
  totalFound?: number;
  
  // 搜索结果
  journals?: JournalInfo[];
  
  // 比较结果
  comparison?: {
    journals: JournalInfo[];
    similarities: string[];
    differences: string[];
    recommendations: string[];
  };
  
  // 分析结果
  analysis?: {
    fieldDistribution: Record<string, number>;
    impactFactorStats: {
      mean: number;
      median: number;
      min: number;
      max: number;
    };
    publisherStats: Record<string, number>;
    recommendations: string[];
  };
}

/**
 * 期刊匹配器工具
 * 提供智能期刊推荐、搜索、比较和分析功能
 */
export class JournalMatcher extends BaseResearchTool<JournalMatcherParams, JournalMatcherResult> {
  private journalDatabase: JournalInfo[] = [];
  
  constructor() {
    super(
      'match_journal',
      'Intelligent journal matching and recommendation system',
      ResearchToolCategory.SUBMISSION
    );
    
    // 初始化期刊数据库
    this.initializeJournalDatabase();
  }

  public validate(params: ResearchToolParams): boolean {
    const matcherParams = params as JournalMatcherParams;
    
    if (!matcherParams.action) {
      return false;
    }

    // 根据不同操作验证必需参数
    switch (matcherParams.action) {
      case 'match':
      case 'recommend':
        return !!(matcherParams.title || matcherParams.abstract || matcherParams.keywords);
      case 'search':
        return true; // 搜索可以不需要特定参数
      case 'compare':
        return !!(matcherParams.journalNames?.length || matcherParams.journalIds?.length);
      case 'analyze':
        return true;
      default:
        return true; // 其他操作通过验证，在执行时处理错误
    }
  }

  public getHelp(): string {
    return this.formatHelp(
      'Intelligent journal matching and recommendation system for academic publishing',
      [
        { name: 'action', type: 'string', required: true, description: 'Action to perform (match, search, compare, analyze, recommend)' },
        { name: 'title', type: 'string', required: false, description: 'Paper title for matching' },
        { name: 'abstract', type: 'string', required: false, description: 'Paper abstract for content analysis' },
        { name: 'keywords', type: 'string[]', required: false, description: 'Research keywords' },
        { name: 'researchField', type: 'ResearchField', required: false, description: 'Primary research field' },
        { name: 'paperType', type: 'string', required: false, description: 'Type of paper (research, review, survey, etc.)' },
        { name: 'impactFactorRange', type: 'object', required: false, description: 'Desired impact factor range {min, max}' },
        { name: 'quartile', type: 'string[]', required: false, description: 'JCR quartiles (Q1, Q2, Q3, Q4)' },
        { name: 'openAccess', type: 'boolean', required: false, description: 'Prefer open access journals' },
        { name: 'publisher', type: 'string[]', required: false, description: 'Preferred publishers' },
        { name: 'journalNames', type: 'string[]', required: false, description: 'Journal names for comparison' },
        { name: 'sortBy', type: 'string', required: false, description: 'Sort criteria (relevance, impact_factor, acceptance_rate, review_time)' },
        { name: 'maxResults', type: 'number', required: false, description: 'Maximum number of results' }
      ],
      [
        {
          description: 'Find matching journals for a machine learning paper',
          params: {
            action: 'match',
            title: 'Deep Learning for Computer Vision Applications',
            keywords: ['deep learning', 'computer vision', 'neural networks'],
            researchField: 'computer_science',
            impactFactorRange: { min: 2.0, max: 8.0 },
            quartile: ['Q1', 'Q2'],
            maxResults: 10
          }
        },
        {
          description: 'Compare IEEE and ACM journals',
          params: {
            action: 'compare',
            journalNames: ['IEEE Transactions on Pattern Analysis and Machine Intelligence', 'ACM Computing Surveys'],
            includeRequirements: true
          }
        },
        {
          description: 'Search for open access computer science journals',
          params: {
            action: 'search',
            researchField: 'computer_science',
            openAccess: true,
            quartile: ['Q1'],
            sortBy: 'impact_factor',
            sortOrder: 'desc'
          }
        }
      ]
    );
  }

  protected async executeImpl(params: JournalMatcherParams): Promise<JournalMatcherResult> {
    switch (params.action) {
      case 'match':
      case 'recommend':
        return this.matchJournals(params);
      case 'search':
        return this.searchJournals(params);
      case 'compare':
        return this.compareJournals(params);
      case 'analyze':
        return this.analyzeJournals(params);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  /**
   * 智能期刊匹配
   */
  private async matchJournals(params: JournalMatcherParams): Promise<JournalMatcherResult> {
    // 预过滤期刊
    let candidateJournals = this.filterJournals(params);
    
    // 计算匹配分数
    const matches: JournalMatchResult[] = [];
    
    for (const journal of candidateJournals) {
      const matchResult = this.calculateMatchScore(params, journal);
      matches.push(matchResult);
    }
    
    // 排序结果
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    // 限制结果数量
    const maxResults = params.maxResults || 20;
    const topMatches = matches.slice(0, maxResults);
    
    return {
      action: params.action,
      matches: topMatches,
      totalFound: matches.length
    };
  }

  /**
   * 搜索期刊
   */
  private async searchJournals(params: JournalMatcherParams): Promise<JournalMatcherResult> {
    let journals = this.filterJournals(params);
    
    // 排序
    journals = this.sortJournals(journals, params.sortBy || 'relevance', params.sortOrder || 'desc');
    
    // 限制结果数量
    const maxResults = params.maxResults || 50;
    journals = journals.slice(0, maxResults);
    
    return {
      action: 'search',
      journals,
      totalFound: journals.length
    };
  }

  /**
   * 比较期刊
   */
  private async compareJournals(params: JournalMatcherParams): Promise<JournalMatcherResult> {
    const journalsToCompare: JournalInfo[] = [];
    
    // 根据名称或ID查找期刊
    if (params.journalNames) {
      for (const name of params.journalNames) {
        const journal = this.journalDatabase.find(j => 
          j.name.toLowerCase().includes(name.toLowerCase()) ||
          j.abbreviation?.toLowerCase() === name.toLowerCase()
        );
        if (journal) {
          journalsToCompare.push(journal);
        }
      }
    }
    
    if (params.journalIds) {
      for (const id of params.journalIds) {
        const journal = this.journalDatabase.find(j => j.id === id);
        if (journal) {
          journalsToCompare.push(journal);
        }
      }
    }
    
    if (journalsToCompare.length < 2) {
      throw new Error('At least 2 journals are required for comparison');
    }
    
    // 分析相似性和差异
    const similarities = this.findSimilarities(journalsToCompare);
    const differences = this.findDifferences(journalsToCompare);
    const recommendations = this.generateComparisonRecommendations(journalsToCompare);
    
    return {
      action: 'compare',
      comparison: {
        journals: journalsToCompare,
        similarities,
        differences,
        recommendations
      }
    };
  }

  /**
   * 分析期刊数据库
   */
  private async analyzeJournals(params: JournalMatcherParams): Promise<JournalMatcherResult> {
    const journals = this.filterJournals(params);
    
    // 研究领域分布
    const fieldDistribution: Record<string, number> = {};
    for (const journal of journals) {
      for (const field of journal.researchFields) {
        fieldDistribution[field] = (fieldDistribution[field] || 0) + 1;
      }
    }
    
    // 影响因子统计
    const impactFactors = journals
      .map(j => j.impactFactor)
      .filter(impactFactor => impactFactor !== undefined) as number[];
    
    const impactFactorStats = {
      mean: impactFactors.reduce((a, b) => a + b, 0) / impactFactors.length,
      median: this.calculateMedian(impactFactors),
      min: Math.min(...impactFactors),
      max: Math.max(...impactFactors)
    };
    
    // 出版商统计
    const publisherStats: Record<string, number> = {};
    for (const journal of journals) {
      publisherStats[journal.publisher] = (publisherStats[journal.publisher] || 0) + 1;
    }
    
    const recommendations = this.generateAnalysisRecommendations(journals, params);
    
    return {
      action: 'analyze',
      analysis: {
        fieldDistribution,
        impactFactorStats,
        publisherStats,
        recommendations
      }
    };
  }

  /**
   * 计算匹配分数
   */
  private calculateMatchScore(params: JournalMatcherParams, journal: JournalInfo): JournalMatchResult {
    const scores = {
      titleMatch: this.calculateTitleMatch(params.title, journal),
      abstractMatch: this.calculateAbstractMatch(params.abstract, journal),
      keywordMatch: this.calculateKeywordMatch(params.keywords, journal),
      fieldMatch: this.calculateFieldMatch(params.researchField, journal),
      scopeMatch: this.calculateScopeMatch(params, journal),
      impactAlignment: this.calculateImpactAlignment(params, journal),
      requirementFit: this.calculateRequirementFit(params, journal)
    };
    
    // 计算综合分数（加权平均）
    const weights = {
      titleMatch: 0.15,
      abstractMatch: 0.20,
      keywordMatch: 0.20,
      fieldMatch: 0.15,
      scopeMatch: 0.10,
      impactAlignment: 0.10,
      requirementFit: 0.10
    };
    
    const matchScore = Object.entries(scores).reduce((total, [key, score]) => {
      return total + score * weights[key as keyof typeof weights];
    }, 0);
    
    const relevanceScore = (scores.titleMatch + scores.abstractMatch + scores.keywordMatch) / 3;
    const qualityScore = scores.impactAlignment;
    const feasibilityScore = (scores.requirementFit + scores.scopeMatch) / 2;
    
    // 生成匹配原因和建议
    const matchReasons = this.generateMatchReasons(scores, journal);
    const concerns = this.generateConcerns(scores, journal, params);
    const recommendations = this.generateRecommendations(scores, journal, params);
    
    return {
      journal,
      matchScore,
      relevanceScore,
      qualityScore,
      feasibilityScore,
      scores,
      matchReasons,
      concerns,
      recommendations
    };
  }

  /**
   * 计算标题匹配度
   */
  private calculateTitleMatch(title: string | undefined, journal: JournalInfo): number {
    if (!title) return 0.5; // 默认中等分数
    
    const titleLower = title.toLowerCase();
    let score = 0;
    
    // 检查期刊关键词
    for (const keyword of journal.keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    }
    
    // 检查期刊主题
    for (const subject of journal.subjects) {
      if (titleLower.includes(subject.toLowerCase())) {
        score += 0.15;
      }
    }
    
    // 检查期刊名称相关性
    const journalNameWords = journal.name.toLowerCase().split(/\s+/);
    for (const word of journalNameWords) {
      if (word.length > 3 && titleLower.includes(word)) {
        score += 0.1;
      }
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * 计算摘要匹配度
   */
  private calculateAbstractMatch(abstract: string | undefined, journal: JournalInfo): number {
    if (!abstract) return 0.5;
    
    const abstractLower = abstract.toLowerCase();
    let score = 0;
    let matches = 0;
    
    // 检查关键词密度
    for (const keyword of journal.keywords) {
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const keywordMatches = (abstractLower.match(regex) || []).length;
      if (keywordMatches > 0) {
        score += Math.min(keywordMatches * 0.1, 0.3);
        matches++;
      }
    }
    
    // 检查主题相关性
    for (const subject of journal.subjects) {
      if (abstractLower.includes(subject.toLowerCase())) {
        score += 0.2;
        matches++;
      }
    }
    
    // 检查期刊范围描述
    const scopeWords = journal.scope.toLowerCase().split(/\s+/);
    for (const word of scopeWords) {
      if (word.length > 4 && abstractLower.includes(word)) {
        score += 0.05;
      }
    }
    
    // 奖励关键词匹配的多样性
    if (matches > 3) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * 计算关键词匹配度
   */
  private calculateKeywordMatch(keywords: string[] | undefined, journal: JournalInfo): number {
    if (!keywords || keywords.length === 0) return 0.5;
    
    let matchCount = 0;
    let totalRelevance = 0;
    
    for (const userKeyword of keywords) {
      let bestMatch = 0;
      
      // 精确匹配
      for (const journalKeyword of journal.keywords) {
        if (userKeyword.toLowerCase() === journalKeyword.toLowerCase()) {
          bestMatch = Math.max(bestMatch, 1.0);
        } else if (
          userKeyword.toLowerCase().includes(journalKeyword.toLowerCase()) ||
          journalKeyword.toLowerCase().includes(userKeyword.toLowerCase())
        ) {
          bestMatch = Math.max(bestMatch, 0.7);
        }
      }
      
      // 主题匹配
      for (const subject of journal.subjects) {
        if (userKeyword.toLowerCase().includes(subject.toLowerCase()) ||
            subject.toLowerCase().includes(userKeyword.toLowerCase())) {
          bestMatch = Math.max(bestMatch, 0.5);
        }
      }
      
      if (bestMatch > 0.3) {
        matchCount++;
        totalRelevance += bestMatch;
      }
    }
    
    if (matchCount === 0) return 0;
    
    const averageRelevance = totalRelevance / matchCount;
    const coverageBonus = Math.min(matchCount / keywords.length, 1.0) * 0.3;
    
    return Math.min(averageRelevance + coverageBonus, 1.0);
  }

  /**
   * 计算研究领域匹配度
   */
  private calculateFieldMatch(researchField: ResearchField | undefined, journal: JournalInfo): number {
    if (!researchField) return 0.5;
    
    if (journal.researchFields.includes(researchField)) {
      return 1.0;
    }
    
    // 相关领域映射
    const fieldRelations: Record<ResearchField, ResearchField[]> = {
      [ResearchField.COMPUTER_SCIENCE]: [ResearchField.ENGINEERING, ResearchField.MATHEMATICS],
      [ResearchField.ENGINEERING]: [ResearchField.COMPUTER_SCIENCE, ResearchField.MATHEMATICS, ResearchField.PHYSICS],
      [ResearchField.MEDICINE]: [ResearchField.BIOLOGY, ResearchField.CHEMISTRY],
      [ResearchField.PHYSICS]: [ResearchField.MATHEMATICS, ResearchField.ENGINEERING],
      [ResearchField.CHEMISTRY]: [ResearchField.BIOLOGY, ResearchField.MEDICINE],
      [ResearchField.BIOLOGY]: [ResearchField.MEDICINE, ResearchField.CHEMISTRY],
      [ResearchField.MATHEMATICS]: [ResearchField.COMPUTER_SCIENCE, ResearchField.PHYSICS, ResearchField.ENGINEERING],
      [ResearchField.PSYCHOLOGY]: [ResearchField.SOCIAL_SCIENCES, ResearchField.MEDICINE],
      [ResearchField.ECONOMICS]: [ResearchField.SOCIAL_SCIENCES],
      [ResearchField.SOCIAL_SCIENCES]: [ResearchField.PSYCHOLOGY, ResearchField.ECONOMICS]
    };
    
    const relatedFields = fieldRelations[researchField] || [];
    for (const relatedField of relatedFields) {
      if (journal.researchFields.includes(relatedField)) {
        return 0.6;
      }
    }
    
    return 0.2;
  }

  /**
   * 计算范围匹配度
   */
  private calculateScopeMatch(params: JournalMatcherParams, journal: JournalInfo): number {
    let score = 0.5; // 基础分数
    
    // 论文类型匹配
    if (params.paperType) {
      const scopeLower = journal.scope.toLowerCase();
      const typeMatches: Record<string, string[]> = {
        'research': ['research', 'original', 'novel', 'experimental'],
        'review': ['review', 'survey', 'overview', 'systematic'],
        'survey': ['survey', 'review', 'comprehensive', 'state-of-the-art'],
        'case_study': ['case study', 'application', 'practical', 'real-world'],
        'short_paper': ['short', 'brief', 'letter', 'communication']
      };
      
      const matchTerms = typeMatches[params.paperType] || [];
      for (const term of matchTerms) {
        if (scopeLower.includes(term)) {
          score += 0.2;
          break;
        }
      }
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * 计算影响因子对齐度
   */
  private calculateImpactAlignment(params: JournalMatcherParams, journal: JournalInfo): number {
    if (!journal.impactFactor) return 0.5;
    
    const impactFactor = journal.impactFactor;
    
    // 如果指定了影响因子范围
    if (params.impactFactorRange) {
      const { min, max } = params.impactFactorRange;
      
      if (min !== undefined && impactFactor < min) {
        return Math.max(0.1, impactFactor / min);
      }
      
      if (max !== undefined && impactFactor > max) {
        return Math.max(0.3, max / impactFactor);
      }
      
      return 1.0; // 在范围内
    }
    
    // 如果指定了分区要求
    if (params.quartile && journal.quartile) {
      if (params.quartile.includes(journal.quartile)) {
        return 1.0;
      } else {
        // 根据分区差距给分
        const quartileScores = { Q1: 1.0, Q2: 0.8, Q3: 0.6, Q4: 0.4 };
        return quartileScores[journal.quartile] || 0.3;
      }
    }
    
    // 默认基于影响因子给分
    if (impactFactor > 5) return 1.0;
    if (impactFactor > 3) return 0.8;
    if (impactFactor > 1) return 0.6;
    return 0.4;
  }

  /**
   * 计算要求匹配度
   */
  private calculateRequirementFit(params: JournalMatcherParams, journal: JournalInfo): number {
    let score = 0.5;
    
    // 开放获取要求
    if (params.openAccess !== undefined) {
      if (params.openAccess === journal.openAccess) {
        score += 0.3;
      } else if (params.openAccess && journal.hybridOA) {
        score += 0.15; // 混合开放获取
      }
    }
    
    // 出版商偏好
    if (params.publisher && params.publisher.length > 0) {
      if (params.publisher.includes(journal.publisher)) {
        score += 0.2;
      }
    }
    
    // 语言要求
    if (params.language && params.language.length > 0) {
      const hasLanguageMatch = params.language.some(lang => 
        journal.language.includes(lang)
      );
      if (hasLanguageMatch) {
        score += 0.2;
      } else {
        score -= 0.1;
      }
    }
    
    return Math.min(Math.max(score, 0), 1.0);
  }

  /**
   * 过滤期刊
   */
  private filterJournals(params: JournalMatcherParams): JournalInfo[] {
    let journals = [...this.journalDatabase];
    
    // 研究领域过滤
    if (params.researchField) {
      journals = journals.filter(journal => 
        journal.researchFields.includes(params.researchField!)
      );
    }
    
    // 影响因子范围过滤
    if (params.impactFactorRange) {
      const { min, max } = params.impactFactorRange;
      journals = journals.filter(journal => {
        if (!journal.impactFactor) return false;
        if (min !== undefined && journal.impactFactor < min) return false;
        if (max !== undefined && journal.impactFactor > max) return false;
        return true;
      });
    }
    
    // 分区过滤
    if (params.quartile && params.quartile.length > 0) {
      journals = journals.filter(journal => 
        journal.quartile && params.quartile!.includes(journal.quartile)
      );
    }
    
    // 开放获取过滤
    if (params.openAccess !== undefined) {
      journals = journals.filter(journal => 
        journal.openAccess === params.openAccess || 
        (params.openAccess && journal.hybridOA)
      );
    }
    
    // 出版商过滤
    if (params.publisher && params.publisher.length > 0) {
      journals = journals.filter(journal => 
        params.publisher!.includes(journal.publisher)
      );
    }
    
    // 语言过滤
    if (params.language && params.language.length > 0) {
      journals = journals.filter(journal =>
        params.language!.some(lang => journal.language.includes(lang))
      );
    }
    
    return journals;
  }

  /**
   * 排序期刊
   */
  private sortJournals(journals: JournalInfo[], sortBy: string, sortOrder: string): JournalInfo[] {
    const sorted = [...journals].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'impact_factor':
          comparison = (a.impactFactor || 0) - (b.impactFactor || 0);
          break;
        case 'acceptance_rate':
          comparison = (a.acceptanceRate || 50) - (b.acceptanceRate || 50);
          break;
        case 'review_time':
          comparison = (a.averageReviewTime || 90) - (b.averageReviewTime || 90);
          break;
        case 'relevance':
        default:
          // 基于名称排序作为默认
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }

  /**
   * 查找相似性
   */
  private findSimilarities(journals: JournalInfo[]): string[] {
    const similarities: string[] = [];
    
    // 检查共同出版商
    const publishers = journals.map(j => j.publisher);
    if (new Set(publishers).size === 1) {
      similarities.push(`All journals are published by ${publishers[0]}`);
    }
    
    // 检查共同研究领域
    const commonFields = journals[0].researchFields.filter(field =>
      journals.every(journal => journal.researchFields.includes(field))
    );
    if (commonFields.length > 0) {
      similarities.push(`Common research fields: ${commonFields.join(', ')}`);
    }
    
    // 检查相似的影响因子范围
    const impactFactors = journals.map(j => j.impactFactor).filter(impactFactor => impactFactor !== undefined);
    if (impactFactors.length === journals.length) {
      const min = Math.min(...impactFactors);
      const max = Math.max(...impactFactors);
      if (max - min < 2) {
        similarities.push(`Similar impact factor range: ${min.toFixed(2)} - ${max.toFixed(2)}`);
      }
    }
    
    // 检查开放获取政策
    const allOpenAccess = journals.every(j => j.openAccess);
    const allClosed = journals.every(j => !j.openAccess && !j.hybridOA);
    if (allOpenAccess) {
      similarities.push('All journals are open access');
    } else if (allClosed) {
      similarities.push('All journals are subscription-based');
    }
    
    return similarities;
  }

  /**
   * 查找差异
   */
  private findDifferences(journals: JournalInfo[]): string[] {
    const differences: string[] = [];
    
    // 影响因子差异
    const impactFactors = journals.map(j => j.impactFactor).filter(factor => factor !== undefined);
    if (impactFactors.length > 1) {
      const min = Math.min(...impactFactors);
      const max = Math.max(...impactFactors);
      if (max - min > 2) {
        differences.push(`Significant impact factor variation: ${min.toFixed(2)} to ${max.toFixed(2)}`);
      }
    }
    
    // 接收率差异
    const acceptanceRates = journals.map(j => j.acceptanceRate).filter(ar => ar !== undefined);
    if (acceptanceRates.length > 1) {
      const min = Math.min(...acceptanceRates);
      const max = Math.max(...acceptanceRates);
      if (max - min > 20) {
        differences.push(`Acceptance rates vary significantly: ${min}% to ${max}%`);
      }
    }
    
    // 审稿时间差异
    const reviewTimes = journals.map(j => j.averageReviewTime).filter(rt => rt !== undefined);
    if (reviewTimes.length > 1) {
      const min = Math.min(...reviewTimes);
      const max = Math.max(...reviewTimes);
      if (max - min > 60) {
        differences.push(`Review times vary: ${min} to ${max} days`);
      }
    }
    
    // 出版费用差异
    const fees = journals.map(j => j.publicationFee).filter(fee => fee !== undefined);
    if (fees.length > 1) {
      const hasFree = fees.some(fee => fee === 0);
      const hasExpensive = fees.some(fee => fee > 2000);
      if (hasFree && hasExpensive) {
        differences.push('Publication fees range from free to over $2000');
      }
    }
    
    return differences;
  }

  /**
   * 生成比较建议
   */
  private generateComparisonRecommendations(journals: JournalInfo[]): string[] {
    const recommendations: string[] = [];
    
    // 根据影响因子推荐
    const withImpactFactor = journals.filter(j => j.impactFactor !== undefined);
    if (withImpactFactor.length > 1) {
      const highest = withImpactFactor.reduce((prev, current) =>
        (prev.impactFactor! > current.impactFactor!) ? prev : current
      );
      recommendations.push(`Consider ${highest.name} for highest impact (IF: ${highest.impactFactor})`);
    }
    
    // 根据接收率推荐
    const withAcceptanceRate = journals.filter(j => j.acceptanceRate !== undefined);
    if (withAcceptanceRate.length > 1) {
      const easiest = withAcceptanceRate.reduce((prev, current) =>
        (prev.acceptanceRate! > current.acceptanceRate!) ? prev : current
      );
      recommendations.push(`${easiest.name} has the highest acceptance rate (${easiest.acceptanceRate}%)`);
    }
    
    // 根据审稿时间推荐
    const withReviewTime = journals.filter(j => j.averageReviewTime !== undefined);
    if (withReviewTime.length > 1) {
      const fastest = withReviewTime.reduce((prev, current) =>
        (prev.averageReviewTime! < current.averageReviewTime!) ? prev : current
      );
      recommendations.push(`${fastest.name} has the fastest review process (${fastest.averageReviewTime} days)`);
    }
    
    return recommendations;
  }

  /**
   * 生成匹配原因
   */
  private generateMatchReasons(scores: any, journal: JournalInfo): string[] {
    const reasons: string[] = [];
    
    if (scores.fieldMatch > 0.8) {
      reasons.push('Strong alignment with research field');
    }
    
    if (scores.keywordMatch > 0.7) {
      reasons.push('High keyword relevance');
    }
    
    if (scores.impactAlignment > 0.8) {
      reasons.push('Good impact factor alignment');
    }
    
    if (scores.abstractMatch > 0.6) {
      reasons.push('Content matches journal scope');
    }
    
    if (journal.quartile === 'Q1') {
      reasons.push('Top-tier journal in field');
    }
    
    return reasons;
  }

  /**
   * 生成关注点
   */
  private generateConcerns(scores: any, journal: JournalInfo, params: JournalMatcherParams): string[] {
    const concerns: string[] = [];
    
    if (scores.fieldMatch < 0.4) {
      concerns.push('Limited alignment with research field');
    }
    
    if (journal.acceptanceRate && journal.acceptanceRate < 10) {
      concerns.push('Very low acceptance rate');
    }
    
    if (journal.averageReviewTime && journal.averageReviewTime > 180) {
      concerns.push('Long review process');
    }
    
    if (params.openAccess && !journal.openAccess && !journal.hybridOA) {
      concerns.push('Not open access');
    }
    
    if (journal.publicationFee && journal.publicationFee > 3000) {
      concerns.push('High publication fee');
    }
    
    return concerns;
  }

  /**
   * 生成建议
   */
  private generateRecommendations(scores: any, journal: JournalInfo, params: JournalMatcherParams): string[] {
    const recommendations: string[] = [];
    
    if (scores.titleMatch < 0.5) {
      recommendations.push('Consider revising title to better match journal scope');
    }
    
    if (scores.keywordMatch < 0.6) {
      recommendations.push('Review and align keywords with journal focus areas');
    }
    
    if (journal.wordLimit) {
      recommendations.push(`Ensure manuscript meets word limit: ${journal.wordLimit} words`);
    }
    
    if (journal.citationStyle) {
      recommendations.push(`Follow ${journal.citationStyle} citation style`);
    }
    
    if (journal.specialIssues && journal.specialIssues.length > 0) {
      recommendations.push(`Consider special issues: ${journal.specialIssues.slice(0, 2).join(', ')}`);
    }
    
    return recommendations;
  }

  /**
   * 生成分析建议
   */
  private generateAnalysisRecommendations(journals: JournalInfo[], params: JournalMatcherParams): string[] {
    const recommendations: string[] = [];
    
    // 分析影响因子分布
    const impactFactors = journals.map(j => j.impactFactor).filter(factor => factor !== undefined);
    if (impactFactors.length > 0) {
      const avgIF = impactFactors.reduce((a, b) => a + b, 0) / impactFactors.length;
      recommendations.push(`Average impact factor in this selection: ${avgIF.toFixed(2)}`);
      
      const q1Journals = journals.filter(j => j.quartile === 'Q1').length;
      const q1Percentage = (q1Journals / journals.length) * 100;
      recommendations.push(`${q1Percentage.toFixed(1)}% of journals are Q1 ranked`);
    }
    
    // 分析开放获取
    const openAccessCount = journals.filter(j => j.openAccess).length;
    const oaPercentage = (openAccessCount / journals.length) * 100;
    recommendations.push(`${oaPercentage.toFixed(1)}% of journals are fully open access`);
    
    return recommendations;
  }

  /**
   * 计算中位数
   */
  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  /**
   * 初始化期刊数据库
   */
  private initializeJournalDatabase(): void {
    this.journalDatabase = [
      // Computer Science - Top Journals
      {
        id: 'ieee-tpami',
        name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
        abbreviation: 'IEEE TPAMI',
        issn: '0162-8828',
        impactFactor: 24.31,
        quartile: 'Q1',
        publisher: 'IEEE',
        frequency: 'monthly',
        language: ['English'],
        country: 'USA',
        scope: 'Computer vision, machine learning, pattern recognition, and related fields',
        researchFields: [ResearchField.COMPUTER_SCIENCE, ResearchField.ENGINEERING],
        subjects: ['computer vision', 'machine learning', 'pattern recognition', 'artificial intelligence'],
        keywords: ['deep learning', 'neural networks', 'computer vision', 'pattern recognition', 'machine learning', 'AI'],
        acceptanceRate: 14,
        averageReviewTime: 180,
        publicationFee: 0,
        openAccess: false,
        hybridOA: true,
        citationStyle: CitationStyle.IEEE,
        wordLimit: 8000,
        pageLimit: 14,
        formatRequirements: ['IEEE format', 'Double column', 'References in IEEE style'],
        website: 'https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=34',
        submissionSystem: 'ScholarOne',
        indexedIn: ['SCI', 'Scopus', 'DBLP'],
        specialIssues: ['Deep Learning', 'Computer Vision', 'Medical Image Analysis'],
        recentTopics: ['transformer networks', 'self-supervised learning', 'multimodal learning']
      },
      {
        id: 'acm-csur',
        name: 'ACM Computing Surveys',
        abbreviation: 'ACM CSUR',
        issn: '0360-0300',
        impactFactor: 14.32,
        quartile: 'Q1',
        publisher: 'ACM',
        frequency: 'quarterly',
        language: ['English'],
        country: 'USA',
        scope: 'Comprehensive surveys and tutorials in all areas of computer science',
        researchFields: [ResearchField.COMPUTER_SCIENCE],
        subjects: ['computer science', 'software engineering', 'algorithms', 'systems'],
        keywords: ['survey', 'tutorial', 'comprehensive review', 'state-of-the-art', 'computer science'],
        acceptanceRate: 8,
        averageReviewTime: 240,
        publicationFee: 0,
        openAccess: false,
        hybridOA: true,
        citationStyle: CitationStyle.ACM,
        wordLimit: 15000,
        formatRequirements: ['ACM format', 'Single column', 'Comprehensive bibliography'],
        website: 'https://dl.acm.org/journal/csur',
        submissionSystem: 'ACM PMS',
        indexedIn: ['SCI', 'Scopus', 'DBLP'],
        specialIssues: ['AI Survey', 'Cybersecurity Survey', 'Quantum Computing Survey'],
        recentTopics: ['large language models', 'quantum computing', 'edge computing']
      },
      {
        id: 'nature-machine-intelligence',
        name: 'Nature Machine Intelligence',
        abbreviation: 'Nat Mach Intell',
        issn: '2522-5839',
        impactFactor: 25.89,
        quartile: 'Q1',
        publisher: 'Springer Nature',
        frequency: 'monthly',
        language: ['English'],
        country: 'UK',
        scope: 'Machine intelligence research including algorithms, applications, and societal implications',
        researchFields: [ResearchField.COMPUTER_SCIENCE],
        subjects: ['machine intelligence', 'artificial intelligence', 'machine learning', 'robotics'],
        keywords: ['AI', 'machine learning', 'deep learning', 'robotics', 'autonomous systems'],
        acceptanceRate: 12,
        averageReviewTime: 120,
        publicationFee: 0,
        openAccess: false,
        hybridOA: true,
        citationStyle: CitationStyle.NATURE,
        wordLimit: 6000,
        formatRequirements: ['Nature format', 'Single column', 'High impact research'],
        website: 'https://www.nature.com/natmachintell/',
        submissionSystem: 'Nature Editorial Manager',
        indexedIn: ['SCI', 'Scopus'],
        specialIssues: ['AI Ethics', 'Neuromorphic Computing', 'Quantum AI'],
        recentTopics: ['foundation models', 'AI safety', 'multimodal AI']
      },
      // Engineering Journals
      {
        id: 'ieee-tii',
        name: 'IEEE Transactions on Industrial Informatics',
        abbreviation: 'IEEE TII',
        issn: '1551-3203',
        impactFactor: 12.09,
        quartile: 'Q1',
        publisher: 'IEEE',
        frequency: 'monthly',
        language: ['English'],
        country: 'USA',
        scope: 'Industrial informatics, automation, and intelligent manufacturing systems',
        researchFields: [ResearchField.ENGINEERING, ResearchField.COMPUTER_SCIENCE],
        subjects: ['industrial informatics', 'automation', 'IoT', 'cyber-physical systems'],
        keywords: ['Industry 4.0', 'IoT', 'automation', 'smart manufacturing', 'cyber-physical systems'],
        acceptanceRate: 18,
        averageReviewTime: 150,
        publicationFee: 0,
        openAccess: false,
        hybridOA: true,
        citationStyle: CitationStyle.IEEE,
        wordLimit: 7000,
        formatRequirements: ['IEEE format', 'Double column', 'Technical rigor'],
        website: 'https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=9424',
        submissionSystem: 'ScholarOne',
        indexedIn: ['SCI', 'Scopus'],
        specialIssues: ['Digital Twins', 'Edge Computing in Industry', 'AI in Manufacturing'],
        recentTopics: ['digital twins', 'edge AI', 'predictive maintenance']
      },
      // Medicine Journals
      {
        id: 'nature-medicine',
        name: 'Nature Medicine',
        abbreviation: 'Nat Med',
        issn: '1078-8956',
        impactFactor: 87.24,
        quartile: 'Q1',
        publisher: 'Springer Nature',
        frequency: 'monthly',
        language: ['English'],
        country: 'UK',
        scope: 'Biomedical research with direct relevance to human health and disease',
        researchFields: [ResearchField.MEDICINE, ResearchField.BIOLOGY],
        subjects: ['biomedicine', 'clinical research', 'translational medicine', 'therapeutics'],
        keywords: ['clinical research', 'biomedicine', 'therapeutics', 'precision medicine', 'diagnostics'],
        acceptanceRate: 8,
        averageReviewTime: 90,
        publicationFee: 0,
        openAccess: false,
        hybridOA: true,
        citationStyle: CitationStyle.NATURE,
        wordLimit: 5000,
        formatRequirements: ['Nature format', 'High clinical relevance', 'Strict ethical guidelines'],
        website: 'https://www.nature.com/nm/',
        submissionSystem: 'Nature Editorial Manager',
        indexedIn: ['SCI', 'PubMed', 'Scopus'],
        specialIssues: ['Cancer Therapeutics', 'Immunotherapy', 'Gene Therapy'],
        recentTopics: ['COVID-19 therapeutics', 'mRNA vaccines', 'personalized medicine']
      },
      // Open Access Journals
      {
        id: 'plos-one',
        name: 'PLOS ONE',
        abbreviation: 'PLoS One',
        issn: '1932-6203',
        impactFactor: 3.75,
        quartile: 'Q2',
        publisher: 'PLOS',
        frequency: 'continuous',
        language: ['English'],
        country: 'USA',
        scope: 'Multidisciplinary research across all areas of science and medicine',
        researchFields: [
          ResearchField.COMPUTER_SCIENCE, ResearchField.MEDICINE, ResearchField.BIOLOGY,
          ResearchField.PHYSICS, ResearchField.CHEMISTRY, ResearchField.PSYCHOLOGY
        ],
        subjects: ['multidisciplinary', 'open science', 'reproducible research'],
        keywords: ['multidisciplinary', 'open access', 'peer review', 'scientific rigor'],
        acceptanceRate: 69,
        averageReviewTime: 120,
        publicationFee: 1795,
        openAccess: true,
        hybridOA: false,
        citationStyle: CitationStyle.PLOS,
        wordLimit: 10000,
        formatRequirements: ['PLOS format', 'Open data requirements', 'FAIR principles'],
        website: 'https://journals.plos.org/plosone/',
        submissionSystem: 'Editorial Manager',
        indexedIn: ['SCI', 'PubMed', 'Scopus', 'DOAJ'],
        specialIssues: ['COVID-19 Research', 'Climate Change', 'Digital Health'],
        recentTopics: ['machine learning applications', 'climate research', 'global health']
      },
      // Mathematics Journals
      {
        id: 'jams',
        name: 'Journal of the American Mathematical Society',
        abbreviation: 'J. Amer. Math. Soc.',
        issn: '0894-0347',
        impactFactor: 5.09,
        quartile: 'Q1',
        publisher: 'American Mathematical Society',
        frequency: 'quarterly',
        language: ['English'],
        country: 'USA',
        scope: 'Research articles of the highest quality in all areas of pure mathematics',
        researchFields: [ResearchField.MATHEMATICS],
        subjects: ['pure mathematics', 'algebra', 'analysis', 'geometry', 'topology'],
        keywords: ['mathematics', 'theorem', 'proof', 'analysis', 'algebra', 'geometry'],
        acceptanceRate: 5,
        averageReviewTime: 300,
        publicationFee: 0,
        openAccess: false,
        hybridOA: false,
        citationStyle: CitationStyle.AMS,
        wordLimit: 0, // No strict limit
        formatRequirements: ['AMS LaTeX', 'Rigorous proofs', 'Mathematical notation'],
        website: 'https://www.ams.org/journals/jams/',
        submissionSystem: 'AMS Editorial System',
        indexedIn: ['SCI', 'MathSciNet', 'Scopus'],
        specialIssues: [],
        recentTopics: ['algebraic geometry', 'number theory', 'differential geometry']
      },
      // Psychology Journals
      {
        id: 'psychological-science',
        name: 'Psychological Science',
        abbreviation: 'Psychol Sci',
        issn: '0956-7976',
        impactFactor: 7.73,
        quartile: 'Q1',
        publisher: 'SAGE Publications',
        frequency: 'monthly',
        language: ['English'],
        country: 'USA',
        scope: 'Research across all areas of scientific psychology',
        researchFields: [ResearchField.PSYCHOLOGY, ResearchField.SOCIAL_SCIENCES],
        subjects: ['experimental psychology', 'cognitive psychology', 'social psychology', 'developmental psychology'],
        keywords: ['psychology', 'behavior', 'cognition', 'experimental', 'empirical research'],
        acceptanceRate: 15,
        averageReviewTime: 90,
        publicationFee: 0,
        openAccess: false,
        hybridOA: true,
        citationStyle: CitationStyle.APA,
        wordLimit: 4000,
        formatRequirements: ['APA format', 'Empirical research', 'Statistical rigor'],
        website: 'https://journals.sagepub.com/home/pss',
        submissionSystem: 'SAGE Track',
        indexedIn: ['SCI', 'PsycINFO', 'Scopus'],
        specialIssues: ['Social Psychology', 'Cognitive Neuroscience', 'Developmental Psychology'],
        recentTopics: ['computational psychology', 'cultural psychology', 'meta-science']
      }
    ];
  }
} 