# Research CLI 网站部署说明

## 快速开始

### 🚀 一键部署/开发

```bash
# 克隆项目
git clone https://github.com/iechor-research/research-cli.git
cd research-cli

# 运行快速部署脚本
./quick-deploy.sh
```

脚本会自动检测环境：
- **服务器环境**: 自动部署到生产环境
- **本地环境**: 启动开发服务器

### 📋 手动部署

如果需要手动控制部署过程，请参考 [完整部署文档](./DEPLOYMENT.md)

## 🌐 访问地址

- **生产环境**: https://freeme.pub
- **本地开发**: http://localhost:3001 (或其他可用端口)

## 📁 项目结构

```
research-cli/
├── research-site/          # 网站源码 (submodule)
├── DEPLOYMENT.md          # 完整部署文档
├── quick-deploy.sh        # 快速部署脚本
└── README-DEPLOYMENT.md   # 本文件
```

## 🔧 常用命令

### 本地开发

```bash
# 进入网站目录
cd research-site

# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev
```

### 服务器管理

```bash
# 查看服务状态
netstat -tlnp | grep :3001

# 查看日志
tail -f /var/log/research-cli.log

# 重启服务
pkill -f 'next dev'
cd /var/www/research-cli
PORT=3001 nohup npm run dev > /var/log/research-cli.log 2>&1 &
```

## 🆘 故障排除

### 常见问题

1. **端口冲突**
   - Next.js 会自动尝试其他端口
   - 手动指定端口: `PORT=3005 npm run dev`

2. **依赖问题**
   - 使用 `--legacy-peer-deps` 解决版本冲突
   - 删除 `node_modules` 重新安装

3. **权限问题**
   - 确保脚本有执行权限: `chmod +x quick-deploy.sh`

### 获取帮助

- 查看完整文档: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 项目仓库: https://github.com/iechor-research/research-cli
- 网站仓库: https://github.com/iechor-research/research-site 