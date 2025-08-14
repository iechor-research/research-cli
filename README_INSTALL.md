# 🚀 Research CLI - 一键安装

Research CLI 现在支持全平台一键安装！无需安装 Node.js 或其他依赖，下载即用。

## ✨ 一键安装 (推荐)

### 所有平台 (Linux / macOS / Windows WSL)

```bash
curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
```

> **Windows 用户**: 推荐使用 WSL (Windows Subsystem for Linux) 或 Git Bash

## 🎯 自定义安装

### 指定安装目录

**Linux/macOS:**
```bash
# 安装到用户目录 (无需 sudo)
INSTALL_DIR=~/bin curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash

# 安装到自定义目录
INSTALL_DIR=/opt/research-cli curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
```

**Windows WSL/Git Bash:**
```bash
# 安装到用户目录
INSTALL_DIR=~/bin curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
```

### 指定版本

```bash
# 安装特定版本
VERSION=v0.3.1 curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
```

## 🌍 支持平台

| 操作系统 | 架构 | 状态 |
|---------|------|------|
| 🐧 Linux | x64 | ✅ |
| 🐧 Linux | ARM64 | ✅ |
| 🍎 macOS | x64 (Intel) | ✅ |
| 🍎 macOS | ARM64 (M1/M2) | ✅ |
| 🪟 Windows | x64 | ✅ |
| 🪟 Windows | ARM64 | ✅ |

## 📦 包特性

- **🎯 自包含**: 包含 Node.js 运行时，无需预装
- **🔐 安全**: SHA256 校验和验证
- **🚀 快速**: 一条命令完成安装
- **🛣️ 智能**: 自动添加到 PATH
- **🔄 简单更新**: 重新运行安装命令即可

## ✅ 验证安装

```bash
# 检查版本
research-cli --version

# 查看帮助
research-cli --help

# 测试功能
research-cli -p "Hello, Research CLI!"
```

## 🔄 更新

重新运行安装命令即可更新到最新版本：

```bash
curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
```

## 🗑️ 卸载

**Linux/macOS:**
```bash
# 删除二进制文件
sudo rm -f /usr/local/bin/research-cli
sudo rm -rf /usr/local/bin/research-cli-bundle

# 或从用户目录删除
rm -f ~/bin/research-cli
rm -rf ~/bin/research-cli-bundle
```

**Windows WSL:**
```bash
# 删除二进制文件 (如果安装在用户目录)
rm -f ~/bin/research-cli
rm -rf ~/bin/research-cli-bundle
```

## 🛠️ 手动安装

如果自动安装失败，可以手动下载：

1. 访问 [GitHub Releases](https://github.com/iechor-research/research-cli/releases/latest)
2. 下载对应平台的包
3. 解压到目标目录
4. 将可执行文件添加到 PATH

## ❓ 故障排除

### 常见问题

1. **权限被拒绝**
   - Linux/macOS: 使用 `INSTALL_DIR=~/bin` 安装到用户目录
   - Windows: 以管理员身份运行 PowerShell

2. **网络问题**
   - 检查防火墙设置
   - 尝试使用代理

3. **PATH 问题**
   - 重启终端
   - 手动添加到 PATH

### 获取帮助

- 📖 [完整文档](INSTALLATION.md)
- 🐛 [问题报告](https://github.com/iechor-research/research-cli/issues)
- 💬 [讨论区](https://github.com/iechor-research/research-cli/discussions)

---

**开始你的 AI 研发之旅！** 🌟
