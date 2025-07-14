/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ResearchTool, 
  ResearchToolCategory, 
  ResearchToolParams, 
  ResearchToolResult 
} from './types.js';

/**
 * 研究工具基础抽象类
 * 提供通用功能和模板方法模式
 */
export abstract class BaseResearchTool implements ResearchTool {
  public readonly name: string;
  public readonly description: string;
  public readonly category: ResearchToolCategory;
  public readonly version: string;

  protected constructor(
    name: string,
    description: string,
    category: ResearchToolCategory,
    version: string = '1.0.0'
  ) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.version = version;
  }

  /**
   * 执行工具的主要方法
   * 实现模板方法模式，提供统一的执行流程
   */
  public async execute(params: ResearchToolParams): Promise<ResearchToolResult> {
    const startTime = Date.now();

    try {
      // 1. 预处理
      await this.preProcess(params);

      // 2. 执行具体逻辑
      const data = await this.executeImpl(params);

      // 3. 后处理
      const processedData = await this.postProcess(data, params);

      // 4. 返回成功结果
      return {
        success: true,
        data: processedData,
        metadata: {
          timestamp: new Date().toISOString(),
          toolName: this.name,
          version: this.version,
          executionTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          timestamp: new Date().toISOString(),
          toolName: this.name,
          version: this.version,
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * 验证参数的抽象方法
   * 每个具体工具必须实现自己的参数验证逻辑
   */
  public abstract validate(params: ResearchToolParams): boolean;

  /**
   * 获取帮助信息的抽象方法
   * 每个具体工具必须提供自己的帮助信息
   */
  public abstract getHelp(): string;

  /**
   * 执行具体逻辑的抽象方法
   * 每个具体工具必须实现自己的核心逻辑
   */
  protected abstract executeImpl(params: ResearchToolParams): Promise<unknown>;

  /**
   * 预处理钩子方法
   * 子类可以重写此方法来执行预处理逻辑
   */
  protected async preProcess(params: ResearchToolParams): Promise<void> {
    // 默认实现：验证参数
    if (!this.validate(params)) {
      throw new Error(`Invalid parameters for tool '${this.name}'`);
    }
  }

  /**
   * 后处理钩子方法
   * 子类可以重写此方法来执行后处理逻辑
   */
  protected async postProcess(data: unknown, params: ResearchToolParams): Promise<unknown> {
    // 默认实现：直接返回数据
    return data;
  }

  /**
   * 验证必需参数
   * 工具方法，帮助子类验证必需参数
   */
  protected validateRequiredParams(params: ResearchToolParams, requiredKeys: string[]): boolean {
    for (const key of requiredKeys) {
      if (!(key in params) || params[key] === undefined || params[key] === null) {
        return false;
      }
    }
    return true;
  }

  /**
   * 验证参数类型
   * 工具方法，帮助子类验证参数类型
   */
  protected validateParamType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return false;
    }
  }

  /**
   * 创建错误结果
   * 工具方法，帮助子类创建错误结果
   */
  protected createErrorResult(error: string): ResearchToolResult {
    return {
      success: false,
      error,
      metadata: {
        timestamp: new Date().toISOString(),
        toolName: this.name,
        version: this.version,
      },
    };
  }

  /**
   * 创建成功结果
   * 工具方法，帮助子类创建成功结果
   */
  protected createSuccessResult(data: unknown): ResearchToolResult {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        toolName: this.name,
        version: this.version,
      },
    };
  }

  /**
   * 日志方法
   * 工具方法，帮助子类记录日志
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const logMessage = `[${this.name}] ${message}`;
    switch (level) {
      case 'info':
        console.info(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'error':
        console.error(logMessage, data || '');
        break;
    }
  }

  /**
   * 格式化帮助信息
   * 工具方法，帮助子类格式化帮助信息
   */
  protected formatHelp(
    purpose: string,
    parameters: Array<{ name: string; type: string; required: boolean; description: string }>,
    examples?: Array<{ description: string; params: Record<string, unknown> }>
  ): string {
    let help = `${this.name} (v${this.version})\n`;
    help += `Category: ${this.category}\n`;
    help += `Description: ${this.description}\n\n`;
    help += `Purpose: ${purpose}\n\n`;
    
    help += 'Parameters:\n';
    parameters.forEach(param => {
      const required = param.required ? '(required)' : '(optional)';
      help += `  - ${param.name} (${param.type}) ${required}: ${param.description}\n`;
    });

    if (examples && examples.length > 0) {
      help += '\nExamples:\n';
      examples.forEach((example, index) => {
        help += `  ${index + 1}. ${example.description}\n`;
        help += `     Parameters: ${JSON.stringify(example.params, null, 2)}\n`;
      });
    }

    return help;
  }
} 