/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Content, GenerateContentConfig } from '@google/genai';

/**
 * 支持的模型提供商类型
 */
export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  DEEPSEEK = 'deepseek',
  QWEN = 'qwen',
  GEMINI = 'gemini',
  GROQ = 'groq',
  MISTRAL = 'mistral',
  COHERE = 'cohere',
  HUGGINGFACE = 'huggingface',
  OLLAMA = 'ollama',
  TOGETHER = 'together',
  FIREWORKS = 'fireworks',
  REPLICATE = 'replicate',
  PERPLEXITY = 'perplexity',
  BEDROCK = 'bedrock',
  VERTEX_AI = 'vertex_ai',
}

/**
 * 模型配置接口
 */
export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  timeout?: number;
  // 特定提供商的额外配置
  extra?: Record<string, any>;
}

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * 聊天请求接口
 */
export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  stream?: boolean;
}

/**
 * 聊天响应接口
 */
export interface ChatResponse {
  content: string;
  model: string;
  provider: ModelProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  metadata?: Record<string, any>;
}

/**
 * 流式响应接口
 */
export interface StreamResponse {
  content: string;
  delta: string;
  done: boolean;
  model: string;
  provider: ModelProvider;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_calls';
}

/**
 * 模型信息接口
 */
export interface ModelInfo {
  id: string;
  name: string;
  provider: ModelProvider;
  description?: string;
  contextLength?: number;
  maxTokens?: number;
  supportedFeatures?: string[];
  pricing?: {
    input: number;
    output: number;
    currency: string;
  };
}

/**
 * 模型提供商接口
 */
export interface IModelProvider {
  /**
   * 提供商名称
   */
  readonly name: ModelProvider;

  /**
   * 初始化提供商
   */
  initialize(config: ModelConfig): Promise<void>;

  /**
   * 发送聊天请求
   */
  chat(request: ChatRequest): Promise<ChatResponse>;

  /**
   * 发送流式聊天请求
   */
  streamChat(request: ChatRequest): AsyncGenerator<StreamResponse>;

  /**
   * 获取可用模型列表
   */
  getModels(): Promise<ModelInfo[]>;

  /**
   * 验证配置
   */
  validateConfig(config: ModelConfig): boolean;

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<ModelConfig>;

  /**
   * 检查是否支持特定功能
   */
  supportsFeature(feature: string): boolean;
}

/**
 * 模型提供商工厂接口
 */
export interface IModelProviderFactory {
  /**
   * 创建模型提供商实例
   */
  createProvider(provider: ModelProvider): IModelProvider;

  /**
   * 获取支持的提供商列表
   */
  getSupportedProviders(): ModelProvider[];

  /**
   * 注册新的提供商
   */
  registerProvider(
    provider: ModelProvider,
    factory: () => IModelProvider,
  ): void;
}

/**
 * 模型选择器接口
 */
export interface IModelSelector {
  /**
   * 选择模型
   */
  selectModel(provider: ModelProvider, model: string): Promise<void>;

  /**
   * 获取当前选择的模型
   */
  getCurrentModel(): { provider: ModelProvider; model: string } | null;

  /**
   * 获取所有可用模型
   */
  getAvailableModels(): Promise<ModelInfo[]>;

  /**
   * 发送消息
   */
  sendMessage(request: ChatRequest): Promise<ChatResponse>;

  /**
   * 发送流式消息
   */
  streamMessage(request: ChatRequest): AsyncGenerator<StreamResponse>;
}

/**
 * 错误类型
 */
export class ModelProviderError extends Error {
  constructor(
    message: string,
    public provider: ModelProvider,
    public code?: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'ModelProviderError';
  }
}

/**
 * 配置错误
 */
export class ConfigurationError extends ModelProviderError {
  constructor(message: string, provider: ModelProvider, cause?: Error) {
    super(message, provider, 'CONFIGURATION_ERROR', cause);
    this.name = 'ConfigurationError';
  }
}

/**
 * API错误
 */
export class APIError extends ModelProviderError {
  constructor(
    message: string,
    provider: ModelProvider,
    public statusCode?: number,
    cause?: Error,
  ) {
    super(message, provider, 'API_ERROR', cause);
    this.name = 'APIError';
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends ModelProviderError {
  constructor(message: string, provider: ModelProvider, cause?: Error) {
    super(message, provider, 'AUTHENTICATION_ERROR', cause);
    this.name = 'AuthenticationError';
  }
}

/**
 * 速率限制错误
 */
export class RateLimitError extends ModelProviderError {
  constructor(
    message: string,
    provider: ModelProvider,
    public retryAfter?: number,
    cause?: Error,
  ) {
    super(message, provider, 'RATE_LIMIT_ERROR', cause);
    this.name = 'RateLimitError';
  }
}
