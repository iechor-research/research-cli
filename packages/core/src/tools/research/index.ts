/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Research Tools Module
 * 
 * 提供完整的学术研究工具套件，包括：
 * - 论文写作工具
 * - 文献管理工具
 * - 代码研究工具
 * - 投稿管理工具
 * - 协作工具
 * - 集成工具
 */

// 导出类型定义（接口和类型别名）
export type {
  ResearchTool,
  ResearchToolParams,
  ResearchToolResult,
  ResearchConfig,
  PaperTemplate,
  PaperSection,
  BibliographyEntry,
  LiteratureSearchParams,
  ExperimentConfig,
  Journal,
  JournalRequirements,
  DataAnalysisConfig,
  ResearchProject,
  ProjectMember,
  Milestone,
  PaperDraft,
} from './types.js';

// 导出枚举（值导出）
export {
  ResearchToolCategory,
  PaperType,
  CitationStyle,
  SectionType,
  Database,
  ProgrammingLanguage,
  ResearchMethod,
  DataFormat,
  AnalysisType,
  ProjectStatus,
} from './types.js';

// 导出核心类
export { BaseResearchTool } from './base-tool.js';
export { ResearchToolRegistry, researchToolRegistry } from './registry.js';

// 导出工具实例
export { PaperOutlineGenerator } from './writing/paper-outline-generator.js';
export { BibliographyManager } from './analysis/bibliography-manager.js';

// 导出集成功能
export {
  ResearchToolAdapter,
  registerResearchTools,
  getResearchToolHelp,
  listResearchTools,
} from './integration.js';

// 导出工具模块（当具体工具实现后会添加）
// export * from './writing/index.js';
// export * from './analysis/index.js';
// export * from './submission/index.js';
// export * from './collaboration/index.js';
// export * from './integration/index.js';

/**
 * 初始化研究工具模块
 * 
 * 这个函数会：
 * 1. 注册所有可用的研究工具
 * 2. 设置默认配置
 * 3. 准备工具注册中心
 */
export function initializeResearchTools(): void {
  // 当具体工具实现后，这里会注册所有工具
  console.info('Research tools module initialized');
  
  // 未来会添加：
  // registerWritingTools();
  // registerAnalysisTools();
  // registerSubmissionTools();
  // registerCollaborationTools();
  // registerIntegrationTools();
}

/**
 * 获取研究工具模块版本信息
 */
export function getModuleInfo() {
  return {
    version: '1.0.0',
    description: 'Research Tools Module for academic research workflow',
    author: 'iEchor LLC',
  };
}

/**
 * 检查研究工具模块的健康状态
 */
export function checkModuleHealth() {
  try {
    return {
      status: 'healthy' as const,
      message: 'Research tools module is functioning normally',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Unknown error in research tools module',
      timestamp: new Date().toISOString(),
    };
  }
} 