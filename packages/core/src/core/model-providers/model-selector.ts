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
      throw new ConfigurationError(`No configuration found for provider: ${provider}`, provider);
    }

    // 创建新的提供商实例
    const providerInstance = modelProviderFactory.createProvider(provider);
    
    // 使用指定的模型更新配置
    const modelConfig = { ...config, model };
    
    // 初始化提供商
    await providerInstance.initialize(modelConfig);
    
    // 验证模型是否存在
    const availableModels = await providerInstance.getModels();
    const modelExists = availableModels.some(m => m.id === model);
    
    if (!modelExists) {
      throw new ConfigurationError(`Model ${model} not found for provider ${provider}`, provider);
    }

    this.currentProvider = providerInstance;
    this.currentModel = model;
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
    
    for (const [provider, config] of this.providerConfigs.entries()) {
      try {
        const providerInstance = modelProviderFactory.createProvider(provider);
        await providerInstance.initialize(config);
        const models = await providerInstance.getModels();
        allModels.push(...models);
      } catch (error) {
        console.warn(`Failed to get models for provider ${provider}:`, error);
      }
    }
    
    return allModels;
  }

  /**
   * 获取指定提供商的可用模型
   */
  async getModelsForProvider(provider: ModelProvider): Promise<ModelInfo[]> {
    const config = this.providerConfigs.get(provider);
    if (!config) {
      throw new ConfigurationError(`No configuration found for provider: ${provider}`, provider);
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