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
} from './types.js';

/**
 * DeepSeek模型信息
 */
const DEEPSEEK_MODELS: ModelInfo[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: ModelProvider.DEEPSEEK,
    description: 'DeepSeek V3 通用对话模型',
    contextLength: 65536,
    maxTokens: 8192,
    supportedFeatures: ['chat', 'stream'],
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: ModelProvider.DEEPSEEK,
    description: 'DeepSeek 代码生成专用模型',
    contextLength: 65536,
    maxTokens: 8192,
    supportedFeatures: ['chat', 'stream'],
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: ModelProvider.DEEPSEEK,
    description: 'DeepSeek R1 推理模型，具备链式思考能力',
    contextLength: 65536,
    maxTokens: 8192,
    supportedFeatures: ['chat', 'stream', 'reasoning'],
  },
];

/**
 * 专门的DeepSeek提供商实现
 * 直接使用HTTP API，避免llm-interface库的问题
 */
export class DeepSeekProvider extends BaseModelProvider {
  private apiKey: string = '';
  private baseURL: string = 'https://api.deepseek.com';

  constructor() {
    super(ModelProvider.DEEPSEEK);
  }

  protected async doInitialize(): Promise<void> {
    if (!this.config?.apiKey) {
      throw new APIError('DeepSeek API key is required', this.name, 401);
    }
    this.apiKey = this.config.apiKey;
  }

  protected async doChat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const model = request.model || this.config?.model || 'deepseek-chat';
      
      // 构建请求体
      const requestBody: any = {
        model,
        messages: this.convertToDeepSeekMessages(request.messages),
        max_tokens: request.maxTokens || this.config?.maxTokens || 4096,
      };

      // 只为非reasoner模型添加这些参数
      if (!this.isReasonerModel(model)) {
        if (request.temperature !== undefined || this.config?.temperature !== undefined) {
          requestBody.temperature = request.temperature ?? this.config?.temperature ?? 1;
        }
        if (request.topP !== undefined || this.config?.topP !== undefined) {
          requestBody.top_p = request.topP ?? this.config?.topP;
        }
        if (request.frequencyPenalty !== undefined || this.config?.frequencyPenalty !== undefined) {
          requestBody.frequency_penalty = request.frequencyPenalty ?? this.config?.frequencyPenalty;
        }
        if (request.presencePenalty !== undefined || this.config?.presencePenalty !== undefined) {
          requestBody.presence_penalty = request.presencePenalty ?? this.config?.presencePenalty;
        }
        if (request.stopSequences || this.config?.stopSequences) {
          requestBody.stop = request.stopSequences || this.config?.stopSequences;
        }
      }

      const response = await axios.post(`${this.baseURL}/chat/completions`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return this.convertToStandardResponse(response.data, model);
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async *doStreamChat(request: ChatRequest): AsyncGenerator<StreamResponse> {
    try {
      const model = request.model || this.config?.model || 'deepseek-chat';
      
      // 构建请求体
      const requestBody: any = {
        model,
        messages: this.convertToDeepSeekMessages(request.messages),
        max_tokens: request.maxTokens || this.config?.maxTokens || 4096,
        stream: true,
      };

      // 只为非reasoner模型添加这些参数
      if (!this.isReasonerModel(model)) {
        if (request.temperature !== undefined || this.config?.temperature !== undefined) {
          requestBody.temperature = request.temperature ?? this.config?.temperature ?? 1;
        }
        if (request.topP !== undefined || this.config?.topP !== undefined) {
          requestBody.top_p = request.topP ?? this.config?.topP;
        }
        if (request.frequencyPenalty !== undefined || this.config?.frequencyPenalty !== undefined) {
          requestBody.frequency_penalty = request.frequencyPenalty ?? this.config?.frequencyPenalty;
        }
        if (request.presencePenalty !== undefined || this.config?.presencePenalty !== undefined) {
          requestBody.presence_penalty = request.presencePenalty ?? this.config?.presencePenalty;
        }
        if (request.stopSequences || this.config?.stopSequences) {
          requestBody.stop = request.stopSequences || this.config?.stopSequences;
        }
      }

      const response = await axios.post(`${this.baseURL}/chat/completions`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        responseType: 'stream',
      });

      let fullContent = '';
      let fullReasoningContent = '';

      for await (const chunk of this.parseStreamResponse(response.data)) {
        const delta = chunk.choices?.[0]?.delta;
        if (delta) {
          const content = delta.content || '';
          const reasoningContent = delta.reasoning_content || '';
          
          fullContent += content;
          fullReasoningContent += reasoningContent;

          yield {
            content: fullContent,
            delta: content,
            done: chunk.choices?.[0]?.finish_reason !== null,
            model,
            provider: this.name,
            usage: chunk.usage ? {
              promptTokens: chunk.usage.prompt_tokens || 0,
              completionTokens: chunk.usage.completion_tokens || 0,
              totalTokens: chunk.usage.total_tokens || 0,
            } : undefined,
            reasoningContent: fullReasoningContent || undefined,
          };
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

   protected async doGetModels(): Promise<ModelInfo[]> {
     return DEEPSEEK_MODELS;
   }

   protected doValidateConfig(config: ModelConfig): boolean {
     return !!config.apiKey;
   }

   protected doGetDefaultConfig(): Partial<ModelConfig> {
     return {
       temperature: 1,
       maxTokens: 4096,
       topP: 1,
     };
   }

     protected doSupportsFeature(feature: string): boolean {
    const supportedFeatures = ['chat', 'stream', 'reasoning'];
    return supportedFeatures.includes(feature);
  }

  // 实现BaseModelProvider要求的抽象方法
  protected extractContent(response: any): string {
    return response.choices?.[0]?.message?.content || '';
  }

  protected extractDelta(chunk: any): string {
    return chunk.choices?.[0]?.delta?.content || '';
  }

  protected isStreamDone(chunk: any): boolean {
    return chunk.choices?.[0]?.finish_reason !== null;
  }

  protected async doCountTokens(request: { messages?: any[]; content?: string; model?: string }): Promise<number> {
    // DeepSeek doesn't provide a token counting API, so we estimate
    let text: string;
    if (request.messages) {
      text = request.messages.map(m => m.content).join(' ');
    } else if (request.content) {
      text = request.content;
    } else {
      return 0;
    }
    return Math.ceil(text.length / 4); // Rough estimation: 1 token ≈ 4 characters
  }

  /**
   * 检查是否为推理模型
   */
  private isReasonerModel(model: string): boolean {
    return model === 'deepseek-reasoner' || model.includes('reasoner');
  }

  /**
   * 转换消息格式为DeepSeek API格式
   */
  private convertToDeepSeekMessages(messages: any[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * 转换DeepSeek响应为标准格式
   */
  private convertToStandardResponse(response: any, model: string): ChatResponse {
    const choice = response.choices?.[0];
    if (!choice) {
      throw new APIError('No response from DeepSeek API', this.name, 500);
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
      reasoningContent: choice.message.reasoning_content,
      finishReason: choice.finish_reason,
    };
  }

  /**
   * 解析流式响应
   */
  private async *parseStreamResponse(stream: any): AsyncGenerator<any> {
    let buffer = '';
    
    for await (const chunk of stream) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            yield JSON.parse(data);
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }
}