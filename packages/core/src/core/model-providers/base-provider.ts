/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IModelProvider,
  ModelProvider,
  ModelConfig,
  ChatRequest,
  ChatResponse,
  StreamResponse,
  ModelInfo,
  ConfigurationError,
  APIError,
  AuthenticationError,
  RateLimitError,
} from './types.js';

/**
 * 模型提供商基础抽象类
 */
export abstract class BaseModelProvider implements IModelProvider {
  protected config: ModelConfig | null = null;
  protected initialized = false;

  constructor(public readonly name: ModelProvider) {}

  /**
   * 初始化提供商
   */
  async initialize(config: ModelConfig): Promise<void> {
    if (!this.validateConfig(config)) {
      throw new ConfigurationError(`Invalid configuration for ${this.name}`, this.name);
    }
    
    this.config = { ...this.getDefaultConfig(), ...config };
    await this.doInitialize();
    this.initialized = true;
  }

  /**
   * 发送聊天请求
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    this.ensureInitialized();
    return this.doChat(request);
  }

  /**
   * 发送流式聊天请求
   */
  async *streamChat(request: ChatRequest): AsyncGenerator<StreamResponse> {
    this.ensureInitialized();
    yield* this.doStreamChat(request);
  }

  /**
   * 获取可用模型列表
   */
  async getModels(): Promise<ModelInfo[]> {
    this.ensureInitialized();
    return this.doGetModels();
  }

  /**
   * 验证配置
   */
  validateConfig(config: ModelConfig): boolean {
    if (!config.provider || config.provider !== this.name) {
      return false;
    }
    if (!config.model) {
      return false;
    }
    return this.doValidateConfig(config);
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<ModelConfig> {
    return {
      provider: this.name,
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1.0,
      timeout: 30000,
    };
  }

  /**
   * 检查是否支持特定功能
   */
  supportsFeature(feature: string): boolean {
    const supportedFeatures = this.getSupportedFeatures();
    return supportedFeatures.includes(feature);
  }

  /**
   * 获取支持的功能列表
   */
  protected getSupportedFeatures(): string[] {
    return ['chat', 'stream'];
  }

  /**
   * 确保提供商已初始化
   */
  protected ensureInitialized(): void {
    if (!this.initialized || !this.config) {
      throw new ConfigurationError(`Provider ${this.name} not initialized`, this.name);
    }
  }

  /**
   * 获取当前配置
   */
  protected getConfig(): ModelConfig {
    if (!this.config) {
      throw new ConfigurationError(`Provider ${this.name} not initialized`, this.name);
    }
    return this.config;
  }

  /**
   * 处理API错误
   */
  protected handleError(error: any): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      switch (status) {
        case 401:
          throw new AuthenticationError(message, this.name, error);
        case 429:
          const retryAfter = error.response.headers['retry-after'];
          throw new RateLimitError(message, this.name, retryAfter, error);
        default:
          throw new APIError(message, this.name, status, error);
      }
    }
    
    throw new APIError(error.message || 'Unknown error', this.name, undefined, error);
  }

  /**
   * 标准化消息格式
   */
  protected normalizeMessages(messages: ChatRequest['messages']): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * 标准化响应格式
   */
  protected normalizeResponse(response: any, model: string): ChatResponse {
    return {
      content: this.extractContent(response),
      model,
      provider: this.name,
      usage: this.extractUsage(response),
      finishReason: this.extractFinishReason(response),
      metadata: this.extractMetadata(response),
    };
  }

  /**
   * 标准化流式响应格式
   */
  protected normalizeStreamResponse(chunk: any, model: string, fullContent: string): StreamResponse {
    const delta = this.extractDelta(chunk);
    return {
      content: fullContent + delta,
      delta,
      done: this.isStreamDone(chunk),
      model,
      provider: this.name,
      usage: this.extractUsage(chunk),
      finishReason: this.extractFinishReason(chunk),
    };
  }

  // 抽象方法 - 子类必须实现
  protected abstract doInitialize(): Promise<void>;
  protected abstract doChat(request: ChatRequest): Promise<ChatResponse>;
  protected abstract doStreamChat(request: ChatRequest): AsyncGenerator<StreamResponse>;
  protected abstract doGetModels(): Promise<ModelInfo[]>;
  protected abstract doValidateConfig(config: ModelConfig): boolean;

  // 响应处理方法 - 子类可以覆盖
  protected abstract extractContent(response: any): string;
  protected abstract extractDelta(chunk: any): string;
  protected abstract isStreamDone(chunk: any): boolean;
  
  protected extractUsage(response: any): ChatResponse['usage'] | undefined {
    return undefined;
  }
  
  protected extractFinishReason(response: any): ChatResponse['finishReason'] | undefined {
    return undefined;
  }
  
  protected extractMetadata(response: any): Record<string, any> | undefined {
    return undefined;
  }
} 