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

/**
 * /research investigate command implementation
 * 
 * Provides comprehensive literature investigation with keyword-driven search,
 * relevance scoring, and research gap analysis
 */
export const investigateCommand: SlashCommand = {
  name: 'investigate',
  description: 'Comprehensive literature investigation with keyword-driven search and analysis',
  subCommands: [
    {
      name: 'topic',
      description: 'Investigate a research topic with interactive keyword selection',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'research investigate topic');

          const topicTitle = parsed.positional[0];
          const domain = getOptionValue(parsed.options, 'domain', '');
          const maxPapers = getOptionValue(parsed.options, 'max-papers', 80);
          const timeframe = getOptionValue(parsed.options, 'timeframe', '');
          const methodology = getOptionValue(parsed.options, 'methodology', '');
          const context_option = getOptionValue(parsed.options, 'context', '');
          const databases = getOptionValue(parsed.options, 'databases', 'arxiv,scholar,pubmed');
          const interactive = getOptionValue(parsed.options, 'interactive', true);

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

          // Parse optional parameters
          const timeframeParts = timeframe ? String(timeframe).split('-').map(Number) : [];
          const methodologyList = methodology ? String(methodology).split(',').map((m: string) => m.trim()) : [];
          const contextList = context_option ? String(context_option).split(',').map((c: string) => c.trim()) : [];
          const databaseList = String(databases).split(',').map((db: string) => db.trim());

          // Validate databases
          const validDatabases = ['arxiv', 'scholar', 'pubmed', 'ieee'];
          for (const db of databaseList) {
            validateOption(db, validDatabases, 'database');
          }

          // Build research topic object
          const researchTopic = {
            title: topicTitle,
            domain: domain,
            subdomains: [],
            timeframe: timeframeParts.length === 2 ? {
              start: timeframeParts[0],
              end: timeframeParts[1]
            } : undefined,
            methodology: methodologyList.length > 0 ? methodologyList : undefined,
            context: contextList.length > 0 ? contextList : undefined,
          };

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Starting literature investigation for: "${topicTitle}"\n` +
                `Domain: ${domain}\n` +
                `Max Papers: ${maxPapers}\n` +
                `Databases: ${databaseList.join(', ')}\n` +
                `Interactive Mode: ${interactive ? 'Yes' : 'No'}`
              ),
            },
            Date.now(),
          );

          if (interactive) {
            // Start interactive keyword selection workflow
            return {
              type: 'tool',
              toolName: 'literature_investigation_interactive',
              toolArgs: {
                topic: researchTopic,
                maxPapers,
                databases: databaseList,
                interactive: true,
              },
            };
          } else {
            // Direct investigation without keyword selection
            return {
              type: 'tool',
              toolName: 'literature_investigator',
              toolArgs: {
                topic: researchTopic,
                totalMaxPapers: maxPapers,
                databases: databaseList,
              },
            };
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

    {
      name: 'keywords',
      description: 'Generate keyword sequences for a research topic',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'research investigate keywords');

          const topicTitle = parsed.positional[0];
          const domain = getOptionValue(parsed.options, 'domain', '');
          const description = getOptionValue(parsed.options, 'description', '');
          const count = getOptionValue(parsed.options, 'count', 10);

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

          const researchTopic = {
            title: topicTitle,
            domain: domain,
            description: description || undefined,
          };

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Generating ${count} keyword sequences for: "${topicTitle}"`
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'keyword_sequence_generator',
            toolArgs: {
              topic: researchTopic,
              maxSequences: count,
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
      name: 'classify',
      description: 'Classify and categorize research papers',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          
          const source = getOptionValue(parsed.options, 'source', 'recent');
          const format = getOptionValue(parsed.options, 'format', 'summary');
          const categories = getOptionValue(parsed.options, 'categories', 'all');

          // Validate options
          validateOption(source, ['recent', 'file', 'query'], 'source');
          validateOption(format, ['summary', 'detailed', 'export'], 'format');

          let sourceQuery = '';
          if (parsed.positional.length > 0) {
            sourceQuery = parsed.positional.join(' ');
          }

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Classifying papers from source: ${source}\n` +
                `Format: ${format}\n` +
                `Categories: ${categories}`
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'reference_classifier',
            toolArgs: {
              source,
              sourceQuery,
              format,
              categories: categories.split(',').map(c => c.trim()),
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
      name: 'trends',
      description: 'Analyze research trends and identify gaps',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          
          const domain = getOptionValue(parsed.options, 'domain', '');
          const timeframe = getOptionValue(parsed.options, 'timeframe', '2020-2024');
          const analysis_type = getOptionValue(parsed.options, 'type', 'comprehensive');

          if (!domain && parsed.positional.length === 0) {
            context.ui.addItem(
              {
                type: MessageType.ERROR,
                text: formatError('Either domain or search query is required.'),
              },
              Date.now(),
            );
            return;
          }

          const query = parsed.positional.join(' ') || '';
          const timeframeParts = timeframe.split('-').map(Number);

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatInfo(
                `Analyzing research trends\n` +
                `Domain: ${domain || 'from query'}\n` +
                `Query: ${query}\n` +
                `Timeframe: ${timeframe}\n` +
                `Analysis Type: ${analysis_type}`
              ),
            },
            Date.now(),
          );

          return {
            type: 'tool',
            toolName: 'research_trend_analyzer',
            toolArgs: {
              domain: domain || undefined,
              query: query || undefined,
              timeframe: timeframeParts.length === 2 ? {
                start: timeframeParts[0],
                end: timeframeParts[1]
              } : undefined,
              analysisType: analysis_type,
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
      name: 'help',
      description: 'Show detailed help for the investigate command',
      action: async (context: CommandContext): Promise<void> => {
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

CLASSIFY OPTIONS:
  --source        Source of papers (recent, file, query)
  --format        Output format (summary, detailed, export)
  --categories    Classification categories

TRENDS OPTIONS:
  --domain        Research domain
  --timeframe     Analysis timeframe (default: 2020-2024)
  --type          Analysis type (comprehensive, focused)

EXAMPLES:
  /research investigate topic "machine learning in healthcare" --domain=artificial_intelligence --max-papers=50
  /research investigate keywords "quantum computing applications" --domain=physics --count=8
  /research investigate classify --source=recent --format=detailed
  /research investigate trends "deep learning" --domain=machine_learning --timeframe=2020-2024

NOTES:
  - The investigate command provides comprehensive literature analysis beyond simple search
  - Interactive mode allows you to select from generated keyword sequences
  - Classification helps organize papers by research type, methodology, and impact
  - Trend analysis identifies research gaps and emerging opportunities
  - Export formats include Markdown, BibTeX, RIS, and CSV for further analysis
        `;

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
