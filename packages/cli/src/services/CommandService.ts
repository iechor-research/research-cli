/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SlashCommand } from '../ui/commands/types.js';
import { memoryCommand } from '../ui/commands/memoryCommand.js';
import { helpCommand } from '../ui/commands/helpCommand.js';
import { clearCommand } from '../ui/commands/clearCommand.js';
import { themeCommand } from '../ui/commands/themeCommand.js';
import { allResearchCommands } from '../ui/commands/research/index.js';

const loadBuiltInCommands = async (): Promise<SlashCommand[]> => [
  clearCommand,
  helpCommand,
  memoryCommand,
  themeCommand,
  ...allResearchCommands  // 添加所有研究命令
];

export class CommandService {
  private commands: SlashCommand[] = [];

  constructor(
    private commandLoader: () => Promise<SlashCommand[]> = loadBuiltInCommands,
  ) {
    // The constructor can be used for dependency injection in the future.
  }

  async loadCommands(): Promise<void> {
    // For now, we only load the built-in commands.
    // File-based and remote commands will be added later.
    process.stderr.write('[FORCE_DEBUG] CommandService.loadCommands called\n');
    this.commands = await this.commandLoader();
    process.stderr.write(`[FORCE_DEBUG] CommandService.loadCommands completed, loaded: ${this.commands.map(c => c.name).join(', ')}\n`);
  }

  getCommands(): SlashCommand[] {
    process.stderr.write(`[FORCE_DEBUG] CommandService.getCommands called, returning: ${this.commands.map(c => c.name).join(', ')}\n`);
    return this.commands;
  }
}
