/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IModelProvider,
  IModelProviderFactory,
  ModelProvider,
  ConfigurationError,
} from './types.js';
import { LLMInterfaceProvider } from './llm-interface-provider.js';

/**
 * 模型提供商工厂实现
 */
export class ModelProviderFactory implements IModelProviderFactory {
  private providerFactories: Map<ModelProvider, () => IModelProvider> = new Map();

  constructor() {
    this.registerDefaultProviders();
  }

  /**
   * 注册默认提供商
   */
  private registerDefaultProviders(): void {
    // 注册所有支持的提供商
    const supportedProviders = [
      ModelProvider.OPENAI,
      ModelProvider.ANTHROPIC,
      ModelProvider.DEEPSEEK,
      ModelProvider.QWEN,
      ModelProvider.GEMINI,
      ModelProvider.GROQ,
      ModelProvider.MISTRAL,
      ModelProvider.COHERE,
      ModelProvider.HUGGINGFACE,
      ModelProvider.OLLAMA,
      ModelProvider.TOGETHER,
      ModelProvider.FIREWORKS,
      ModelProvider.REPLICATE,
      ModelProvider.PERPLEXITY,
      ModelProvider.BEDROCK,
      ModelProvider.VERTEX_AI,
    ];

    supportedProviders.forEach(provider => {
      this.providerFactories.set(provider, () => new LLMInterfaceProvider(provider));
    });
  }

  /**
   * 创建模型提供商实例
   */
  createProvider(provider: ModelProvider): IModelProvider {
    const factory = this.providerFactories.get(provider);
    if (!factory) {
      throw new ConfigurationError(`Unsupported provider: ${provider}`, provider);
    }
    return factory();
  }

  /**
   * 获取支持的提供商列表
   */
  getSupportedProviders(): ModelProvider[] {
    return Array.from(this.providerFactories.keys());
  }

  /**
   * 注册新的提供商
   */
  registerProvider(provider: ModelProvider, factory: () => IModelProvider): void {
    this.providerFactories.set(provider, factory);
  }

  /**
   * 取消注册提供商
   */
  unregisterProvider(provider: ModelProvider): void {
    this.providerFactories.delete(provider);
  }

  /**
   * 检查是否支持某个提供商
   */
  isSupported(provider: ModelProvider): boolean {
    return this.providerFactories.has(provider);
  }
}

/**
 * 单例工厂实例
 */
export const modelProviderFactory = new ModelProviderFactory(); 