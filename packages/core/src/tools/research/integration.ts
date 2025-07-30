/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolRegistry } from '../tool-registry.js';
import { researchToolRegistry } from './registry.js';
import { BaseTool, ToolResult } from '../tools.js';
import { ResearchToolParams } from './types.js';
import { initializeResearchTools } from './init.js';

/**
 * 研究工具适配器
 * 将研究工具适配为标准工具接口
 */
export class ResearchToolAdapter extends BaseTool<
  ResearchToolParams,
  ToolResult
> {
  constructor(
    private readonly researchToolName: string,
    name: string,
    description: string,
    parameterSchema: Record<string, unknown>,
  ) {
    super(
      name,
      researchToolName,
      description,
      parameterSchema,
      true, // isOutputMarkdown - 研究工具通常输出格式化内容
      false, // canUpdateOutput
    );
  }

  async execute(
    params: ResearchToolParams,
    signal: AbortSignal,
  ): Promise<ToolResult> {
    try {
      const result = await researchToolRegistry.executeTool(
        this.researchToolName,
        params,
      );

      if (result.success) {
        const output = this.formatSuccessOutput(result.data);
        return {
          summary: `Research tool '${this.researchToolName}' executed successfully`,
          llmContent: [{ text: output }],
          returnDisplay: output,
        };
      } else {
        const errorMessage = `Error in research tool '${this.researchToolName}': ${result.error}`;
        return {
          summary: `Research tool '${this.researchToolName}' failed`,
          llmContent: [{ text: errorMessage }],
          returnDisplay: errorMessage,
        };
      }
    } catch (error) {
      const errorMessage = `Failed to execute research tool '${this.researchToolName}': ${error instanceof Error ? error.message : 'Unknown error'}`;
      return {
        summary: `Research tool '${this.researchToolName}' crashed`,
        llmContent: [{ text: errorMessage }],
        returnDisplay: errorMessage,
      };
    }
  }

  private formatSuccessOutput(data: unknown): string {
    if (typeof data === 'string') {
      return data;
    }

    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, 2);
    }

    return String(data);
  }
}

/**
 * 将研究工具注册到主工具注册中心
 */
export function registerResearchTools(toolRegistry: ToolRegistry): void {
  // Ensure research tools are initialized first
  if (!researchToolRegistry.isInitialized()) {
    try {
      // Initialize research tools
      initializeResearchTools(researchToolRegistry);
    } catch (error) {
      console.warn('Failed to initialize research tools:', error);
      return;
    }
  }

  const researchTools = researchToolRegistry.getAllTools();

  for (const researchTool of researchTools) {
    const adapter = new ResearchToolAdapter(
      researchTool.name,
      `research_${researchTool.name}`,
      researchTool.description,
      generateParameterSchema(researchTool.name),
    );

    toolRegistry.registerTool(adapter);
  }
}

/**
 * 生成研究工具的参数模式
 * 基于工具名称生成基础参数模式
 */
function generateParameterSchema(toolName: string): Record<string, unknown> {
  // 基础模式
  const baseSchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  // 根据工具名称添加特定参数
  switch (toolName) {
    case 'generate_paper_outline':
      return {
        ...baseSchema,
        properties: {
          research_topic: {
            type: 'string',
            description: 'The research topic for the paper',
          },
          paper_type: {
            type: 'string',
            enum: [
              'research_paper',
              'review',
              'case_study',
              'conference',
              'thesis',
            ],
            description: 'Type of paper to generate',
          },
          citation_style: {
            type: 'string',
            enum: ['apa', 'ieee', 'nature', 'acm', 'chicago'],
            description: 'Citation style to use',
          },
          template: {
            type: 'string',
            description: 'Journal or conference template (optional)',
          },
        },
        required: ['research_topic', 'paper_type', 'citation_style'],
      };

    case 'manage_bibliography':
      return {
        ...baseSchema,
        properties: {
          search_terms: {
            type: 'string',
            description: 'Keywords to search for literature',
          },
          databases: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['arxiv', 'pubmed', 'ieee', 'acm', 'springer'],
            },
            description: 'Databases to search',
          },
          max_results: {
            type: 'number',
            description: 'Maximum number of papers to retrieve',
            minimum: 1,
            maximum: 100,
          },
          year_range: {
            type: 'object',
            properties: {
              start: { type: 'number' },
              end: { type: 'number' },
            },
            description: 'Year range for search (optional)',
          },
        },
        required: ['search_terms', 'databases', 'max_results'],
      };

    case 'generate_experiment_code':
      return {
        ...baseSchema,
        properties: {
          research_method: {
            type: 'string',
            enum: [
              'machine_learning',
              'statistical_analysis',
              'numerical_computation',
              'simulation',
            ],
            description: 'Research method type',
          },
          programming_language: {
            type: 'string',
            enum: ['python', 'r', 'matlab', 'julia'],
            description: 'Programming language for the code',
          },
          data_types: {
            type: 'array',
            items: { type: 'string' },
            description: 'Types of data to work with',
          },
          analysis_methods: {
            type: 'array',
            items: { type: 'string' },
            description: 'Analysis methods to include',
          },
        },
        required: ['research_method', 'programming_language'],
      };

    case 'match_journal':
      return {
        ...baseSchema,
        properties: {
          action: {
            type: 'string',
            enum: ['match', 'search', 'compare', 'analyze', 'recommend'],
            description: 'Action to perform',
          },
          title: {
            type: 'string',
            description: 'Paper title for matching',
          },
          abstract: {
            type: 'string',
            description: 'Paper abstract for content analysis',
          },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'Research keywords',
          },
          research_field: {
            type: 'string',
            enum: [
              'computer_science',
              'engineering',
              'medicine',
              'physics',
              'chemistry',
              'biology',
              'mathematics',
              'psychology',
              'economics',
              'social_sciences',
            ],
            description: 'Primary research field',
          },
          impact_factor_range: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' },
            },
            description: 'Desired impact factor range',
          },
          quartile: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['Q1', 'Q2', 'Q3', 'Q4'],
            },
            description: 'JCR quartiles',
          },
          open_access: {
            type: 'boolean',
            description: 'Prefer open access journals',
          },
          publisher: {
            type: 'array',
            items: { type: 'string' },
            description: 'Preferred publishers',
          },
          journal_names: {
            type: 'array',
            items: { type: 'string' },
            description: 'Journal names for comparison',
          },
          max_results: {
            type: 'number',
            description: 'Maximum number of results',
            minimum: 1,
            maximum: 50,
          },
        },
        required: ['action'],
      };

    default:
      return baseSchema;
  }
}

/**
 * 获取研究工具的帮助信息
 */
export function getResearchToolHelp(toolName: string): string | undefined {
  const cleanToolName = toolName.startsWith('research_')
    ? toolName.substring(9)
    : toolName;

  return researchToolRegistry.getToolHelp(cleanToolName);
}

/**
 * 列出所有可用的研究工具
 */
export function listResearchTools(): string {
  const tools = researchToolRegistry.getToolsSummary();

  if (tools.length === 0) {
    return 'No research tools are currently registered.';
  }

  let output = 'Available Research Tools:\n\n';

  tools.forEach((tool) => {
    output += `**${tool.name}** (v${tool.version})\n`;
    output += `Category: ${tool.category}\n`;
    output += `Description: ${tool.description}\n\n`;
  });

  return output;
}
