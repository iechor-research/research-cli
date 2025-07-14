/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { 
  PaperType, 
  ResearchField, 
  CitationStyle, 
  LaTeXEngine,
  JournalStyle 
} from '@iechor/research-cli-core';

/**
 * 研究命令参数接口
 */
export interface ResearchCommandParams {
  operation: string;
  args: string[];
  options: Record<string, any>;
}

/**
 * 论文命令参数
 */
export interface PaperCommandParams {
  subcommand: 'outline' | 'write' | 'check' | 'bib';
  type?: PaperType;
  field?: ResearchField;
  journal?: string;
  style?: JournalStyle;
  file?: string;
  checkType?: 'all' | 'grammar' | 'style' | 'citations' | 'structure';
  bibOperation?: 'search' | 'add' | 'remove' | 'list' | 'format';
}

/**
 * 投稿命令参数
 */
export interface SubmitCommandParams {
  subcommand: 'match' | 'prepare' | 'latex';
  title?: string;
  abstract?: string;
  field?: ResearchField;
  paperFile?: string;
  journal?: string;
  format?: 'pdf' | 'latex';
  latexOperation?: 'create' | 'compile' | 'clean' | 'check';
  projectPath?: string;
}

/**
 * 研究命令配置
 */
export interface ResearchCommandConfig {
  defaultPaperType: PaperType;
  preferredCitationStyle: CitationStyle;
  defaultField: ResearchField;
  latexEngine: LaTeXEngine;
  outputDirectory: string;
}

/**
 * 命令执行结果
 */
export interface ResearchCommandResult {
  success: boolean;
  message?: string;
  data?: any;
  suggestions?: string[];
  outputFiles?: string[];
}

/**
 * 表格显示配置
 */
export interface TableDisplayConfig {
  maxWidth: number;
  showBorders: boolean;
  colorScheme: 'default' | 'accent' | 'muted';
}

/**
 * 文件选择器配置
 */
export interface FilePickerConfig {
  extensions: string[];
  multiple: boolean;
  startDirectory?: string;
}

/**
 * 进度指示器配置
 */
export interface ProgressConfig {
  showPercentage: boolean;
  showSpinner: boolean;
  message?: string;
} 