/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Text, Box, Newline } from 'ink';
import { 
  ModelProvider, 
  ModelSelector, 
  ModelInfo,
  ModelProviderConfigManager,
  ModelProviderSettings,
  Config
} from '@iechor/research-cli-core';

interface ModelCommandProps {
  action?: 'list' | 'select' | 'config' | 'current' | 'providers';
  provider?: string;
  model?: string;
  apiKey?: string;
  config: Config;
}

export const ModelCommand: React.FC<ModelCommandProps> = ({ 
  action = 'list', 
  provider, 
  model, 
  apiKey,
  config
}) => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [currentModel, setCurrentModel] = useState<{ provider: ModelProvider; model: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 创建模型选择器和配置管理器
  const modelSelector = new ModelSelector();
  const configManager = new ModelProviderConfigManager();

  useEffect(() => {
    const initializeModels = async () => {
      try {
        // 从环境变量加载配置
        configManager.loadFromEnvironment();

        // 为每个配置的提供商添加配置
        const configuredProviders = configManager.getConfiguredProviders();
        for (const provider of configuredProviders) {
          const providerConfig = configManager.getProviderConfig(provider);
          if (providerConfig) {
            modelSelector.addProviderConfig(providerConfig);
          }
        }

        // 根据action执行不同的操作
        switch (action) {
          case 'list':
            await handleList();
            break;
          case 'select':
            await handleSelect();
            break;
          case 'config':
            await handleConfig();
            break;
          case 'current':
            await handleCurrent();
            break;
          case 'providers':
            await handleProviders();
            break;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    initializeModels();
  }, [action, provider, model, apiKey]);

  const handleList = async () => {
    if (provider) {
      // 列出特定提供商的模型
      const providerEnum = provider.toUpperCase() as ModelProvider;
      const providerModels = await modelSelector.getModelsForProvider(providerEnum);
      setModels(providerModels);
    } else {
      // 列出所有可用模型
      const allModels = await modelSelector.getAvailableModels();
      setModels(allModels);
    }
  };

  const handleSelect = async () => {
    if (!provider || !model) {
      setError('Provider and model are required for selection');
      return;
    }

    const providerEnum = provider.toUpperCase() as ModelProvider;
    await modelSelector.selectModel(providerEnum, model);
    setCurrentModel({ provider: providerEnum, model });
  };

  const handleConfig = async () => {
    if (!provider || !apiKey) {
      setError('Provider and API key are required for configuration');
      return;
    }

    const providerEnum = provider.toUpperCase() as ModelProvider;
    configManager.setProviderConfig(providerEnum, { apiKey });
    
    // 保存到设置
    const settings = configManager.getSettings();
    // TODO: 保存到用户设置文件
  };

  const handleCurrent = async () => {
    const current = modelSelector.getCurrentModel();
    setCurrentModel(current);
  };

  const handleProviders = async () => {
    // 显示支持的提供商
    const supportedProviders = Object.values(ModelProvider);
    const configuredProviders = configManager.getConfiguredProviders();
    
    setModels(supportedProviders.map(provider => ({
      id: provider,
      name: provider.charAt(0).toUpperCase() + provider.slice(1),
      provider: provider as ModelProvider,
      description: `${provider} provider`,
      contextLength: 0,
      maxTokens: 0,
      supportedFeatures: configuredProviders.includes(provider as ModelProvider) ? ['configured'] : [],
    })));
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  const renderModelList = () => (
    <Box flexDirection="column">
      <Text color="cyan" bold>Available Models:</Text>
      <Newline />
      {models.map((model) => (
        <Box key={`${model.provider}-${model.id}`} flexDirection="column" marginBottom={1}>
          <Text>
            <Text color="yellow" bold>{model.provider}</Text>
            <Text color="gray"> / </Text>
            <Text color="green" bold>{model.id}</Text>
          </Text>
          <Text color="gray">  {model.description}</Text>
          {model.contextLength && (
            <Text color="gray">  Context: {model.contextLength.toLocaleString()} tokens</Text>
          )}
          {model.supportedFeatures && model.supportedFeatures.length > 0 && (
            <Text color="gray">  Features: {model.supportedFeatures.join(', ')}</Text>
          )}
        </Box>
      ))}
    </Box>
  );

  const renderCurrentModel = () => (
    <Box flexDirection="column">
      <Text color="cyan" bold>Current Model:</Text>
      <Newline />
      {currentModel ? (
        <Box flexDirection="column">
          <Text>
            <Text color="yellow" bold>Provider:</Text>
            <Text> {currentModel.provider}</Text>
          </Text>
          <Text>
            <Text color="yellow" bold>Model:</Text>
            <Text> {currentModel.model}</Text>
          </Text>
        </Box>
      ) : (
        <Text color="gray">No model selected</Text>
      )}
    </Box>
  );

  const renderProviders = () => (
    <Box flexDirection="column">
      <Text color="cyan" bold>Model Providers:</Text>
      <Newline />
      {models.map((provider) => (
        <Box key={provider.id} flexDirection="row" marginBottom={1}>
          <Text>
            <Text color="yellow" bold>{provider.name}</Text>
            <Text color="gray"> - {provider.description}</Text>
            {provider.supportedFeatures?.includes('configured') && (
              <Text color="green"> ✓ Configured</Text>
            )}
          </Text>
        </Box>
      ))}
    </Box>
  );

  const renderSuccess = () => (
    <Box flexDirection="column">
      <Text color="green">✓ Model selected successfully!</Text>
      <Text>
        <Text color="yellow">Provider:</Text>
        <Text> {currentModel?.provider}</Text>
      </Text>
      <Text>
        <Text color="yellow">Model:</Text>
        <Text> {currentModel?.model}</Text>
      </Text>
    </Box>
  );

  switch (action) {
    case 'list':
      return renderModelList();
    case 'select':
      return renderSuccess();
    case 'config':
      return (
        <Box flexDirection="column">
          <Text color="green">✓ Provider configured successfully!</Text>
          <Text>
            <Text color="yellow">Provider:</Text>
            <Text> {provider}</Text>
          </Text>
        </Box>
      );
    case 'current':
      return renderCurrentModel();
    case 'providers':
      return renderProviders();
    default:
      return renderModelList();
  }
}; 