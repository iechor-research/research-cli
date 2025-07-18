# Research CLI 网站部署文档

## 概述

本文档详细说明了 Research CLI 网站的部署过程，包括服务器部署和本地开发环境的配置。

## 部署架构

- **服务器**: 阿里云 ECS (IP: 8.216.80.83)
- **前端框架**: Next.js 13.5.11 (基于 research-site 项目)
- **反向代理**: Nginx (运行在 Docker 容器中)
- **SSL 证书**: Let's Encrypt (freeme.pub 域名)
- **运行端口**: 3001 (Next.js 开发服务器)

## 访问地址

- **主域名**: https://freeme.pub
- **备用域名**: https://research-cli.com (需要 DNS 解析配置)

## 服务器部署步骤

### 1. 准备工作

```bash
# 连接到服务器
ssh root@8.216.80.83

# 清理现有部署
rm -rf /var/www/research-cli
```

### 2. 克隆项目

```bash
# 进入部署目录
cd /var/www

# 克隆 research-site 仓库
git clone https://github.com/iechor-research/research-site.git research-cli

# 进入项目目录
cd research-cli
```

### 3. 安装依赖

```bash
# 检查 Node.js 版本
node --version
npm --version

# 如果没有 Node.js，安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 修复 package.json 中的包名错误
sed -i 's/hast-to-research-cliscript/hast-to-hyperscript/g' package.json

# 安装项目依赖
npm install --legacy-peer-deps
```

### 4. 配置和启动服务

```bash
# 启动 Next.js 开发服务器（端口 3001）
PORT=3001 nohup npm run dev > /var/log/research-cli.log 2>&1 &

# 等待服务器启动
sleep 10

# 检查服务器状态
netstat -tlnp | grep :3001
```

### 5. 配置 Nginx 代理

```bash
# 更新 Docker 容器中的 Nginx 配置
cat > /root/label-studio-deploy/nginx/conf.d/freeme.pub.conf << 'EOF'
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name freeme.pub www.freeme.pub research-cli.com www.research-cli.com;
    
    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name freeme.pub www.freeme.pub research-cli.com www.research-cli.com;
    
    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/freeme.pub/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/freeme.pub/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # 代理到 Next.js 应用
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # 处理 Next.js 静态文件
    location /_next/static/ {
        proxy_pass http://localhost:3001;
        proxy_cache_valid 200 1y;
        add_header Cache-Control 'public, immutable';
    }
    
    # 处理其他静态资源
    location /static/ {
        proxy_pass http://localhost:3001;
        expires 1y;
        add_header Cache-Control 'public, immutable';
    }
}
EOF

# 重新加载 Nginx 配置
docker exec labelstudio-nginx nginx -s reload
```

## 自动化部署脚本

创建自动化部署脚本 `/var/www/deploy-research-cli.sh`：

```bash
#!/bin/bash

# Research CLI 网站部署脚本
echo '🚀 开始部署 Research CLI 网站...'

# 停止现有进程
echo '⏹️  停止现有进程...'
pkill -f 'next dev'
pkill -f 'next-router-worker'

# 进入项目目录
cd /var/www/research-cli

# 拉取最新代码
echo '📥 拉取最新代码...'
git pull origin main

# 安装依赖
echo '📦 安装依赖...'
npm install --legacy-peer-deps

# 启动开发服务器
echo '🌟 启动服务器...'
PORT=3001 nohup npm run dev > /var/log/research-cli.log 2>&1 &

# 等待服务器启动
echo '⏳ 等待服务器启动...'
sleep 10

# 检查服务器状态
if netstat -tlnp | grep :3001 > /dev/null; then
    echo '✅ Next.js 服务器启动成功 (端口 3001)'
else
    echo '❌ Next.js 服务器启动失败'
    echo '📋 检查日志: tail -f /var/log/research-cli.log'
    exit 1
fi

# 重新加载 Nginx 配置
echo '🔄 重新加载 Nginx 配置...'
docker exec labelstudio-nginx nginx -s reload

echo '🎉 Research CLI 网站部署完成！'
echo '📄 网站地址: https://freeme.pub'
echo '📄 备用地址: https://research-cli.com'
echo '📋 日志文件: /var/log/research-cli.log'
echo '🔧 部署脚本: /var/www/deploy-research-cli.sh'
```

### 使用部署脚本

```bash
# 设置执行权限
chmod +x /var/www/deploy-research-cli.sh

# 运行部署脚本
/var/www/deploy-research-cli.sh
```

## 本地开发环境

### 问题说明

本地开发环境存在以下问题：
1. **React 版本冲突**: 根目录和 packages/web 存在不同版本的 React
2. **依赖缺失**: 缺少 @next/mdx 和 hast-to-hyperscript 等依赖
3. **文件缺失**: packages/web 目录已被删除

### 本地开发方案

推荐直接使用 research-site 子模块进行本地开发：

```bash
# 进入 research-site 目录
cd research-site

# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev
```

### 常见问题解决

1. **端口冲突**
   ```bash
   # Next.js 会自动尝试其他端口 (3001, 3002, 3003...)
   # 或手动指定端口
   PORT=3005 npm run dev
   ```

2. **依赖缺失**
   ```bash
   # 安装缺失的 MDX 依赖
   npm install @next/mdx --legacy-peer-deps
   
   # 修复包名错误
   sed -i 's/hast-to-research-cliscript/hast-to-hyperscript/g' package.json
   ```

3. **模块版本冲突**
   ```bash
   # 使用 legacy-peer-deps 解决版本冲突
   npm install --legacy-peer-deps
   ```

## 功能特性

### 已实现功能

1. **主页面**: 完整的 Research CLI 介绍和功能展示
2. **研究工具页面**: 6 个主要功能模块展示
3. **Web Terminal**: 真实的 CLI 交互界面，连接到 @iechor/research-cli
4. **响应式设计**: 支持桌面和移动设备
5. **安全配置**: 完整的 HTTPS 和安全头配置

### Web Terminal 功能

- 连接真实的 Research CLI 后端
- 支持所有 CLI 命令
- 命令历史记录
- 实时响应和错误处理

## 监控和维护

### 日志监控

```bash
# 查看实时日志
tail -f /var/log/research-cli.log

# 查看错误日志
grep -i error /var/log/research-cli.log

# 查看 Nginx 日志
docker exec labelstudio-nginx tail -f /var/log/nginx/access.log
docker exec labelstudio-nginx tail -f /var/log/nginx/error.log
```

### 服务状态检查

```bash
# 检查 Next.js 进程
ps aux | grep next | grep -v grep

# 检查端口占用
netstat -tlnp | grep :3001

# 检查网站可访问性
curl -I https://freeme.pub
```

### 重启服务

```bash
# 重启 Next.js 服务
pkill -f 'next dev'
cd /var/www/research-cli
PORT=3001 nohup npm run dev > /var/log/research-cli.log 2>&1 &

# 重启 Nginx
docker exec labelstudio-nginx nginx -s reload
```

## 故障排除

### 常见问题

1. **网站无法访问**
   - 检查 Next.js 服务是否运行
   - 检查 Nginx 配置是否正确
   - 检查防火墙设置

2. **SSL 证书问题**
   - 检查证书是否过期
   - 验证证书路径是否正确

3. **性能问题**
   - 检查服务器资源使用情况
   - 查看日志中的错误信息

### 联系信息

如有问题，请查看：
- 项目仓库: https://github.com/iechor-research/research-site
- 主项目: https://github.com/iechor-research/research-cli
- 服务器日志: `/var/log/research-cli.log` 