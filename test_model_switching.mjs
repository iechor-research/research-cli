#!/usr/bin/env node

import { ModelSelector, ModelProviderConfigManager, ModelProvider } from './packages/core/dist/index.js';

async function testModelSwitching() {
    console.log('🧪 测试模型切换功能...\n');
    
    try {
        // 1. 初始化配置管理器
        console.log('1. 初始化配置管理器...');
        const configManager = new ModelProviderConfigManager();
        await configManager.loadFromEnvironment();
        console.log('✅ 配置管理器初始化成功\n');
        
        // 2. 创建模型选择器
        console.log('2. 创建模型选择器...');
        const selector = new ModelSelector();
        console.log('✅ 模型选择器创建成功\n');
        
        // 3. 获取可用的提供商
        console.log('3. 获取可用的提供商...');
        const availableProviders = configManager.getAvailableProviders();
        console.log(`✅ 发现 ${availableProviders.length} 个可用提供商:`);
        availableProviders.forEach(provider => {
            console.log(`   - ${provider}`);
        });
        console.log();
        
        // 4. 获取可用的模型
        console.log('4. 获取可用的模型...');
        const availableModels = configManager.getAvailableModels();
        console.log(`✅ 发现 ${availableModels.length} 个可用模型:`);
        availableModels.forEach(model => {
            console.log(`   - ${model.name} (${model.provider})`);
        });
        console.log();
        
        // 5. 测试模型切换
        console.log('5. 测试模型切换...');
        
        // 如果有多个模型可用，测试切换
        if (availableModels.length >= 2) {
            const firstModel = availableModels[0];
            const secondModel = availableModels[1];
            
            console.log(`   切换到第一个模型: ${firstModel.name} (${firstModel.provider})`);
            const success1 = await selector.selectModel(firstModel.provider, firstModel.name);
            console.log(`   切换结果: ${success1 ? '✅ 成功' : '❌ 失败'}`);
            
            if (success1) {
                const currentModel1 = selector.getCurrentModel();
                console.log(`   当前模型: ${currentModel1?.name} (${currentModel1?.provider})`);
            }
            
            console.log(`   切换到第二个模型: ${secondModel.name} (${secondModel.provider})`);
            const success2 = await selector.selectModel(secondModel.provider, secondModel.name);
            console.log(`   切换结果: ${success2 ? '✅ 成功' : '❌ 失败'}`);
            
            if (success2) {
                const currentModel2 = selector.getCurrentModel();
                console.log(`   当前模型: ${currentModel2?.name} (${currentModel2?.provider})`);
            }
        } else if (availableModels.length === 1) {
            const model = availableModels[0];
            console.log(`   只有一个模型可用，测试选择: ${model.name} (${model.provider})`);
            const success = await selector.selectModel(model.provider, model.name);
            console.log(`   选择结果: ${success ? '✅ 成功' : '❌ 失败'}`);
            
            if (success) {
                const currentModel = selector.getCurrentModel();
                console.log(`   当前模型: ${currentModel?.name} (${currentModel?.provider})`);
            }
        } else {
            console.log('   ⚠️  没有可用的模型进行测试');
        }
        
        console.log();
        
        // 6. 测试简单的聊天功能
        console.log('6. 测试简单的聊天功能...');
        const currentModel = selector.getCurrentModel();
        if (currentModel) {
            console.log(`   使用当前模型 ${currentModel.name} 进行测试聊天...`);
            
            try {
                const response = await selector.sendMessage([
                    { role: 'user', content: '你好，请简单介绍一下你自己' }
                ]);
                
                console.log('✅ 聊天测试成功');
                console.log(`   模型响应: ${response.content.substring(0, 100)}...`);
            } catch (error) {
                console.log('❌ 聊天测试失败');
                console.log(`   错误: ${error.message}`);
            }
        } else {
            console.log('   ⚠️  没有当前模型，跳过聊天测试');
        }
        
        console.log('\n🎉 模型切换功能测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error('错误详情:', error);
    }
}

// 运行测试
testModelSwitching().catch(console.error); 