/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SlashCommand, SlashCommandActionReturn, CommandContext } from '../types.js';
import { MessageType } from '../../types.js';
import { parseCommandArgs, getOptionValue, buildHelpText } from './utils/commandParser.js';
import { formatTable, formatSuccess, formatError, formatInfo, TableColumn } from './utils/outputFormatter.js';
import { handleResearchError, validateArguments, validateOption, executeWithErrorHandling } from './utils/errorHandler.js';
import type { ResearchToolRegistry } from '@iechor/research-cli-core';

/**
 * /research 命令实现
 * 
 * 子命令：
 * - search <query> [--source=arxiv|scholar] [--limit=10] - 文献搜索
 * - analyze <file> [--type=structure|grammar|style] - 文档分析  
 * - experiment <language> <method> - 生成实验代码
 * - data <operation> <file> - 数据分析
 */
export const researchCommand: SlashCommand = {
  name: 'research',
  description: 'Research tools for literature search, document analysis, and experiment generation',
  subCommands: [
    {
      name: 'search',
      description: 'Search academic literature from multiple sources',
      action: async (context: CommandContext, args: string): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'research search');

          const query = parsed.positional[0];
          const source = getOptionValue(parsed.options, 'source', 'arxiv');
          const limit = getOptionValue(parsed.options, 'limit', 10);

          validateOption(source, ['arxiv', 'scholar', 'pubmed', 'ieee'], 'source');

          context.ui.addItem({
            type: MessageType.INFO,
            text: formatInfo(`Searching ${source} for: "${query}" (limit: ${limit})`)
          }, Date.now());

          return {
            type: 'tool',
            toolName: 'bibliography_manager',
            toolArgs: {
              operation: 'search',
              query,
              sources: [source],
              maxResults: limit
            }
          };
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem({
            type: MessageType.ERROR,
            text: errorResult.message + '\n\nSuggestions:\n' + errorResult.suggestions.map(s => `  • ${s}`).join('\n')
          }, Date.now());
        }
      }
    },

    {
      name: 'analyze',
      description: 'Analyze document structure, grammar, or style',
      action: async (context: CommandContext, args: string): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'research analyze');

          const file = parsed.positional[0];
          const analysisType = getOptionValue(parsed.options, 'type', 'structure') as string;

          validateOption(analysisType, ['structure', 'grammar', 'style', 'citations', 'readability', 'all'], 'type');

          context.ui.addItem({
            type: MessageType.INFO,
            text: formatInfo(`Analyzing ${file} (type: ${analysisType})`)
          }, Date.now());

          // 根据分析类型调用不同的写作助手功能
          let operation: string;
          switch (analysisType) {
            case 'structure':
              operation = 'analyze_structure';
              break;
            case 'grammar':
              operation = 'check_grammar';
              break;
            case 'style':
              operation = 'improve_style';
              break;
            case 'citations':
              operation = 'verify_citations';
              break;
            case 'readability':
              operation = 'check_readability';
              break;
            case 'all':
              operation = 'comprehensive_review';
              break;
            default:
              operation = 'analyze_structure';
          }

          return {
            type: 'tool',
            toolName: 'read_file',
            toolArgs: { path: file }
          };

        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem({
            type: MessageType.ERROR,
            text: errorResult.message + '\n\nSuggestions:\n' + errorResult.suggestions.map(s => `  • ${s}`).join('\n')
          }, Date.now());
        }
      }
    },

    {
      name: 'experiment',
      description: 'Generate experiment code for research',
      action: async (context: CommandContext, args: string): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 2, 'research experiment');

          const language = parsed.positional[0];
          const method = parsed.positional[1];
          const outputDir = getOptionValue(parsed.options, 'output', './experiments');

          validateOption(language, ['python', 'r', 'matlab', 'julia', 'javascript'], 'language');
          validateOption(method, ['ml', 'stats', 'numerical', 'simulation', 'data_mining'], 'method');

          context.ui.addItem({
            type: MessageType.INFO,
            text: formatInfo(`Generating ${language} experiment code for ${method} method`)
          }, Date.now());

          return {
            type: 'tool',
            toolName: 'experiment_code_generator',
            toolArgs: {
              language,
              researchMethod: method,
              outputDirectory: outputDir,
              includeTests: getOptionValue(parsed.options, 'tests', true),
              includeDocs: getOptionValue(parsed.options, 'docs', true)
            }
          };
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem({
            type: MessageType.ERROR,
            text: errorResult.message + '\n\nSuggestions:\n' + errorResult.suggestions.map(s => `  • ${s}`).join('\n')
          }, Date.now());
        }
      }
    },

    {
      name: 'data',
      description: 'Analyze research data',
      action: async (context: CommandContext, args: string): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 2, 'research data');

          const operation = parsed.positional[0];
          const file = parsed.positional[1];
          const outputFormat = getOptionValue(parsed.options, 'format', 'table');

          validateOption(operation, ['describe', 'correlate', 'visualize', 'test'], 'operation');
          validateOption(outputFormat, ['table', 'chart', 'report'], 'format');

          context.ui.addItem({
            type: MessageType.INFO,
            text: formatInfo(`Performing ${operation} analysis on ${file}`)
          }, Date.now());

          return {
            type: 'tool',
            toolName: 'research_data_analyzer',
            toolArgs: {
              operation,
              dataFile: file,
              outputFormat,
              includeVisualizations: getOptionValue(parsed.options, 'viz', true)
            }
          };
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem({
            type: MessageType.ERROR,
            text: errorResult.message + '\n\nSuggestions:\n' + errorResult.suggestions.map(s => `  • ${s}`).join('\n')
          }, Date.now());
        }
      }
    },

    {
      name: 'help',
      description: 'Show help for research commands',
      action: (context: CommandContext, args: string): void => {
        const helpText = buildHelpText({
          name: 'research',
          description: 'Research tools for literature search, document analysis, and experiment generation',
          usage: '/research <subcommand> [options]',
          examples: [
            '/research search "machine learning" --source=arxiv --limit=5',
            '/research analyze paper.pdf --type=structure',
            '/research experiment python ml --output=./my-experiments',
            '/research data describe dataset.csv --format=report'
          ],
          options: [
            {
              name: 'source',
              description: 'Literature search source',
              type: 'string',
              choices: ['arxiv', 'scholar', 'pubmed', 'ieee']
            },
            {
              name: 'limit',
              description: 'Maximum number of search results',
              type: 'number'
            },
            {
              name: 'type',
              description: 'Analysis type',
              type: 'string',
              choices: ['structure', 'grammar', 'style', 'citations', 'readability', 'all']
            },
            {
              name: 'output',
              description: 'Output directory',
              type: 'string'
            },
            {
              name: 'format',
              description: 'Output format',
              type: 'string',
              choices: ['table', 'chart', 'report']
            }
          ]
        });

        context.ui.addItem({
          type: MessageType.INFO,
          text: helpText
        }, Date.now());
      }
    }
  ]
}; 