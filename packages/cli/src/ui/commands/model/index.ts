/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

import { CommandKind, type SlashCommand } from '../types.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

// 配置文件路径
const CONFIG_DIR = path.join(os.homedir(), '.research-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'model-config.json');

interface ModelConfig {
  providers: Record<
    string,
    {
      apiKey?: string;
      baseUrl?: string;
      defaultModel?: string;
    }
  >;
}

// 读取配置文件
function readConfig(): ModelConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    // 如果读取失败，返回默认配置
  }
  return { providers: {} };
}

// 写入配置文件
function writeConfig(config: ModelConfig): void {
  try {
    // 确保配置目录存在
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    throw new Error(
      `Failed to write config: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// 获取API key（优先从配置文件，然后是环境变量）
function getApiKey(provider: string): string | undefined {
  const config = readConfig();
  const providerConfig = config.providers[provider.toLowerCase()];

  if (providerConfig?.apiKey) {
    return providerConfig.apiKey;
  }

  // 回退到环境变量
  const envVarMapping: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
    qwen: 'QWEN_API_KEY',
    gemini: 'GEMINI_API_KEY',
    groq: 'GROQ_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    cohere: 'COHERE_API_KEY',
    huggingface: 'HUGGINGFACE_API_KEY',
    ollama: 'OLLAMA_API_KEY',
    together: 'TOGETHER_API_KEY',
    fireworks: 'FIREWORKS_API_KEY',
    replicate: 'REPLICATE_API_KEY',
    perplexity: 'PERPLEXITY_API_KEY',
    baidu: 'BAIDU_LLM_KEY',
    moonshot: 'MOONSHOT_API_KEY',
  };

  const envVar = envVarMapping[provider.toLowerCase()];
  return envVar ? process.env[envVar] : undefined;
}

export const modelCommand: SlashCommand = {
  name: 'model',
  description: 'Manage and switch between different AI models',
  kind: CommandKind.BUILT_IN,
  action: async (context, args) => {
    const argsArray = args
      .trim()
      .split(/\s+/)
      .filter((arg) => arg.length > 0);
    const command = argsArray[0] || 'help';

    try {
      // 动态导入core包以避免编译时类型问题
      const core = await import('@iechor/research-cli-core');

      // 初始化配置管理器
      const manager = new core.ModelProviderConfigManager();
      await manager.loadFromEnvironment();

      // 创建模型选择器
      const selector = new core.ModelSelector();

      // 添加提供商配置（包括从配置文件读取的API keys）
      const providers = manager.getConfiguredProviders();
      for (const provider of providers) {
        const providerConfig = manager.getProviderConfig(provider);
        if (providerConfig) {
          // 如果配置文件中有API key，使用配置文件中的
          const configApiKey = getApiKey(provider.toLowerCase());
          if (configApiKey) {
            providerConfig.apiKey = configApiKey;
          }
          selector.addProviderConfig(providerConfig);
        }
      }

      // 额外检查配置文件中的提供商（可能没有在manager中）
      const config = readConfig();
      if (config.providers) {
        Object.keys(config.providers).forEach((providerName) => {
          const provider = core.ModelProvider[
            providerName.toUpperCase() as keyof typeof core.ModelProvider
          ];
          
          if (provider && !providers.includes(provider)) {
            // 这个提供商在配置文件中但不在manager中，手动添加
            const apiKey = getApiKey(providerName);
            if (apiKey) {
              // 使用默认模型映射
              const defaultModels: Record<string, string> = {
                'openai': 'gpt-4o-mini',
                'anthropic': 'claude-3-5-haiku-20241022',
                'deepseek': 'deepseek-chat',
                'qwen': 'qwen-turbo',
                'gemini': 'gemini-1.5-flash',
                'groq': 'llama-3.1-8b-instant',
                'mistral': 'mistral-small-latest',
                'cohere': 'command-r-plus',
                'huggingface': 'microsoft/DialoGPT-medium',
                'ollama': 'llama2',
                'together': 'meta-llama/Llama-2-7b-chat-hf',
                'fireworks': 'accounts/fireworks/models/llama-v2-7b-chat',
                'replicate': 'meta/llama-2-7b-chat',
                'perplexity': 'llama-3.1-sonar-small-128k-online',
                'bedrock': 'anthropic.claude-3-haiku-20240307-v1:0',
                'vertex_ai': 'gemini-1.5-flash',
                'baidu': 'ernie-4.5-turbo-128k',
                'moonshot': 'kimi-k2-0711-preview',
              };

              const providerConfig: any = {
                provider,
                model: defaultModels[providerName] || '',
                apiKey,
                temperature: 0.7,
                maxTokens: 2048,
                topP: 1.0,
                timeout: 30000,
              };
              selector.addProviderConfig(providerConfig);
            }
          }
        });
      }

      switch (command) {
        case 'config': {
          if (argsArray.length < 2) {
            return {
              type: 'message',
              messageType: 'info',
              content: `Model Configuration Commands:
  /model config set <provider> <api-key> - Set API key for a provider
  /model config get <provider> - Get API key for a provider (masked)
  /model config list - List all configured providers
  /model config remove <provider> - Remove API key for a provider
  /model config show - Show configuration file location

Examples:
  /model config set openai sk-your-key-here
  /model config set deepseek your-deepseek-key-here
  /model config get openai
  /model config list`,
            };
          }

          const subCommand = argsArray[1];

          switch (subCommand) {
            case 'set': {
              if (argsArray.length < 4) {
                return {
                  type: 'message',
                  messageType: 'error',
                  content:
                    'Usage: /model config set <provider> <api-key>\nExample: /model config set openai sk-your-key-here',
                };
              }

              const [, , provider, apiKey] = argsArray;
              const config = readConfig();

              if (!config.providers[provider.toLowerCase()]) {
                config.providers[provider.toLowerCase()] = {};
              }

              config.providers[provider.toLowerCase()].apiKey = apiKey;
              writeConfig(config);

              return {
                type: 'message',
                messageType: 'info',
                content: `✅ API key for ${provider} has been saved to configuration file.`,
              };
            }

            case 'get': {
              if (argsArray.length < 3) {
                return {
                  type: 'message',
                  messageType: 'error',
                  content:
                    'Usage: /model config get <provider>\nExample: /model config get openai',
                };
              }

              const [, , provider] = argsArray;
              const apiKey = getApiKey(provider);

              if (!apiKey) {
                return {
                  type: 'message',
                  messageType: 'info',
                  content: `No API key configured for ${provider}`,
                };
              }

              // 显示掩码后的API key
              const maskedKey =
                apiKey.length > 8
                  ? apiKey.substring(0, 4) +
                    '*'.repeat(apiKey.length - 8) +
                    apiKey.substring(apiKey.length - 4)
                  : '*'.repeat(apiKey.length);

              return {
                type: 'message',
                messageType: 'info',
                content: `API key for ${provider}: ${maskedKey}`,
              };
            }

            case 'list': {
              const config = readConfig();
              const configuredProviders = Object.keys(config.providers);

              if (configuredProviders.length === 0) {
                return {
                  type: 'message',
                  messageType: 'info',
                  content: 'No providers configured in configuration file.',
                };
              }

              const providerList = configuredProviders
                .map((provider) => {
                  const hasApiKey = config.providers[provider]?.apiKey
                    ? '✅'
                    : '❌';
                  return `  ${hasApiKey} ${provider}`;
                })
                .join('\n');

              return {
                type: 'message',
                messageType: 'info',
                content: `Configured Providers:\n${providerList}`,
              };
            }

            case 'remove': {
              if (argsArray.length < 3) {
                return {
                  type: 'message',
                  messageType: 'error',
                  content:
                    'Usage: /model config remove <provider>\nExample: /model config remove openai',
                };
              }

              const [, , provider] = argsArray;
              const config = readConfig();

              if (!config.providers[provider.toLowerCase()]) {
                return {
                  type: 'message',
                  messageType: 'info',
                  content: `No configuration found for ${provider}`,
                };
              }

              delete config.providers[provider.toLowerCase()];
              writeConfig(config);

              return {
                type: 'message',
                messageType: 'info',
                content: `✅ Configuration for ${provider} has been removed.`,
              };
            }

            case 'show': {
              return {
                type: 'message',
                messageType: 'info',
                content: `Configuration file location: ${CONFIG_FILE}`,
              };
            }

            default: {
              return {
                type: 'message',
                messageType: 'error',
                content: `Unknown config command: ${subCommand}\nUse '/model config' to see available commands.`,
              };
            }
          }
        }

        case 'list': {
          const models = await selector.getAvailableModels();
          const modelList = models
            .map(
              (model: any) => `• ${model.name} (${model.provider}/${model.id})`,
            )
            .join('\n');

          // 检查是否有百度模型在列表中，但是显示需要配置的提示
          const baiduModels = models.filter((model: any) => model.provider === 'baidu');
          let configNote = '';
          
          if (baiduModels.length > 0) {
            // 检查是否有配置百度API密钥
            const baiduKey = getApiKey('baidu');
            if (!baiduKey) {
              configNote = '\n\n📋 配置提示:\n• 百度模型需要API密钥，格式: bce-v3/ACCESS_KEY/SECRET_KEY\n• 使用命令: /model config set baidu bce-v3/your-access-key/your-secret-key\n• 获取密钥: https://cloud.baidu.com/doc/qianfan-api/s/3m7of64lb';
            }
          }

          return {
            type: 'message',
            messageType: 'info',
            content: `Available Models:\n${modelList}${configNote}`,
          };
        }

        case 'current': {
          // 显示Research CLI核心配置中的当前模型
          const currentCoreModel = context.services.agentContext?.config.getModel();
          if (currentCoreModel) {
            return {
              type: 'message',
              messageType: 'info',
              content: `Current Model: ${currentCoreModel}`,
            };
          } else {
            return {
              type: 'message',
              messageType: 'info',
              content: 'No model currently selected',
            };
          }
        }

        case 'providers': {
          const models = await selector.getAvailableModels();
          const providerList = Array.from(
            new Set(models.map((m: any) => m.provider)),
          )
            .map((provider) => `• ${provider}`)
            .join('\n');

          return {
            type: 'message',
            messageType: 'info',
            content: `Model Providers:\n${providerList}`,
          };
        }

        case 'select': {
          if (argsArray.length < 3) {
            return {
              type: 'message',
              messageType: 'error',
              content:
                'Usage: /model select <provider> <model-id>\nExample: /model select openai gpt-4o',
            };
          }

          const [, provider, modelId] = argsArray;
          const models = await selector.getAvailableModels();
          const selectedModel = models.find(
            (m: any) => m.provider === provider && m.id === modelId,
          );

          if (!selectedModel) {
            return {
              type: 'message',
              messageType: 'error',
              content: `Model not found: ${provider}/${modelId}\nUse '/model list' to see available models`,
            };
          }

          try {
            // 首先更新ModelSelector
            const providerEnum =
              core.ModelProvider[
                provider.toUpperCase() as keyof typeof core.ModelProvider
              ];
            await selector.selectModel(providerEnum, modelId);

            // 然后更新Research CLI的核心Config
            const config = context.services.agentContext?.config;
            if (config) {
              // 构建模型名称 - 根据提供商类型使用不同的格式
              let modelName: string;

              // 对于Gemini模型，使用Gemini格式
              if (provider.toLowerCase() === 'gemini') {
                modelName = modelId; // 直接使用模型ID，如 'gemini-1.5-pro'
              } else {
                // 对于其他提供商，可能需要不同的格式
                // 这里先使用简单的格式，后续可以根据需要调整
                modelName = modelId;
              }

              config.setModel(modelName);

              return {
                type: 'message',
                messageType: 'info',
                content: `Successfully switched to ${selectedModel.name} (${provider}/${modelId})\nCore model updated to: ${modelName}`,
              };
            } else {
              return {
                type: 'message',
                messageType: 'error',
                content: 'Unable to access configuration service',
              };
            }
          } catch (error: any) {
            // 处理选择模型时的错误（如认证失败）
            console.warn('Model selection warning:', error);
            
            // 即使有认证错误，仍然尝试设置模型
            const config = context.services.agentContext?.config;
            if (config) {
              let modelName: string;
              if (provider.toLowerCase() === 'gemini') {
                modelName = modelId;
              } else {
                modelName = modelId;
              }
              config.setModel(modelName);
            }
            
            return {
              type: 'message',
              messageType: 'error',
              content: `Model selected with authentication warning: ${selectedModel.name} (${provider}/${modelId})\n\n⚠️  Warning: API key may be invalid or provider authentication failed.\n• Use: /model config set ${provider} <valid-api-key>\n• For Baidu: Format should be bce-v3/ACCESS_KEY/SECRET_KEY\n• Get key: https://cloud.baidu.com/doc/qianfan-api/s/3m7of64lb`,
            };
          }
        }

        case 'help':
        default: {
          return {
            type: 'message',
            messageType: 'info',
            content: `Model Commands:
  /model list - List all available models
  /model current - Show current model
  /model providers - List model providers
  /model select <provider> <model-id> - Select a model
  /model config - Manage API keys and provider configuration
  /model help - Show this help

Examples:
  /model select openai gpt-4o
  /model select anthropic claude-3-5-sonnet-20241022
  /model select deepseek deepseek-chat
  /model select gemini gemini-1.5-pro
  /model config set openai sk-your-key-here

Configuration:
  Use '/model config' to manage API keys without environment variables.
  Configuration is stored in: ~/.research-cli/model-config.json`,
          };
        }
      }
    } catch (error) {
      return {
        type: 'message',
        messageType: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to execute model command'}`,
      };
    }
  },
};
