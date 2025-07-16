/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SlashCommand } from '../types.js';

export const modelCommand: SlashCommand = {
  name: 'model',
  description: 'Manage and switch between different AI models',
  action: async (context, args) => {
    const argsArray = args.trim().split(/\s+/).filter(arg => arg.length > 0);
    const command = argsArray[0] || 'help';
    
    try {
      // 动态导入core包以避免编译时类型问题
      const core = await import('@iechor/research-cli-core');
      
      // 初始化配置管理器
      const manager = new core.ModelProviderConfigManager();
      await manager.loadFromEnvironment();

      // 创建模型选择器
      const selector = new core.ModelSelector();
      
      // 添加提供商配置
      const providers = manager.getConfiguredProviders();
      for (const provider of providers) {
        const providerConfig = manager.getProviderConfig(provider);
        if (providerConfig) {
          selector.addProviderConfig(providerConfig);
        }
      }
      
      switch (command) {
        case 'list': {
          const models = await selector.getAvailableModels();
          const modelList = models.map((model: any) => 
            `• ${model.name} (${model.provider}/${model.id})`
          ).join('\n');
          
          return {
            type: 'message',
            messageType: 'info',
            content: `Available Models:\n${modelList}`,
          };
        }
        
        case 'current': {
          // 显示Research CLI核心配置中的当前模型
          const currentCoreModel = context.services.config?.getModel();
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
          const providerList = Array.from(new Set(models.map((m: any) => m.provider)))
            .map(provider => `• ${provider}`)
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
              content: 'Usage: /model select <provider> <model-id>\nExample: /model select openai gpt-4o',
            };
          }
          
          const [, provider, modelId] = argsArray;
          const models = await selector.getAvailableModels();
          const selectedModel = models.find((m: any) => m.provider === provider && m.id === modelId);
          
          if (!selectedModel) {
            return {
              type: 'message',
              messageType: 'error',
              content: `Model not found: ${provider}/${modelId}\nUse '/model list' to see available models`,
            };
          }
          
          // 首先更新ModelSelector
          const providerEnum = core.ModelProvider[provider.toUpperCase() as keyof typeof core.ModelProvider];
          await selector.selectModel(providerEnum, modelId);
          
          // 然后更新Research CLI的核心Config
          const config = context.services.config;
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
  /model help - Show this help

Examples:
  /model select openai gpt-4o
  /model select anthropic claude-3-5-sonnet-20241022
  /model select deepseek deepseek-chat
  /model select gemini gemini-1.5-pro

Note: Make sure to set your API keys as environment variables:
  export OPENAI_API_KEY="your-key"
  export ANTHROPIC_API_KEY="your-key"
  export DEEPSEEK_API_KEY="your-key"
  export GEMINI_API_KEY="your-key"`,
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