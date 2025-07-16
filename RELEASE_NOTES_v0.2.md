# Research CLI v0.2.0 Release Notes

## 🚀 Major New Feature: Multi-LLM Model Provider System

We're excited to announce the release of Research CLI v0.2.0, which introduces a comprehensive **Multi-LLM Model Provider System**! This major update enables users to seamlessly switch between different large language models from various providers.

## 📦 Published Packages

- **@iechor/research-cli-core@0.2.0** - Core functionality with model provider system
- **@iechor/research-cli@0.2.1** - CLI interface with updated core dependency

## 🎯 Key Features

### 🔄 Multi-Model Support
Support for **16 different model providers** including:
- **OpenAI**: GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku
- **DeepSeek**: DeepSeek Chat, DeepSeek Coder
- **Alibaba Qwen**: Qwen Turbo, Qwen Plus, Qwen Max
- **Google Gemini**: Gemini 1.5 Pro, Gemini 1.5 Flash
- **Groq**: Llama 3.1 70B, Llama 3.1 8B
- **And more**: Mistral, Cohere, Hugging Face, etc.

### 🛠️ Core Components

1. **Unified Model Provider Interface** (`IModelProvider`)
   - Standardized API for all providers
   - Support for both regular and streaming responses
   - Comprehensive error handling

2. **Model Provider Factory** (`ModelProviderFactory`)
   - Centralized provider registration and creation
   - Easy extensibility for new providers

3. **Model Selector** (`ModelSelector`)
   - Dynamic model switching at runtime
   - Automatic model discovery and validation
   - Unified message sending interface

4. **Configuration Management** (`ModelProviderConfigManager`)
   - Environment variable auto-loading
   - Flexible configuration options
   - Secure API key management

### 🔧 Implementation Details

- **Built on llm-interface**: Leverages the powerful `llm-interface` npm package for unified LLM access
- **TypeScript Support**: Full type safety with comprehensive interfaces
- **Environment Variable Configuration**: Automatic detection and loading of API keys
- **Error Handling**: Robust error management with custom error types
- **Streaming Support**: Real-time response streaming for better UX

### 🚀 Usage Examples

#### Environment Variable Configuration
```bash
# Set up your API keys
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
export DEEPSEEK_API_KEY="your-deepseek-key"
export GEMINI_API_KEY="your-gemini-key"
export GROQ_API_KEY="your-groq-key"
```

#### Programmatic Usage
```typescript
import { ModelProviderConfigManager, ModelSelector } from '@iechor/research-cli-core';

// Initialize configuration
const configManager = new ModelProviderConfigManager();
await configManager.loadFromEnvironment();

// Create model selector
const modelSelector = new ModelSelector();

// Add provider configurations
const providers = configManager.getConfiguredProviders();
for (const provider of providers) {
  const config = configManager.getProviderConfig(provider);
  if (config) {
    modelSelector.addProviderConfig(config);
  }
}

// Get available models
const models = await modelSelector.getAvailableModels();
console.log(`Found ${models.length} available models`);

// Select a model
await modelSelector.selectModel('openai', 'gpt-4o');

// Send a message
const response = await modelSelector.sendMessage([
  { role: 'user', content: 'Hello!' }
]);
```

## 🧪 Testing & Validation

The system has been thoroughly tested with:
- ✅ **Environment variable auto-detection** - Automatically discovers configured providers
- ✅ **Model discovery** - Successfully lists all available models from configured providers
- ✅ **Model switching** - Seamless switching between different models and providers
- ✅ **Error handling** - Robust error management for invalid configurations
- ✅ **Type safety** - Full TypeScript support with comprehensive type definitions

## 📚 Documentation

Comprehensive documentation and examples are available in:
- `docs/examples/model-providers-example.md` - Detailed usage examples
- Type definitions in the core package for full IntelliSense support
- Inline code documentation for all public APIs

## 🔮 Future Enhancements

- **CLI Commands**: Interactive model selection commands (coming soon)
- **Model Performance Analytics**: Track usage and performance metrics
- **Custom Provider Support**: Easy integration of custom model providers
- **Advanced Configuration**: Fine-grained control over model parameters

## 🛠️ Technical Architecture

The system is designed with:
- **Modular Architecture**: Clean separation of concerns
- **Extensible Design**: Easy to add new providers
- **Type Safety**: Comprehensive TypeScript support
- **Performance Optimized**: Efficient provider initialization and caching
- **Error Resilient**: Graceful handling of provider failures

## 📈 Migration Guide

For existing users upgrading from v0.1.x:
1. Update to the latest version: `npm install -g @iechor/research-cli@latest`
2. Set up environment variables for your preferred providers
3. The system will automatically detect and configure available providers
4. No breaking changes to existing functionality

## 🙏 Acknowledgments

This release was made possible by:
- The excellent `llm-interface` package for unified LLM access
- Community feedback and feature requests
- Comprehensive testing and validation

---

**Ready to explore the power of multi-LLM support?** 

Install the latest version and start switching between different AI models seamlessly:

```bash
npm install -g @iechor/research-cli@latest
```

Happy researching! 🚀 