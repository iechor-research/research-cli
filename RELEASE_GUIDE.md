# 🚀 Research CLI 发布指南

这个指南展示了如何使用新的跨平台发布系统和一键安装功能。

## 📋 发布检查清单

在发布新版本之前，确保完成以下步骤：

- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] CHANGELOG.md 已更新
- [ ] 版本号已确定
- [ ] GitHub CLI 已安装并认证

## 🎯 发布流程

### 1. 自动发布（推荐）

使用内置的发布脚本，一键完成所有步骤：

```bash
# 发布 patch 版本 (0.3.1 -> 0.3.2)
npm run release:patch

# 发布 minor 版本 (0.3.1 -> 0.4.0)  
npm run release:minor

# 发布 major 版本 (0.3.1 -> 1.0.0)
npm run release:major
```

这会自动：
1. ✅ 检查工作目录状态
2. 📝 更新版本号
3. 🔨 构建项目  
4. 💾 提交更改
5. 🏷️ 创建 Git 标签
6. 📤 推送到远程
7. 🤖 触发 GitHub Actions

### 2. 手动 GitHub Release

如果需要手动创建 GitHub Release：

```bash
# 创建发布版本
npm run gh:release v1.0.0

# 创建草稿版本
npm run gh:release-draft v1.0.0-beta

# 创建预发布版本
node scripts/create-github-release.js v1.0.0-rc1 --prerelease
```

### 3. 构建跨平台包

```bash
# 构建当前平台
npm run build:standalone-simple

# 构建所有平台（本地）
npm run build:cross-platform

# 测试构建流程
npm run test:cross-platform
```

## 🌍 GitHub Actions 自动化

推送标签后，GitHub Actions 会自动：

1. **矩阵构建**: 在 6 个平台上并行构建
   - Linux (x64, ARM64)
   - macOS (Intel, M1/M2) 
   - Windows (x64, ARM64)

2. **打包**: 创建独立可执行包
   - 包含 Node.js 运行时
   - 包含所有依赖
   - 平台特定的启动脚本

3. **发布**: 自动创建 GitHub Release
   - 上传所有平台包
   - 生成 SHA256 校验和
   - 包含安装脚本

## 📦 用户安装体验

发布完成后，用户可以通过以下方式安装：

### Linux/macOS 一键安装

```bash
curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
```

**特性：**
- 🎯 自动检测平台和架构
- 📥 从 GitHub Releases 下载最新版本
- 🔐 验证下载完整性
- 📂 智能选择安装目录
- 🛣️ 自动添加到 PATH
- ✅ 验证安装成功

### Windows PowerShell 安装

```powershell
iwr -useb https://raw.githubusercontent.com/iechor-research/research-cli/main/install.ps1 | iex
```

**特性：**
- 🎯 自动检测 Windows 架构
- 📥 下载并解压 ZIP 包
- 📂 安装到用户程序目录
- 🛣️ 添加到用户 PATH
- ✅ 创建启动脚本

### 手动安装

用户也可以从 GitHub Releases 手动下载：

```bash
# 下载
curl -L https://github.com/iechor-research/research-cli/releases/latest/download/research-cli-linux-x64.tar.gz -o research-cli.tar.gz

# 解压
tar -xzf research-cli.tar.gz

# 安装
sudo cp research-cli-linux-x64/research-cli /usr/local/bin/
```

## 🔍 监控和维护

### 发布后检查

1. **验证 GitHub Actions**: 检查所有平台构建是否成功
2. **测试安装脚本**: 在不同平台上测试安装
3. **验证包完整性**: 检查 SHA256 校验和
4. **用户反馈**: 监控 Issues 和 Discussions

### 常见问题处理

1. **构建失败**: 检查 GitHub Actions 日志
2. **安装失败**: 更新安装脚本处理边缘情况
3. **平台兼容性**: 添加新平台支持
4. **依赖问题**: 更新打包脚本

## 📊 发布统计

每次发布后，可以通过以下方式监控：

- **GitHub Release**: 下载统计
- **GitHub Actions**: 构建时间和成功率  
- **Issues/Discussions**: 用户反馈
- **Package Size**: 各平台包大小变化

## 🛠️ 开发者工具

### 有用的命令

```bash
# 检查所有脚本语法
node -c scripts/*.js && echo "All scripts valid"

# 测试跨平台构建
npm run test:cross-platform

# 本地创建发布包
npm run build:standalone-simple

# 检查 GitHub CLI 认证
gh auth status
```

### 调试技巧

```bash
# 详细构建日志
DEBUG=1 npm run build:cross-platform

# 检查包内容
tar -tzf research-cli-*.tar.gz

# 验证安装脚本
bash -n install.sh
```

## 📖 相关文档

- [跨平台发布指南](docs/cross-platform-release.md)
- [安装指南](INSTALLATION.md)  
- [打包技术文档](docs/packaging.md)
- [GitHub Actions 工作流](.github/workflows/build-cross-platform.yml)

## 🎉 发布示例

完整的发布流程示例：

```bash
# 1. 确保工作目录干净
git status

# 2. 运行测试
npm test

# 3. 发布新版本（自动处理所有步骤）
npm run release:patch

# 4. 等待 GitHub Actions 完成构建

# 5. 测试安装脚本
curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash

# 6. 验证安装
research-cli --version
```

---

**现在你可以轻松发布 Research CLI 的跨平台版本了！** 🌍✨

这套完整的发布系统让 Research CLI 能够为全球用户提供一致、可靠的安装体验。
