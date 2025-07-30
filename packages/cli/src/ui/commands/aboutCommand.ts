/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SlashCommand, SlashCommandActionReturn, MessageActionReturn } from './types.js';
import { getCliVersion } from '../../utils/version.js';

export const aboutCommand: SlashCommand = {
  name: 'about',
  description: 'Show information about Research CLI',
  action: async (context, _args): Promise<SlashCommandActionReturn> => {
    // Check if we're in non-interactive mode
    if ((context.services.logger as any)?.sessionId === 'non-interactive') {
      // Return CLI info for non-interactive mode
      const cliVersion = await getCliVersion();
      const osVersion = process.platform;
      const modelVersion = context.services.config?.getModel() || 'Unknown';
      
      const aboutContent = `Research CLI - Academic Research Assistant

Version: ${cliVersion}
Platform: ${osVersion}
Model: ${modelVersion}

Research CLI is an interactive command-line tool for academic research,
providing AI-powered assistance for literature search, paper analysis,
and research workflow management.

For help, use: research --help or /help`;

      const messageReturn: MessageActionReturn = {
        type: 'message',
        messageType: 'info',
        content: aboutContent,
      };
      return messageReturn;
    }

    // Interactive mode - add about message to history
    const cliVersion = await getCliVersion();
    const osVersion = process.platform;
    let sandboxEnv = 'no sandbox';
    if (process.env.SANDBOX && process.env.SANDBOX !== 'sandbox-exec') {
      sandboxEnv = process.env.SANDBOX;
    } else if (process.env.SANDBOX === 'sandbox-exec') {
      sandboxEnv = `sandbox-exec (${process.env.SEATBELT_PROFILE || 'unknown'})`;
    }
    const modelVersion = context.services.config?.getModel() || 'Unknown';
    const selectedAuthType = (context.services.settings as any)?.merged?.selectedAuthType || '';
    const gcpProject = process.env.GOOGLE_CLOUD_PROJECT || '';

    context.ui.addItem({
      type: 'about',
      cliVersion,
      osVersion,
      sandboxEnv,
      modelVersion,
      selectedAuthType,
      gcpProject,
    } as any, Date.now());

    return { type: 'message', messageType: 'info', content: '' };
  },
};