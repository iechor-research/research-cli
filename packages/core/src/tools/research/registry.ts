/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ResearchTool,
  ResearchToolCategory,
  ResearchToolParams,
  ResearchToolResult,
} from './types.js';
import { EnhancedBibliographyManager } from './bibliography/enhanced-bibliography-manager.js';
import { AcademicWritingAssistant } from './writing/academic-writing-assistant.js';
import { ArXivMCPClient } from './bibliography/arxiv-mcp-client.js';
import { SubmissionPreparator } from './submission/submission-preparator.js';
import { PaperOutlineGenerator } from './writing/paper-outline-generator.js';
import { ExperimentCodeGenerator } from './analysis/experiment-code-generator.js';
import { LaTeXManager } from './submission/latex-manager.js';
import { JournalMatcher } from './submission/journal-matcher.js';
import { ResearchDataAnalyzer } from './analysis/research-data-analyzer.js';

/**
 * 研究工具注册中心
 * 负责管理和注册所有研究相关工具
 */
export class ResearchToolRegistry {
  private static instance: ResearchToolRegistry;
  private tools: Map<string, ResearchTool> = new Map();
  private toolsByCategory: Map<ResearchToolCategory, ResearchTool[]> =
    new Map();
  private initialized: boolean = false;
  private arxivClient: ArXivMCPClient;

  private constructor() {
    this.tools = new Map();
    this.arxivClient = new ArXivMCPClient();
    // 初始化分类映射
    Object.values(ResearchToolCategory).forEach((category) => {
      this.toolsByCategory.set(category, []);
    });
  }

  /**
   * 获取注册中心实例（单例模式）
   */
  public static getInstance(): ResearchToolRegistry {
    if (!ResearchToolRegistry.instance) {
      ResearchToolRegistry.instance = new ResearchToolRegistry();
    }
    return ResearchToolRegistry.instance;
  }

  /**
   * 检查是否已初始化
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 设置初始化状态
   */
  public setInitialized(initialized: boolean): void {
    this.initialized = initialized;
  }

  /**
   * 注册研究工具
   */
  public registerTool(tool: ResearchTool): void {
    if (this.tools.has(tool.name)) {
      console.debug(
        `Research tool '${tool.name}' already registered, skipping.`,
      );
      return;
    }

    this.tools.set(tool.name, tool);

    const categoryTools = this.toolsByCategory.get(tool.category) || [];
    categoryTools.push(tool);
    this.toolsByCategory.set(tool.category, categoryTools);
  }

  /**
   * 注册所有默认研究工具
   */
  private registerDefaultTools(): void {
    // Only register tools that are not registered in init.ts
    // Journal matching
    this.registerTool(new JournalMatcher());

    // Submission preparation (new)
    this.registerTool(new SubmissionPreparator(this.arxivClient));
  }

  /**
   * 获取指定工具
   */
  public getTool(name: string): ResearchTool | undefined {
    return this.tools.get(name);
  }

  /**
   * 获取所有工具
   */
  public getAllTools(): ResearchTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 按分类获取工具
   */
  public getToolsByCategory(category: ResearchToolCategory): ResearchTool[] {
    return this.toolsByCategory.get(category) || [];
  }

  /**
   * 获取工具名称列表
   */
  public getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * 检查工具是否存在
   */
  public hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * 执行工具
   */
  public async executeTool(
    name: string,
    params: ResearchToolParams,
  ): Promise<ResearchToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Research tool '${name}' not found`,
        metadata: {
          timestamp: new Date().toISOString(),
          toolName: name,
          version: 'unknown',
        },
      };
    }

    try {
      // 验证参数
      if (!tool.validate(params)) {
        return {
          success: false,
          error: `Invalid parameters for tool '${name}'`,
          metadata: {
            timestamp: new Date().toISOString(),
            toolName: name,
            version: tool.version,
          },
        };
      }

      // 执行工具
      const result = await tool.execute(params);

      // 确保结果包含元数据
      if (!result.metadata) {
        result.metadata = {
          timestamp: new Date().toISOString(),
          toolName: name,
          version: tool.version,
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          timestamp: new Date().toISOString(),
          toolName: name,
          version: tool.version,
        },
      };
    }
  }

  /**
   * 获取工具帮助信息
   */
  public getToolHelp(name: string): string | undefined {
    const tool = this.tools.get(name);
    return tool?.getHelp();
  }

  /**
   * 获取所有工具的信息摘要
   */
  public getToolsSummary(): Array<{
    name: string;
    description: string;
    category: ResearchToolCategory;
    version: string;
  }> {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      version: tool.version,
    }));
  }

  /**
   * 注销工具
   */
  public unregisterTool(name: string): boolean {
    const tool = this.tools.get(name);
    if (!tool) {
      return false;
    }

    this.tools.delete(name);

    const categoryTools = this.toolsByCategory.get(tool.category) || [];
    const index = categoryTools.findIndex((t) => t.name === name);
    if (index !== -1) {
      categoryTools.splice(index, 1);
      this.toolsByCategory.set(tool.category, categoryTools);
    }

    return true;
  }

  /**
   * 清空所有工具（用于测试）
   */
  public clearAll(): void {
    this.tools.clear();
    this.toolsByCategory.clear();
    Object.values(ResearchToolCategory).forEach((category) => {
      this.toolsByCategory.set(category, []);
    });
  }
}

/**
 * 导出默认注册中心实例
 */
export const researchToolRegistry = ResearchToolRegistry.getInstance();
