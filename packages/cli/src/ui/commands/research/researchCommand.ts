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
import {
  formatTable,
  formatSuccess,
  formatError,
  formatInfo,
  TableColumn,
} from './utils/outputFormatter.js';
import {
  handleResearchError,
  validateArguments,
  validateOption,
  executeWithErrorHandling,
} from './utils/errorHandler.js';
import type { ResearchToolRegistry } from '@iechor/research-cli-core';

/**
 * /research 命令实现
 *
 * 子命令：
 * - search <query> [--db=arxiv,pubmed,ieee] [--source=arxiv|scholar] [--limit=10] - 文献搜索
 * - analyze <file> [--type=structure|grammar|style] - 文档分析
 * - experiment <language> <method> - 生成实验代码
 * - data <operation> <file> - 数据分析
 */
export const researchCommand: SlashCommand = {
  name: 'research',
  description:
    'Research tools for literature search, document analysis, and experiment generation',
  subCommands: [
    {
      name: 'search',
      description: 'Search academic literature from multiple sources',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'research search');

          const query = parsed.positional[0];
          const dbParam = getOptionValue(parsed.options, 'db', '') || getOptionValue(parsed.options, 'source', 'arxiv');
          const limit = getOptionValue(parsed.options, 'limit', 10);

          // Handle multiple databases from --db parameter
          const databases = dbParam.includes(',') 
            ? dbParam.split(',').map(db => db.trim())
            : [dbParam];

          // Validate each database
          const validDatabases = ['arxiv', 'scholar', 'pubmed', 'ieee'];
          for (const db of databases) {
            validateOption(db, validDatabases, 'database');
          }

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Searching ${databases.join(', ')} for: "${query}" (limit: ${limit})`,
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'research_manage_bibliography',
            toolArgs: {
              query,
              databases: databases,
              maxResults: limit,
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
      name: 'analyze',
      description: 'Analyze document structure, grammar, or style',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'research analyze');

          const file = parsed.positional[0];
          const analysisType = getOptionValue(
            parsed.options,
            'type',
            'structure',
          ) as string;

          validateOption(
            analysisType,
            [
              'structure',
              'grammar',
              'style',
              'citations',
              'readability',
              'all',
            ],
            'type',
          );

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(`Analyzing ${file} (type: ${analysisType})`),
            },
            Date.now(),
          );

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
      name: 'experiment',
      description: 'Generate experiment code for research',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 2, 'research experiment');

          const language = parsed.positional[0];
          const method = parsed.positional[1];
          const outputDir = getOptionValue(
            parsed.options,
            'output',
            './experiments',
          );

          validateOption(
            language,
            ['python', 'r', 'matlab', 'julia', 'javascript'],
            'language',
          );
          validateOption(
            method,
            ['ml', 'stats', 'numerical', 'simulation', 'data_mining'],
            'method',
          );

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Generating ${language} experiment code for ${method} method`,
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'experiment_code_generator',
            toolArgs: {
              language,
              researchMethod: method,
              outputDirectory: outputDir,
              includeTests: getOptionValue(parsed.options, 'tests', true),
              includeDocs: getOptionValue(parsed.options, 'docs', true),
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
      name: 'data',
      description: 'Analyze research data',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 2, 'research data');

          const operation = parsed.positional[0];
          const file = parsed.positional[1];
          const outputFormat = getOptionValue(
            parsed.options,
            'format',
            'table',
          );

          validateOption(
            operation,
            ['describe', 'correlate', 'visualize', 'test'],
            'operation',
          );
          validateOption(outputFormat, ['table', 'chart', 'report'], 'format');

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(`Performing ${operation} analysis on ${file}`),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'research_data_analyzer',
            toolArgs: {
              operation,
              dataFile: file,
              outputFormat,
              includeVisualizations: getOptionValue(
                parsed.options,
                'viz',
                true,
              ),
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
      name: 'arxiv',
      description: 'ArXiv paper search, download, and management',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        // Parse the arxiv subcommand and arguments
        const parts = args.trim().split(/\s+/);
        const subcommand = parts[0] || 'help';
        const arxivArgs = parts.slice(1);

        // Show help if no subcommand provided
        if (!subcommand || subcommand === 'help') {
          const helpText = buildHelpText({
            name: 'research arxiv',
            description: 'ArXiv paper search, download, and management',
            usage: '/research arxiv <operation> [options]',
            examples: [
              '/research arxiv search "machine learning" --limit=5',
              '/research arxiv download 2301.12345',
              '/research arxiv read 2301.12345',
              '/research arxiv cache',
            ],
            options: [
              {
                name: 'limit',
                description: 'Maximum number of search results',
                type: 'number',
              },
              {
                name: 'categories',
                description: 'ArXiv categories to search in',
                type: 'string',
              },
              {
                name: 'date-from',
                description: 'Search papers from this date',
                type: 'string',
              },
              {
                name: 'date-to',
                description: 'Search papers until this date',
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
          return;
        }

        // Handle arxiv operations
        try {
          let toolArgs: any = {};

          switch (subcommand) {
            case 'search':
              if (arxivArgs.length === 0) {
                throw new Error(
                  'Search requires a query. Usage: /research arxiv search <query>',
                );
              }
              const query = arxivArgs[0];
              const parsed = parseCommandArgs(arxivArgs.slice(1).join(' '));

              toolArgs = {
                operation: 'search',
                query,
                searchOptions: {
                  maxResults: getOptionValue(parsed.options, 'limit', 10),
                  categories: getOptionValue(parsed.options, 'categories', '')
                    ?.split(',')
                    .filter((c) => c),
                  dateFrom: getOptionValue(parsed.options, 'date-from', ''),
                  dateTo: getOptionValue(parsed.options, 'date-to', ''),
                },
              };
              break;

            case 'download':
              if (arxivArgs.length === 0) {
                throw new Error(
                  'Download requires a paper ID. Usage: /research arxiv download <paper-id>',
                );
              }
              toolArgs = {
                operation: 'download',
                paperId: arxivArgs[0],
              };
              break;

            case 'read':
              if (arxivArgs.length === 0) {
                throw new Error(
                  'Read requires a paper ID. Usage: /research arxiv read <paper-id>',
                );
              }
              toolArgs = {
                operation: 'read',
                paperId: arxivArgs[0],
              };
              break;

            case 'cache':
              toolArgs = { operation: 'cache' };
              break;

            default:
              throw new Error(`Unknown arxiv operation: ${subcommand}`);
          }

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(`Executing arXiv ${subcommand} operation...`),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'enhanced_bibliography_manager',
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
      description: 'Show help for research commands',
      action: (context: CommandContext, args: string): void => {
        const helpText = buildHelpText({
          name: 'research',
          description:
            'Research tools for literature search, document analysis, and experiment generation',
          usage: '/research <subcommand> [options]',
          examples: [
            '/research search "machine learning" --db=arxiv,pubmed --limit=5',
            '/research analyze paper.pdf --type=structure',
            '/research experiment python ml --output=./my-experiments',
            '/research data describe dataset.csv --format=report',
          ],
          options: [
            {
              name: 'source',
              description: 'Literature search source',
              type: 'string',
              choices: ['arxiv', 'scholar', 'pubmed', 'ieee'],
            },
            {
              name: 'limit',
              description: 'Maximum number of search results',
              type: 'number',
            },
            {
              name: 'type',
              description: 'Analysis type',
              type: 'string',
              choices: [
                'structure',
                'grammar',
                'style',
                'citations',
                'readability',
                'all',
              ],
            },
            {
              name: 'output',
              description: 'Output directory',
              type: 'string',
            },
            {
              name: 'format',
              description: 'Output format',
              type: 'string',
              choices: ['table', 'chart', 'report'],
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

    {
      name: 'investigate',
      description: 'Comprehensive literature investigation with keyword-driven search and analysis',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          
          if (parsed.positional.length === 0) {
            context.ui.addItem(
              {
                type: MessageType.ERROR,
                text: formatError(
                  'investigate subcommand required. Use: topic, keywords, classify, trends, or help'
                ),
              },
              Date.now(),
            );
            return;
          }

          const subcommand = parsed.positional[0];
          const remainingArgs = parsed.positional.slice(1).join(' ');
          
          // Build args string for subcommand
          let subcommandArgs = remainingArgs;
          Object.entries(parsed.options).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
              subcommandArgs += ` --${key}`;
            } else {
              subcommandArgs += ` --${key}="${value}"`;
            }
          });

          switch (subcommand) {
            case 'topic':
              if (remainingArgs.length === 0) {
                context.ui.addItem(
                  {
                    type: MessageType.ERROR,
                    text: formatError('Topic title is required. Usage: /research investigate topic "research question" --domain=domain'),
                  },
                  Date.now(),
                );
                return;
              }
              
              const domain = getOptionValue(parsed.options, 'domain', '');
              if (!domain) {
                context.ui.addItem(
                  {
                    type: MessageType.ERROR,
                    text: formatError('Domain is required. Use --domain to specify research domain.'),
                  },
                  Date.now(),
                );
                return;
              }

              return {
                type: 'tool',
                toolName: 'research_literature_investigator',
                toolArgs: {
                  topic: {
                    title: remainingArgs,
                    domain: domain,
                  },
                  totalMaxPapers: getOptionValue(parsed.options, 'max-papers', 80),
                  databases: String(getOptionValue(parsed.options, 'databases', 'arxiv,scholar,pubmed')).split(','),
                },
              };

            case 'keywords':
              if (remainingArgs.length === 0) {
                context.ui.addItem(
                  {
                    type: MessageType.ERROR,
                    text: formatError('Topic title is required. Usage: /research investigate keywords "research topic" --domain=domain'),
                  },
                  Date.now(),
                );
                return;
              }

              const keywordDomain = getOptionValue(parsed.options, 'domain', '');
              if (!keywordDomain) {
                context.ui.addItem(
                  {
                    type: MessageType.ERROR,
                    text: formatError('Domain is required. Use --domain to specify research domain.'),
                  },
                  Date.now(),
                );
                return;
              }

              return {
                type: 'tool',
                toolName: 'research_keyword_sequence_generator',
                toolArgs: {
                  topic: {
                    title: remainingArgs,
                    domain: keywordDomain,
                  },
                  maxSequences: getOptionValue(parsed.options, 'count', 10),
                },
              };

            case 'help':
              const helpText = `
Research Investigation Tool

DESCRIPTION:
  Comprehensive literature investigation with keyword-driven search and analysis

SUBCOMMANDS:
  topic     - Investigate a research topic with interactive keyword selection
  keywords  - Generate keyword sequences for a research topic  
  classify  - Classify and categorize research papers
  trends    - Analyze research trends and identify gaps

USAGE:
  /research investigate topic "research question" --domain=domain [options]
  /research investigate keywords "research topic" --domain=domain [options]
  /research investigate classify [query] [options]
  /research investigate trends [query] [options]

TOPIC OPTIONS:
  --domain        Research domain (required)
  --max-papers    Maximum papers to investigate (default: 80)
  --timeframe     Publication timeframe (e.g., 2020-2024)
  --methodology   Comma-separated methodologies
  --context       Comma-separated context terms
  --databases     Comma-separated databases (default: arxiv,scholar,pubmed)
  --interactive   Enable interactive mode (default: true)

KEYWORDS OPTIONS:
  --domain        Research domain (required)
  --description   Detailed topic description
  --count         Number of sequences to generate (default: 10)

EXAMPLES:
  /research investigate topic "machine learning in healthcare" --domain=artificial_intelligence --max-papers=50
  /research investigate keywords "quantum computing applications" --domain=physics --count=8

DOMAINS:
  computer_science, machine_learning, artificial_intelligence, biology, medicine,
  biomedical, physics, chemistry, psychology, sociology, economics
              `;

              context.ui.addItem(
                {
                  type: MessageType.INFO,
                  text: helpText,
                },
                Date.now(),
              );
              return;

            default:
              context.ui.addItem(
                {
                  type: MessageType.ERROR,
                  text: formatError(`Unknown investigate subcommand: ${subcommand}. Use: topic, keywords, classify, trends, or help`),
                },
                Date.now(),
              );
          }
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
  ],
};
