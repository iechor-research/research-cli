/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenDialogActionReturn, SlashCommand, SlashCommandActionReturn, MessageActionReturn } from './types.js';

export const helpCommand: SlashCommand = {
  name: 'help',
  altName: '?',
  description: 'for help on research-cli',
  action: (context, _args): SlashCommandActionReturn => {
    // Check if we're in non-interactive mode by checking if the logger sessionId indicates non-interactive
    // In non-interactive mode, the logger is created with 'non-interactive' sessionId
    if ((context.services.logger as any)?.sessionId === 'non-interactive') {
      // Return help content for non-interactive mode
      const helpContent = `Available Research CLI commands:

Core Commands:
  /help, ?             Show this help message
  /about               Show information about Research CLI
  /tools               List available tools
  /clear               Clear the screen
  /model               Manage AI models
  /config              Manage configuration

Research Commands:
  /research help       Show research command help
  /research search     Search academic papers
  /research arxiv      ArXiv operations
  /paper outline       Generate paper outlines
  /submit              Submission tools

Memory Commands:
  /memory show         Show current memory
  /memory add          Add to memory

Use /command help for detailed help on specific commands.`;

      const messageReturn: MessageActionReturn = {
        type: 'message',
        messageType: 'info',
        content: helpContent,
      };
      return messageReturn;
    }

    // Interactive mode - open dialog
    console.debug('Opening help UI ...');
    const dialogReturn: OpenDialogActionReturn = {
      type: 'dialog',
      dialog: 'help',
    };
    return dialogReturn;
  },
};
