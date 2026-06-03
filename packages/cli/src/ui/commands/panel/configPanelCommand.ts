/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { SlashCommand, SlashCommandActionReturn, MessageActionReturn } from '../types.js';

export const configPanelCommand: SlashCommand = {
  name: 'config-panel',
  altNames: 'panel config',
  description: 'Open configuration panel in web browser',
  kind: CommandKind.BUILT_IN,

  action: async (context, args): Promise<SlashCommandActionReturn> => {
    const { services } = context;
    const logger = services.logger;

    try {
      // Parse options
      const argsArray = args.split(' ').filter(Boolean);
      const portArg = argsArray.includes('--port') ?
        argsArray[argsArray.indexOf('--port') + 1] : '3001';
      const port = parseInt(portArg);

      if (isNaN(port)) {
        throw new Error(`Invalid port number: ${portArg}`);
      }

      const host = argsArray.includes('--host') ?
        argsArray[argsArray.indexOf('--host') + 1] : 'localhost';

      // For now, return a message indicating the feature is coming soon
      // TODO: Implement panel server in next phase
      const messageReturn: MessageActionReturn = {
        type: 'message',
        messageType: 'info',
        content: `Configuration panel feature is coming soon!\nPlanned URL: http://${host}:${port}\n\nThis will provide a web interface for managing all research-cli configuration settings.`,
      };

      return messageReturn;

    } catch (error) {
      const errorReturn: MessageActionReturn = {
        type: 'message',
        messageType: 'error',
        content: `Failed to start configuration panel: ${error}`,
      };
      return errorReturn;
    }
  }
};
