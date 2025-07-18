/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenDialogActionReturn, SlashCommand } from './types.js';

export const helpCommand: SlashCommand = {
  name: 'help',
  altName: '?',
  description: 'for help on research-cli',
  action: (_context, _args): OpenDialogActionReturn => {
    console.debug('Opening help UI ...');
    return {
      type: 'dialog',
      dialog: 'help',
    };
  },
};
