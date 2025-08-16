/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// 导出所有研究命令
export { researchCommand } from './researchCommand.js';
export { paperCommand } from './paperCommand.js';
export { submitCommand } from './submitCommand.js';
export { ArXivCommand } from './arxivCommand.js';
export { investigateCommand } from './investigateCommand.js';

// 导出类型定义
export * from './types.js';

// 导出工具函数
export * from './utils/commandParser.js';
export * from './utils/outputFormatter.js';
export * from './utils/errorHandler.js';

// 为CommandService提供的研究命令数组
import { researchCommand } from './researchCommand.js';
import { paperCommand } from './paperCommand.js';
import { submitCommand } from './submitCommand.js';
import { investigateCommand } from './investigateCommand.js';
import { configCommand } from '../config/configCommand.js';
import { SlashCommand } from '../types.js';
import { ArXivCommand } from './arxivCommand.js';

/**
 * 所有研究相关的命令
 */
export const allResearchCommands: SlashCommand[] = [
  researchCommand,
  paperCommand,
  submitCommand,
  investigateCommand,
  configCommand,
];

/**
 * 获取研究命令的工厂函数
 * 用于延迟加载或动态注册
 */
export function getResearchCommands(): SlashCommand[] {
  return allResearchCommands;
}
