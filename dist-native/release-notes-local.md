# Research CLI Native Wrapper v0.2.8-native

## 🎯 跨平台原生二进制文件

这个版本提供了可以独立工作的原生二进制文件，无需单独安装Research CLI。

## ✨ 主要特性

- **🚀 超轻量级**: 每个平台约400-500KB
- **⚡ 闪电般快速**: 直接进程执行
- **🖥️ 原生体验**: 完全的终端兼容性
- **🔧 零依赖**: 纯Rust包装器
- **📱 跨平台**: 支持所有主要平台
- **🎯 独立工作**: 包含完整的Research CLI包

## 📦 快速安装

### 一键安装器（所有平台）

```bash
curl -sSL https://github.com/iechor-research/research-cli/releases/download/v0.2.8-native/install-complete.sh | bash
```

### 手动安装

#### macOS Intel

```bash
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.8-native/research-cli-darwin-x64
chmod +x research-cli && ./research-cli
```

#### macOS Apple Silicon (M1/M2/M3)

```bash
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.8-native/research-cli-darwin-arm64
chmod +x research-cli && ./research-cli
```

## 📋 系统要求

- Node.js (包装器会自动检测和使用)
- 包装器包含完整的Research CLI包

## 🔧 技术细节

每个二进制文件都是一个轻量级的Rust包装器，具有以下特性：

- 包含完整的Research CLI Node.js包
- 自动查找并使用系统的Node.js安装
- 提供完全的终端兼容性（stdin/stdout/stderr）
- 工作方式与直接运行Research CLI完全相同

## 📊 可用平台

- ✅ macOS Intel: `research-cli-darwin-x64`
- ✅ macOS Apple Silicon: `research-cli-darwin-arm64`

构建时间: 2025-07-23T21:52:17.831Z
