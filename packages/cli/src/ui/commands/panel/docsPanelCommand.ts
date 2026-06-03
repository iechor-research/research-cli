/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import type { SlashCommand, SlashCommandActionReturn, MessageActionReturn } from '../types.js';
import { CommandKind } from '../types.js';

export const docsPanelCommand: SlashCommand = {
  name: 'docs-panel',
  altNames: ['panel docs'],
  description: 'Open documentation panel in web browser',
  kind: CommandKind.BUILT_IN,
  
  action: async (_context, args): Promise<SlashCommandActionReturn> => {
    
    try {
      // Parse options
      const argsArray = args.split(' ').filter(Boolean);
      const portArg = argsArray.includes('--port') ? 
        argsArray[argsArray.indexOf('--port') + 1] : '3002';
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
        content: `Documentation panel feature is coming soon!\nPlanned URL: http://${host}:${port}\n\nThis will provide a web interface for browsing research-cli generated documentation and research content.`,
      };
      
      return messageReturn;
      
    } catch (error) {
      const errorReturn: MessageActionReturn = {
        type: 'message',
        messageType: 'error',
        content: `Failed to start documentation panel: ${error}`,
      };
      return errorReturn;
    }
  }
}; 
