/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResearchToolRegistry } from './registry.js';

// 导入所有已实现的工具
import { PaperOutlineGenerator } from './writing/paper-outline-generator.js';
import { BibliographyManager } from './analysis/bibliography-manager.js';
import { ExperimentCodeGenerator } from './analysis/experiment-code-generator.js';
import { LaTeXManager } from './submission/latex-manager.js';
import { JournalMatcher } from './submission/journal-matcher.js';

/**
 * 初始化所有研究工具
 * 将已实现的工具注册到工具注册中心
 */
export function initializeAllResearchTools(): void {
  const registry = ResearchToolRegistry.getInstance();

  // 注册写作工具
  registry.registerTool(new PaperOutlineGenerator());
  registry.registerTool(new BibliographyManager());

  // 注册分析工具
  registry.registerTool(new ExperimentCodeGenerator());

  // 注册投稿工具
  registry.registerTool(new LaTeXManager());
  registry.registerTool(new JournalMatcher());

  console.info('All research tools have been initialized and registered');
}

/**
 * 获取已注册工具的统计信息
 */
export function getRegisteredToolsInfo() {
  const registry = ResearchToolRegistry.getInstance();
  const tools = registry.getAllTools();
  
  const summary = {
    totalTools: tools.length,
    toolNames: tools.map(t => t.name),
    byCategory: {} as Record<string, number>
  };

  // 按分类统计
  for (const tool of tools) {
    summary.byCategory[tool.category] = (summary.byCategory[tool.category] || 0) + 1;
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
    'latex_manager',
    'match_journal'
  ];

  const registeredTools = registry.getToolNames();
  const missingTools = expectedTools.filter(tool => !registeredTools.includes(tool));
  
  if (missingTools.length > 0) {
    console.error('Missing tools:', missingTools);
    return false;
  }

  console.info('All expected tools are properly registered');
  return true;
} 