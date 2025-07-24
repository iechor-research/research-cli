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
 * /submit 命令实现
 *
 * 子命令：
 * - match <title> <abstract> [--field=cs|bio|physics] - 期刊匹配
 * - prepare <paper-file> <journal> [--format=pdf|latex] - 准备投稿包
 * - latex <operation> <project-path> - LaTeX项目管理
 */
export const submitCommand: SlashCommand = {
  name: 'submit',
  description:
    'Submission preparation tools for journal matching, package preparation, and LaTeX management',
  subCommands: [
    {
      name: 'match',
      description: 'Find suitable journals based on paper title and abstract',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 2, 'submit match');

          const title = parsed.positional[0];
          const abstract = parsed.positional[1];
          const field = getOptionValue(
            parsed.options,
            'field',
            'COMPUTER_SCIENCE',
          ) as string;
          const maxResults = getOptionValue(parsed.options, 'limit', 5);

          validateOption(
            field,
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
                `Matching journals for paper in ${field.toLowerCase()} (showing top ${maxResults} matches)`,
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'journal_matcher',
            toolArgs: {
              operation: 'match',
              title,
              abstract,
              researchField: field,
              maxResults,
              includeMetrics: getOptionValue(parsed.options, 'metrics', true),
              filterByImpactFactor: getOptionValue(parsed.options, 'min-if', 0),
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
      name: 'prepare',
      description: 'Prepare submission package for a target journal',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 2, 'submit prepare');

          const paperFile = parsed.positional[0];
          const journal = parsed.positional[1];
          const format = getOptionValue(
            parsed.options,
            'format',
            'pdf',
          ) as string;
          const outputDir = getOptionValue(
            parsed.options,
            'output',
            './submission',
          ) as string;

          validateOption(format, ['pdf', 'latex', 'word'], 'format');

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Preparing ${format} submission package for ${journal}`,
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'submission_preparer',
            toolArgs: {
              operation: 'prepare',
              paperFile,
              targetJournal: journal,
              outputFormat: format,
              outputDirectory: outputDir,
              includeSupplementary: getOptionValue(
                parsed.options,
                'supplementary',
                true,
              ),
              anonymize: getOptionValue(parsed.options, 'anonymous', false),
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
      name: 'latex',
      description: 'Manage LaTeX projects for academic papers',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 2, 'submit latex');

          const operation = parsed.positional[0];
          const projectPath = parsed.positional[1];

          validateOption(
            operation,
            ['create', 'compile', 'clean', 'check', 'template', 'package'],
            'operation',
          );

          let toolArgs: any = {
            operation,
            projectPath,
          };

          // 根据操作类型设置特定参数
          switch (operation) {
            case 'create':
              toolArgs.template = getOptionValue(
                parsed.options,
                'template',
                'ieee_conference',
              ) as string;
              toolArgs.title = getOptionValue(
                parsed.options,
                'title',
                'Untitled Paper',
              ) as string;
              toolArgs.authors = getOptionValue(
                parsed.options,
                'authors',
                'Author Name',
              ) as string;
              break;

            case 'compile':
              toolArgs.engine = getOptionValue(
                parsed.options,
                'engine',
                'PDFLATEX',
              ) as string;
              toolArgs.bibtex = getOptionValue(parsed.options, 'bibtex', true);
              toolArgs.clean = getOptionValue(parsed.options, 'clean', false);
              break;

            case 'template':
              toolArgs.templateType = getOptionValue(
                parsed.options,
                'type',
                'ieee_conference',
              ) as string;
              validateOption(
                toolArgs.templateType,
                [
                  'ieee_conference',
                  'acm_article',
                  'springer_journal',
                  'thesis',
                ],
                'type',
              );
              break;

            case 'package':
              toolArgs.outputFormat = getOptionValue(
                parsed.options,
                'format',
                'zip',
              ) as string;
              toolArgs.includeSource = getOptionValue(
                parsed.options,
                'source',
                true,
              );
              break;
          }

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Performing LaTeX ${operation} on ${projectPath}`,
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'latex_manager',
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
      description: 'Show help for submission commands',
      action: (context: CommandContext, args: string): void => {
        const helpText = buildHelpText({
          name: 'submit',
          description:
            'Submission preparation tools for journal matching, package preparation, and LaTeX management',
          usage: '/submit <subcommand> [options]',
          examples: [
            '/submit match "Deep Learning for NLP" "This paper presents..." --field=COMPUTER_SCIENCE --limit=3',
            '/submit prepare paper.pdf "Nature Machine Intelligence" --format=pdf --output=./submission',
            '/submit latex create ./my-paper --template=ieee_conference --title="My Research"',
            '/submit latex compile ./my-paper --engine=PDFLATEX --bibtex',
            '/submit latex clean ./my-paper',
          ],
          options: [
            {
              name: 'field',
              description: 'Research field for journal matching',
              type: 'string',
              choices: [
                'COMPUTER_SCIENCE',
                'BIOLOGY',
                'PHYSICS',
                'MATHEMATICS',
                'ENGINEERING',
              ],
            },
            {
              name: 'limit',
              description: 'Maximum number of journal matches',
              type: 'number',
            },
            {
              name: 'format',
              description: 'Output format',
              type: 'string',
              choices: ['pdf', 'latex', 'word', 'zip'],
            },
            {
              name: 'output',
              description: 'Output directory',
              type: 'string',
            },
            {
              name: 'template',
              description: 'LaTeX template type',
              type: 'string',
              choices: [
                'ieee_conference',
                'acm_article',
                'springer_journal',
                'thesis',
              ],
            },
            {
              name: 'engine',
              description: 'LaTeX compilation engine',
              type: 'string',
              choices: ['PDFLATEX', 'XELATEX', 'LUALATEX'],
            },
            {
              name: 'title',
              description: 'Paper title',
              type: 'string',
            },
            {
              name: 'authors',
              description: 'Paper authors',
              type: 'string',
            },
            {
              name: 'anonymous',
              description: 'Create anonymous submission',
              type: 'boolean',
            },
            {
              name: 'supplementary',
              description: 'Include supplementary materials',
              type: 'boolean',
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
