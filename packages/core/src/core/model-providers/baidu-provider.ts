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
  RateLimitError,
  ConfigurationError,
} from './types.js';

/**
 * 百度千帆API请求格式
 */
interface BaiduChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  top_p?: number;
  penalty_score?: number;
  stream?: boolean;
  system?: string;
  max_output_tokens?: number;
  stop?: string[];
  tools?: any[];
  tool_choice?: any;
}

/**
 * 百度千帆API响应格式
 */
interface BaiduChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      tool_calls?: any[];
    };
    finish_reason: string;
    flag: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    error_code: number;
    error_msg: string;
  };
}

/**
 * 百度千帆流式响应格式
 */
interface BaiduStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
    flag: number;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 百度千帆模型提供者实现
 */
export class BaiduProvider implements IModelProvider {
  readonly name = ModelProvider.BAIDU;
  private config: ModelConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  /**
   * 获取模型端点映射
   */
  private getModelEndpoint(model: string): string {
    const endpointMap: Record<string, string> = {
      'ernie-4.5-turbo-128k': 'ernie-4.5-turbo-128k',
      'ernie-4.5-turbo-128k-preview': 'ernie-4.5-turbo-128k-preview',
      'ernie-4.0-turbo-8k': 'ernie-4.0-turbo-8k',
      'ernie-4.0-8k': 'ernie-4.0-8k',
      'ernie-3.5-8k': 'ernie-3.5-8k',
      'ernie-3.5-4k': 'ernie-3.5-4k',
      'ernie-turbo-8k': 'ernie-turbo-8k',
      'ernie-speed-128k': 'ernie-speed-128k',
      'ernie-speed-8k': 'ernie-speed-8k',
      'ernie-lite-8k': 'ernie-lite-8k',
      'ernie-tiny-8k': 'ernie-tiny-8k',
    };

    return endpointMap[model] || 'ernie-4.5-turbo-128k';
  }

  /**
   * 获取访问令牌
   */
  private async getAccessToken(): Promise<string> {
    if (!this.config?.apiKey) {
      throw new AuthenticationError('BAIDU_LLM_KEY is required', this.name);
    }

    // 检查token是否过期
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    // 解析API密钥格式: bce-v3/ALTAK-xxx/secret
    const keyParts = this.config.apiKey.split('/');
    if (keyParts.length !== 3 || keyParts[0] !== 'bce-v3') {
      throw new AuthenticationError(
        'Invalid BAIDU_LLM_KEY format. Expected: bce-v3/ACCESS_KEY/SECRET_KEY',
        this.name,
      );
    }

    const [, accessKey, secretKey] = keyParts;

    try {
      const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${accessKey}&client_secret=${secretKey}`;
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new APIError(
          `Failed to get access token: ${response.statusText}`,
          this.name,
          response.status,
        );
      }

      const data = await response.json();
      
      if (data.error) {
        throw new AuthenticationError(
          `Authentication failed: ${data.error_description || data.error}`,
          this.name,
        );
      }

      this.accessToken = data.access_token;
      this.tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000; // 提前5分钟刷新

      return this.accessToken!;
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new APIError(
        `Failed to authenticate with Baidu API: ${error}`,
        this.name,
      );
    }
  }

  /**
   * 转换请求格式
   */
  private convertRequest(request: ChatRequest): BaiduChatRequest {
    const baiduRequest: BaiduChatRequest = {
      messages: request.messages.map((msg) => ({
        role: msg.role === 'system' ? 'user' : msg.role, // 百度API不直接支持system role
        content: msg.content,
      })),
      stream: request.stream || false,
    };

    // 处理system消息
    const systemMessages = request.messages.filter(msg => msg.role === 'system');
    if (systemMessages.length > 0) {
      baiduRequest.system = systemMessages.map(msg => msg.content).join('\n');
      // 移除system消息，只保留user和assistant消息
      baiduRequest.messages = request.messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
    }

    // 设置参数
    if (request.temperature !== undefined) {
      baiduRequest.temperature = Math.max(0.01, Math.min(1.0, request.temperature));
    }
    
    if (request.topP !== undefined) {
      baiduRequest.top_p = Math.max(0.01, Math.min(1.0, request.topP));
    }

    if (request.maxTokens !== undefined) {
      baiduRequest.max_output_tokens = request.maxTokens;
    }

    if (request.stopSequences && request.stopSequences.length > 0) {
      baiduRequest.stop = request.stopSequences;
    }

    // 百度API使用penalty_score而不是frequency_penalty
    if (request.frequencyPenalty !== undefined) {
      baiduRequest.penalty_score = Math.max(1.0, Math.min(2.0, 1.0 + request.frequencyPenalty));
    }

    return baiduRequest;
  }

  /**
   * 转换响应格式
   */
  private convertResponse(response: BaiduChatResponse, model: string): ChatResponse {
    if (response.error) {
      throw new APIError(
        `Baidu API error: ${response.error.error_msg}`,
        this.name,
        response.error.error_code,
      );
    }

    const choice = response.choices[0];
    if (!choice) {
      throw new APIError('No response choices returned', this.name);
    }

    return {
      content: choice.message.content || '',
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
      case 'normal':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      case 'function_call':
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

    // 预先获取访问令牌以验证认证
    try {
      await this.getAccessToken();
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

    const accessToken = await this.getAccessToken();
    const model = request.model || this.config.model;
    const endpoint = this.getModelEndpoint(model);
    const baiduRequest = this.convertRequest(request);
    
    // 确保非流式请求
    baiduRequest.stream = false;

    const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${endpoint}?access_token=${accessToken}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(baiduRequest),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthenticationError('Invalid access token', this.name);
        }
        if (response.status === 429) {
          throw new RateLimitError('Rate limit exceeded', this.name);
        }
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          this.name,
          response.status,
        );
      }

      const data: BaiduChatResponse = await response.json();
      return this.convertResponse(data, model);
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthenticationError || error instanceof RateLimitError) {
        throw error;
      }
      throw new APIError(
        `Failed to send chat request: ${error}`,
        this.name,
      );
    }
  }

  /**
   * 发送流式聊天请求
   */
  async *streamChat(request: ChatRequest): AsyncGenerator<StreamResponse> {
    if (!this.config) {
      throw new ConfigurationError('Provider not initialized', this.name);
    }

    const accessToken = await this.getAccessToken();
    const model = request.model || this.config.model;
    const endpoint = this.getModelEndpoint(model);
    const baiduRequest = this.convertRequest(request);
    
    // 确保流式请求
    baiduRequest.stream = true;

    const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${endpoint}?access_token=${accessToken}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(baiduRequest),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthenticationError('Invalid access token', this.name);
        }
        if (response.status === 429) {
          throw new RateLimitError('Rate limit exceeded', this.name);
        }
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          this.name,
          response.status,
        );
      }

      if (!response.body) {
        throw new APIError('No response body', this.name);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

            const dataStr = trimmedLine.slice(6);
            if (dataStr === '[DONE]') {
              return;
            }

            try {
              const data: BaiduStreamResponse = JSON.parse(dataStr);
              const choice = data.choices[0];
              
              if (choice?.delta?.content) {
                const delta = choice.delta.content;
                fullContent += delta;

                yield {
                  content: fullContent,
                  delta,
                  done: false,
                  model,
                  provider: this.name,
                  usage: data.usage ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens,
                  } : undefined,
                  finishReason: choice.finish_reason ? this.mapFinishReason(choice.finish_reason) : undefined,
                };
              }

              if (choice?.finish_reason) {
                yield {
                  content: fullContent,
                  delta: '',
                  done: true,
                  model,
                  provider: this.name,
                  usage: data.usage ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens,
                  } : undefined,
                  finishReason: this.mapFinishReason(choice.finish_reason),
                };
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse stream data:', parseError);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof APIError || error instanceof AuthenticationError || error instanceof RateLimitError) {
        throw error;
      }
      throw new APIError(
        `Failed to send stream chat request: ${error}`,
        this.name,
      );
    }
  }

  /**
   * 获取可用模型列表
   */
  async getModels(): Promise<ModelInfo[]> {
    return [
      {
        id: 'ernie-4.5-turbo-128k',
        name: 'ERNIE 4.5 Turbo 128K',
        provider: this.name,
        description: '百度文心一言4.5 Turbo版本，支持128K上下文',
        contextLength: 131072,
        maxTokens: 4096,
        supportedFeatures: ['chat', 'stream'],
      },
      {
        id: 'ernie-4.5-turbo-128k-preview',
        name: 'ERNIE 4.5 Turbo 128K Preview',
        provider: this.name,
        description: '百度文心一言4.5 Turbo预览版本，支持128K上下文',
        contextLength: 131072,
        maxTokens: 4096,
        supportedFeatures: ['chat', 'stream'],
      },
      {
        id: 'ernie-4.0-turbo-8k',
        name: 'ERNIE 4.0 Turbo 8K',
        provider: this.name,
        description: '百度文心一言4.0 Turbo版本，支持8K上下文',
        contextLength: 8192,
        maxTokens: 2048,
        supportedFeatures: ['chat', 'stream'],
      },
      {
        id: 'ernie-4.0-8k',
        name: 'ERNIE 4.0 8K',
        provider: this.name,
        description: '百度文心一言4.0标准版本，支持8K上下文',
        contextLength: 8192,
        maxTokens: 2048,
        supportedFeatures: ['chat', 'stream'],
      },
    ];
  }

  /**
   * 验证配置
   */
  validateConfig(config: ModelConfig): boolean {
    if (!config.apiKey) {
      return false;
    }

    // 验证API密钥格式
    const keyParts = config.apiKey.split('/');
    if (keyParts.length !== 3 || keyParts[0] !== 'bce-v3') {
      return false;
    }

    if (!config.model) {
      return false;
    }

    return true;
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<ModelConfig> {
    return {
      provider: this.name,
      model: 'ernie-4.5-turbo-128k',
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
    const supportedFeatures = ['chat', 'stream'];
    return supportedFeatures.includes(feature);
  }
}