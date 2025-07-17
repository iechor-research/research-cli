# GitHub Actions 跨平台构建指南

本文档说明如何使用GitHub Actions来自动构建Research CLI Native Wrapper的所有平台版本。

## 🎯 概述

GitHub Actions工作流会自动构建以下平台的原生包装器：

- **macOS Intel** (x86_64-apple-darwin)
- **macOS Apple Silicon** (aarch64-apple-darwin)  
- **Windows x64** (x86_64-pc-windows-msvc)
- **Linux x64** (x86_64-unknown-linux-gnu)
- **Linux ARM64** (aarch64-unknown-linux-gnu)

## 🚀 触发构建

### 方法1：使用脚本（推荐）

```bash
# 自动创建标签并触发GitHub Actions
npm run github:build
```

这个脚本会：
1. 创建 `v{version}-native` 标签
2. 推送到GitHub
3. 自动触发GitHub Actions工作流

### 方法2：手动创建标签

```bash
# 获取当前版本
VERSION=$(node -p "require('./package.json').version")

# 创建并推送标签
git tag "v${VERSION}-native"
git push origin "v${VERSION}-native"
```

### 方法3：手动触发（在GitHub网页）

1. 访问：https://github.com/iechor-research/research-cli/actions/workflows/build-native-wrapper.yml
2. 点击"Run workflow"
3. 输入版本号（如：0.2.6）
4. 点击"Run workflow"

## 📋 构建流程

### 1. 并行构建阶段

GitHub Actions会在不同的运行器上并行构建：

```yaml
Strategy Matrix:
├── macOS-latest (Intel + Apple Silicon)
├── windows-latest (x64)
└── ubuntu-latest (x64 + ARM64)
```

每个构建包含：
- 安装Node.js和Rust工具链
- 构建Research CLI包
- 交叉编译原生包装器
- 生成构建信息

### 2. 发布阶段

构建完成后，自动：
- 收集所有平台的二进制文件
- 生成安装脚本
- 创建发布说明
- 发布到GitHub Releases

## 📦 构建产物

每次构建会生成：

| 文件 | 描述 | 大小 |
|------|------|------|
| `research-cli-darwin-x64` | macOS Intel版本 | ~420KB |
| `research-cli-darwin-arm64` | macOS Apple Silicon版本 | ~431KB |
| `research-cli-win32-x64.exe` | Windows x64版本 | ~400KB |
| `research-cli-linux-x64` | Linux x64版本 | ~420KB |
| `research-cli-linux-arm64` | Linux ARM64版本 | ~410KB |
| `install.sh` | 自动检测平台的安装脚本 | ~2KB |

## 🔧 配置文件

### GitHub Actions工作流
- 文件：`.github/workflows/build-native-wrapper.yml`
- 触发：推送 `v*-native` 标签
- 权限：需要 `GITHUB_TOKEN`（自动提供）

### Cargo配置
- 文件：`src-tauri/.cargo/config.toml`
- 用途：交叉编译配置
- 自动配置：Linux ARM64链接器

## 📥 用户安装

构建完成后，用户可以通过以下方式安装：

### 一键安装（推荐）
```bash
curl -sSL https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/install.sh | bash
```

### 手动下载
```bash
# macOS Apple Silicon
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-darwin-arm64
chmod +x research-cli

# Windows (PowerShell)
Invoke-WebRequest -Uri "https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-win32-x64.exe" -OutFile "research-cli.exe"

# Linux x64
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-linux-x64
chmod +x research-cli
```

## 🐛 故障排除

### 构建失败
1. 检查GitHub Actions日志
2. 确认Rust代码编译正确
3. 验证依赖项版本

### 发布失败
1. 确认有 `GITHUB_TOKEN` 权限
2. 检查标签格式 (`v*-native`)
3. 验证仓库设置

### 交叉编译问题
1. Linux ARM64：需要 `gcc-aarch64-linux-gnu`
2. Windows：使用MSVC工具链
3. macOS：需要对应的target

## 📊 监控构建

### 查看进度
- Actions页面：https://github.com/iechor-research/research-cli/actions
- 构建时间：通常5-10分钟
- 并行执行：5个平台同时构建

### 构建状态
- ✅ 成功：绿色勾号
- ❌ 失败：红色叉号
- 🟡 进行中：黄色圆点

## 🎉 优势

相比本地构建，GitHub Actions提供：

1. **真正的跨平台**：在原生环境中构建每个平台
2. **并行执行**：同时构建所有平台，节省时间
3. **自动发布**：构建完成后自动创建Release
4. **一致性**：每次构建使用相同的环境
5. **无需本地工具**：不需要安装交叉编译工具链

## 🔄 版本管理

- 标签格式：`v{version}-native`
- 自动版本：从 `package.json` 读取
- 发布名称：`Research CLI Native Wrapper v{version}`
- 覆盖发布：推送相同标签会覆盖之前的发布

---

💡 **提示**：首次使用时，确保仓库有Actions权限，并且 `GITHUB_TOKEN` 有创建Release的权限。 