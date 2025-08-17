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
 * 基于新的OpenAI兼容接口，使用直接的API密钥认证
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
      id: 'ernie-3.5-8k-preview',
      name: 'ERNIE 3.5 8K Preview',
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
      id: 'ernie-tiny-8k',
      name: 'ERNIE Tiny 8K',
      provider: ModelProvider.BAIDU,
      contextLength: 8000,
      supportedFeatures: ['streaming'],
    },
    {
      id: 'ernie-character-8k',
      name: 'ERNIE Character 8K',
      provider: ModelProvider.BAIDU,
      contextLength: 8000,
      supportedFeatures: ['streaming'],
    },
    {
      id: 'ernie-func-8k',
      name: 'ERNIE Function 8K',
      provider: ModelProvider.BAIDU,
      contextLength: 8000,
      supportedFeatures: ['streaming', 'tools'],
    },
  ];

  /**
   * 百度千帆API的基础URL
   */
  private readonly baseUrl = 'https://qianfan.baidubce.com/v2';

  /**
   * 初始化提供者
   */
  async initialize(config: ModelConfig): Promise<void> {
    this.config = config;
    if (!this.config?.apiKey) {
      throw new AuthenticationError('BAIDU_LLM_KEY is required', this.name);
    }
  }

  /**
   * 获取支持的模型列表
   */
  async getModels(): Promise<ModelInfo[]> {
    return BaiduProvider.SUPPORTED_MODELS;
  }

  /**
   * 验证配置
   */
  validateConfig(config: ModelConfig): boolean {
    return !!(config.apiKey && config.provider === ModelProvider.BAIDU);
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<ModelConfig> {
    return {
      provider: ModelProvider.BAIDU,
      model: 'ernie-4.5-turbo-128k',
      temperature: 0.7,
      maxTokens: 4000,
    };
  }

  /**
   * 检查是否支持特定功能
   */
  supportsFeature(feature: string): boolean {
    const supportedFeatures = ['streaming', 'tools'];
    return supportedFeatures.includes(feature);
  }

  /**
   * 获取API密钥
   */
  private getApiKey(): string {
    if (!this.config?.apiKey) {
      throw new AuthenticationError('BAIDU_LLM_KEY is required', this.name);
    }
    return this.config.apiKey;
  }

  /**
   * 发送聊天请求
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const apiKey = this.getApiKey();
      
      // 构建请求体，基于OpenAI兼容格式
      const requestBody: any = {
        model: request.model,
        messages: request.messages,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        top_p: request.topP,
        stream: false,
      };

      // 添加百度特有的参数（暂时不支持tools）

      // 百度特有的参数
      requestBody.web_search = {
        enable: false,
        enable_citation: false,
        enable_trace: false,
      };
      requestBody.plugin_options = {};

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new APIError(
          `Baidu API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
          this.name,
          response.status,
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new APIError(
          `Baidu API error: ${data.error.message || data.error}`,
          this.name,
        );
      }

      return {
        content: data.choices[0]?.message?.content || '',
        model: data.model || request.model || 'ernie-4.5-turbo-128k',
        provider: ModelProvider.BAIDU,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        finishReason: this.mapFinishReason(data.choices[0]?.finish_reason),
      };
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new APIError(
        `Baidu provider error: ${error instanceof Error ? error.message : error}`,
        this.name,
      );
    }
  }

  /**
   * 发送流式聊天请求
   */
  async *streamChat(request: ChatRequest): AsyncGenerator<StreamResponse> {
    try {
      const apiKey = this.getApiKey();
      
      // 构建请求体，基于OpenAI兼容格式
      const requestBody: any = {
        model: request.model,
        messages: request.messages,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        top_p: request.topP,
        stream: true,
      };

      // 添加百度特有的参数（暂时不支持tools）

      // 百度特有的参数
      requestBody.web_search = {
        enable: false,
        enable_citation: false,
        enable_trace: false,
      };
      requestBody.plugin_options = {};

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new APIError(
          `Baidu API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
          this.name,
          response.status,
        );
      }

      if (!response.body) {
        throw new APIError('No response body received', this.name);
      }

      // 直接yield流式数据
      yield* this.createStreamReader(response.body);
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new APIError(
        `Baidu provider error: ${error instanceof Error ? error.message : error}`,
        this.name,
      );
    }
  }

  /**
   * 创建流式响应读取器
   */
  private async *createStreamReader(
    body: ReadableStream<Uint8Array>,
  ): AsyncIterable<StreamResponse> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

          if (trimmedLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6));

              if (data.error) {
                throw new APIError(
                  `Baidu streaming error: ${data.error.message || data.error}`,
                  this.name,
                );
              }

              const choice = data.choices?.[0];
              if (choice) {
                const deltaContent = choice.delta?.content || '';
                yield {
                  content: deltaContent,
                  delta: deltaContent,
                  done: choice.finish_reason === 'stop' || choice.finish_reason === 'length',
                  model: data.model || 'ernie-4.5-turbo-128k',
                  provider: ModelProvider.BAIDU,
                  usage: data.usage ? {
                    promptTokens: data.usage.prompt_tokens || 0,
                    completionTokens: data.usage.completion_tokens || 0,
                    totalTokens: data.usage.total_tokens || 0,
                  } : undefined,
                  finishReason: choice.finish_reason ? this.mapFinishReason(choice.finish_reason) : undefined,
                };
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming response:', trimmedLine);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 映射完成原因
   */
  private mapFinishReason(reason: string | undefined): 'stop' | 'length' | 'content_filter' | 'tool_calls' | undefined {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool_calls':
        return 'tool_calls';
      case 'content_filter':
        return 'content_filter';
      default:
        return undefined;
    }
  }
}