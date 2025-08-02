/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference path="./llm-interface.d.ts" />

import { LLMInterface } from 'llm-interface';
import { BaseModelProvider } from './base-provider.js';
import {
  ModelProvider,
  ModelConfig,
  ChatRequest,
  ChatResponse,
  StreamResponse,
  ModelInfo,
  ConfigurationError,
  APIError,
} from './types.js';

/**
 * LLM Interface 提供商映射
 */
const PROVIDER_MAPPING: Record<ModelProvider, string> = {
  [ModelProvider.OPENAI]: 'openai',
  [ModelProvider.ANTHROPIC]: 'anthropic',
  [ModelProvider.DEEPSEEK]: 'deepseek',
  [ModelProvider.QWEN]: 'qwen',
  [ModelProvider.GEMINI]: 'gemini',
  [ModelProvider.GROQ]: 'groq',
  [ModelProvider.MISTRAL]: 'mistral',
  [ModelProvider.COHERE]: 'cohere',
  [ModelProvider.HUGGINGFACE]: 'huggingface',
  [ModelProvider.OLLAMA]: 'ollama',
  [ModelProvider.TOGETHER]: 'together',
  [ModelProvider.FIREWORKS]: 'fireworks',
  [ModelProvider.REPLICATE]: 'replicate',
  [ModelProvider.PERPLEXITY]: 'perplexity',
  [ModelProvider.BEDROCK]: 'bedrock',
  [ModelProvider.VERTEX_AI]: 'vertex_ai',
  [ModelProvider.BAIDU]: 'baidu',
};

/**
 * 模型信息映射
 */
const MODEL_INFO_MAP: Record<ModelProvider, ModelInfo[]> = {
  [ModelProvider.OPENAI]: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: ModelProvider.OPENAI,
      description: 'Most capable GPT-4 model',
      contextLength: 128000,
      maxTokens: 4096,
      supportedFeatures: ['chat', 'stream', 'functions'],
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: ModelProvider.OPENAI,
      description: 'Faster and cheaper GPT-4 model',
      contextLength: 128000,
      maxTokens: 16384,
      supportedFeatures: ['chat', 'stream', 'functions'],
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: ModelProvider.OPENAI,
      description: 'Fast and efficient model',
      contextLength: 16385,
      maxTokens: 4096,
      supportedFeatures: ['chat', 'stream', 'functions'],
    },
  ],
  [ModelProvider.ANTHROPIC]: [
    // Claude 4 系列 - 最新旗舰模型
    {
      id: 'claude-opus-4-20250514',
      name: 'Claude Opus 4',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 4 系列最强模型，具备顶级推理和创作能力',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    {
      id: 'claude-sonnet-4-20250514',
      name: 'Claude Sonnet 4',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 4 系列平衡模型，性能与成本的最佳平衡',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    
    // Claude 3.7 系列
    {
      id: 'claude-3-7-sonnet-20250219',
      name: 'Claude Sonnet 3.7',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 3.7 系列模型，介于3.5和4之间的能力',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    {
      id: 'claude-3-7-sonnet-latest',
      name: 'Claude Sonnet 3.7 (Latest)',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 3.7 最新版本',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },

    // Claude 3.5 系列
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet v2',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 3.5 Sonnet 第二版，改进的推理能力',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    {
      id: 'claude-3-5-sonnet-latest',
      name: 'Claude 3.5 Sonnet (Latest)',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 3.5 Sonnet 最新版本',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    {
      id: 'claude-3-5-sonnet-20240620',
      name: 'Claude 3.5 Sonnet v1',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 3.5 Sonnet 第一版',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      provider: ModelProvider.ANTHROPIC,
      description: '最快的Claude模型，适合简单任务',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    {
      id: 'claude-3-5-haiku-latest',
      name: 'Claude 3.5 Haiku (Latest)',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 3.5 Haiku 最新版本',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    
    // Claude 3 系列
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 3 系列最强模型',
      contextLength: 200000,
      maxTokens: 4096,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 3 系列平衡模型',
      contextLength: 200000,
      maxTokens: 4096,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      provider: ModelProvider.ANTHROPIC,
      description: 'Claude 3 系列快速模型',
      contextLength: 200000,
      maxTokens: 4096,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
  ],
  [ModelProvider.DEEPSEEK]: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      provider: ModelProvider.DEEPSEEK,
      description: 'DeepSeek conversational model',
      contextLength: 32768,
      maxTokens: 4096,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'deepseek-coder',
      name: 'DeepSeek Coder',
      provider: ModelProvider.DEEPSEEK,
      description: 'DeepSeek code generation model',
      contextLength: 16384,
      maxTokens: 4096,
      supportedFeatures: ['chat', 'stream'],
    },
  ],
  [ModelProvider.QWEN]: [
    // 商业版模型
    {
      id: 'qwen-turbo',
      name: 'Qwen Turbo',
      provider: ModelProvider.QWEN,
      description: '适合简单任务，速度快、成本低',
      contextLength: 1008192,
      maxTokens: 8000,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'qwen-plus',
      name: 'Qwen Plus',
      provider: ModelProvider.QWEN,
      description: '效果、速度、成本均衡',
      contextLength: 131072,
      maxTokens: 8000,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'qwen-max',
      name: 'Qwen Max',
      provider: ModelProvider.QWEN,
      description: '适合复杂任务，能力最强',
      contextLength: 32768,
      maxTokens: 8000,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'qwq-32b-preview',
      name: 'QwQ 32B Preview',
      provider: ModelProvider.QWEN,
      description: '基于Qwen2.5训练的推理模型，大幅提升推理能力',
      contextLength: 32768,
      maxTokens: 32768,
      supportedFeatures: ['chat', 'stream'],
    },
    // Qwen2.5 开源版
    {
      id: 'qwen2.5-72b-instruct',
      name: 'Qwen2.5 72B Instruct',
      provider: ModelProvider.QWEN,
      description: 'Qwen2.5 最大参数版本',
      contextLength: 131072,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'qwen2.5-32b-instruct',
      name: 'Qwen2.5 32B Instruct',
      provider: ModelProvider.QWEN,
      description: 'Qwen2.5 中等参数版本',
      contextLength: 131072,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'qwen2.5-14b-instruct',
      name: 'Qwen2.5 14B Instruct',
      provider: ModelProvider.QWEN,
      description: 'Qwen2.5 中等参数版本',
      contextLength: 131072,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'qwen2.5-7b-instruct',
      name: 'Qwen2.5 7B Instruct',
      provider: ModelProvider.QWEN,
      description: 'Qwen2.5 标准版本',
      contextLength: 131072,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'qwen2.5-3b-instruct',
      name: 'Qwen2.5 3B Instruct',
      provider: ModelProvider.QWEN,
      description: 'Qwen2.5 轻量版本',
      contextLength: 32768,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
    },
    // 视觉理解模型
    {
      id: 'qwen-vl-plus',
      name: 'Qwen VL Plus',
      provider: ModelProvider.QWEN,
      description: '视觉理解模型，支持图像和文本',
      contextLength: 32768,
      maxTokens: 8000,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    {
      id: 'qwen-vl-max',
      name: 'Qwen VL Max',
      provider: ModelProvider.QWEN,
      description: '最强视觉理解模型',
      contextLength: 32768,
      maxTokens: 8000,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
    {
      id: 'qvq-72b-preview',
      name: 'QVQ 72B Preview',
      provider: ModelProvider.QWEN,
      description: '视觉推理模型，具备强大的视觉推理能力',
      contextLength: 32768,
      maxTokens: 32768,
      supportedFeatures: ['chat', 'stream', 'vision'],
    },
  ],
  [ModelProvider.GEMINI]: [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: ModelProvider.GEMINI,
      description: 'Most capable Gemini model',
      contextLength: 2097152,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: ModelProvider.GEMINI,
      description: 'Fast Gemini model',
      contextLength: 1048576,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
    },
  ],
  [ModelProvider.GROQ]: [
    {
      id: 'llama-3.1-70b-versatile',
      name: 'Llama 3.1 70B',
      provider: ModelProvider.GROQ,
      description: 'Large Llama model on Groq',
      contextLength: 131072,
      maxTokens: 8000,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B',
      provider: ModelProvider.GROQ,
      description: 'Fast Llama model on Groq',
      contextLength: 131072,
      maxTokens: 8000,
      supportedFeatures: ['chat', 'stream'],
    },
  ],
  [ModelProvider.MISTRAL]: [
    {
      id: 'mistral-large-latest',
      name: 'Mistral Large',
      provider: ModelProvider.MISTRAL,
      description: 'Most capable Mistral model',
      contextLength: 128000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'mistral-small-latest',
      name: 'Mistral Small',
      provider: ModelProvider.MISTRAL,
      description: 'Efficient Mistral model',
      contextLength: 128000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
    },
  ],
  [ModelProvider.COHERE]: [
    {
      id: 'command-r-plus',
      name: 'Command R+',
      provider: ModelProvider.COHERE,
      description: 'Enhanced Command model',
      contextLength: 128000,
      maxTokens: 4096,
      supportedFeatures: ['chat', 'stream'],
    },
  ],
  [ModelProvider.HUGGINGFACE]: [],
  [ModelProvider.OLLAMA]: [],
  [ModelProvider.TOGETHER]: [],
  [ModelProvider.FIREWORKS]: [],
  [ModelProvider.REPLICATE]: [],
  [ModelProvider.PERPLEXITY]: [],
  [ModelProvider.BEDROCK]: [],
  [ModelProvider.VERTEX_AI]: [],
  [ModelProvider.BAIDU]: [],
};

/**
 * 基于 LLM Interface 的通用模型提供商
 */
export class LLMInterfaceProvider extends BaseModelProvider {
  private llmInterface: any;
  private providerKey: string;

  constructor(provider: ModelProvider) {
    super(provider);
    this.providerKey = PROVIDER_MAPPING[provider];
    if (!this.providerKey) {
      throw new ConfigurationError(
        `Unsupported provider: ${provider}`,
        provider,
      );
    }
  }

  protected async doInitialize(): Promise<void> {
    const config = this.getConfig();

    // 设置 API Key
    if (config.apiKey) {
      LLMInterface.setApiKey({ [this.providerKey]: config.apiKey });
    }

    this.llmInterface = LLMInterface;
  }

  protected async doChat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const config = this.getConfig();
      const messages = this.normalizeMessages(request.messages);
      const model = request.model || config.model;

      // 构建请求参数，过滤掉不支持的参数
      const requestParams: any = {
        messages,
        model,
        max_tokens: request.maxTokens ?? config.maxTokens,
      };

      // 只为支持的模型添加 temperature 参数
      if (!this.isDeepSeekReasonerModel(model)) {
        requestParams.temperature = request.temperature ?? config.temperature;
        requestParams.top_p = request.topP ?? config.topP;
        requestParams.frequency_penalty = request.frequencyPenalty ?? config.frequencyPenalty;
        requestParams.presence_penalty = request.presencePenalty ?? config.presencePenalty;
        requestParams.stop = request.stopSequences ?? config.stopSequences;
      }

      const response = await this.llmInterface.sendMessage(this.providerKey, requestParams);

      return this.normalizeResponse(response, model);
    } catch (error) {
      this.handleError(error);
    }
  }

  protected async *doStreamChat(
    request: ChatRequest,
  ): AsyncGenerator<StreamResponse> {
    try {
      const config = this.getConfig();
      const messages = this.normalizeMessages(request.messages);
      const model = request.model || config.model;

      // 构建请求参数，过滤掉不支持的参数
      const requestParams: any = {
        messages,
        model,
        max_tokens: request.maxTokens ?? config.maxTokens,
        stream: true,
      };

      // 只为支持的模型添加 temperature 参数
      if (!this.isDeepSeekReasonerModel(model)) {
        requestParams.temperature = request.temperature ?? config.temperature;
        requestParams.top_p = request.topP ?? config.topP;
        requestParams.frequency_penalty = request.frequencyPenalty ?? config.frequencyPenalty;
        requestParams.presence_penalty = request.presencePenalty ?? config.presencePenalty;
        requestParams.stop = request.stopSequences ?? config.stopSequences;
      }

      const stream = await this.llmInterface.sendMessage(this.providerKey, requestParams);

      let fullContent = '';
      for await (const chunk of stream) {
        const streamResponse = this.normalizeStreamResponse(
          chunk,
          model,
          fullContent,
        );
        fullContent = streamResponse.content;
        yield streamResponse;
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  protected async doGetModels(): Promise<ModelInfo[]> {
    return MODEL_INFO_MAP[this.name] || [];
  }

  /**
   * 检查是否为 DeepSeek Reasoner 模型（不支持 temperature 等参数）
   */
  private isDeepSeekReasonerModel(model: string): boolean {
    return model === 'deepseek-reasoner' || model.includes('deepseek-r1');
  }

  protected doValidateConfig(config: ModelConfig): boolean {
    // 基本验证
    if (!config.apiKey && this.name !== ModelProvider.OLLAMA) {
      return false;
    }
    return true;
  }

  protected extractContent(response: any): string {
    return response?.results?.[0]?.response || response?.response || '';
  }

  protected extractDelta(chunk: any): string {
    return (
      chunk?.choices?.[0]?.delta?.content ||
      chunk?.delta?.content ||
      chunk?.content ||
      ''
    );
  }

  protected isStreamDone(chunk: any): boolean {
    return (
      chunk?.choices?.[0]?.finish_reason !== null ||
      chunk?.finish_reason !== null ||
      chunk?.done === true
    );
  }

  protected extractUsage(response: any): ChatResponse['usage'] | undefined {
    if (response?.usage) {
      return {
        promptTokens: response.usage.prompt_tokens || 0,
        completionTokens: response.usage.completion_tokens || 0,
        totalTokens: response.usage.total_tokens || 0,
      };
    }
    return undefined;
  }

  protected extractFinishReason(
    response: any,
  ): ChatResponse['finishReason'] | undefined {
    const reason =
      response?.choices?.[0]?.finish_reason || response?.finish_reason;
    if (reason) {
      return reason as ChatResponse['finishReason'];
    }
    return undefined;
  }

  protected extractMetadata(response: any): Record<string, any> | undefined {
    const metadata: Record<string, any> = {};

    if (response?.id) {
      metadata.id = response.id;
    }
    if (response?.created) {
      metadata.created = response.created;
    }
    if (response?.model) {
      metadata.model = response.model;
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }

  protected getSupportedFeatures(): string[] {
    const baseFeatures = super.getSupportedFeatures();

    // 根据不同提供商添加特定功能
    switch (this.name) {
      case ModelProvider.OPENAI:
        return [...baseFeatures, 'functions', 'tools'];
      case ModelProvider.ANTHROPIC:
        return [...baseFeatures, 'vision'];
      case ModelProvider.GEMINI:
        return [...baseFeatures, 'vision', 'multimodal'];
      default:
        return baseFeatures;
    }
  }
}
