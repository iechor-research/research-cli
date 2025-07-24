/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SlashCommand,
  SlashCommandActionReturn,
  CommandContext,
} from '../types.js';
import { MessageType } from '../../types.js';
import {
  parseCommandArgs,
  getOptionValue,
  buildHelpText,
} from './utils/commandParser.js';
import { formatSuccess, formatInfo } from './utils/outputFormatter.js';
import {
  handleResearchError,
  validateArguments,
  validateOption,
} from './utils/errorHandler.js';

/**
 * /paper 命令实现
 *
 * 子命令：
 * - outline <type> <field> [--journal=name] - 生成论文大纲
 * - write <section> [--style=academic|technical] - 写作辅助
 * - check <file> [--all|--grammar|--style|--citations] - 全面检查
 * - bib <operation> [options] - 文献管理
 */
export const paperCommand: SlashCommand = {
  name: 'paper',
  description:
    'Paper writing tools for outline generation, writing assistance, and review',
  subCommands: [
    {
      name: 'outline',
      description: 'Generate paper outline based on type and research field',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 2, 'paper outline');

          const paperType = parsed.positional[0];
          const researchField = parsed.positional[1];
          const journal = getOptionValue(
            parsed.options,
            'journal',
            '',
          ) as string;
          const targetLength = getOptionValue(parsed.options, 'length', 8000);

          validateOption(
            paperType,
            [
              'SURVEY',
              'EXPERIMENTAL',
              'THEORETICAL',
              'EMPIRICAL',
              'CONCEPTUAL',
            ],
            'type',
          );
          validateOption(
            researchField,
            [
              'COMPUTER_SCIENCE',
              'BIOLOGY',
              'PHYSICS',
              'MATHEMATICS',
              'ENGINEERING',
            ],
            'field',
          );

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Generating ${paperType.toLowerCase()} paper outline for ${researchField.toLowerCase()}${journal ? ` (${journal})` : ''}`,
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'paper_outline_generator',
            toolArgs: {
              paperType,
              researchField,
              targetJournal: journal || undefined,
              targetLength,
              includeTimeline: getOptionValue(parsed.options, 'timeline', true),
              includeBibliography: getOptionValue(parsed.options, 'bib', true),
            },
          };
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text:
                errorResult.message +
                '\n\nSuggestions:\n' +
                errorResult.suggestions.map((s) => `  • ${s}`).join('\n'),
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'write',
      description: 'Get writing assistance for specific paper sections',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'paper write');

          const section = parsed.positional[0];
          const style = getOptionValue(
            parsed.options,
            'style',
            'academic',
          ) as string;
          const length = getOptionValue(parsed.options, 'length', 500);

          validateOption(
            style,
            ['academic', 'technical', 'formal', 'informal'],
            'style',
          );

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Generating writing assistance for ${section} section (${style} style, ~${length} words)`,
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'academic_writing_assistant',
            toolArgs: {
              operation: 'comprehensive_review',
              content: `Please provide writing guidance for the ${section} section of an academic paper. Style: ${style}. Target length: ${length} words.`,
              documentType: 'paper',
              targetAudience: 'academic',
            },
          };
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text:
                errorResult.message +
                '\n\nSuggestions:\n' +
                errorResult.suggestions.map((s) => `  • ${s}`).join('\n'),
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'check',
      description:
        'Check paper for grammar, style, citations, or overall quality',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'paper check');

          const file = parsed.positional[0];
          const checkType = getOptionValue(
            parsed.options,
            'type',
            'all',
          ) as string;

          validateOption(
            checkType,
            [
              'all',
              'grammar',
              'style',
              'citations',
              'structure',
              'readability',
            ],
            'type',
          );

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(`Checking ${file} (${checkType} analysis)`),
            },
            Date.now(),
          );

          // 先读取文件内容
          return {
            type: 'tool',
            toolName: 'read_file',
            toolArgs: { path: file },
          };
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text:
                errorResult.message +
                '\n\nSuggestions:\n' +
                errorResult.suggestions.map((s) => `  • ${s}`).join('\n'),
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'bib',
      description: 'Manage bibliography and citations',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'paper bib');

          const operation = parsed.positional[0];
          const query = parsed.positional[1] || '';

          validateOption(
            operation,
            ['search', 'add', 'remove', 'list', 'format'],
            'operation',
          );

          let toolArgs: any = { operation };

          switch (operation) {
            case 'search':
              if (!query) {
                throw new Error('Search operation requires a query');
              }
              toolArgs = {
                operation: 'search',
                query,
                sources: getOptionValue(
                  parsed.options,
                  'sources',
                  'arxiv',
                ).split(','),
                maxResults: getOptionValue(parsed.options, 'limit', 10),
              };
              break;

            case 'format':
              toolArgs = {
                operation: 'format',
                style: getOptionValue(parsed.options, 'style', 'APA') as string,
                outputFile: getOptionValue(
                  parsed.options,
                  'output',
                  '',
                ) as string,
              };
              break;

            case 'list':
              toolArgs = { operation: 'list' };
              break;

            default:
              if (!query) {
                throw new Error(
                  `${operation} operation requires additional arguments`,
                );
              }
              toolArgs.target = query;
          }

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Performing bibliography ${operation}${query ? ` for: ${query}` : ''}`,
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'manage_bibliography',
            toolArgs,
          };
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text:
                errorResult.message +
                '\n\nSuggestions:\n' +
                errorResult.suggestions.map((s) => `  • ${s}`).join('\n'),
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'help',
      description: 'Show help for paper commands',
      action: (context: CommandContext, args: string): void => {
        const helpText = buildHelpText({
          name: 'paper',
          description:
            'Paper writing tools for outline generation, writing assistance, and review',
          usage: '/paper <subcommand> [options]',
          examples: [
            '/paper outline EXPERIMENTAL COMPUTER_SCIENCE --journal="Nature" --length=6000',
            '/paper write introduction --style=academic --length=800',
            '/paper check draft.pdf --type=grammar',
            '/paper bib search "neural networks" --sources=arxiv,scholar --limit=5',
            '/paper bib format --style=IEEE --output=references.bib',
          ],
          options: [
            {
              name: 'journal',
              description: 'Target journal name',
              type: 'string',
            },
            {
              name: 'length',
              description:
                'Target length (words for writing, total for outline)',
              type: 'number',
            },
            {
              name: 'style',
              description: 'Writing or citation style',
              type: 'string',
              choices: [
                'academic',
                'technical',
                'formal',
                'APA',
                'IEEE',
                'MLA',
              ],
            },
            {
              name: 'type',
              description: 'Check type',
              type: 'string',
              choices: [
                'all',
                'grammar',
                'style',
                'citations',
                'structure',
                'readability',
              ],
            },
            {
              name: 'sources',
              description: 'Bibliography sources (comma-separated)',
              type: 'string',
            },
            {
              name: 'limit',
              description: 'Maximum number of results',
              type: 'number',
            },
            {
              name: 'output',
              description: 'Output file path',
              type: 'string',
            },
          ],
        });

        context.ui.addItem(
          {
            type: MessageType.INFO,
            text: helpText,
          },
          Date.now(),
        );
      },
    },
  ],
};
