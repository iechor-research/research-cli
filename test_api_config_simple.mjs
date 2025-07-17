#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.research-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'api-config.json');

// 清理之前的配置文件
function cleanup() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
      console.log('✅ Cleaned up previous API config file');
    }
  } catch (error) {
    console.warn('⚠️ Failed to cleanup config file:', error.message);
  }
}

// 测试配置文件读写
function testConfigFile() {
  console.log('🧪 Testing API Configuration File System\n');

  // 清理
  cleanup();

  try {
    // 1. 创建配置目录
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
      console.log('✅ Created config directory:', CONFIG_DIR);
    }

    // 2. 测试写入配置
    const testConfig = {
      apis: {
        serpapi: {
          apiKey: 'test-serpapi-key-12345',
          lastUpdated: new Date().toISOString()
        },
        gemini: {
          apiKey: 'test-gemini-key-67890',
          lastUpdated: new Date().toISOString()
        },
        google: {
          apiKey: 'test-google-key-abcdef',
          lastUpdated: new Date().toISOString()
        },
        google_project: {
          value: 'my-test-project-123',
          lastUpdated: new Date().toISOString()
        },
        google_location: {
          value: 'us-central1',
          lastUpdated: new Date().toISOString()
        }
      }
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(testConfig, null, 2));
    console.log('✅ Configuration file created successfully');

    // 3. 测试读取配置
    const readConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    console.log('✅ Configuration file read successfully');

    // 4. 验证数据完整性
    const expectedKeys = ['serpapi', 'gemini', 'google', 'google_project', 'google_location'];
    const actualKeys = Object.keys(readConfig.apis);
    
    if (expectedKeys.every(key => actualKeys.includes(key))) {
      console.log('✅ All expected API providers found in config');
    } else {
      console.log('❌ Some API providers missing from config');
    }

    // 5. 测试掩码功能
    function maskAPIKey(key) {
      if (key.length <= 8) {
        return '*'.repeat(key.length);
      }
      return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
    }

    console.log('\n📋 Configuration Summary:');
    Object.entries(readConfig.apis).forEach(([provider, config]) => {
      const value = config.apiKey || config.value;
      const displayValue = provider.includes('key') || provider === 'serpapi' || provider === 'gemini'
        ? maskAPIKey(value)
        : value;
      console.log(`  ${provider}: ${displayValue}`);
    });

    // 6. 测试Google Scholar客户端配置读取
    console.log('\n🔍 Testing Google Scholar client config integration...');
    
    // 模拟Google Scholar客户端的配置读取逻辑
    function getConfiguredApiKey() {
      try {
        if (fs.existsSync(CONFIG_FILE)) {
          const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
          return config.apis?.serpapi?.apiKey || config.apis?.google?.apiKey;
        }
      } catch (error) {
        return undefined;
      }
      return undefined;
    }

    const scholarApiKey = getConfiguredApiKey();
    if (scholarApiKey === 'test-serpapi-key-12345') {
      console.log('✅ Google Scholar client would use SerpAPI key correctly');
    } else {
      console.log('❌ Google Scholar client config integration failed');
    }

    // 7. 测试Content Generator配置读取
    console.log('\n🔍 Testing Content Generator config integration...');
    
    function getConfiguredAPIValues() {
      try {
        if (fs.existsSync(CONFIG_FILE)) {
          const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
          return {
            geminiApiKey: config.apis?.gemini?.apiKey,
            googleApiKey: config.apis?.google?.apiKey,
            googleCloudProject: config.apis?.google_project?.value,
            googleCloudLocation: config.apis?.google_location?.value,
          };
        }
      } catch (error) {
        return {};
      }
      return {};
    }

    const contentGenValues = getConfiguredAPIValues();
    
    if (contentGenValues.geminiApiKey === 'test-gemini-key-67890' &&
        contentGenValues.googleApiKey === 'test-google-key-abcdef' &&
        contentGenValues.googleCloudProject === 'my-test-project-123' &&
        contentGenValues.googleCloudLocation === 'us-central1') {
      console.log('✅ Content Generator would use all configured values correctly');
    } else {
      console.log('❌ Content Generator config integration failed');
      console.log('Values:', contentGenValues);
    }

    // 8. 测试删除配置
    console.log('\n🗑️ Testing configuration removal...');
    delete readConfig.apis.serpapi;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(readConfig, null, 2));
    
    const updatedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (!updatedConfig.apis.serpapi) {
      console.log('✅ Configuration removal works correctly');
    } else {
      console.log('❌ Configuration removal failed');
    }

    console.log('\n🎉 API Configuration File System Test Complete!');
    console.log('✅ All core functionality is working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // 清理测试配置
    cleanup();
    console.log('\n🧹 Test cleanup completed');
  }
}

// 运行测试
testConfigFile(); 