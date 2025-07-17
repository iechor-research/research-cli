#!/usr/bin/env node

import { spawn } from 'child_process';
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

// 运行CLI命令
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Running: research ${command}`);
    
    const child = spawn('node', ['packages/cli/dist/index.js', command], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    // 发送退出命令
    setTimeout(() => {
      child.stdin.write('/exit\n');
      child.stdin.end();
    }, 1000);
  });
}

// 检查配置文件
function checkConfigFile() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      console.log('📋 Current API config:', JSON.stringify(config, null, 2));
      return config;
    } else {
      console.log('📋 No API config file found');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to read config file:', error.message);
    return null;
  }
}

async function testAPIConfig() {
  console.log('🧪 Testing API Configuration System\n');

  // 清理
  cleanup();

  try {
    // 1. 测试帮助命令
    console.log('\n1️⃣ Testing help command');
    const helpResult = await runCommand('/api help');
    console.log('✅ Help command output:', helpResult.stdout.slice(0, 200) + '...');

    // 2. 测试providers命令
    console.log('\n2️⃣ Testing providers command');
    const providersResult = await runCommand('/api providers');
    console.log('✅ Providers command output:', providersResult.stdout.slice(0, 300) + '...');

    // 3. 测试设置SerpAPI key
    console.log('\n3️⃣ Testing set serpapi key');
    const setResult = await runCommand('/api set serpapi test-serpapi-key-12345');
    console.log('✅ Set command output:', setResult.stdout);

    // 4. 检查配置文件是否创建
    console.log('\n4️⃣ Checking config file creation');
    const config1 = checkConfigFile();
    if (config1?.apis?.serpapi?.apiKey === 'test-serpapi-key-12345') {
      console.log('✅ SerpAPI key saved correctly');
    } else {
      console.log('❌ SerpAPI key not saved correctly');
    }

    // 5. 测试设置Google API key
    console.log('\n5️⃣ Testing set google key');
    await runCommand('/api set google test-google-key-67890');
    
    // 6. 测试设置Google Project
    console.log('\n6️⃣ Testing set google project');
    await runCommand('/api set google_project my-test-project-123');

    // 7. 检查所有配置
    console.log('\n7️⃣ Checking all configurations');
    const config2 = checkConfigFile();
    
    // 8. 测试获取命令（带掩码）
    console.log('\n8️⃣ Testing get command with masking');
    const getResult = await runCommand('/api get serpapi');
    console.log('✅ Get command output (should be masked):', getResult.stdout);

    // 9. 测试列表命令
    console.log('\n9️⃣ Testing list command');
    const listResult = await runCommand('/api list');
    console.log('✅ List command output:', listResult.stdout);

    // 10. 测试移除命令
    console.log('\n🔟 Testing remove command');
    const removeResult = await runCommand('/api remove serpapi');
    console.log('✅ Remove command output:', removeResult.stdout);

    // 11. 最终检查
    console.log('\n1️⃣1️⃣ Final config check');
    const finalConfig = checkConfigFile();

    console.log('\n🎉 API Configuration Test Complete!');
    
    if (finalConfig?.apis?.google?.apiKey && finalConfig?.apis?.google_project?.value) {
      console.log('✅ API configuration system is working correctly');
    } else {
      console.log('⚠️ Some configurations may not have been saved correctly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // 清理测试配置
    cleanup();
    console.log('\n🧹 Test cleanup completed');
  }
}

// 运行测试
testAPIConfig().catch(console.error); 