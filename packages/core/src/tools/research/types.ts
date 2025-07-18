/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 研究工具基础类型定义
 */

export interface ResearchToolParams {
  [key: string]: unknown;
}

export interface ResearchToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  timestamp?: Date;
  metadata?: {
    timestamp: string;
    toolName: string;
    version: string;
    executionTime?: number;
  };
}

/**
 * 论文相关类型
 */
export enum PaperType {
  RESEARCH_PAPER = 'research_paper',
  REVIEW = 'review',
  CASE_STUDY = 'case_study',
  CONFERENCE = 'conference',
  THESIS = 'thesis',
  TECHNICAL_REPORT = 'technical_report',
  SURVEY = 'survey',
  THEORETICAL = 'theoretical',
  EXPERIMENTAL = 'experimental',
  EMPIRICAL = 'empirical',
  CONCEPTUAL = 'conceptual',
}

export enum CitationStyle {
  APA = 'apa',
  IEEE = 'ieee',
  NATURE = 'nature',
  ACM = 'acm',
  CHICAGO = 'chicago',
  MLA = 'mla',
  VANCOUVER = 'vancouver',
  PLOS = 'plos',
  AMS = 'ams',
}

export type CitationFormat = 'apa' | 'mla' | 'ieee';

export interface SearchOptions {
  maxResults?: number;
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
}

export enum JournalStyle {
  APA = 'apa',
  IEEE = 'ieee',
  NATURE = 'nature',
  ACM = 'acm',
  CHICAGO = 'chicago',
  MLA = 'mla',
  VANCOUVER = 'vancouver',
}

export enum ResearchField {
  COMPUTER_SCIENCE = 'computer_science',
  ENGINEERING = 'engineering',
  MEDICINE = 'medicine',
  PHYSICS = 'physics',
  CHEMISTRY = 'chemistry',
  BIOLOGY = 'biology',
  MATHEMATICS = 'mathematics',
  PSYCHOLOGY = 'psychology',
  ECONOMICS = 'economics',
  SOCIAL_SCIENCES = 'social_sciences',
}

export interface PaperTemplate {
  type: PaperType;
  citationStyle: CitationStyle;
  journal?: string;
  conference?: string;
  sections: PaperSection[];
}

export interface PaperSection {
  title: string;
  type: SectionType;
  content?: string;
  subsections?: PaperSection[];
  required: boolean;
}

export enum SectionType {
  ABSTRACT = 'abstract',
  INTRODUCTION = 'introduction',
  LITERATURE_REVIEW = 'literature_review',
  METHODOLOGY = 'methodology',
  RESULTS = 'results',
  DISCUSSION = 'discussion',
  CONCLUSION = 'conclusion',
  REFERENCES = 'references',
  APPENDIX = 'appendix',
  ACKNOWLEDGMENTS = 'acknowledgments',
}

/**
 * 文献管理类型
 */
export interface PaperMetadata {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  journal?: string;
  doi?: string;
  keywords?: string[];
  url?: string;
}

export interface BibliographyEntry {
  id: string;
  // Direct fields for backward compatibility
  title: string;
  authors: string[];
  year: number;
  abstract?: string;
  journal?: string;
  doi?: string;
  url?: string;
  keywords?: string[];
  citationCount?: number;
  conference?: string;
  arxivId?: string;
  
  // Legacy metadata structure (optional)
  metadata?: PaperMetadata;
  source: string;
  dateAdded: Date;
  tags: string[];
  notes: string;
  citationFormats: {
    apa: string;
    mla: string;
    ieee: string;
  };
}

export interface LiteratureSearchParams {
  query: string;
  databases: Database[];
  maxResults: number;
  yearRange?: {
    start: number;
    end: number;
  };
  fields?: string[];
}

export enum Database {
  ARXIV = 'arxiv',
  PUBMED = 'pubmed',
  IEEE = 'ieee',
  ACM = 'acm',
  SPRINGER = 'springer',
  GOOGLE_SCHOLAR = 'google_scholar',
}

/**
 * 代码研究类型
 */
export enum ProgrammingLanguage {
  PYTHON = 'python',
  R = 'r',
  MATLAB = 'matlab',
  JULIA = 'julia',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
}

/**
 * LaTeX 引擎枚举
 */
export enum LaTeXEngine {
  PDFLATEX = 'pdflatex',
  XELATEX = 'xelatex',
  LUALATEX = 'lualatex',
  LATEX = 'latex'
}

/**
 * 文档类型枚举
 */
export enum DocumentType {
  JOURNAL_ARTICLE = 'journal_article',
  CONFERENCE_PAPER = 'conference_paper',
  THESIS = 'thesis',
  DISSERTATION = 'dissertation',
  TECHNICAL_REPORT = 'technical_report',
  BOOK = 'book',
  BOOK_CHAPTER = 'book_chapter',
  PREPRINT = 'preprint',
  POSTER = 'poster',
  PRESENTATION = 'presentation'
}

export enum ResearchMethod {
  MACHINE_LEARNING = 'machine_learning',
  STATISTICAL_ANALYSIS = 'statistical_analysis',
  NUMERICAL_COMPUTATION = 'numerical_computation',
  DATA_MINING = 'data_mining',
  SIMULATION = 'simulation',
  SURVEY = 'survey',
  EXPERIMENTAL = 'experimental',
}

export interface ExperimentConfig {
  name: string;
  description: string;
  method: ResearchMethod;
  language: ProgrammingLanguage;
  dataTypes: string[];
  analysisTypes: string[];
  outputFormats: string[];
}

/**
 * 期刊和会议类型
 */
export interface Journal {
  name: string;
  issn?: string;
  impactFactor?: number;
  quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  publisher: string;
  fields: string[];
  openAccess: boolean;
  submissionDeadlines?: Date[];
  requirements: JournalRequirements;
}

export interface JournalRequirements {
  maxPages?: number;
  wordLimit?: number;
  citationStyle: CitationStyle;
  formatStyle: 'single-column' | 'double-column';
  figureFormats: string[];
  supplementaryMaterial: boolean;
  anonymousReview: boolean;
}

/**
 * 数据分析类型
 */
export enum DataFormat {
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel',
  HDF5 = 'hdf5',
  PARQUET = 'parquet',
  SQLITE = 'sqlite',
}

export enum AnalysisType {
  DESCRIPTIVE = 'descriptive',
  INFERENTIAL = 'inferential',
  MACHINE_LEARNING = 'machine_learning',
  TIME_SERIES = 'time_series',
  VISUALIZATION = 'visualization',
  SIMULATION = 'simulation',
}

export interface DataAnalysisConfig {
  dataPath: string;
  format: DataFormat;
  analysisTypes: AnalysisType[];
  targetColumns?: string[];
  outputFormat: 'html' | 'pdf' | 'markdown';
}

/**
 * 研究项目类型
 */
export interface ResearchProject {
  id: string;
  name: string;
  description: string;
  field: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  members: ProjectMember[];
  milestones: Milestone[];
  papers: PaperDraft[];
  codeRepositories: string[];
  dataFiles: string[];
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  WRITING = 'writing',
  REVIEWING = 'reviewing',
  SUBMITTED = 'submitted',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
}

export interface ProjectMember {
  name: string;
  email: string;
  role: 'lead' | 'researcher' | 'student' | 'collaborator';
  affiliation: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  tasks: string[];
}

export interface PaperDraft {
  id: string;
  title: string;
  filePath: string;
  status: 'draft' | 'review' | 'final' | 'submitted';
  lastModified: Date;
}

/**
 * 研究工具基础接口
 */
export interface ResearchTool {
  name: string;
  description: string;
  category: ResearchToolCategory;
  version: string;
  execute(params: ResearchToolParams): Promise<ResearchToolResult>;
  validate(params: ResearchToolParams): boolean;
  getHelp(): string;
}

export enum ResearchToolCategory {
  WRITING = 'writing',
  ANALYSIS = 'analysis',
  SUBMISSION = 'submission',
  COLLABORATION = 'collaboration',
  INTEGRATION = 'integration',
  PUBLISHING = "PUBLISHING",
}

/**
 * 配置类型
 */
export interface ResearchConfig {
  defaultCitationStyle: CitationStyle;
  preferredJournals: string[];
  researchFields: string[];
  collaborators: ProjectMember[];
  dataDirectories: string[];
  templateDirectories: string[];
  externalAPIs: {
    arxiv?: string;
    pubmed?: string;
    ieee?: string;
  };
}

/**
 * 论文大纲相关类型
 */
export interface OutlineSubsection {
  id: string;
  title: string;
  description: string;
}

export interface OutlineSection {
  id: string;
  title: string;
  description: string;
  subsections: OutlineSubsection[];
  estimatedPages: number;
  keyPoints: string[];
  required: boolean;
}

export interface PaperOutline {
  title: string;
  paperType: PaperType;
  researchField: ResearchField;
  targetJournal?: string;
  journalStyle: JournalStyle;
  sections: OutlineSection[];
  abstractStructure: string[];
  bibliographyRequirements: {
    minReferences: number;
    recommendedTypes: string[];
    citationStyle: JournalStyle;
  };
  timeline?: Array<{
    phase: string;
    duration: string;
    description: string;
  }>;
  estimatedLength: {
    pages: number;
    words: number;
  };
  generatedAt: string;
  version: string;
} 

// Writing Assistant Types
export enum WritingStyle {
  ACADEMIC = 'academic',
  FORMAL = 'formal',
  TECHNICAL = 'technical',
  SCIENTIFIC = 'scientific'
}

export enum WritingOperation {
  ANALYZE_STRUCTURE = 'analyze_structure',
  CHECK_GRAMMAR = 'check_grammar',
  IMPROVE_STYLE = 'improve_style',
  VERIFY_CITATIONS = 'verify_citations',
  CHECK_READABILITY = 'check_readability',
  DETECT_PLAGIARISM = 'detect_plagiarism',
  COMPREHENSIVE_REVIEW = 'comprehensive_review'
}

export enum TargetAudience {
  EXPERTS = 'experts',
  GENERAL_ACADEMIC = 'general_academic',
  STUDENTS = 'students',
  PRACTITIONERS = 'practitioners'
}



export interface WritingSuggestion {
  type: 'grammar' | 'style' | 'structure' | 'citation' | 'readability' | 'plagiarism' | 'transitions' | 'technical_terms';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  location?: {
    start: number;
    end: number;
    line: number;
  };
}

export interface GrammarCheck {
  type: 'subject_verb_agreement' | 'punctuation' | 'capitalization' | 'redundancy' | 'passive_voice';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  position: {
    start: number;
    end: number;
    line: number;
  };
}

export interface StyleImprovement {
  type: 'wordiness' | 'formality' | 'clarity' | 'transitions' | 'technical_terms';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  originalText: string;
  improvedText: string;
  location: {
    start: number;
    end: number;
    line: number;
  };
}

export interface CitationIssue {
  type: 'format' | 'missing_reference' | 'inconsistent';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  location: {
    start: number;
    end: number;
    line: number;
  };
  citationText: string;
}

export interface StructureAnalysis {
  totalSections: number;
  totalParagraphs: number;
  totalSentences: number;
  averageSentencesPerParagraph: number;
  averageWordsPerSentence: number;
  hasAbstract: boolean;
  hasIntroduction: boolean;
  hasConclusion: boolean;
  hasReferences: boolean;
  sections: Array<{
    title: string;
    level: number;
    wordCount: number;
    position: number;
  }>;
  structureScore: number;
}

export interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFogIndex: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  totalWords: number;
  totalSentences: number;
  totalParagraphs: number;
  readabilityLevel: string;
}

export interface PlagiarismCheck {
  overallSimilarity: number;
  suspiciousTexts: Array<{
    text: string;
    similarity: number;
    reason: string;
    location: {
      start: number;
      end: number;
      line: number;
    };
  }>;
  sources: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface WritingAssistantParams extends ResearchToolParams {
  operation: WritingOperation | string;
  content: string;
  writingStyle?: WritingStyle | string;
  documentType?: DocumentType | string;
  targetAudience?: TargetAudience | string;
  citationStyle?: CitationStyle | string;
  language?: string;
  includeStatistics?: boolean;
}

export interface WritingAssistantResult extends ResearchToolResult {
  operation: WritingOperation | string;
  structureAnalysis?: StructureAnalysis;
  grammarCheck?: GrammarCheck[];
  styleImprovements?: StyleImprovement[];
  citationIssues?: CitationIssue[];
  readabilityMetrics?: ReadabilityMetrics;
  plagiarismCheck?: PlagiarismCheck;
  suggestions?: WritingSuggestion[];
} 