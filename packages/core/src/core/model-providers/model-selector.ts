/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IModelSelector,
  IModelProvider,
  ModelProvider,
  ModelConfig,
  ChatRequest,
  ChatResponse,
  StreamResponse,
  ModelInfo,
  ConfigurationError,
} from './types.js';
import { modelProviderFactory } from './model-provider-factory.js';

/**
 * 模型选择器实现
 */
export class ModelSelector implements IModelSelector {
  private currentProvider: IModelProvider | null = null;
  private currentModel: string | null = null;
  private providerConfigs: Map<ModelProvider, ModelConfig> = new Map();

  /**
   * 添加提供商配置
   */
  addProviderConfig(config: ModelConfig): void {
    this.providerConfigs.set(config.provider, config);
  }

  /**
   * 获取提供商配置
   */
  getProviderConfig(provider: ModelProvider): ModelConfig | undefined {
    return this.providerConfigs.get(provider);
  }

  /**
   * 移除提供商配置
   */
  removeProviderConfig(provider: ModelProvider): void {
    this.providerConfigs.delete(provider);
    if (this.currentProvider?.name === provider) {
      this.currentProvider = null;
      this.currentModel = null;
    }
  }

  /**
   * 选择模型
   */
  async selectModel(provider: ModelProvider, model: string): Promise<void> {
    const config = this.providerConfigs.get(provider);
    if (!config) {
      throw new ConfigurationError(
        `No configuration found for provider: ${provider}`,
        provider,
      );
    }

    // 创建新的提供商实例
    const providerInstance = modelProviderFactory.createProvider(provider);

    // 使用指定的模型更新配置
    const modelConfig = { ...config, model };

    try {
      // 尝试初始化提供商
      await providerInstance.initialize(modelConfig);

      // 验证模型是否存在
      const availableModels = await providerInstance.getModels();
      const modelExists = availableModels.some((m) => m.id === model);

      if (!modelExists) {
        throw new ConfigurationError(
          `Model ${model} not found for provider ${provider}`,
          provider,
        );
      }

      this.currentProvider = providerInstance;
      this.currentModel = model;
    } catch (error) {
      // 如果初始化失败（通常是认证问题），仍然允许选择模型
      // 但在实际使用时会显示认证错误
      console.warn(`Warning: Provider ${provider} initialization failed:`, error);
      
      // 验证模型是否在静态定义中存在
      const allModels = await this.getAvailableModels();
      const modelExists = allModels.some((m) => m.provider === provider && m.id === model);
      
      if (!modelExists) {
        throw new ConfigurationError(
          `Model ${model} not found for provider ${provider}`,
          provider,
        );
      }

      // 设置为未初始化的提供商实例，但记录选择的模型
      this.currentProvider = providerInstance;
      this.currentModel = model;
    }
  }

  /**
   * 获取当前选择的模型
   */
  getCurrentModel(): { provider: ModelProvider; model: string } | null {
    if (!this.currentProvider || !this.currentModel) {
      return null;
    }
    return {
      provider: this.currentProvider.name,
      model: this.currentModel,
    };
  }

  /**
   * 获取所有可用模型
   */
  async getAvailableModels(): Promise<ModelInfo[]> {
    const allModels: ModelInfo[] = [];
    
    // 获取所有支持的提供商，不仅仅是已配置的
    const allProviders = Object.values(ModelProvider);
    
    for (const provider of allProviders) {
      const config = this.providerConfigs.get(provider);
      
      try {
        if (config) {
          // 有配置的情况下，尝试正常初始化
          const providerInstance = modelProviderFactory.createProvider(provider);
          await providerInstance.initialize(config);
          const models = await providerInstance.getModels();
          allModels.push(...models);
        } else {
          // 没有配置的情况下，添加静态模型定义（如果支持）
          this.addStaticModelsForProvider(provider, allModels);
        }
      } catch (error) {
        console.warn(`Failed to get models for provider ${provider}:`, error);
        
        // 对于认证失败的情况，仍然尝试获取静态模型定义
        this.addStaticModelsForProvider(provider, allModels);
      }
    }

    return allModels;
  }

  /**
   * 为指定提供商添加静态模型定义
   */
  private addStaticModelsForProvider(provider: ModelProvider, allModels: ModelInfo[]): void {
    if (provider === ModelProvider.BAIDU) {
      // 为百度提供商添加静态模型定义
      const staticModels: ModelInfo[] = [
        {
          id: 'ernie-4.5-turbo-128k',
          name: 'ERNIE 4.5 Turbo 128K',
          provider: ModelProvider.BAIDU,
          description: '百度文心一言4.5 Turbo版本，支持128K上下文（需要配置API密钥）',
          contextLength: 131072,
          maxTokens: 4096,
          supportedFeatures: ['chat', 'stream'],
        },
        {
          id: 'ernie-4.5-turbo-128k-preview',
          name: 'ERNIE 4.5 Turbo 128K Preview',
          provider: ModelProvider.BAIDU,
          description: '百度文心一言4.5 Turbo预览版本，支持128K上下文（需要配置API密钥）',
          contextLength: 131072,
          maxTokens: 4096,
          supportedFeatures: ['chat', 'stream'],
        },
        {
          id: 'ernie-4.0-turbo-8k',
          name: 'ERNIE 4.0 Turbo 8K',
          provider: ModelProvider.BAIDU,
          description: '百度文心一言4.0 Turbo版本，支持8K上下文（需要配置API密钥）',
          contextLength: 8192,
          maxTokens: 2048,
          supportedFeatures: ['chat', 'stream'],
        },
        {
          id: 'ernie-4.0-8k',
          name: 'ERNIE 4.0 8K',
          provider: ModelProvider.BAIDU,
          description: '百度文心一言4.0标准版本，支持8K上下文（需要配置API密钥）',
          contextLength: 8192,
          maxTokens: 2048,
          supportedFeatures: ['chat', 'stream'],
        },
      ];
      
      // 确保不重复添加
      const existingIds = allModels.map(m => m.id);
      const newModels = staticModels.filter(m => !existingIds.includes(m.id));
      allModels.push(...newModels);
    }
  }

  /**
   * 获取指定提供商的可用模型
   */
  async getModelsForProvider(provider: ModelProvider): Promise<ModelInfo[]> {
    const config = this.providerConfigs.get(provider);
    if (!config) {
      throw new ConfigurationError(
        `No configuration found for provider: ${provider}`,
        provider,
      );
    }

    const providerInstance = modelProviderFactory.createProvider(provider);
    await providerInstance.initialize(config);
    return providerInstance.getModels();
  }

  /**
   * 发送消息
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    if (!this.currentProvider) {
      throw new ConfigurationError('No model selected', ModelProvider.OPENAI);
    }

    return this.currentProvider.chat(request);
  }

  /**
   * 发送流式消息
   */
  async *streamMessage(request: ChatRequest): AsyncGenerator<StreamResponse> {
    if (!this.currentProvider) {
      throw new ConfigurationError('No model selected', ModelProvider.OPENAI);
    }

    yield* this.currentProvider.streamChat(request);
  }

  /**
   * 检查当前提供商是否支持特定功能
   */
  supportsFeature(feature: string): boolean {
    if (!this.currentProvider) {
      return false;
    }
    return this.currentProvider.supportsFeature(feature);
  }

  /**
   * 获取所有配置的提供商
   */
  getConfiguredProviders(): ModelProvider[] {
    return Array.from(this.providerConfigs.keys());
  }

  /**
   * 重置选择器
   */
  reset(): void {
    this.currentProvider = null;
    this.currentModel = null;
    this.providerConfigs.clear();
  }

  /**
   * 克隆选择器
   */
  clone(): ModelSelector {
    const newSelector = new ModelSelector();
    this.providerConfigs.forEach((config, provider) => {
      newSelector.addProviderConfig({ ...config });
    });
    return newSelector;
  }
}
