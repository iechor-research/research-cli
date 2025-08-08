/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { BaseModelProvider } from './base-provider.js';
import {
  ModelProvider,
  ModelConfig,
  ChatRequest,
  ChatResponse,
  StreamResponse,
  ModelInfo,
  APIError,
  AuthenticationError,
  RateLimitError,
} from './types.js';

/**
 * Moonshot模型信息
 */
const MOONSHOT_MODELS: ModelInfo[] = [
  {
    id: 'kimi-k2-0711-preview',
    name: 'Kimi K2 0711 Preview',
    provider: ModelProvider.MOONSHOT,
    description: '月之暗面 Kimi K2 预览版模型，支持长文本对话',
    contextLength: 128000,
    maxTokens: 4096,
    supportedFeatures: ['chat', 'stream'],
  },
];

/**
 * Moonshot API请求格式
 */
interface MoonshotChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
}

/**
 * Moonshot API响应格式
 */
interface MoonshotChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Moonshot流式响应格式
 */
interface MoonshotStreamResponse {
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
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Moonshot AI 模型提供商实现
 */
export class MoonshotProvider extends BaseModelProvider {
  private apiKey: string = '';
  private baseURL: string = 'https://api.moonshot.cn/v1';

  constructor() {
    super(ModelProvider.MOONSHOT);
  }

  protected async doInitialize(): Promise<void> {
    const config = this.getConfig();
    this.apiKey = config.apiKey || '';
    
    if (config.baseUrl) {
      this.baseURL = config.baseUrl;
    }

    if (!this.apiKey) {
      throw new AuthenticationError('MOONSHOT_API_KEY is required', this.name);
    }
  }

  protected async doChat(request: ChatRequest): Promise<ChatResponse> {
    const config = this.getConfig();
    const model = request.model || config.model || 'kimi-k2-0711-preview';

    const moonshotRequest: MoonshotChatRequest = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? config.temperature,
      max_tokens: request.maxTokens ?? config.maxTokens,
      top_p: request.topP ?? config.topP,
      frequency_penalty: request.frequencyPenalty ?? config.frequencyPenalty,
      presence_penalty: request.presencePenalty ?? config.presencePenalty,
      stop: request.stopSequences ?? config.stopSequences,
      stream: false,
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        moonshotRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: config.timeout || 30000,
        }
      );

      const data: MoonshotChatResponse = response.data;
      return this.convertResponse(data, model);
    } catch (error) {
      this.handleError(error);
    }
  }

  protected async *doStreamChat(request: ChatRequest): AsyncGenerator<StreamResponse> {
    const config = this.getConfig();
    const model = request.model || config.model || 'kimi-k2-0711-preview';

    const moonshotRequest: MoonshotChatRequest = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? config.temperature,
      max_tokens: request.maxTokens ?? config.maxTokens,
      top_p: request.topP ?? config.topP,
      frequency_penalty: request.frequencyPenalty ?? config.frequencyPenalty,
      presence_penalty: request.presencePenalty ?? config.presencePenalty,
      stop: request.stopSequences ?? config.stopSequences,
      stream: true,
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        moonshotRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: config.timeout || 30000,
          responseType: 'stream',
        }
      );

      let fullContent = '';
      const stream = response.data;

      for await (const chunk of stream) {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const dataStr = trimmedLine.slice(6);
          if (dataStr === '[DONE]') {
            return;
          }

          try {
            const data: MoonshotStreamResponse = JSON.parse(dataStr);
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
    } catch (error) {
      this.handleError(error);
    }
  }

  protected async doGetModels(): Promise<ModelInfo[]> {
    return MOONSHOT_MODELS;
  }

  /**
   * 转换响应格式
   */
  private convertResponse(response: MoonshotChatResponse, model: string): ChatResponse {
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
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      case 'tool_calls':
        return 'tool_calls';
      default:
        return 'stop';
    }
  }

  /**
   * 验证配置的具体实现
   */
  protected doValidateConfig(config: ModelConfig): boolean {
    if (!config.apiKey) {
      return false;
    }
    return true;
  }

  /**
   * 从响应中提取内容
   */
  protected extractContent(response: any): string {
    return response.choices?.[0]?.message?.content || '';
  }

  /**
   * 从流式响应块中提取增量内容
   */
  protected extractDelta(chunk: any): string {
    return chunk.choices?.[0]?.delta?.content || '';
  }

  /**
   * 判断流式响应是否已完成
   */
  protected isStreamDone(chunk: any): boolean {
    return chunk.choices?.[0]?.finish_reason !== null;
  }

  /**
   * 错误处理
   */
  protected handleError(error: any): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      if (status === 401) {
        throw new AuthenticationError(`Authentication failed: ${message}`, this.name);
      }
      if (status === 429) {
        throw new RateLimitError(`Rate limit exceeded: ${message}`, this.name);
      }
      if (status && status >= 400) {
        throw new APIError(`API error (${status}): ${message}`, this.name, status);
      }
    }

    throw new APIError(`Unexpected error: ${error.message || error}`, this.name);
  }
}
