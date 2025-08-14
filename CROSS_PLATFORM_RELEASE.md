# 🌍 跨平台发布系统

Research CLI 现在支持全平台自动打包和发布！

## ✨ 特性

- 🔄 **自动构建**: 支持 6 个平台组合
- 📦 **独立包**: 包含 Node.js 运行时，无需安装依赖
- 🤖 **GitHub Actions**: 自动 CI/CD 流水线
- 🔐 **安全**: SHA256 校验和验证
- 📖 **文档**: 完整的使用和开发文档

## 🎯 支持平台

| 操作系统 | 架构 | 状态 |
|---------|------|------|
| 🐧 Linux | x64 | ✅ |
| 🐧 Linux | ARM64 | ✅ |
| 🍎 macOS | x64 (Intel) | ✅ |
| 🍎 macOS | ARM64 (M1/M2) | ✅ |
| 🪟 Windows | x64 | ✅ |
| 🪟 Windows | ARM64 | ✅ |

## 🚀 快速开始

### 开发者发布

```bash
# 快速发布 patch 版本
npm run release:patch

# 或者发布 minor/major 版本
npm run release:minor
npm run release:major

# 指定版本
npm run release 1.0.0
```

### 用户安装

```bash
# Linux/macOS
curl -L https://github.com/iechor-research/research-cli/releases/latest/download/research-cli-linux-x64.tar.gz | tar -xz
sudo cp research-cli-linux-x64/research-cli /usr/local/bin/

# 验证安装
research-cli --version
```

## 📁 项目结构

```
scripts/
├── build-cross-platform-packages.js    # 跨平台构建主脚本
├── release.js                          # 自动发布脚本
├── test-cross-platform-build.js        # 测试脚本
└── build-simple-standalone-package.js  # 单平台构建

.github/workflows/
└── build-cross-platform.yml            # GitHub Actions 工作流

docs/
├── cross-platform-release.md           # 详细发布指南
└── packaging.md                         # 打包技术文档
```

## 🛠️ 开发命令

```bash
# 构建当前平台
npm run build:standalone-simple

# 构建所有平台（本地）
npm run build:cross-platform

# 测试构建流程
npm run test:cross-platform

# 发布版本
npm run release:patch
```

## 📊 构建产物

每次发布会自动生成：

- `research-cli-linux-x64.tar.gz` (~45MB)
- `research-cli-linux-arm64.tar.gz` (~45MB)  
- `research-cli-darwin-x64.tar.gz` (~45MB)
- `research-cli-darwin-arm64.tar.gz` (~45MB)
- `research-cli-win32-x64.zip` (~45MB)
- `research-cli-win32-arm64.zip` (~45MB)
- `checksums.txt` (SHA256 校验和)

## 🔄 CI/CD 流程

1. **触发**: 推送标签或手动触发
2. **矩阵构建**: 6个平台并行构建
3. **打包**: 创建独立可执行包
4. **发布**: 自动创建 GitHub Release
5. **验证**: 校验和文件生成

## 📖 详细文档

- [跨平台发布指南](docs/cross-platform-release.md) - 完整的发布流程
- [打包技术文档](docs/packaging.md) - 打包实现细节
- [GitHub Actions 工作流](.github/workflows/build-cross-platform.yml) - CI/CD 配置

## 🎉 使用示例

发布新版本只需要一个命令：

```bash
npm run release:patch
```

这会自动：
1. ✅ 检查工作目录状态
2. 📝 更新版本号
3. 🔨 构建项目
4. 🧪 运行测试
5. 💾 提交更改
6. 🏷️ 创建标签
7. 📤 推送到远程
8. 🤖 触发 GitHub Actions
9. 📦 生成所有平台包
10. 🎯 创建 GitHub Release

## 🔍 监控和调试

- **GitHub Actions**: 查看构建日志和状态
- **Release 页面**: 下载和验证包
- **Issues**: 报告平台特定问题

---

**现在 Research CLI 已经准备好为全球用户提供跨平台支持！** 🌍✨
