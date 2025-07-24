/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelProvider } from './types.js';

/**
 * 模型名称到提供商的映射
 */
const MODEL_TO_PROVIDER_MAP: Record<string, ModelProvider> = {
  // OpenAI models
  'gpt-4o': ModelProvider.OPENAI,
  'gpt-4o-mini': ModelProvider.OPENAI,
  'gpt-4': ModelProvider.OPENAI,
  'gpt-4-turbo': ModelProvider.OPENAI,
  'gpt-3.5-turbo': ModelProvider.OPENAI,

  // Anthropic models - Claude 4 系列
  'claude-opus-4-20250514': ModelProvider.ANTHROPIC,
  'claude-sonnet-4-20250514': ModelProvider.ANTHROPIC,
  
  // Anthropic models - Claude 3.7 系列
  'claude-3-7-sonnet-20250219': ModelProvider.ANTHROPIC,
  'claude-3-7-sonnet-latest': ModelProvider.ANTHROPIC,

  // Anthropic models - Claude 3.5 系列
  'claude-3-5-sonnet-20241022': ModelProvider.ANTHROPIC,
  'claude-3-5-sonnet-latest': ModelProvider.ANTHROPIC,
  'claude-3-5-sonnet-20240620': ModelProvider.ANTHROPIC,
  'claude-3-5-haiku-20241022': ModelProvider.ANTHROPIC,
  'claude-3-5-haiku-latest': ModelProvider.ANTHROPIC,
  
  // Anthropic models - Claude 3 系列
  'claude-3-opus-20240229': ModelProvider.ANTHROPIC,
  'claude-3-sonnet-20240229': ModelProvider.ANTHROPIC,
  'claude-3-haiku-20240307': ModelProvider.ANTHROPIC,

  // DeepSeek models
  'deepseek-chat': ModelProvider.DEEPSEEK,
  'deepseek-coder': ModelProvider.DEEPSEEK,

  // Qwen models - 商业版
  'qwen-turbo': ModelProvider.QWEN,
  'qwen-plus': ModelProvider.QWEN,
  'qwen-max': ModelProvider.QWEN,
  'qwq-32b-preview': ModelProvider.QWEN,
  
  // Qwen models - 开源版
  'qwen2.5-72b-instruct': ModelProvider.QWEN,
  'qwen2.5-32b-instruct': ModelProvider.QWEN,
  'qwen2.5-14b-instruct': ModelProvider.QWEN,
  'qwen2.5-7b-instruct': ModelProvider.QWEN,
  'qwen2.5-3b-instruct': ModelProvider.QWEN,
  'qwen2.5-1.5b-instruct': ModelProvider.QWEN,
  'qwen2.5-0.5b-instruct': ModelProvider.QWEN,
  'qwen2-72b-instruct': ModelProvider.QWEN,
  'qwen2-57b-a14b-instruct': ModelProvider.QWEN,
  'qwen2-7b-instruct': ModelProvider.QWEN,
  'qwen2-1.5b-instruct': ModelProvider.QWEN,
  'qwen2-0.5b-instruct': ModelProvider.QWEN,
  'qwen1.5-110b-chat': ModelProvider.QWEN,
  'qwen1.5-72b-chat': ModelProvider.QWEN,
  'qwen1.5-32b-chat': ModelProvider.QWEN,
  'qwen1.5-14b-chat': ModelProvider.QWEN,
  'qwen1.5-7b-chat': ModelProvider.QWEN,
  'qwen1.5-4b-chat': ModelProvider.QWEN,
  'qwen1.5-1.8b-chat': ModelProvider.QWEN,
  'qwen1.5-0.5b-chat': ModelProvider.QWEN,
  
  // Qwen VL models (视觉理解)
  'qwen-vl-plus': ModelProvider.QWEN,
  'qwen-vl-max': ModelProvider.QWEN,
  'qwen2-vl-72b-instruct': ModelProvider.QWEN,
  'qwen2-vl-7b-instruct': ModelProvider.QWEN,
  'qwen2-vl-2b-instruct': ModelProvider.QWEN,
  'qvq-72b-preview': ModelProvider.QWEN,

  // Gemini models
  'gemini-1.5-pro': ModelProvider.GEMINI,
  'gemini-1.5-flash': ModelProvider.GEMINI,
  'gemini-2.5-pro': ModelProvider.GEMINI,
  'gemini-2.5-flash': ModelProvider.GEMINI,
  'gemini-2.0-flash': ModelProvider.GEMINI,

  // Groq models
  'llama-3.1-8b-instant': ModelProvider.GROQ,
  'llama-3.1-70b-versatile': ModelProvider.GROQ,
  'mixtral-8x7b-32768': ModelProvider.GROQ,

  // Mistral models
  'mistral-small-latest': ModelProvider.MISTRAL,
  'mistral-medium-latest': ModelProvider.MISTRAL,
  'mistral-large-latest': ModelProvider.MISTRAL,
};

/**
 * 提供商模式匹配规则
 */
const PROVIDER_PATTERNS: Array<{ pattern: RegExp; provider: ModelProvider }> = [
  { pattern: /^gpt-/i, provider: ModelProvider.OPENAI },
  { pattern: /^claude-/i, provider: ModelProvider.ANTHROPIC },
  { pattern: /^deepseek-/i, provider: ModelProvider.DEEPSEEK },
  { pattern: /^qwen/i, provider: ModelProvider.QWEN },
  { pattern: /^qwq-/i, provider: ModelProvider.QWEN },
  { pattern: /^qvq-/i, provider: ModelProvider.QWEN },
  { pattern: /^gemini-/i, provider: ModelProvider.GEMINI },
  { pattern: /^llama-/i, provider: ModelProvider.GROQ },
  { pattern: /^mixtral-/i, provider: ModelProvider.GROQ },
  { pattern: /^mistral-/i, provider: ModelProvider.MISTRAL },
];

/**
 * 根据模型名称检测提供商
 */
export function detectModelProvider(modelName: string): ModelProvider {
  // 首先检查精确匹配
  const exactMatch = MODEL_TO_PROVIDER_MAP[modelName];
  if (exactMatch) {
    return exactMatch;
  }

  // 然后检查模式匹配
  for (const { pattern, provider } of PROVIDER_PATTERNS) {
    if (pattern.test(modelName)) {
      return provider;
    }
  }

  // 默认返回 Gemini（保持向后兼容）
  return ModelProvider.GEMINI;
}

/**
 * 检查模型是否为 Gemini 模型
 */
export function isGeminiModel(modelName: string): boolean {
  return detectModelProvider(modelName) === ModelProvider.GEMINI;
}

/**
 * 检查提供商是否支持 countTokens 功能
 */
export function supportsCountTokens(provider: ModelProvider): boolean {
  // 目前只有 Gemini 支持 countTokens API
  return provider === ModelProvider.GEMINI;
}

/**
 * 获取模型的估算 token 限制
 */
export function getModelTokenLimit(modelName: string): number {
  const provider = detectModelProvider(modelName);
  
  // 根据提供商返回合理的默认值
  switch (provider) {
    case ModelProvider.OPENAI:
      if (modelName.includes('gpt-4o')) return 128000;
      if (modelName.includes('gpt-4')) return 8192;
      if (modelName.includes('gpt-3.5')) return 4096;
      return 4096;
      
    case ModelProvider.ANTHROPIC:
      // Claude 4 和 3.7、3.5 系列都支持 200K tokens
      // Claude 3 系列也支持 200K tokens
      return 200000;
      
    case ModelProvider.DEEPSEEK:
      return 32768;
      
    case ModelProvider.QWEN:
      if (modelName.includes('turbo')) return 1008192;
      if (modelName.includes('plus')) return 131072;
      if (modelName.includes('max')) return 32768;
      if (modelName.includes('qwq-32b')) return 32768;
      if (modelName.includes('qvq-72b')) return 32768;
      if (modelName.includes('2.5')) return 131072;
      if (modelName.includes('2-')) return 32768;
      if (modelName.includes('1.5')) return 32768;
      return 32768;
      
    case ModelProvider.GEMINI:
      if (modelName.includes('1.5-pro')) return 2097152;
      if (modelName.includes('2.5')) return 1048576;
      return 1048576;
      
    case ModelProvider.GROQ:
      return 32768;
      
    case ModelProvider.MISTRAL:
      return 32768;
      
    default:
      return 4096;
  }
} 