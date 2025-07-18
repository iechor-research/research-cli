#!/bin/bash

# Research CLI 快速部署脚本
# 用法: ./quick-deploy.sh

set -e

echo "🚀 Research CLI 快速部署脚本"
echo "================================"

# 检查是否为服务器环境
if [[ "$HOSTNAME" == *"research-cli"* ]] || [[ "$USER" == "root" ]]; then
    echo "📍 检测到服务器环境，开始服务器部署..."
    
    # 服务器部署
    echo "⏹️  停止现有服务..."
    pkill -f 'next dev' || true
    pkill -f 'next-router-worker' || true
    
    echo "📥 更新代码..."
    cd /var/www/research-cli
    git pull origin main
    
    echo "📦 安装依赖..."
    npm install --legacy-peer-deps
    
    echo "🌟 启动服务器..."
    PORT=3001 nohup npm run dev > /var/log/research-cli.log 2>&1 &
    
    echo "⏳ 等待服务器启动..."
    sleep 10
    
    if netstat -tlnp | grep :3001 > /dev/null; then
        echo "✅ Next.js 服务器启动成功 (端口 3001)"
    else
        echo "❌ Next.js 服务器启动失败"
        echo "📋 检查日志: tail -f /var/log/research-cli.log"
        exit 1
    fi
    
    echo "🔄 重新加载 Nginx..."
    docker exec labelstudio-nginx nginx -s reload
    
    echo "🎉 服务器部署完成！"
    echo "📄 访问地址: https://freeme.pub"
    
else
    echo "📍 检测到本地环境，开始本地开发..."
    
    # 本地开发
    if [ -d "research-site" ]; then
        echo "📂 进入 research-site 目录..."
        cd research-site
        
        echo "📦 安装依赖..."
        npm install --legacy-peer-deps
        
        echo "🌟 启动开发服务器..."
        npm run dev
    else
        echo "❌ 未找到 research-site 目录"
        echo "请确保在 research-cli 项目根目录运行此脚本"
        exit 1
    fi
fi 