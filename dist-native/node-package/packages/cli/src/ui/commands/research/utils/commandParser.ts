/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 解析命令行参数
 *
 * 支持格式：
 * - 位置参数：command arg1 arg2
 * - 选项参数：command --option=value --flag
 * - 短选项：command -o value -f
 */
export interface ParsedArgs {
  positional: string[];
  options: Record<string, string | boolean>;
}

/**
 * 解析命令行参数字符串
 */
export function parseCommandArgs(argsString: string): ParsedArgs {
  const args = argsString
    .trim()
    .split(/\s+/)
    .filter((arg) => arg.length > 0);
  const positional: string[] = [];
  const options: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      // 长选项格式：--option=value 或 --flag
      const equalIndex = arg.indexOf('=');
      if (equalIndex > 0) {
        const key = arg.substring(2, equalIndex);
        const value = arg.substring(equalIndex + 1);
        options[key] = value;
      } else {
        const key = arg.substring(2);
        // 检查下一个参数是否是值
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          options[key] = args[++i];
        } else {
          options[key] = true;
        }
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      // 短选项格式：-o value 或 -f
      const key = arg.substring(1);
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options[key] = args[++i];
      } else {
        options[key] = true;
      }
    } else {
      // 位置参数
      positional.push(arg);
    }
  }

  return { positional, options };
}

/**
 * 验证必需的位置参数
 */
export function validateRequiredArgs(
  args: string[],
  required: number,
  commandName: string,
): string | null {
  if (args.length < required) {
    return `Command ${commandName} requires at least ${required} arguments, got ${args.length}`;
  }
  return null;
}

/**
 * 获取选项值，支持默认值
 */
export function getOptionValue<T>(
  options: Record<string, string | boolean>,
  key: string,
  defaultValue: T,
): T {
  const value = options[key];
  if (value === undefined) {
    return defaultValue;
  }

  // 尝试类型转换
  if (typeof defaultValue === 'number') {
    const numValue = Number(value);
    return (isNaN(numValue) ? defaultValue : numValue) as T;
  }

  if (typeof defaultValue === 'boolean') {
    if (typeof value === 'boolean') {
      return value as T;
    }
    return (value === 'true' || value === '1') as T;
  }

  return value as T;
}

/**
 * 验证选项值是否在允许的值列表中
 */
export function validateChoice(
  value: string | undefined,
  choices: string[],
  optionName: string,
): string | null {
  if (value && !choices.includes(value)) {
    return `Invalid value '${value}' for option ${optionName}. Valid choices: ${choices.join(', ')}`;
  }
  return null;
}

/**
 * 构建帮助文本
 */
export interface CommandHelp {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  options: Array<{
    name: string;
    description: string;
    type: 'string' | 'number' | 'boolean';
    required?: boolean;
    choices?: string[];
  }>;
}

export function buildHelpText(help: CommandHelp): string {
  let text = `\n${help.description}\n\n`;
  text += `Usage: ${help.usage}\n\n`;

  if (help.options.length > 0) {
    text += 'Options:\n';
    for (const option of help.options) {
      const required = option.required ? ' (required)' : '';
      const choices = option.choices ? ` [${option.choices.join('|')}]` : '';
      text += `  --${option.name}${choices}  ${option.description}${required}\n`;
    }
    text += '\n';
  }

  if (help.examples.length > 0) {
    text += 'Examples:\n';
    for (const example of help.examples) {
      text += `  ${example}\n`;
    }
  }

  return text;
}
