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
} from '../research/utils/commandParser.js';
import {
  formatSuccess,
  formatError,
  formatInfo,
  formatTable,
  TableColumn,
} from '../research/utils/outputFormatter.js';
import {
  handleResearchError,
  validateArguments,
} from '../research/utils/errorHandler.js';
import {
  ResearchConfigManager,
  ResearchConfigScope,
  ResearchSettings,
  DEFAULT_RESEARCH_CONFIG,
} from '@iechor/research-cli-core';

/**
 * /config 命令实现
 *
 * 子命令：
 * - show [research] - 显示配置
 * - set <key> <value> [--scope=user|workspace|system] - 设置配置项
 * - get <key> - 获取配置项
 * - reset [research] [--scope=user|workspace|system] - 重置配置
 * - validate [research] - 验证配置
 * - export [research] [--include-defaults] - 导出配置
 * - import <file> [--scope=user|workspace] - 导入配置
 */
export const configCommand: SlashCommand = {
  name: 'config',
  description: 'Configuration management for research-cli settings',
  subCommands: [
    {
      name: 'show',
      description: 'Show current configuration',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          const configType = parsed.positional[0] || 'all';

          if (configType === 'research' || configType === 'all') {
            const configManager = new ResearchConfigManager();
            const config = await configManager.getResearchConfig();

            // 格式化配置显示
            const configText = formatResearchConfig(config);

            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: formatInfo('Research Configuration:\n\n' + configText),
              },
              Date.now(),
            );
          }

          if (configType === 'general' || configType === 'all') {
            // TODO: 显示通用配置
            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: formatInfo(
                  'General configuration display not yet implemented.',
                ),
              },
              Date.now(),
            );
          }
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text: errorResult.message,
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'set',
      description: 'Set a configuration value',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 2, 'config set');

          const keyPath = parsed.positional[0];
          const value = parsed.positional[1];
          const scope = getOptionValue(
            parsed.options,
            'scope',
            'user',
          ) as string;

          // 检查是否是研究配置
          if (
            keyPath.startsWith('research.') ||
            keyPath.startsWith('defaults.') ||
            keyPath.startsWith('apis.') ||
            keyPath.startsWith('latex.')
          ) {
            const configManager = new ResearchConfigManager();
            const configScope = mapStringToScope(scope);

            // 解析值类型
            const parsedValue = parseConfigValue(value);

            await configManager.setResearchConfig(
              configScope,
              keyPath,
              parsedValue,
            );

            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: formatSuccess(
                  `Set ${keyPath} = ${value} (scope: ${scope})`,
                ),
              },
              Date.now(),
            );
          } else {
            // TODO: 处理通用配置
            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: formatInfo(
                  'General configuration setting not yet implemented.',
                ),
              },
              Date.now(),
            );
          }
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text: errorResult.message,
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'get',
      description: 'Get a configuration value',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'config get');

          const keyPath = parsed.positional[0];

          if (
            keyPath.startsWith('research.') ||
            keyPath.startsWith('defaults.') ||
            keyPath.startsWith('apis.') ||
            keyPath.startsWith('latex.')
          ) {
            const configManager = new ResearchConfigManager();
            const value = await configManager.getConfigValue(keyPath);

            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: formatInfo(
                  `${keyPath} = ${JSON.stringify(value, null, 2)}`,
                ),
              },
              Date.now(),
            );
          } else {
            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: formatInfo(
                  'General configuration getting not yet implemented.',
                ),
              },
              Date.now(),
            );
          }
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text: errorResult.message,
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'reset',
      description: 'Reset configuration to defaults',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          const configType = parsed.positional[0] || 'research';
          const scope = getOptionValue(
            parsed.options,
            'scope',
            'user',
          ) as string;

          if (configType === 'research') {
            const configManager = new ResearchConfigManager();
            const configScope = mapStringToScope(scope);

            await configManager.resetConfig(configScope);

            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: formatSuccess(
                  `Reset research configuration (scope: ${scope})`,
                ),
              },
              Date.now(),
            );
          }
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text: errorResult.message,
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'validate',
      description: 'Validate configuration',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          const configType = parsed.positional[0] || 'research';

          if (configType === 'research') {
            const configManager = new ResearchConfigManager();
            const config = await configManager.getResearchConfig();
            const validation = configManager.validateConfig(config);

            let message = formatSuccess(
              'Configuration validation completed.\n\n',
            );

            if (validation.isValid) {
              message += '✅ No validation errors found.\n';
            } else {
              message += `❌ Found ${validation.errors.length} error(s):\n`;
              validation.errors.forEach((error) => {
                message += `  • ${error.path}: ${error.message}\n`;
              });
            }

            if (validation.warnings.length > 0) {
              message += `\n⚠️ Found ${validation.warnings.length} warning(s):\n`;
              validation.warnings.forEach((warning) => {
                message += `  • ${warning.path}: ${warning.message}\n`;
              });
            }

            context.ui.addItem(
              {
                type: validation.isValid ? MessageType.INFO : MessageType.ERROR,
                text: message,
              },
              Date.now(),
            );
          }
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text: errorResult.message,
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'export',
      description: 'Export configuration',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          const configType = parsed.positional[0] || 'research';
          const includeDefaults = getOptionValue(
            parsed.options,
            'include-defaults',
            false,
          );

          if (configType === 'research') {
            const configManager = new ResearchConfigManager();
            const configJson =
              await configManager.exportConfig(includeDefaults);

            context.ui.addItem(
              {
                type: MessageType.INFO,
                text: formatSuccess(
                  'Research configuration exported:\n\n```json\n' +
                    configJson +
                    '\n```',
                ),
              },
              Date.now(),
            );
          }
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text: errorResult.message,
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'import',
      description: 'Import configuration from file or JSON',
      action: async (
        context: CommandContext,
        args: string,
      ): Promise<void | SlashCommandActionReturn> => {
        try {
          const parsed = parseCommandArgs(args);
          validateArguments(parsed.positional, 1, 'config import');

          const configData = parsed.positional[0];
          const scope = getOptionValue(
            parsed.options,
            'scope',
            'user',
          ) as string;

          const configManager = new ResearchConfigManager();
          const configScope = mapStringToScope(scope);

          // 假设传入的是JSON字符串，实际应用中可能需要文件读取
          await configManager.importConfig(configData, configScope);

          context.ui.addItem(
            {
              type: MessageType.INFO,
              text: formatSuccess(
                `Configuration imported successfully (scope: ${scope})`,
              ),
            },
            Date.now(),
          );
        } catch (error) {
          const errorResult = handleResearchError(error);
          context.ui.addItem(
            {
              type: MessageType.ERROR,
              text: errorResult.message,
            },
            Date.now(),
          );
        }
      },
    },

    {
      name: 'help',
      description: 'Show configuration command help',
      action: (context: CommandContext, args: string): void => {
        const helpText = buildHelpText({
          name: 'config',
          description: 'Configuration management for research-cli settings',
          usage: '/config <subcommand> [options]',
          examples: [
            '/config show research',
            '/config set defaults.citationStyle APA --scope=user',
            '/config get apis.arxiv.enabled',
            '/config validate research',
            '/config export research --include-defaults',
            '/config reset research --scope=user',
          ],
          options: [
            {
              name: 'scope',
              description: 'Configuration scope',
              type: 'string',
              choices: ['system', 'user', 'workspace'],
            },
            {
              name: 'include-defaults',
              description: 'Include default values in export',
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

/**
 * 格式化研究配置显示
 */
function formatResearchConfig(config: ResearchSettings): string {
  let output = '';

  if (config.defaults) {
    output += '📋 Defaults:\n';
    output += `  Citation Style: ${config.defaults.citationStyle || 'Not set'}\n`;
    output += `  Paper Type: ${config.defaults.paperType || 'Not set'}\n`;
    output += `  Research Field: ${config.defaults.researchField || 'Not set'}\n`;
    output += `  Output Format: ${config.defaults.outputFormat || 'Not set'}\n\n`;
  }

  if (config.apis) {
    output += '🔌 APIs:\n';
    if (config.apis.arxiv) {
      output += `  ArXiv: ${config.apis.arxiv.enabled ? '✅ Enabled' : '❌ Disabled'}\n`;
    }
    if (config.apis.pubmed) {
      output += `  PubMed: ${config.apis.pubmed.enabled ? '✅ Enabled' : '❌ Disabled'}\n`;
    }
    if (config.apis.ieee) {
      output += `  IEEE: ${config.apis.ieee.enabled ? '✅ Enabled' : '❌ Disabled'}\n`;
    }
    output += '\n';
  }

  if (config.latex && config.latex.authorInfo) {
    output += '📝 Author Info:\n';
    output += `  Name: ${config.latex.authorInfo.name || 'Not set'}\n`;
    output += `  Email: ${config.latex.authorInfo.email || 'Not set'}\n`;
    output += `  Affiliation: ${config.latex.authorInfo.affiliation || 'Not set'}\n\n`;
  }

  if (config.analysis) {
    output += '📊 Analysis:\n';
    output += `  Default Visualization: ${config.analysis.defaultVisualization ? '✅ Yes' : '❌ No'}\n`;
    output += `  Significance Level: ${config.analysis.significanceLevel || 'Not set'}\n`;
    output += `  Correlation Method: ${config.analysis.correlationMethod || 'Not set'}\n\n`;
  }

  return output || 'No configuration found.';
}

/**
 * 映射字符串到配置作用域
 */
function mapStringToScope(scope: string): ResearchConfigScope {
  switch (scope.toLowerCase()) {
    case 'system':
      return ResearchConfigScope.SYSTEM;
    case 'user':
      return ResearchConfigScope.USER;
    case 'workspace':
      return ResearchConfigScope.WORKSPACE;
    default:
      throw new Error(
        `Invalid scope: ${scope}. Must be one of: system, user, workspace`,
      );
  }
}

/**
 * 解析配置值类型
 */
function parseConfigValue(value: string): unknown {
  // 尝试解析为JSON
  try {
    return JSON.parse(value);
  } catch {
    // 解析布尔值
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // 解析数字
    const numValue = Number(value);
    if (!isNaN(numValue)) return numValue;

    // 返回字符串
    return value;
  }
}
