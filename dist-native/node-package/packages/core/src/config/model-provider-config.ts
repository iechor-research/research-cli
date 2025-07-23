/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelProvider, ModelConfig } from '../core/model-providers/types.js';

/**
 * 模型提供商配置接口
 */
export interface ModelProviderSettings {
  // 默认提供商和模型
  defaultProvider?: ModelProvider;
  defaultModel?: string;
  
  // 提供商配置
  providers?: Partial<Record<ModelProvider, {
    apiKey?: string;
    baseUrl?: string;
    models?: string[];
    defaultModel?: string;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    // 特定提供商的额外配置
    extra?: Record<string, any>;
  }>>;
  
  // 全局模型配置
  globalConfig?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
  };
}

/**
 * 环境变量配置映射
 */
const ENV_VAR_MAPPING: Record<ModelProvider, string> = {
  [ModelProvider.OPENAI]: 'OPENAI_API_KEY',
  [ModelProvider.ANTHROPIC]: 'ANTHROPIC_API_KEY',
  [ModelProvider.DEEPSEEK]: 'DEEPSEEK_API_KEY',
  [ModelProvider.QWEN]: 'QWEN_API_KEY',
  [ModelProvider.GEMINI]: 'GEMINI_API_KEY',
  [ModelProvider.GROQ]: 'GROQ_API_KEY',
  [ModelProvider.MISTRAL]: 'MISTRAL_API_KEY',
  [ModelProvider.COHERE]: 'COHERE_API_KEY',
  [ModelProvider.HUGGINGFACE]: 'HUGGINGFACE_API_KEY',
  [ModelProvider.OLLAMA]: 'OLLAMA_API_KEY',
  [ModelProvider.TOGETHER]: 'TOGETHER_API_KEY',
  [ModelProvider.FIREWORKS]: 'FIREWORKS_API_KEY',
  [ModelProvider.REPLICATE]: 'REPLICATE_API_KEY',
  [ModelProvider.PERPLEXITY]: 'PERPLEXITY_API_KEY',
  [ModelProvider.BEDROCK]: 'AWS_ACCESS_KEY_ID',
  [ModelProvider.VERTEX_AI]: 'GOOGLE_APPLICATION_CREDENTIALS',
};

/**
 * 默认模型映射
 */
const DEFAULT_MODELS: Record<ModelProvider, string> = {
  [ModelProvider.OPENAI]: 'gpt-4o-mini',
  [ModelProvider.ANTHROPIC]: 'claude-3-5-haiku-20241022',
  [ModelProvider.DEEPSEEK]: 'deepseek-chat',
  [ModelProvider.QWEN]: 'qwen-turbo',
  [ModelProvider.GEMINI]: 'gemini-1.5-flash',
  [ModelProvider.GROQ]: 'llama-3.1-8b-instant',
  [ModelProvider.MISTRAL]: 'mistral-small-latest',
  [ModelProvider.COHERE]: 'command-r-plus',
  [ModelProvider.HUGGINGFACE]: 'microsoft/DialoGPT-medium',
  [ModelProvider.OLLAMA]: 'llama2',
  [ModelProvider.TOGETHER]: 'meta-llama/Llama-2-7b-chat-hf',
  [ModelProvider.FIREWORKS]: 'accounts/fireworks/models/llama-v2-7b-chat',
  [ModelProvider.REPLICATE]: 'meta/llama-2-7b-chat',
  [ModelProvider.PERPLEXITY]: 'llama-3.1-sonar-small-128k-online',
  [ModelProvider.BEDROCK]: 'anthropic.claude-3-haiku-20240307-v1:0',
  [ModelProvider.VERTEX_AI]: 'gemini-1.5-flash',
};

/**
 * 模型提供商配置管理器
 */
export class ModelProviderConfigManager {
  private settings: ModelProviderSettings;

  constructor(settings: ModelProviderSettings = {}) {
    this.settings = settings;
  }

  /**
   * 获取提供商配置
   */
  getProviderConfig(provider: ModelProvider): ModelConfig | null {
    const providerSettings = this.settings.providers?.[provider];
    const envApiKey = process.env[ENV_VAR_MAPPING[provider]];
    
    if (!providerSettings && !envApiKey) {
      return null;
    }

    return {
      provider,
      model: providerSettings?.defaultModel || DEFAULT_MODELS[provider],
      apiKey: providerSettings?.apiKey || envApiKey,
      baseUrl: providerSettings?.baseUrl,
      timeout: providerSettings?.timeout || 30000,
      temperature: this.settings.globalConfig?.temperature || 0.7,
      maxTokens: this.settings.globalConfig?.maxTokens || 2048,
      topP: this.settings.globalConfig?.topP || 1.0,
      topK: this.settings.globalConfig?.topK,
      frequencyPenalty: this.settings.globalConfig?.frequencyPenalty || 0,
      presencePenalty: this.settings.globalConfig?.presencePenalty || 0,
      stopSequences: this.settings.globalConfig?.stopSequences,
      extra: providerSettings?.extra,
    };
  }

  /**
   * 获取所有配置的提供商
   */
  getConfiguredProviders(): ModelProvider[] {
    const providers: ModelProvider[] = [];
    
    // 检查设置中的提供商
    if (this.settings.providers) {
      Object.keys(this.settings.providers).forEach(provider => {
        providers.push(provider as ModelProvider);
      });
    }
    
    // 检查环境变量中的提供商
    Object.entries(ENV_VAR_MAPPING).forEach(([provider, envVar]) => {
      if (process.env[envVar] && !providers.includes(provider as ModelProvider)) {
        providers.push(provider as ModelProvider);
      }
    });
    
    return providers;
  }

  /**
   * 获取默认提供商
   */
  getDefaultProvider(): ModelProvider | null {
    if (this.settings.defaultProvider) {
      return this.settings.defaultProvider;
    }
    
    // 如果没有设置默认提供商，返回第一个配置的提供商
    const configuredProviders = this.getConfiguredProviders();
    return configuredProviders.length > 0 ? configuredProviders[0] : null;
  }

  /**
   * 获取默认模型
   */
  getDefaultModel(provider?: ModelProvider): string | null {
    const targetProvider = provider || this.getDefaultProvider();
    if (!targetProvider) {
      return null;
    }
    
    return this.settings.defaultModel || 
           this.settings.providers?.[targetProvider]?.defaultModel || 
           DEFAULT_MODELS[targetProvider];
  }

  /**
   * 设置提供商配置
   */
     setProviderConfig(provider: ModelProvider, config: Partial<NonNullable<ModelProviderSettings['providers']>[ModelProvider]>): void {
     if (!this.settings.providers) {
       this.settings.providers = {};
     }
     
     this.settings.providers[provider] = {
       ...this.settings.providers[provider],
       ...config,
     };
   }

  /**
   * 移除提供商配置
   */
  removeProviderConfig(provider: ModelProvider): void {
    if (this.settings.providers) {
      delete this.settings.providers[provider];
    }
  }

  /**
   * 设置默认提供商
   */
  setDefaultProvider(provider: ModelProvider): void {
    this.settings.defaultProvider = provider;
  }

  /**
   * 设置默认模型
   */
  setDefaultModel(model: string): void {
    this.settings.defaultModel = model;
  }

  /**
   * 设置全局配置
   */
  setGlobalConfig(config: Partial<ModelProviderSettings['globalConfig']>): void {
    this.settings.globalConfig = {
      ...this.settings.globalConfig,
      ...config,
    };
  }

  /**
   * 获取设置
   */
  getSettings(): ModelProviderSettings {
    return { ...this.settings };
  }

  /**
   * 更新设置
   */
  updateSettings(settings: Partial<ModelProviderSettings>): void {
    this.settings = {
      ...this.settings,
      ...settings,
    };
  }

  /**
   * 重置为默认设置
   */
  reset(): void {
    this.settings = {};
  }

  /**
   * 验证提供商配置
   */
  validateProviderConfig(provider: ModelProvider): boolean {
    const config = this.getProviderConfig(provider);
    if (!config) {
      return false;
    }
    
    // 基本验证
    if (!config.apiKey && provider !== ModelProvider.OLLAMA) {
      return false;
    }
    
    if (!config.model) {
      return false;
    }
    
    return true;
  }

  /**
   * 从环境变量加载配置
   */
  loadFromEnvironment(): void {
    Object.entries(ENV_VAR_MAPPING).forEach(([provider, envVar]) => {
      const apiKey = process.env[envVar];
      if (apiKey) {
        this.setProviderConfig(provider as ModelProvider, { apiKey });
      }
    });
  }

  /**
   * 导出为JSON
   */
  toJSON(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * 从JSON加载
   */
  fromJSON(json: string): void {
    try {
      const settings = JSON.parse(json);
      this.settings = settings;
    } catch (error) {
      throw new Error(`Invalid JSON configuration: ${error}`);
    }
  }
} 