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
  APIError,
  AuthenticationError,
  ConfigurationError,
} from './types.js';

/**
 * 百度千帆模型提供者实现 (OpenAI兼容API)
 */
export class BaiduProvider implements IModelProvider {
  readonly name = ModelProvider.BAIDU;
  private config: ModelConfig | null = null;

  /**
   * 静态模型信息列表
   */
  static readonly SUPPORTED_MODELS: ModelInfo[] = [
    {
      id: 'ernie-4.5-turbo-128k',
      name: 'ERNIE 4.5 Turbo 128K',
      provider: ModelProvider.BAIDU,
      contextLength: 128000,
      supportedFeatures: ['streaming', 'tools'],
    },
    {
      id: 'ernie-4.5-turbo-128k-preview',
      name: 'ERNIE 4.5 Turbo 128K Preview',
      provider: ModelProvider.BAIDU,
      contextLength: 128000,
      supportedFeatures: ['streaming', 'tools'],
    },
    {
      id: 'ernie-4.0-turbo-8k',
      name: 'ERNIE 4.0 Turbo 8K',
      provider: ModelProvider.BAIDU,
      contextLength: 8000,
      supportedFeatures: ['streaming'],
    },
    {
      id: 'ernie-4.0-8k',
      name: 'ERNIE 4.0 8K',
      provider: ModelProvider.BAIDU,
      contextLength: 8000,
      supportedFeatures: ['streaming'],
    },
    {
      id: 'ernie-3.5-8k',
      name: 'ERNIE 3.5 8K',
      provider: ModelProvider.BAIDU,
      contextLength: 8000,
      supportedFeatures: ['streaming'],
    },
    {
      id: 'ernie-3.5-4k',
      name: 'ERNIE 3.5 4K',
      provider: ModelProvider.BAIDU,
      contextLength: 4000,
      supportedFeatures: ['streaming'],
    },
    {
      id: 'ernie-turbo-8k',
      name: 'ERNIE Turbo 8K',
      provider: ModelProvider.BAIDU,
      contextLength: 8000,
      supportedFeatures: ['streaming'],
    },
    {
      id: 'ernie-speed-128k',
      name: 'ERNIE Speed 128K',
      provider: ModelProvider.BAIDU,
      contextLength: 128000,
      supportedFeatures: ['streaming'],
    },
    {
      id: 'ernie-speed-8k',
      name: 'ERNIE Speed 8K',
      provider: ModelProvider.BAIDU,
      contextLength: 8000,
      supportedFeatures: ['streaming'],
    },
    {
      id: 'ernie-lite-8k',
      name: 'ERNIE Lite 8K',
      provider: ModelProvider.BAIDU,
      contextLength: 8000,
      supportedFeatures: ['streaming'],
    },
    {
      id: 'ernie-tiny-8k',
      name: 'ERNIE Tiny 8K',
      provider: ModelProvider.BAIDU,
      contextLength: 8000,
      supportedFeatures: ['streaming'],
    },
  ];

  /**
   * 获取API密钥（OpenAI兼容格式）
   */
  private async getApiKey(): Promise<string> {
    if (!this.config?.apiKey) {
      throw new AuthenticationError('BAIDU_LLM_KEY is required', this.name);
    }

    // 验证API密钥格式: bce-v3/ACCESS_KEY/SECRET_KEY
    const keyParts = this.config.apiKey.split('/');
    if (keyParts.length !== 3 || keyParts[0] !== 'bce-v3') {
      throw new AuthenticationError(
        'Invalid BAIDU_LLM_KEY format. Expected: bce-v3/ACCESS_KEY/SECRET_KEY',
        this.name,
      );
    }

    return this.config.apiKey;
  }

  /**
   * 转换OpenAI兼容API响应格式
   */
  private convertOpenAIResponse(response: any, model: string): ChatResponse {
    const choice = response.choices?.[0];
    if (!choice) {
      throw new APIError('No response choices returned', this.name);
    }

    return {
      content: choice.message?.content || '',
      model,
      provider: this.name,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
      finishReason: this.mapFinishReason(choice.finish_reason),
    };
  }

  /**
   * 映射结束原因
   */
  private mapFinishReason(reason: string): ChatResponse['finishReason'] {
    switch (reason) {
      case 'stop':
      case 'normal':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      case 'function_call':
      case 'tool_calls':
        return 'tool_calls';
      default:
        return 'stop';
    }
  }

  /**
   * 初始化提供商
   */
  async initialize(config: ModelConfig): Promise<void> {
    this.config = config;
    
    // 验证配置
    if (!this.validateConfig(config)) {
      throw new ConfigurationError('Invalid Baidu provider configuration', this.name);
    }

    // 验证API密钥格式
    try {
      await this.getApiKey();
    } catch (error) {
      throw new AuthenticationError(
        `Failed to initialize Baidu provider: ${error}`,
        this.name,
      );
    }
  }

  /**
   * 发送聊天请求
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.config) {
      throw new ConfigurationError('Provider not initialized', this.name);
    }

    const model = request.model || this.config.model;
    const apiKey = await this.getApiKey();
    
    const openAIRequest = {
      model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      top_p: request.topP,
      stop: request.stopSequences,
      stream: false,
    };

    const url = 'https://qianfan.baidubce.com/v2/chat/completions';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(openAIRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          `Baidu API error: ${errorData.message || response.statusText}`,
          this.name,
          response.status,
        );
      }

      const data = await response.json();
      return this.convertOpenAIResponse(data, model);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Baidu request failed: ${error}`, this.name);
    }
  }

  /**
   * 发送流式聊天请求
   */
  async *streamChat(request: ChatRequest): AsyncGenerator<StreamResponse> {
    if (!this.config) {
      throw new ConfigurationError('Provider not initialized', this.name);
    }

    const model = request.model || this.config.model;
    const apiKey = await this.getApiKey();
    
    const openAIRequest = {
      model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      top_p: request.topP,
      stop: request.stopSequences,
      stream: true,
    };

    const url = 'https://qianfan.baidubce.com/v2/chat/completions';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(openAIRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          `Baidu API error: ${errorData.message || response.statusText}`,
          this.name,
          response.status,
        );
      }

      if (!response.body) {
        throw new APIError('No response body', this.name);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') return;

              try {
                const parsed = JSON.parse(data);
                const choice = parsed.choices?.[0];
                if (choice?.delta?.content) {
                  yield {
                    content: choice.delta.content,
                    delta: choice.delta.content,
                    model,
                    provider: this.name,
                    done: false,
                  };
                }
                
                if (choice?.finish_reason) {
                  yield {
                    content: '',
                    delta: '',
                    model,
                    provider: this.name,
                    done: true,
                    usage: parsed.usage ? {
                      promptTokens: parsed.usage.prompt_tokens,
                      completionTokens: parsed.usage.completion_tokens,
                      totalTokens: parsed.usage.total_tokens,
                    } : undefined,
                  };
                  return;
                }
              } catch (e) {
                // 忽略解析错误，继续处理下一行
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Baidu stream request failed: ${error}`, this.name);
    }
  }

  /**
   * 获取可用模型列表
   */
  async getModels(): Promise<ModelInfo[]> {
    return BaiduProvider.SUPPORTED_MODELS;
  }

  /**
   * 验证配置
   */
  validateConfig(config: ModelConfig): boolean {
    return !!(config?.apiKey && typeof config.apiKey === 'string');
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig(): ModelConfig | null {
    return this.config;
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<ModelConfig> {
    return {
      model: 'ernie-4.5-turbo-128k',
      temperature: 0.7,
      maxTokens: 4000,
    };
  }

  /**
   * 检查是否支持特定功能
   */
  supportsFeature(feature: string): boolean {
    const supportedFeatures = ['streaming', 'tools', 'chat'];
    return supportedFeatures.includes(feature);
  }

  /**
   * 重置提供商状态
   */
  reset(): void {
    this.config = null;
  }
}