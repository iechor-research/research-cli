export interface SubmissionPrepOptions {
  operation: 'prepare' | 'validate' | 'package' | 'checklist' | 'clean' | 
            'init' | 'template' | 'extract';
  projectPath?: string;
  journalName?: string;
  templateSource?: 'overleaf' | 'arxiv' | 'local';
  templateId?: string;
  arxivId?: string;
  outputDir?: string;
  projectName?: string;
  includeSupplementary?: boolean;
  validateOnly?: boolean;
  customRequirements?: JournalRequirements;
}

export interface SubmissionResult {
  success: boolean;
  packagePath?: string;
  validationReport?: ValidationReport;
  checklist?: ChecklistItem[];
  warnings: string[];
  errors: string[];
  message?: string;
  timestamp?: Date;
}

export interface ValidationReport {
  latexCompilation: CompilationResult;
  journalCompliance: ComplianceCheck;
  fileStructure: FileStructureCheck;
  supplementaryMaterials: SupplementaryCheck;
}

export interface CompilationResult {
  success: boolean;
  pdfGenerated: boolean;
  errors: string[];
  warnings: string[];
  logPath?: string;
}

export interface ComplianceCheck {
  pageLimit: boolean;
  wordLimit: boolean;
  figureLimit: boolean;
  referenceStyle: boolean;
  fontRequirements: boolean;
  marginRequirements: boolean;
  issues: string[];
}

export interface FileStructureCheck {
  mainTexFile: boolean;
  figuresPresent: boolean;
  bibliographyPresent: boolean;
  supplementaryOrganized: boolean;
  missingFiles: string[];
}

export interface SupplementaryCheck {
  dataFiles: boolean;
  codeFiles: boolean;
  additionalFigures: boolean;
  videoFiles: boolean;
  organizationScore: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: 'content' | 'formatting' | 'files' | 'submission';
}

export interface JournalRequirements {
  name: string;
  publisher: string;
  formatting: {
    pageLimit?: number;
    wordLimit?: number;
    figureLimit?: number;
    referenceStyle: string; // 'apa' | 'ieee' | 'nature' | 'chicago'
    fontRequirements?: FontRequirements;
    marginRequirements?: MarginRequirements;
  };
  fileRequirements: {
    mainDocument: FileFormat[];
    figures: FileFormat[];
    supplementary?: FileFormat[];
    blindReview: boolean;
  };
  submissionProcess: {
    platform: string; // 'Editorial Manager' | 'ScholarOne' | 'EVISE'
    additionalForms?: string[];
    coverLetterRequired: boolean;
    highlightsRequired?: boolean;
  };
}

export interface FontRequirements {
  family: string[];
  size: number;
  lineSpacing: number;
}

export interface MarginRequirements {
  top: number;
  bottom: number;
  left: number;
  right: number;
  unit: 'in' | 'cm' | 'pt';
}

export interface FileFormat {
  extension: string;
  maxSize?: string;
  requirements?: string[];
}

// Template-related types
export interface TemplateData {
  id: string;
  name: string;
  description: string;
  source: 'overleaf' | 'arxiv' | 'local';
  journalName?: string;
  publisher?: string;
  category: string[];
  files: TemplateFile[];
  metadata: TemplateMetadata;
  lastUpdated: Date;
}

export interface TemplateFile {
  path: string;
  content: string;
  type: 'tex' | 'cls' | 'sty' | 'bib' | 'figure' | 'other';
  required: boolean;
}

export interface TemplateMetadata {
  version?: string;
  authors?: string[];
  license?: string;
  tags?: string[];
  lastModified?: Date;
  downloadCount?: number;
  rating?: number;
}

export interface ProjectInitOptions {
  name: string;
  path: string;
  template: TemplateData;
  journalTarget?: string;
  authorInfo?: AuthorInfo;
  projectMetadata?: ProjectMetadata;
}

export interface AuthorInfo {
  name: string;
  email?: string;
  affiliation?: string;
  orcid?: string;
}

export interface ProjectMetadata {
  title?: string;
  abstract?: string;
  keywords?: string[];
  discipline?: string;
  targetJournal?: string;
}

export interface ProjectResult {
  success: boolean;
  projectPath: string;
  filesCreated: string[];
  configGenerated: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateSearchOptions {
  journal?: string;
  publisher?: string;
  category?: string[];
  keywords?: string[];
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'popularity';
}

export interface LatexTemplate {
  mainFile: string;
  files: Map<string, string>;
  structure: DocumentStructure;
  dependencies: string[];
  metadata: TemplateMetadata;
}

export interface DocumentStructure {
  documentClass: string;
  packages: string[];
  sections: SectionInfo[];
  figures: FigureInfo[];
  tables: TableInfo[];
  bibliography: BibliographyInfo;
}

export interface SectionInfo {
  level: number;
  title: string;
  startLine: number;
  endLine?: number;
}

export interface FigureInfo {
  label: string;
  caption: string;
  fileName?: string;
  width?: string;
}

export interface TableInfo {
  label: string;
  caption: string;
  columns: number;
  rows: number;
}

export interface BibliographyInfo {
  style: string;
  file?: string;
  entries: number;
} 