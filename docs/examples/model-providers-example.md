# 模型提供商系统使用示例

Research CLI 现在支持多种大模型提供商，包括 OpenAI、Claude、DeepSeek、通义千问等。本文档展示如何配置和使用这些模型提供商。

## 支持的提供商

目前支持以下模型提供商：

- **OpenAI**: GPT-4o, GPT-4o-mini, GPT-3.5-turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku
- **DeepSeek**: DeepSeek Chat, DeepSeek Coder
- **通义千问 (Qwen)**: Qwen Turbo, Qwen Plus, Qwen Max
- **Gemini**: Gemini 1.5 Pro, Gemini 1.5 Flash
- **Groq**: Llama 3.1 70B, Llama 3.1 8B
- **Mistral**: Mistral Large, Mistral Small
- **Cohere**: Command R+
- **其他**: Hugging Face, Ollama, Together AI, Fireworks, Replicate, Perplexity

## 环境变量配置

设置相应的环境变量来配置API密钥：

```bash
# OpenAI
export OPENAI_API_KEY="sk-..."

# Anthropic Claude
export ANTHROPIC_API_KEY="sk-ant-..."

# DeepSeek
export DEEPSEEK_API_KEY="sk-..."

# 通义千问
export QWEN_API_KEY="sk-..."

# Gemini
export GEMINI_API_KEY="AIza..."

# Groq
export GROQ_API_KEY="gsk_..."

# Mistral
export MISTRAL_API_KEY="..."

# Cohere
export COHERE_API_KEY="..."
```

## 编程方式使用

### 1. 基本用法

```typescript
import { 
  ModelSelector, 
  ModelProvider, 
  ModelProviderConfigManager 
} from '@iechor/research-cli-core';

// 创建配置管理器
const configManager = new ModelProviderConfigManager();
configManager.loadFromEnvironment();

// 创建模型选择器
const modelSelector = new ModelSelector();

// 添加提供商配置
const configuredProviders = configManager.getConfiguredProviders();
for (const provider of configuredProviders) {
  const config = configManager.getProviderConfig(provider);
  if (config) {
    modelSelector.addProviderConfig(config);
  }
}

// 选择模型
await modelSelector.selectModel(ModelProvider.OPENAI, 'gpt-4o-mini');

// 发送消息
const response = await modelSelector.sendMessage({
  messages: [
    { role: 'user', content: '你好，请介绍一下你自己' }
  ]
});

console.log(response.content);
```

### 2. 流式响应

```typescript
// 发送流式消息
const stream = modelSelector.streamMessage({
  messages: [
    { role: 'user', content: '请写一首关于春天的诗' }
  ]
});

for await (const chunk of stream) {
  process.stdout.write(chunk.delta);
  if (chunk.done) {
    break;
  }
}
```

### 3. 获取可用模型

```typescript
// 获取所有可用模型
const allModels = await modelSelector.getAvailableModels();
console.log('可用模型：');
allModels.forEach(model => {
  console.log(`- ${model.provider}/${model.id}: ${model.description}`);
});

// 获取特定提供商的模型
const openaiModels = await modelSelector.getModelsForProvider(ModelProvider.OPENAI);
console.log('OpenAI 模型：');
openaiModels.forEach(model => {
  console.log(`- ${model.id}: ${model.description}`);
});
```

### 4. 动态配置

```typescript
// 动态添加提供商配置
configManager.setProviderConfig(ModelProvider.DEEPSEEK, {
  apiKey: 'your-deepseek-api-key',
  defaultModel: 'deepseek-chat'
});

// 设置全局配置
configManager.setGlobalConfig({
  temperature: 0.8,
  maxTokens: 4096,
  topP: 0.9
});

// 验证配置
const isValid = configManager.validateProviderConfig(ModelProvider.DEEPSEEK);
console.log(`DeepSeek 配置有效: ${isValid}`);
```

## CLI 命令使用

### 列出可用模型

```bash
# 列出所有可用模型
research model list

# 列出特定提供商的模型
research model list --provider openai
```

### 选择模型

```bash
# 选择模型
research model select --provider openai --model gpt-4o-mini

# 查看当前选择的模型
research model current
```

### 配置提供商

```bash
# 配置提供商
research model config --provider deepseek --api-key your-api-key

# 查看支持的提供商
research model providers
```

## 配置文件示例

你也可以通过配置文件来管理模型提供商：

```json
{
  "modelProviders": {
    "defaultProvider": "openai",
    "defaultModel": "gpt-4o-mini",
    "providers": {
      "openai": {
        "apiKey": "sk-...",
        "defaultModel": "gpt-4o-mini",
        "timeout": 30000
      },
      "anthropic": {
        "apiKey": "sk-ant-...",
        "defaultModel": "claude-3-5-haiku-20241022",
        "timeout": 30000
      },
      "deepseek": {
        "apiKey": "sk-...",
        "defaultModel": "deepseek-chat",
        "timeout": 30000
      },
      "qwen": {
        "apiKey": "sk-...",
        "defaultModel": "qwen-turbo",
        "timeout": 30000
      }
    },
    "globalConfig": {
      "temperature": 0.7,
      "maxTokens": 2048,
      "topP": 1.0
    }
  }
}
```

## 错误处理

```typescript
import { 
  ModelProviderError, 
  AuthenticationError, 
  RateLimitError, 
  ConfigurationError 
} from '@iechor/research-cli-core';

try {
  await modelSelector.selectModel(ModelProvider.OPENAI, 'gpt-4o');
  const response = await modelSelector.sendMessage({
    messages: [{ role: 'user', content: 'Hello' }]
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('认证失败，请检查API密钥');
  } else if (error instanceof RateLimitError) {
    console.error('达到速率限制，请稍后重试');
  } else if (error instanceof ConfigurationError) {
    console.error('配置错误:', error.message);
  } else {
    console.error('未知错误:', error.message);
  }
}
```

## 最佳实践

1. **环境变量管理**: 使用 `.env` 文件管理API密钥，不要将密钥硬编码在代码中
2. **错误处理**: 始终处理可能的错误，特别是认证和网络错误
3. **模型选择**: 根据任务类型选择合适的模型（如代码生成使用 DeepSeek Coder）
4. **成本控制**: 监控API使用情况，选择合适的模型以平衡性能和成本
5. **配置验证**: 在使用前验证配置的有效性

## 故障排除

### 常见问题

1. **API密钥无效**: 检查环境变量是否正确设置
2. **模型不可用**: 确认提供商支持该模型
3. **网络错误**: 检查网络连接和防火墙设置
4. **配置错误**: 验证配置格式和必需字段

### 调试技巧

```typescript
// 启用调试模式
const configManager = new ModelProviderConfigManager();
configManager.loadFromEnvironment();

// 检查配置状态
console.log('配置的提供商:', configManager.getConfiguredProviders());
console.log('默认提供商:', configManager.getDefaultProvider());

// 验证每个提供商的配置
configManager.getConfiguredProviders().forEach(provider => {
  const isValid = configManager.validateProviderConfig(provider);
  console.log(`${provider}: ${isValid ? '✓' : '✗'}`);
});
```

通过这个统一的模型提供商系统，你可以轻松地在不同的大模型之间切换，享受最佳的AI体验！ 