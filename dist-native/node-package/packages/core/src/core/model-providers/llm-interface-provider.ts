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
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: ModelProvider.ANTHROPIC,
      description: 'Most capable Claude model',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      provider: ModelProvider.ANTHROPIC,
      description: 'Fast and efficient Claude model',
      contextLength: 200000,
      maxTokens: 8192,
      supportedFeatures: ['chat', 'stream'],
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
    {
      id: 'qwen-turbo',
      name: 'Qwen Turbo',
      provider: ModelProvider.QWEN,
      description: 'Fast Qwen model',
      contextLength: 8192,
      maxTokens: 1500,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'qwen-plus',
      name: 'Qwen Plus',
      provider: ModelProvider.QWEN,
      description: 'Enhanced Qwen model',
      contextLength: 32768,
      maxTokens: 2000,
      supportedFeatures: ['chat', 'stream'],
    },
    {
      id: 'qwen-max',
      name: 'Qwen Max',
      provider: ModelProvider.QWEN,
      description: 'Most capable Qwen model',
      contextLength: 8192,
      maxTokens: 2000,
      supportedFeatures: ['chat', 'stream'],
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

      const response = await this.llmInterface.sendMessage(this.providerKey, {
        messages,
        model: request.model || config.model,
        temperature: request.temperature ?? config.temperature,
        max_tokens: request.maxTokens ?? config.maxTokens,
        top_p: request.topP ?? config.topP,
        frequency_penalty: request.frequencyPenalty ?? config.frequencyPenalty,
        presence_penalty: request.presencePenalty ?? config.presencePenalty,
        stop: request.stopSequences ?? config.stopSequences,
      });

      return this.normalizeResponse(response, request.model || config.model);
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

      const stream = await this.llmInterface.sendMessage(this.providerKey, {
        messages,
        model: request.model || config.model,
        temperature: request.temperature ?? config.temperature,
        max_tokens: request.maxTokens ?? config.maxTokens,
        top_p: request.topP ?? config.topP,
        frequency_penalty: request.frequencyPenalty ?? config.frequencyPenalty,
        presence_penalty: request.presencePenalty ?? config.presencePenalty,
        stop: request.stopSequences ?? config.stopSequences,
        stream: true,
      });

      let fullContent = '';
      for await (const chunk of stream) {
        const streamResponse = this.normalizeStreamResponse(
          chunk,
          request.model || config.model,
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
