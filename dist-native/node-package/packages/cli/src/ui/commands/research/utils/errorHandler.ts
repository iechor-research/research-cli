/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { formatError, formatWarning } from './outputFormatter.js';

/**
 * 研究命令错误类型
 */
export enum ResearchErrorType {
  INVALID_ARGUMENTS = 'INVALID_ARGUMENTS',
  MISSING_REQUIRED = 'MISSING_REQUIRED',
  TOOL_EXECUTION_FAILED = 'TOOL_EXECUTION_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FORMAT = 'INVALID_FORMAT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 研究命令错误类
 */
export class ResearchCommandError extends Error {
  public readonly type: ResearchErrorType;
  public readonly suggestions: string[];
  public readonly details?: any;

  constructor(
    message: string,
    type: ResearchErrorType = ResearchErrorType.UNKNOWN_ERROR,
    suggestions: string[] = [],
    details?: any
  ) {
    super(message);
    this.name = 'ResearchCommandError';
    this.type = type;
    this.suggestions = suggestions;
    this.details = details;
  }
}

/**
 * 错误处理器接口
 */
export interface ErrorHandlerResult {
  message: string;
  suggestions: string[];
  shouldRetry: boolean;
}

/**
 * 处理研究命令错误，返回用户友好的错误信息
 */
export function handleResearchError(error: unknown): ErrorHandlerResult {
  if (error instanceof ResearchCommandError) {
    return {
      message: formatError(error.message),
      suggestions: error.suggestions,
      shouldRetry: error.type === ResearchErrorType.NETWORK_ERROR
    };
  }

  if (error instanceof Error) {
    // 识别常见错误模式并提供有用建议
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('not found') || errorMessage.includes('enoent')) {
      return {
        message: formatError('File or directory not found'),
        suggestions: [
          'Check if the file path is correct',
          'Make sure the file exists',
          'Try using absolute paths instead of relative paths'
        ],
        shouldRetry: false
      };
    }

    if (errorMessage.includes('permission') || errorMessage.includes('eacces')) {
      return {
        message: formatError('Permission denied'),
        suggestions: [
          'Check file permissions',
          'Make sure you have read/write access',
          'Try running with appropriate permissions'
        ],
        shouldRetry: false
      };
    }

    if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connect')) {
      return {
        message: formatError('Network connection failed'),
        suggestions: [
          'Check your internet connection',
          'Verify the service is available',
          'Try again in a few minutes'
        ],
        shouldRetry: true
      };
    }

    if (errorMessage.includes('syntax') || errorMessage.includes('parse')) {
      return {
        message: formatError('Invalid format or syntax'),
        suggestions: [
          'Check the command syntax',
          'Verify file format is correct',
          'Use --help for usage information'
        ],
        shouldRetry: false
      };
    }

    return {
      message: formatError(error.message),
      suggestions: ['Try using --help for more information'],
      shouldRetry: false
    };
  }

  return {
    message: formatError('An unknown error occurred'),
    suggestions: [
      'Try running the command again',
      'Check the command syntax',
      'Use --help for usage information'
    ],
    shouldRetry: false
  };
}

/**
 * 验证参数并抛出适当的错误
 */
export function validateArguments(
  args: string[],
  required: number,
  commandName: string
): void {
  if (args.length < required) {
    throw new ResearchCommandError(
      `Command '${commandName}' requires at least ${required} arguments, got ${args.length}`,
      ResearchErrorType.MISSING_REQUIRED,
      [
        `Use /${commandName} help to see usage information`,
        'Check the command syntax',
        'Make sure all required arguments are provided'
      ]
    );
  }
}

/**
 * 验证选项值
 */
export function validateOption(
  value: string | undefined,
  validValues: string[],
  optionName: string
): void {
  if (value && !validValues.includes(value)) {
    throw new ResearchCommandError(
      `Invalid value '${value}' for option --${optionName}`,
      ResearchErrorType.INVALID_ARGUMENTS,
      [
        `Valid values are: ${validValues.join(', ')}`,
        `Use /${optionName} help for more information`
      ]
    );
  }
}

/**
 * 验证文件存在性
 */
export function validateFileExists(filePath: string): void {
  try {
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      throw new ResearchCommandError(
        `File not found: ${filePath}`,
        ResearchErrorType.FILE_NOT_FOUND,
        [
          'Check if the file path is correct',
          'Make sure the file exists',
          'Use absolute paths if relative paths are not working'
        ]
      );
    }
  } catch (error) {
    if (error instanceof ResearchCommandError) {
      throw error;
    }
    throw new ResearchCommandError(
      `Cannot access file: ${filePath}`,
      ResearchErrorType.PERMISSION_DENIED,
      [
        'Check file permissions',
        'Make sure you have read access to the file'
      ]
    );
  }
}

/**
 * 包装工具执行，处理错误
 */
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ResearchCommandError) {
      throw error;
    }

    throw new ResearchCommandError(
      `Failed to execute ${operationName}: ${error instanceof Error ? error.message : String(error)}`,
      ResearchErrorType.TOOL_EXECUTION_FAILED,
      [
        'Check your input parameters',
        'Verify the tool is properly configured',
        'Try running the command again'
      ],
      error
    );
  }
}

/**
 * 格式化警告消息
 */
export function formatValidationWarning(message: string, suggestions: string[] = []): string {
  let result = formatWarning(message);
  if (suggestions.length > 0) {
    result += '\n\nSuggestions:\n';
    result += suggestions.map(s => `  • ${s}`).join('\n');
  }
  return result;
} 