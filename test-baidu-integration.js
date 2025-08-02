#!/usr/bin/env node

/**
 * 测试百度千帆API集成的简单脚本
 */

// 使用相对路径导入构建后的模块
import { 
  ModelProvider, 
  ModelProviderFactory, 
  detectModelProvider,
  getModelTokenLimit 
} from '../core/dist/index.js';

async function testBaiduIntegration() {
  console.log('🧪 测试百度千帆API集成...\n');

  // 1. 测试模型提供者枚举
  console.log('1. 检查ModelProvider枚举:');
  console.log(`   BAIDU = "${ModelProvider.BAIDU}"`);
  console.log('   ✅ BAIDU提供者已添加到枚举\n');

  // 2. 测试模型检测
  console.log('2. 测试模型检测功能:');
  const testModels = [
    'ernie-4.5-turbo-128k',
    'ernie-4.5-turbo-128k-preview',
    'ernie-4.0-turbo-8k',
    'ernie-3.5-8k'
  ];

  testModels.forEach(model => {
    const provider = detectModelProvider(model);
    const tokenLimit = getModelTokenLimit(model);
    console.log(`   ${model}:`);
    console.log(`     提供者: ${provider}`);
    console.log(`     Token限制: ${tokenLimit}`);
    
    if (provider === ModelProvider.BAIDU) {
      console.log('     ✅ 正确检测为百度提供者');
    } else {
      console.log('     ❌ 检测错误');
    }
  });
  console.log('');

  // 3. 测试工厂创建
  console.log('3. 测试模型提供者工厂:');
  try {
    const factory = new ModelProviderFactory();
    const supportedProviders = factory.getSupportedProviders();
    
    if (supportedProviders.includes(ModelProvider.BAIDU)) {
      console.log('   ✅ 百度提供者已注册到工厂');
    } else {
      console.log('   ❌ 百度提供者未注册到工厂');
      return;
    }

    // 尝试创建百度提供者实例
    const baiduProvider = factory.createProvider(ModelProvider.BAIDU);
    console.log(`   ✅ 成功创建百度提供者实例: ${baiduProvider.name}`);
    
    // 测试默认配置
    const defaultConfig = baiduProvider.getDefaultConfig();
    console.log('   默认配置:');
    console.log(`     模型: ${defaultConfig.model}`);
    console.log(`     温度: ${defaultConfig.temperature}`);
    console.log(`     最大tokens: ${defaultConfig.maxTokens}`);
    
    // 测试支持的功能
    const features = ['chat', 'stream', 'tools'];
    features.forEach(feature => {
      const supported = baiduProvider.supportsFeature(feature);
      console.log(`     支持${feature}: ${supported ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.log(`   ❌ 工厂测试失败: ${error.message}`);
    return;
  }
  console.log('');

  // 4. 测试配置验证
  console.log('4. 测试配置验证:');
  
  // 测试无效配置
  const invalidConfigs = [
    { provider: ModelProvider.BAIDU, model: 'ernie-4.5-turbo-128k' }, // 缺少apiKey
    { provider: ModelProvider.BAIDU, apiKey: 'invalid-key', model: 'ernie-4.5-turbo-128k' }, // 无效格式
    { provider: ModelProvider.BAIDU, apiKey: 'bce-v3/key/secret' }, // 缺少model
  ];

  const validConfig = {
    provider: ModelProvider.BAIDU,
    apiKey: 'bce-v3/ALTAK-test/test-secret',
    model: 'ernie-4.5-turbo-128k'
  };

  try {
    const factory = new ModelProviderFactory();
    const baiduProvider = factory.createProvider(ModelProvider.BAIDU);
    
    invalidConfigs.forEach((config, index) => {
      const isValid = baiduProvider.validateConfig(config);
      console.log(`   无效配置${index + 1}: ${isValid ? '❌ 应该无效但通过了' : '✅ 正确识别为无效'}`);
    });

    const isValidConfigValid = baiduProvider.validateConfig(validConfig);
    console.log(`   有效配置: ${isValidConfigValid ? '✅ 正确识别为有效' : '❌ 应该有效但失败了'}`);

  } catch (error) {
    console.log(`   ❌ 配置验证测试失败: ${error.message}`);
  }

  console.log('\n🎉 百度千帆API集成测试完成！');
  console.log('\n📝 下一步:');
  console.log('   1. 设置环境变量: export BAIDU_LLM_KEY=bce-v3/YOUR_ACCESS_KEY/YOUR_SECRET_KEY');
  console.log('   2. 在配置文件中添加百度提供者配置');
  console.log('   3. 使用命令: research --model ernie-4.5-turbo-128k "你的问题"');
}

// 运行测试
testBaiduIntegration().catch(console.error);