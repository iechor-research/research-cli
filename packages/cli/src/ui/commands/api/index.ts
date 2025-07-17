import { SlashCommand, CommandContext } from '../types.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// API配置文件路径
const API_CONFIG_DIR = path.join(os.homedir(), '.research-cli');
const API_CONFIG_FILE = path.join(API_CONFIG_DIR, 'api-config.json');

// 支持的API提供商
const SUPPORTED_APIS = {
  'serpapi': {
    name: 'SerpAPI',
    envVar: 'SERPAPI_KEY',
    description: 'Google Scholar and web search API',
    urlPattern: 'https://serpapi.com/'
  },
  'gemini': {
    name: 'Gemini API',
    envVar: 'GEMINI_API_KEY',
    description: 'Google Gemini AI API',
    urlPattern: 'https://aistudio.google.com/'
  },
  'google': {
    name: 'Google API',
    envVar: 'GOOGLE_API_KEY',
    description: 'Google Cloud API (Vertex AI)',
    urlPattern: 'https://cloud.google.com/'
  },
  'google_project': {
    name: 'Google Cloud Project',
    envVar: 'GOOGLE_CLOUD_PROJECT',
    description: 'Google Cloud Project ID',
    urlPattern: 'https://cloud.google.com/'
  },
  'google_location': {
    name: 'Google Cloud Location',
    envVar: 'GOOGLE_CLOUD_LOCATION',
    description: 'Google Cloud Location/Region',
    urlPattern: 'https://cloud.google.com/'
  }
};

interface APIConfig {
  apis: {
    [provider: string]: {
      apiKey?: string;
      value?: string; // For non-key values like project ID
      lastUpdated?: string;
    };
  };
}

// 读取API配置
function readAPIConfig(): APIConfig {
  try {
    if (fs.existsSync(API_CONFIG_FILE)) {
      const content = fs.readFileSync(API_CONFIG_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('Failed to read API config:', error);
  }
  return { apis: {} };
}

// 写入API配置
function writeAPIConfig(config: APIConfig): void {
  try {
    if (!fs.existsSync(API_CONFIG_DIR)) {
      fs.mkdirSync(API_CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(API_CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Failed to write API config:', error);
    throw error;
  }
}

// 获取API key（优先从配置文件，然后是环境变量）
function getAPIValue(provider: string): string | undefined {
  const config = readAPIConfig();
  const providerConfig = config.apis[provider.toLowerCase()];
  
  if (providerConfig?.apiKey || providerConfig?.value) {
    return providerConfig.apiKey || providerConfig.value;
  }
  
  // 回退到环境变量
  const apiInfo = SUPPORTED_APIS[provider.toLowerCase() as keyof typeof SUPPORTED_APIS];
  return apiInfo ? process.env[apiInfo.envVar] : undefined;
}

// 掩码显示API key
function maskAPIKey(key: string): string {
  if (key.length <= 8) {
    return '*'.repeat(key.length);
  }
  return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
}

export const apiCommand: SlashCommand = {
  name: 'api',
  description: 'Manage API keys and configuration',
  action: async (context: CommandContext, args: string) => {
    const argsArray = args.trim().split(/\s+/).filter((arg: string) => arg.length > 0);
    const command = argsArray[0] || 'help';
    
    try {
      switch (command) {
        case 'set': {
          if (argsArray.length < 3) {
            return {
              type: 'message',
              messageType: 'error',
              content: `Usage: /api set <provider> <value>
              
Supported providers:
${Object.entries(SUPPORTED_APIS).map(([key, info]) => `  ${key}: ${info.description}`).join('\n')}

Examples:
  /api set serpapi your-serpapi-key-here
  /api set gemini your-gemini-key-here
  /api set google_project your-project-id`,
            };
          }
          
          const [, provider, value] = argsArray;
          const apiInfo = SUPPORTED_APIS[provider.toLowerCase() as keyof typeof SUPPORTED_APIS];
          
          if (!apiInfo) {
            return {
              type: 'message',
              messageType: 'error',
              content: `Unknown API provider: ${provider}
              
Supported providers: ${Object.keys(SUPPORTED_APIS).join(', ')}`,
            };
          }
          
          const config = readAPIConfig();
          
          if (!config.apis[provider.toLowerCase()]) {
            config.apis[provider.toLowerCase()] = {};
          }
          
          // 根据类型设置不同的字段
          if (provider.toLowerCase().includes('key') || provider.toLowerCase() === 'serpapi' || provider.toLowerCase() === 'gemini') {
            config.apis[provider.toLowerCase()].apiKey = value;
          } else {
            config.apis[provider.toLowerCase()].value = value;
          }
          
          config.apis[provider.toLowerCase()].lastUpdated = new Date().toISOString();
          writeAPIConfig(config);
          
          return {
            type: 'message',
            messageType: 'info',
            content: `✅ ${apiInfo.name} has been saved to configuration file.`,
          };
        }

        case 'get': {
          if (argsArray.length < 2) {
            return {
              type: 'message',
              messageType: 'error',
              content: 'Usage: /api get <provider>\nExample: /api get serpapi',
            };
          }
          
          const [, provider] = argsArray;
          const apiInfo = SUPPORTED_APIS[provider.toLowerCase() as keyof typeof SUPPORTED_APIS];
          
          if (!apiInfo) {
            return {
              type: 'message',
              messageType: 'error',
              content: `Unknown API provider: ${provider}`,
            };
          }
          
          const value = getAPIValue(provider);
          
          if (!value) {
            return {
              type: 'message',
              messageType: 'info',
              content: `${apiInfo.name} is not configured.`,
            };
          }
          
          const displayValue = provider.toLowerCase().includes('key') || provider.toLowerCase() === 'serpapi' || provider.toLowerCase() === 'gemini'
            ? maskAPIKey(value)
            : value;
          
          return {
            type: 'message',
            messageType: 'info',
            content: `${apiInfo.name}: ${displayValue}`,
          };
        }

        case 'list': {
          const config = readAPIConfig();
          const configuredApis = Object.keys(config.apis);
          
          if (configuredApis.length === 0) {
            return {
              type: 'message',
              messageType: 'info',
              content: 'No APIs configured in configuration file.',
            };
          }
          
          const apiList = configuredApis.map(provider => {
            const apiInfo = SUPPORTED_APIS[provider as keyof typeof SUPPORTED_APIS];
            const value = getAPIValue(provider);
            const status = value ? '✅ Configured' : '❌ Not set';
            
            return `  ${provider}: ${apiInfo?.name || 'Unknown'} - ${status}`;
          }).join('\n');
          
          return {
            type: 'message',
            messageType: 'info',
            content: `Configured APIs:\n${apiList}`,
          };
        }

        case 'remove': {
          if (argsArray.length < 2) {
            return {
              type: 'message',
              messageType: 'error',
              content: 'Usage: /api remove <provider>\nExample: /api remove serpapi',
            };
          }
          
          const [, provider] = argsArray;
          const config = readAPIConfig();
          
          if (!config.apis[provider.toLowerCase()]) {
            return {
              type: 'message',
              messageType: 'info',
              content: `${provider} is not configured.`,
            };
          }
          
          delete config.apis[provider.toLowerCase()];
          writeAPIConfig(config);
          
          return {
            type: 'message',
            messageType: 'info',
            content: `✅ ${provider} configuration has been removed.`,
          };
        }

        case 'show': {
          return {
            type: 'message',
            messageType: 'info',
            content: `API configuration file location: ${API_CONFIG_FILE}`,
          };
        }

        case 'providers': {
          const providerList = Object.entries(SUPPORTED_APIS).map(([key, info]) => {
            const envValue = process.env[info.envVar];
            const configValue = getAPIValue(key);
            const status = configValue ? '✅ Configured' : envValue ? '🔄 Env only' : '❌ Not set';
            
            return `  ${key}: ${info.name}
    Description: ${info.description}
    Environment Variable: ${info.envVar}
    Status: ${status}`;
          }).join('\n\n');
          
          return {
            type: 'message',
            messageType: 'info',
            content: `Supported API Providers:\n\n${providerList}`,
          };
        }

        case 'help':
        default: {
          return {
            type: 'message',
            messageType: 'info',
            content: `API Configuration Commands:

/api set <provider> <value>     - Set API key or value for a provider
/api get <provider>             - Get current API key/value (masked)
/api list                       - List all configured APIs
/api remove <provider>          - Remove API configuration
/api show                       - Show configuration file location
/api providers                  - List all supported API providers

Examples:
  /api set serpapi your-serpapi-key-here
  /api set gemini your-gemini-key-here
  /api set google_project your-project-id
  /api get serpapi
  /api list
  /api providers

Configuration is stored in: ${API_CONFIG_FILE}`,
          };
        }
      }
    } catch (error) {
      return {
        type: 'message',
        messageType: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      };
    }
  },
}; 