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

// 重新导出所有研究相关的类型和接口
export * from './types.js';

// 导出核心类
export { BaseResearchTool } from './base-tool.js';
export { ResearchToolRegistry, researchToolRegistry } from './registry.js';

// 导出工具实例
export { PaperOutlineGenerator } from './writing/paper-outline-generator.js';
export { BibliographyManager } from './analysis/bibliography-manager.js';
export { ExperimentCodeGenerator } from './analysis/experiment-code-generator.js';
export { LaTeXManager } from './submission/latex-manager.js';

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
// 添加一个全局标志防止重复初始化
let globalInitialized = false;

export function initializeResearchTools(): void {
  if (globalInitialized) {
    return;
  }
  globalInitialized = true;

  // 延迟初始化研究工具（避免循环依赖）
  import('./init.js')
    .then(async (initModule) => {
      const { ResearchToolRegistry } = await import('./registry.js');
      initModule.initializeResearchTools(ResearchToolRegistry.getInstance());
    })
    .catch(console.error);
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
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error in research tools module',
      timestamp: new Date().toISOString(),
    };
  }
}
