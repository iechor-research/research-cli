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
  GoogleGenAI,
} from '@google/genai';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import { DEFAULT_RESEARCH_MODEL } from '../config/models.js';
import { Config } from '../config/config.js';
import { getEffectiveModel } from './modelCheck.js';
import { UserTierId } from '../code_assist/types.js';
import { MultiProviderContentGenerator } from './multi-provider-content-generator.js';
import { detectModelProvider, isGeminiModel } from './model-providers/model-utils.js';
import { ModelProvider } from './model-providers/types.js';

/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
  generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  getTier?(): Promise<UserTierId | undefined>;
}

export enum AuthType {
  LOGIN_WITH_GOOGLE = 'oauth-personal',
  USE_RESEARCH = 'research-api-key',
  USE_VERTEX_AI = 'vertex-ai',
  CLOUD_SHELL = 'cloud-shell',
}

export type ContentGeneratorConfig = {
  model: string;
  apiKey?: string;
  vertexai?: boolean;
  authType?: AuthType | undefined;
};

/**
 * Get API configuration from config file
 */
function getConfiguredAPIValues(): {
  geminiApiKey?: string;
  googleApiKey?: string;
  googleCloudProject?: string;
  googleCloudLocation?: string;
} {
  try {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const configFile = path.join(
      os.homedir(),
      '.research-cli',
      'api-config.json',
    );

    if (fs.existsSync(configFile)) {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      return {
        geminiApiKey: config.apis?.gemini?.apiKey,
        googleApiKey: config.apis?.google?.apiKey,
        googleCloudProject: config.apis?.google_project?.value,
        googleCloudLocation: config.apis?.google_location?.value,
      };
    }
  } catch (error) {
    // 静默失败，回退到环境变量
  }

  return {};
}

export async function createContentGeneratorConfig(
  model: string | undefined,
  authType: AuthType | undefined,
): Promise<ContentGeneratorConfig> {
  const configuredValues = getConfiguredAPIValues();

  const researchApiKey =
    configuredValues.geminiApiKey || process.env.GEMINI_API_KEY || undefined;
  const iechorApiKey =
    configuredValues.googleApiKey || process.env.GOOGLE_API_KEY || undefined;
  const iechorCloudProject =
    configuredValues.googleCloudProject ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    undefined;
  const iechorCloudLocation =
    configuredValues.googleCloudLocation ||
    process.env.GOOGLE_CLOUD_LOCATION ||
    undefined;

  // Use runtime model from config if available, otherwise fallback to parameter or default
  const effectiveModel = model || DEFAULT_RESEARCH_MODEL;

  const contentGeneratorConfig: ContentGeneratorConfig = {
    model: effectiveModel,
    authType,
  };

  // If we are using iEchor auth or we are in Cloud Shell, there is nothing else to validate for now
  if (
    authType === AuthType.LOGIN_WITH_GOOGLE ||
    authType === AuthType.CLOUD_SHELL
  ) {
    return contentGeneratorConfig;
  }

  if (authType === AuthType.USE_RESEARCH && researchApiKey) {
    contentGeneratorConfig.apiKey = researchApiKey;
    contentGeneratorConfig.vertexai = false;
    contentGeneratorConfig.model = await getEffectiveModel(
      contentGeneratorConfig.apiKey,
      contentGeneratorConfig.model,
    );

    return contentGeneratorConfig;
  }

  if (
    authType === AuthType.USE_VERTEX_AI &&
    (iechorApiKey || (iechorCloudProject && iechorCloudLocation))
  ) {
    contentGeneratorConfig.apiKey = iechorApiKey;
    contentGeneratorConfig.vertexai = true;

    return contentGeneratorConfig;
  }

  return contentGeneratorConfig;
}

export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
  sessionId?: string,
): Promise<ContentGenerator> {
  const version = process.env.CLI_VERSION || process.version;
  const httpOptions = {
    headers: {
      'User-Agent': `ResearchCLI/${version} (${process.platform}; ${process.arch})`,
    },
  };

  // 创建基础的 Gemini generator
  let baseGenerator: ContentGenerator;
  
  if (
    config.authType === AuthType.LOGIN_WITH_GOOGLE ||
    config.authType === AuthType.CLOUD_SHELL
  ) {
    baseGenerator = await createCodeAssistContentGenerator(
      httpOptions,
      config.authType,
      gcConfig,
      sessionId,
    );
  } else if (
    config.authType === AuthType.USE_RESEARCH ||
    config.authType === AuthType.USE_VERTEX_AI
  ) {
    const googleGenAI = new GoogleGenAI({
      apiKey: config.apiKey === '' ? undefined : config.apiKey,
      vertexai: config.vertexai,
      httpOptions,
    });
    baseGenerator = googleGenAI.models;
  } else {
    throw new Error(
      `Error creating contentGenerator: Unsupported authType: ${config.authType}`,
    );
  }

  // 创建多提供商 ContentGenerator
  const multiProviderGenerator = new MultiProviderContentGenerator(
    baseGenerator,
    {}
  );

  // 配置各个提供商
  await configureProviders(multiProviderGenerator, gcConfig);

  return multiProviderGenerator;
}

/**
 * 从配置文件读取API key
 */
function getApiKeyFromConfig(provider: string): string | undefined {
  try {
    const os = require('node:os');
    const fs = require('node:fs');
    const path = require('node:path');
    
    const configFile = path.join(os.homedir(), '.research-cli', 'model-config.json');
    if (fs.existsSync(configFile)) {
      const content = fs.readFileSync(configFile, 'utf-8');
      const config = JSON.parse(content);
      return config.providers?.[provider.toLowerCase()]?.apiKey;
    }
  } catch (error) {
    // 忽略配置文件读取错误
  }
  return undefined;
}

/**
 * 配置各个提供商的API密钥和设置
 */
async function configureProviders(
  generator: MultiProviderContentGenerator,
  gcConfig: Config
): Promise<void> {
  // 配置 DeepSeek
  const deepseekApiKey = getApiKeyFromConfig('deepseek') || process.env.DEEPSEEK_API_KEY;
  if (deepseekApiKey) {
    generator.configureProvider(ModelProvider.DEEPSEEK, {
      apiKey: deepseekApiKey,
    });
  }

  // 配置 OpenAI
  const openaiApiKey = getApiKeyFromConfig('openai') || process.env.OPENAI_API_KEY;
  if (openaiApiKey) {
    generator.configureProvider(ModelProvider.OPENAI, {
      apiKey: openaiApiKey,
    });
  }

  // 配置 Anthropic
  const anthropicApiKey = getApiKeyFromConfig('anthropic') || process.env.ANTHROPIC_API_KEY;
  if (anthropicApiKey) {
    generator.configureProvider(ModelProvider.ANTHROPIC, {
      apiKey: anthropicApiKey,
    });
  }

  // 配置 Qwen
  const qwenApiKey = getApiKeyFromConfig('qwen') || process.env.QWEN_API_KEY;
  if (qwenApiKey) {
    generator.configureProvider(ModelProvider.QWEN, {
      apiKey: qwenApiKey,
    });
  }

  // 配置 Groq
  const groqApiKey = getApiKeyFromConfig('groq') || process.env.GROQ_API_KEY;
  if (groqApiKey) {
    generator.configureProvider(ModelProvider.GROQ, {
      apiKey: groqApiKey,
    });
  }

  // 配置 Mistral
  const mistralApiKey = getApiKeyFromConfig('mistral') || process.env.MISTRAL_API_KEY;
  if (mistralApiKey) {
    generator.configureProvider(ModelProvider.MISTRAL, {
      apiKey: mistralApiKey,
    });
  }

  // 配置 Baidu
  const baiduApiKey = getApiKeyFromConfig('baidu') || process.env.BAIDU_LLM_KEY;
  if (baiduApiKey) {
    generator.configureProvider(ModelProvider.BAIDU, {
      apiKey: baiduApiKey,
    });
  }

  // 配置 Moonshot
  const moonshotApiKey = getApiKeyFromConfig('moonshot') || process.env.MOONSHOT_API_KEY;
  if (moonshotApiKey) {
    generator.configureProvider(ModelProvider.MOONSHOT, {
      apiKey: moonshotApiKey,
    });
  }

  // 配置 Gemini
  const geminiApiKey = getApiKeyFromConfig('gemini') || process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    generator.configureProvider(ModelProvider.GEMINI, {
      apiKey: geminiApiKey,
    });
  }

  // 配置 Cohere
  const cohereApiKey = getApiKeyFromConfig('cohere') || process.env.COHERE_API_KEY;
  if (cohereApiKey) {
    generator.configureProvider(ModelProvider.COHERE, {
      apiKey: cohereApiKey,
    });
  }

  // 配置 HuggingFace
  const huggingfaceApiKey = getApiKeyFromConfig('huggingface') || process.env.HUGGINGFACE_API_KEY;
  if (huggingfaceApiKey) {
    generator.configureProvider(ModelProvider.HUGGINGFACE, {
      apiKey: huggingfaceApiKey,
    });
  }

  // 配置 Ollama
  const ollamaApiKey = getApiKeyFromConfig('ollama') || process.env.OLLAMA_API_KEY;
  if (ollamaApiKey) {
    generator.configureProvider(ModelProvider.OLLAMA, {
      apiKey: ollamaApiKey,
    });
  }

  // 配置 Together
  const togetherApiKey = getApiKeyFromConfig('together') || process.env.TOGETHER_API_KEY;
  if (togetherApiKey) {
    generator.configureProvider(ModelProvider.TOGETHER, {
      apiKey: togetherApiKey,
    });
  }

  // 配置 Fireworks
  const fireworksApiKey = getApiKeyFromConfig('fireworks') || process.env.FIREWORKS_API_KEY;
  if (fireworksApiKey) {
    generator.configureProvider(ModelProvider.FIREWORKS, {
      apiKey: fireworksApiKey,
    });
  }

  // 配置 Replicate
  const replicateApiKey = getApiKeyFromConfig('replicate') || process.env.REPLICATE_API_KEY;
  if (replicateApiKey) {
    generator.configureProvider(ModelProvider.REPLICATE, {
      apiKey: replicateApiKey,
    });
  }

  // 配置 Perplexity
  const perplexityApiKey = getApiKeyFromConfig('perplexity') || process.env.PERPLEXITY_API_KEY;
  if (perplexityApiKey) {
    generator.configureProvider(ModelProvider.PERPLEXITY, {
      apiKey: perplexityApiKey,
    });
  }
}
