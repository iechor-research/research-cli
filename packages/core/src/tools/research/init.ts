/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResearchToolRegistry } from './registry.js';

// 导入所有已实现的工具
import { PaperOutlineGenerator } from './writing/paper-outline-generator.js';
import { AcademicWritingAssistant } from './writing/academic-writing-assistant.js';
import { BibliographyManager } from './analysis/bibliography-manager.js';
import { ExperimentCodeGenerator } from './analysis/experiment-code-generator.js';
import { ResearchDataAnalyzer } from './analysis/research-data-analyzer.js';
import { LaTeXManager } from './submission/latex-manager.js';
import { JournalMatcher } from './submission/journal-matcher.js';
import { EnhancedBibliographyManager } from './bibliography/enhanced-bibliography-manager.js';

/**
 * 初始化所有研究工具
 * 将已实现的工具注册到工具注册中心
 */
export function initializeResearchTools(registry: ResearchToolRegistry): void {
  // 检查是否已经初始化过
  if (registry.isInitialized()) {
    console.debug('Research tools already initialized, skipping.');
    return;
  }

  // Writing Tools
  registry.registerTool(new PaperOutlineGenerator());
  registry.registerTool(new AcademicWritingAssistant());

  // Bibliography Tools
  registry.registerTool(new BibliographyManager());
  registry.registerTool(new EnhancedBibliographyManager());

  // Code Generation Tools
  registry.registerTool(new ExperimentCodeGenerator());

  // LaTeX Tools
  registry.registerTool(new LaTeXManager());

  // Submission Tools
  registry.registerTool(new JournalMatcher());

  // Data analysis
  registry.registerTool(new ResearchDataAnalyzer());

  // 标记为已初始化
  registry.setInitialized(true);
}

/**
 * 获取已注册工具的统计信息
 */
export function getRegisteredToolsInfo() {
  const registry = ResearchToolRegistry.getInstance();
  const tools = registry.getAllTools();

  const summary = {
    totalTools: tools.length,
    toolNames: tools.map((t) => t.name),
    byCategory: {} as Record<string, number>,
  };

  // 按分类统计
  for (const tool of tools) {
    summary.byCategory[tool.category] =
      (summary.byCategory[tool.category] || 0) + 1;
  }

  return summary;
}

/**
 * 验证所有工具是否正确注册
 */
export function validateToolRegistration(): boolean {
  const registry = ResearchToolRegistry.getInstance();

  const expectedTools = [
    'generate_paper_outline',
    'manage_bibliography',
    'generate_experiment_code',
    'research_data_analyzer',
    'latex_manager',
    'match_journal',
  ];

  const registeredTools = registry.getToolNames();
  const missingTools = expectedTools.filter(
    (tool) => !registeredTools.includes(tool),
  );

  if (missingTools.length > 0) {
    console.error('Missing tools:', missingTools);
    return false;
  }

  console.info('All expected tools are properly registered');
  return true;
}
