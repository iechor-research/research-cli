/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config, GitService, Logger } from '@iechor/research-cli-core';
import { CommandService } from './CommandService.js';
import { SlashCommand, CommandContext } from '../ui/commands/types.js';
import { LoadedSettings } from '../config/settings.js';
import { HistoryItem } from '../ui/types.js';
import { SessionStatsState } from '../ui/contexts/SessionContext.js';

export interface SlashCommandResult {
  type: 'handled' | 'not_found' | 'schedule_tool';
  message?: string;
  messageType?: 'info' | 'error';
  toolName?: string;
  toolArgs?: Record<string, unknown>;
}

export interface SimpleCommandContext {
  config: Config | null;
  outputMessage: (message: string, type?: 'info' | 'error') => void;
}

/**
 * Standalone slash command processor that can be used by both interactive and non-interactive modes
 */
export class SlashCommandProcessor {
  private commands: SlashCommand[] = [];
  private commandService: CommandService;

  constructor() {
    this.commandService = new CommandService();
  }

  async initialize(): Promise<void> {
    await this.commandService.loadCommands();
    this.commands = this.commandService.getCommands();
  }

  async processCommand(
    input: string,
    context: SimpleCommandContext,
  ): Promise<SlashCommandResult> {
    const trimmed = input.trim();
    if (!trimmed.startsWith('/') && !trimmed.startsWith('?')) {
      return { type: 'not_found' };
    }

    const parts = trimmed.substring(1).trim().split(/\s+/);
    const commandPath = parts.filter((p) => p);

    // Find the command using tree traversal logic
    let currentCommands = this.commands;
    let commandToExecute: SlashCommand | undefined;
    let pathIndex = 0;

    for (const part of commandPath) {
      const foundCommand = currentCommands.find(
        (cmd) => cmd.name === part || cmd.altName === part,
      );

      if (foundCommand) {
        commandToExecute = foundCommand;
        pathIndex++;
        if (foundCommand.subCommands) {
          currentCommands = foundCommand.subCommands;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (commandToExecute) {
      const args = parts.slice(pathIndex).join(' ');

      if (commandToExecute.action) {
        // Create a simplified command context for non-interactive use
        const commandContext: CommandContext = {
          services: {
            config: context.config,
            settings: {} as LoadedSettings, // Minimal settings for basic commands
            git: undefined,
            logger: new Logger('non-interactive'),
          },
          ui: {
            addItem: (itemData: Omit<HistoryItem, 'id'>, baseTimestamp: number): number => {
              // For non-interactive mode, just output the message if it's text
              if (itemData.type === 'info' || itemData.type === 'error') {
                const message = 'text' in itemData ? itemData.text : '';
                if (message) {
                  context.outputMessage(message, itemData.type === 'error' ? 'error' : 'info');
                }
              }
              return baseTimestamp; // Return a dummy ID
            },
            clear: () => {}, // No-op for non-interactive
            setDebugMessage: () => {}, // No-op for non-interactive
          },
          session: {
            stats: {
              sessionStartTime: new Date(),
              metrics: {
                models: {},
                tools: {
                  totalCalls: 0,
                  totalSuccess: 0,
                  totalFail: 0,
                  totalDurationMs: 0,
                  totalDecisions: {
                    accept: 0,
                    reject: 0,
                    modify: 0,
                  },
                  byName: {},
                },
              },
              lastPromptTokenCount: 0,
              promptCount: 0,
            } as SessionStatsState,
          },
        };

        try {
          const result = await commandToExecute.action(commandContext, args);

          if (result) {
            switch (result.type) {
              case 'tool':
                return {
                  type: 'schedule_tool',
                  toolName: result.toolName,
                  toolArgs: result.toolArgs,
                };
              case 'message':
                return {
                  type: 'handled',
                  message: result.content,
                  messageType: result.messageType === 'error' ? 'error' : 'info',
                };
              case 'dialog':
                return {
                  type: 'handled',
                  message: `Dialog action not supported in non-interactive mode: ${result.dialog}`,
                  messageType: 'info',
                };
              default:
                return {
                  type: 'handled',
                  message: 'Command executed successfully',
                  messageType: 'info',
                };
            }
          }

          return { type: 'handled' };
        } catch (error) {
          return {
            type: 'handled',
            message: `Error executing command: ${error instanceof Error ? error.message : String(error)}`,
            messageType: 'error',
          };
        }
      } else if (commandToExecute.subCommands) {
        const helpText = `Command '/${commandToExecute.name}' requires a subcommand. Available:\n${commandToExecute.subCommands
          .map((sc) => `  - ${sc.name}: ${sc.description || ''}`)
          .join('\n')}`;
        return {
          type: 'handled',
          message: helpText,
          messageType: 'info',
        };
      }
    }

    // Handle special legacy commands that need direct implementation
    const mainCommand = parts[0];
    if (mainCommand === 'tools') {
      return await this.handleToolsCommand(context);
    }

    return {
      type: 'not_found',
      message: `Unknown command: ${trimmed}`,
      messageType: 'error',
    };
  }

  private async handleToolsCommand(context: SimpleCommandContext): Promise<SlashCommandResult> {
    try {
      const toolRegistry = await context.config?.getToolRegistry();
      const tools = toolRegistry?.getAllTools();
      if (!tools) {
        return {
          type: 'handled',
          message: 'Could not retrieve tools.',
          messageType: 'error',
        };
      }

      // Filter out MCP tools by checking if they have a serverName property
      const researchTools = tools.filter((tool) => !('serverName' in tool));

      let message = 'Available Research CLI tools:\n\n';

      if (researchTools.length > 0) {
        // Group tools by type
        const coreTools = researchTools.filter((tool) => !tool.name.startsWith('research_'));
        const researchSpecificTools = researchTools.filter((tool) => tool.name.startsWith('research_'));

        if (coreTools.length > 0) {
          message += 'Core Tools:\n';
          coreTools.forEach((tool) => {
            message += `  - ${tool.displayName}\n`;
          });
          message += '\n';
        }

        if (researchSpecificTools.length > 0) {
          message += 'Research Tools:\n';
          researchSpecificTools.forEach((tool) => {
            const cleanName = tool.name.replace('research_', '').replace(/_/g, ' ');
            const displayName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            message += `  - ${displayName}\n`;
          });
        }
      } else {
        message += '  No tools available\n';
      }

      return {
        type: 'handled',
        message: message.trim(),
        messageType: 'info',
      };
    } catch (error) {
      return {
        type: 'handled',
        message: `Error retrieving tools: ${error instanceof Error ? error.message : String(error)}`,
        messageType: 'error',
      };
    }
  }

  getAvailableCommands(): SlashCommand[] {
    return this.commands;
  }
}