/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CountTokensResponse,
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  Content,
  ContentListUnion,
} from '@google/genai';
import { ContentGenerator } from './contentGenerator.js';
import { ModelProvider } from './model-providers/types.js';
import { 
  detectModelProvider, 
  isGeminiModel, 
  supportsCountTokens,
  getModelTokenLimit 
} from './model-providers/model-utils.js';
import { modelProviderFactory } from './model-providers/model-provider-factory.js';

/**
 * 多提供商 ContentGenerator 实现
 * 根据模型自动选择合适的提供商来处理请求
 */
export class MultiProviderContentGenerator implements ContentGenerator {
  private geminiGenerator: ContentGenerator;
  private providerConfigs: Map<ModelProvider, any> = new Map();

  constructor(
    private defaultGeminiGenerator: ContentGenerator,
    private globalConfig: any = {}
  ) {
    this.geminiGenerator = defaultGeminiGenerator;
  }

  /**
   * 配置特定提供商
   */
  configureProvider(provider: ModelProvider, config: any): void {
    this.providerConfigs.set(provider, config);
  }

  /**
   * 生成内容
   */
  async generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse> {
    const provider = detectModelProvider(request.model);
    
    if (provider === ModelProvider.GEMINI) {
      // 使用原有的 Gemini generator
      return this.geminiGenerator.generateContent(request);
    }

    // 对于非 Gemini 模型，使用 LLM Interface Provider
    const providerInstance = await this.getProviderInstance(provider, request.model);
    
    // 转换 GenerateContentParameters 到 ChatRequest 格式
    const chatRequest = this.convertToProviderFormat(request);
    const response = await providerInstance.chat(chatRequest);
    
    // 转换回 GenerateContentResponse 格式
    return this.convertToGeminiFormat(response, request.model);
  }

  /**
   * 生成流式内容
   */
  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const provider = detectModelProvider(request.model);
    
    if (provider === ModelProvider.GEMINI) {
      // 使用原有的 Gemini generator
      return this.geminiGenerator.generateContentStream(request);
    }

    // 对于非 Gemini 模型，使用 LLM Interface Provider
    const providerInstance = await this.getProviderInstance(provider, request.model);
    const chatRequest = this.convertToProviderFormat(request);
    
    return this.convertStreamToGeminiFormat(
      providerInstance.streamChat(chatRequest), 
      request.model
    );
  }

  /**
   * 计算 tokens
   */
  async countTokens(request: CountTokensParameters): Promise<CountTokensResponse> {
    const provider = detectModelProvider(request.model);
    
    if (supportsCountTokens(provider)) {
      // 使用原有的 Gemini generator
      return this.geminiGenerator.countTokens(request);
    }

    // 对于不支持 countTokens 的提供商，提供估算
    return this.estimateTokenCount(request);
  }

  /**
   * 嵌入内容
   */
  async embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse> {
    // 嵌入功能目前只支持 Gemini
    return this.geminiGenerator.embedContent(request);
  }

  /**
   * 获取用户层级（如果支持）
   */
  async getTier?(): Promise<any> {
    if (this.geminiGenerator.getTier) {
      return this.geminiGenerator.getTier();
    }
    return undefined;
  }

  /**
   * 获取提供商实例
   */
  private async getProviderInstance(provider: ModelProvider, model: string): Promise<any> {
    const config = this.providerConfigs.get(provider);
    if (!config) {
      throw new Error(`No configuration found for provider: ${provider}`);
    }

    const providerInstance = modelProviderFactory.createProvider(provider);
    const modelConfig = {
      provider,
      model,
      ...config,
      ...this.globalConfig
    };

    await providerInstance.initialize(modelConfig);
    return providerInstance;
  }

  /**
   * 转换 GenerateContentParameters 到提供商格式
   */
  private convertToProviderFormat(request: GenerateContentParameters): any {
    const messages = this.convertContentsToMessages(request.contents);
    
    return {
      messages,
      model: request.model,
      temperature: request.config?.temperature,
      maxTokens: request.config?.maxOutputTokens,
      topP: request.config?.topP,
      topK: request.config?.topK,
      stream: false,
    };
  }

  /**
   * 转换 ContentListUnion 到消息格式
   */
  private convertContentsToMessages(contents: ContentListUnion): any[] {
    // 将 ContentListUnion 转换为 Content[]
    const contentArray = this.normalizeContents(contents);
    
    return contentArray.map(content => ({
      role: content.role === 'model' ? 'assistant' : content.role,
      content: content.parts?.map(part => {
        if ('text' in part) {
          return part.text;
        }
        // 处理其他类型的 part（图片等）
        return JSON.stringify(part);
      }).join('') || ''
    }));
  }

  /**
   * 标准化 contents 为 Content[]
   */
  private normalizeContents(contents: ContentListUnion): Content[] {
    if (Array.isArray(contents)) {
      // 检查是否为 Content[] 还是其他类型的数组
      if (contents.length === 0) {
        return [];
      }
      
      // 如果第一个元素有 role 属性，则认为是 Content[]
      if (contents[0] && typeof contents[0] === 'object' && 'role' in contents[0]) {
        return contents as Content[];
      }
      
      // 否则作为 parts 处理
      return [{
        role: 'user',
        parts: contents as any[]
      }];
    }
    
    if (typeof contents === 'string') {
      return [{
        role: 'user',
        parts: [{ text: contents }]
      }];
    }
    
    // 单个 Content 对象
    if (contents && typeof contents === 'object' && 'role' in contents) {
      return [contents as Content];
    }
    
    // 单个 Part 对象
    return [{
      role: 'user',
      parts: [contents as any]
    }];
  }

  /**
   * 转换提供商响应到 Gemini 格式
   */
  private convertToGeminiFormat(response: any, model: string): GenerateContentResponse {
    const result = new GenerateContentResponse();
    result.candidates = [{
      content: {
        parts: [{ text: response.content }],
        role: 'model'
      },
      finishReason: response.finishReason || 'STOP',
      index: 0,
      safetyRatings: []
    }];
    
    if (response.usage) {
      result.usageMetadata = {
        promptTokenCount: response.usage.promptTokens || 0,
        candidatesTokenCount: response.usage.completionTokens || 0,
        totalTokenCount: response.usage.totalTokens || 0
      };
    }
    
    return result;
  }

  /**
   * 转换流式响应到 Gemini 格式
   */
  private async *convertStreamToGeminiFormat(
    stream: AsyncGenerator<any>, 
    model: string
  ): AsyncGenerator<GenerateContentResponse> {
    for await (const chunk of stream) {
      const result = new GenerateContentResponse();
      result.candidates = [{
        content: {
          parts: [{ text: chunk.delta }],
          role: 'model'
        },
        finishReason: chunk.done ? (chunk.finishReason || 'STOP') : undefined,
        index: 0,
        safetyRatings: []
      }];
      
      if (chunk.usage) {
        result.usageMetadata = {
          promptTokenCount: chunk.usage.promptTokens || 0,
          candidatesTokenCount: chunk.usage.completionTokens || 0,
          totalTokenCount: chunk.usage.totalTokens || 0
        };
      }
      
      yield result;
    }
  }

  /**
   * 估算 token 数量
   */
  private async estimateTokenCount(request: CountTokensParameters): Promise<CountTokensResponse> {
    // 简单的 token 估算：大约 4 个字符 = 1 token
    let totalText = '';
    
    // 将 ContentListUnion 转换为 Content[]
    const contentArray = this.normalizeContents(request.contents);
    
    for (const content of contentArray) {
      for (const part of content.parts || []) {
        if ('text' in part) {
          totalText += part.text || '';
        }
      }
    }

    const estimatedTokens = Math.ceil(totalText.length / 4);
    
    return {
      totalTokens: estimatedTokens
    };
  }
} 