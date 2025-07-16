/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResearchToolRegistry } from './registry.js';
import { ResearchTool, ResearchToolCategory, ResearchToolParams, ResearchToolResult } from './types.js';

// Mock tool for testing
class MockResearchTool implements ResearchTool {
  constructor(
    public name: string,
    public description: string,
    public category: ResearchToolCategory,
    public version: string = '1.0.0'
  ) {}

  async execute(params: ResearchToolParams): Promise<ResearchToolResult> {
    return {
      success: true,
      data: { message: `Mock tool ${this.name} executed successfully` },
      metadata: {
        timestamp: new Date().toISOString(),
        toolName: this.name,
        version: this.version
      }
    };
  }

  validate(params: ResearchToolParams): boolean {
    return true;
  }

  getHelp(): string {
    return `Help for ${this.name}`;
  }
}

describe('ResearchToolRegistry', () => {
  let registry: ResearchToolRegistry;
  let mockTool: MockResearchTool;

  beforeEach(() => {
    registry = ResearchToolRegistry.getInstance();
    // 使用唯一的工具名称避免冲突
    const uniqueName = `test_tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    mockTool = new MockResearchTool(uniqueName, 'Test tool', ResearchToolCategory.ANALYSIS);
  });

  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = ResearchToolRegistry.getInstance();
      const instance2 = ResearchToolRegistry.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('工具注册', () => {
    it('应该成功注册工具', () => {
      registry.registerTool(mockTool);
      
      expect(registry.hasTool(mockTool.name)).toBe(true);
      expect(registry.getTool(mockTool.name)).toBe(mockTool);
    });

    it('应该防止重复注册', () => {
      registry.registerTool(mockTool);
      
      // 尝试重复注册应该被跳过而不是抛出错误（如果已初始化）
      registry.setInitialized(true);
      expect(() => registry.registerTool(mockTool)).not.toThrow();
    });

    it('应该按类别组织工具', () => {
      registry.registerTool(mockTool);
      
      const analysisTool = registry.getToolsByCategory(ResearchToolCategory.ANALYSIS);
      expect(analysisTool).toContain(mockTool);
    });
  });

  describe('工具查找', () => {
    beforeEach(() => {
      registry.registerTool(mockTool);
    });

    it('应该能够查找已注册的工具', () => {
      expect(registry.hasTool(mockTool.name)).toBe(true);
      expect(registry.hasTool('nonexistent_tool')).toBe(false);
    });

    it('应该返回正确的工具实例', () => {
      const tool = registry.getTool(mockTool.name);
      expect(tool).toBe(mockTool);
    });

    it('应该返回所有工具名称', () => {
      const toolNames = registry.getToolNames();
      expect(toolNames).toContain(mockTool.name);
    });

    it('应该返回工具摘要', () => {
      const summary = registry.getToolsSummary();
      expect(summary).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: mockTool.name,
            description: 'Test tool',
            category: ResearchToolCategory.ANALYSIS,
            version: '1.0.0'
          })
        ])
      );
    });
  });

  describe('工具执行', () => {
    beforeEach(() => {
      registry.registerTool(mockTool);
    });

    it('应该成功执行工具', async () => {
      const result = await registry.executeTool(mockTool.name, {});
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ message: `Mock tool ${mockTool.name} executed successfully` });
      expect(result.metadata?.toolName).toBe(mockTool.name);
    });

    it('应该处理不存在的工具', async () => {
      const result = await registry.executeTool('nonexistent_tool', {});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('应该处理参数验证失败', async () => {
      const invalidTool = new MockResearchTool('invalid_tool', 'Invalid tool', ResearchToolCategory.ANALYSIS);
      invalidTool.validate = vi.fn().mockReturnValue(false);
      
      registry.registerTool(invalidTool);
      
      const result = await registry.executeTool('invalid_tool', {});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid parameters');
    });

    it('应该处理工具执行错误', async () => {
      const errorTool = new MockResearchTool('error_tool', 'Error tool', ResearchToolCategory.ANALYSIS);
      errorTool.execute = vi.fn().mockRejectedValue(new Error('Tool execution failed'));
      
      registry.registerTool(errorTool);
      
      const result = await registry.executeTool('error_tool', {});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Tool execution failed');
    });
  });

  describe('初始化状态', () => {
    it('应该跟踪初始化状态', () => {
      // 重置初始化状态进行测试
      registry.setInitialized(false);
      expect(registry.isInitialized()).toBe(false);
      
      registry.setInitialized(true);
      expect(registry.isInitialized()).toBe(true);
      
      registry.setInitialized(false);
      expect(registry.isInitialized()).toBe(false);
    });
  });

  describe('默认工具', () => {
    it('应该包含预期的默认工具', () => {
      const expectedTools = [
        'generate_paper_outline',
        'enhanced_bibliography_manager',
        'generate_experiment_code',
        'latex_manager',
        'match_journal',
        'research_data_analyzer',
        'academic_writing_assistant',
        'submission_preparator'
      ];

      const registeredTools = registry.getToolNames();
      
      expectedTools.forEach(toolName => {
        expect(registeredTools).toContain(toolName);
      });
    });

    it('应该有各种类别的工具', () => {
      const categories = Object.values(ResearchToolCategory);
      
      // 检查是否有工具注册到各个类别
      let hasToolsInCategories = false;
      categories.forEach(category => {
        const tools = registry.getToolsByCategory(category);
        if (tools.length > 0) {
          hasToolsInCategories = true;
        }
      });
      
      expect(hasToolsInCategories).toBe(true);
    });
  });

  describe('工具列表', () => {
    it('应该返回所有注册的工具', () => {
      registry.registerTool(mockTool);
      
      const allTools = registry.getAllTools();
      expect(allTools).toContain(mockTool);
    });

    it('应该按类别过滤工具', () => {
      const writingTool = new MockResearchTool(`writing_tool_${Date.now()}`, 'Writing tool', ResearchToolCategory.WRITING);
      const analysisTool = new MockResearchTool(`analysis_tool_${Date.now()}`, 'Analysis tool', ResearchToolCategory.ANALYSIS);
      
      registry.registerTool(writingTool);
      registry.registerTool(analysisTool);
      
      const writingTools = registry.getToolsByCategory(ResearchToolCategory.WRITING);
      const analysisTools = registry.getToolsByCategory(ResearchToolCategory.ANALYSIS);
      
      expect(writingTools).toContain(writingTool);
      expect(analysisTools).toContain(analysisTool);
      expect(writingTools).not.toContain(analysisTool);
    });
  });
}); 