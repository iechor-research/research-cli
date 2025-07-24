/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CitationStyle,
  PaperType,
  ResearchField,
  LaTeXEngine,
  WritingStyle,
  TargetAudience,
  ProjectMember,
} from '../tools/research/types.js';

/**
 * Get SerpAPI key from configuration file
 */
function getConfiguredSerpApiKey(): string | undefined {
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
      return config.apis?.serpapi?.apiKey;
    }
  } catch (error) {
    // 静默失败，回退到环境变量
  }

  return undefined;
}

/**
 * 作者信息
 */
export interface AuthorInfo {
  name: string;
  email: string;
  affiliation: string;
  orcid?: string;
  address?: string;
  phone?: string;
}

/**
 * API配置接口
 */
export interface APIConfig {
  enabled: boolean;
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * arXiv API配置
 */
export interface ArxivAPIConfig extends APIConfig {
  maxResults?: number;
  sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
  sortOrder?: 'ascending' | 'descending';
}

/**
 * PubMed API配置
 */
export interface PubMedAPIConfig extends APIConfig {
  email?: string; // Required for NCBI API
  tool?: string; // Tool name for API requests
  maxResults?: number;
}

/**
 * IEEE API配置
 */
export interface IEEEAPIConfig extends APIConfig {
  maxResults?: number;
  publicationTitle?: string[];
}

/**
 * Google Scholar配置
 */
export interface GoogleScholarConfig {
  enabled: boolean;
  timeout?: number;
  maxResults?: number;
  language?: string;
  serpApiKey?: string; // SERPAPI key for Google Scholar searches
  useSerpApi?: boolean; // Whether to use SERPAPI instead of web scraping
}

/**
 * 研究配置 - API和数据源
 */
export interface ResearchAPIs {
  arxiv?: ArxivAPIConfig;
  pubmed?: PubMedAPIConfig;
  ieee?: IEEEAPIConfig;
  googleScholar?: GoogleScholarConfig;
}

/**
 * 默认设置配置
 */
export interface ResearchDefaults {
  citationStyle?: CitationStyle;
  paperType?: PaperType;
  researchField?: ResearchField;
  outputFormat?: 'pdf' | 'html' | 'markdown' | 'docx';
  language?: string;
  documentLanguage?: 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja';
}

/**
 * 项目配置
 */
export interface ResearchProjects {
  defaultTemplate?: string;
  workspaceRoot?: string;
  autoSync?: boolean;
  collaborators?: ProjectMember[];
  gitIntegration?: boolean;
  backupEnabled?: boolean;
  backupInterval?: number; // hours
}

/**
 * 期刊和出版偏好
 */
export interface ResearchJournals {
  preferred?: string[];
  blacklist?: string[];
  impactFactorThreshold?: number;
  openAccessPreference?: boolean;
  quartilePreference?: ('Q1' | 'Q2' | 'Q3' | 'Q4')[];
  publishers?: {
    preferred?: string[];
    avoided?: string[];
  };
}

/**
 * 数据分析配置
 */
export interface ResearchAnalysis {
  defaultVisualization?: boolean;
  significanceLevel?: number;
  correlationMethod?: 'pearson' | 'spearman' | 'kendall';
  outputDirectory?: string;
  regressionMethod?: 'linear' | 'polynomial' | 'random_forest';
  clusteringMethod?: 'kmeans' | 'hierarchical' | 'dbscan';
  maxDataSize?: number; // MB
  cachingEnabled?: boolean;
}

/**
 * LaTeX配置
 */
export interface ResearchLaTeX {
  defaultEngine?: LaTeXEngine;
  templateDirectory?: string;
  customPackages?: string[];
  authorInfo?: AuthorInfo;
  documentClass?: string;
  bibliographyStyle?: string;
  compileOptions?: string[];
  outputDirectory?: string;
}

/**
 * 写作助手配置
 */
export interface ResearchWriting {
  defaultStyle?: WritingStyle;
  targetAudience?: TargetAudience;
  plagiarismCheck?: boolean;
  grammarCheck?: boolean;
  styleCheck?: boolean;
  readabilityCheck?: boolean;
  citationCheck?: boolean;
  autoCorrect?: boolean;
  writingGoals?: {
    wordsPerDay?: number;
    sessionsPerWeek?: number;
  };
}

/**
 * 实验和代码生成配置
 */
export interface ResearchExperiments {
  defaultLanguage?: 'python' | 'r' | 'matlab' | 'julia' | 'javascript';
  codeStyle?: 'pep8' | 'google' | 'airbnb' | 'standard';
  includeTests?: boolean;
  includeDocs?: boolean;
  environmentManager?: 'conda' | 'venv' | 'docker' | 'pipenv';
  defaultPackages?: {
    python?: string[];
    r?: string[];
    matlab?: string[];
    julia?: string[];
  };
}

/**
 * 通知和提醒配置
 */
export interface ResearchNotifications {
  enabled?: boolean;
  deadlineReminders?: boolean;
  progressUpdates?: boolean;
  collaborationNotifications?: boolean;
  methods?: ('email' | 'desktop' | 'slack' | 'teams')[];
  frequency?: 'daily' | 'weekly' | 'monthly';
}

/**
 * 主要研究配置接口
 */
export interface ResearchSettings {
  // 配置文件版本
  version?: string;

  // 默认偏好设置
  defaults?: ResearchDefaults;

  // 外部API和数据源配置
  apis?: ResearchAPIs;

  // 项目和协作配置
  projects?: ResearchProjects;

  // 期刊和出版偏好
  journals?: ResearchJournals;

  // 数据分析配置
  analysis?: ResearchAnalysis;

  // LaTeX和文档配置
  latex?: ResearchLaTeX;

  // 写作助手配置
  writing?: ResearchWriting;

  // 实验和代码生成配置
  experiments?: ResearchExperiments;

  // 通知和提醒配置
  notifications?: ResearchNotifications;
}

/**
 * 配置验证错误类型
 */
export interface ConfigValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationError[];
}

/**
 * 默认研究配置
 */
export const DEFAULT_RESEARCH_CONFIG: ResearchSettings = {
  version: '1.0.0',

  defaults: {
    citationStyle: CitationStyle.APA,
    paperType: PaperType.RESEARCH_PAPER,
    researchField: ResearchField.COMPUTER_SCIENCE,
    outputFormat: 'pdf',
    language: 'en',
    documentLanguage: 'en',
  },

  apis: {
    arxiv: {
      enabled: true,
      baseUrl: 'http://export.arxiv.org/api/query',
      maxResults: 20,
      sortBy: 'relevance',
      sortOrder: 'descending',
      timeout: 30000,
      maxRetries: 3,
    },
    pubmed: {
      enabled: false,
      baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
      maxResults: 20,
      timeout: 30000,
      maxRetries: 3,
    },
    ieee: {
      enabled: false,
      baseUrl: 'https://ieeexploreapi.ieee.org/api/v1/',
      maxResults: 20,
      timeout: 30000,
      maxRetries: 3,
    },
    googleScholar: {
      enabled: true,
      timeout: 30000,
      maxResults: 20,
      language: 'en',
      useSerpApi: true,
      serpApiKey:
        getConfiguredSerpApiKey() ||
        process.env.SERPAPI_KEY ||
        'AIzaSyBy5HZjfoh7P4oZalNOaDMad_PbyDXmo_g',
    },
  },

  projects: {
    workspaceRoot: './research-projects',
    autoSync: false,
    collaborators: [],
    gitIntegration: true,
    backupEnabled: false,
    backupInterval: 24,
  },

  journals: {
    preferred: [],
    blacklist: [],
    impactFactorThreshold: 0.5,
    openAccessPreference: false,
    quartilePreference: ['Q1', 'Q2'],
  },

  analysis: {
    defaultVisualization: true,
    significanceLevel: 0.05,
    correlationMethod: 'pearson',
    outputDirectory: './analysis-output',
    regressionMethod: 'linear',
    clusteringMethod: 'kmeans',
    maxDataSize: 100,
    cachingEnabled: true,
  },

  latex: {
    defaultEngine: LaTeXEngine.PDFLATEX,
    templateDirectory: './latex-templates',
    customPackages: [],
    documentClass: 'article',
    bibliographyStyle: 'plain',
    compileOptions: [],
    outputDirectory: './latex-output',
  },

  writing: {
    defaultStyle: WritingStyle.ACADEMIC,
    targetAudience: TargetAudience.EXPERTS,
    plagiarismCheck: true,
    grammarCheck: true,
    styleCheck: true,
    readabilityCheck: true,
    citationCheck: true,
    autoCorrect: false,
  },

  experiments: {
    defaultLanguage: 'python',
    codeStyle: 'pep8',
    includeTests: true,
    includeDocs: true,
    environmentManager: 'conda',
    defaultPackages: {
      python: ['numpy', 'pandas', 'matplotlib', 'scipy', 'scikit-learn'],
      r: ['ggplot2', 'dplyr', 'tidyr', 'caret'],
      matlab: [],
      julia: ['DataFrames', 'Plots', 'StatsBase'],
    },
  },

  notifications: {
    enabled: false,
    deadlineReminders: true,
    progressUpdates: false,
    collaborationNotifications: true,
    methods: ['desktop'],
    frequency: 'weekly',
  },
};
