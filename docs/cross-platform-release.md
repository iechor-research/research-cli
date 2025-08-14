# 跨平台发布指南

Research CLI 现在支持全平台（Linux、Windows、macOS M1/Intel）的自动打包和发布。

## 🎯 支持的平台

| 平台 | 架构 | 包名 | 格式 |
|------|------|------|------|
| Linux | x64 | `research-cli-linux-x64` | `.tar.gz` |
| Linux | ARM64 | `research-cli-linux-arm64` | `.tar.gz` |
| macOS | x64 (Intel) | `research-cli-darwin-x64` | `.tar.gz` |
| macOS | ARM64 (M1/M2) | `research-cli-darwin-arm64` | `.tar.gz` |
| Windows | x64 | `research-cli-win32-x64` | `.zip` |
| Windows | ARM64 | `research-cli-win32-arm64` | `.zip` |

## 🚀 发布流程

### 1. 自动发布（推荐）

使用内置的发布脚本，自动处理版本更新、构建、标签和发布：

```bash
# Patch 版本更新 (0.3.1 -> 0.3.2)
npm run release:patch

# Minor 版本更新 (0.3.1 -> 0.4.0)
npm run release:minor

# Major 版本更新 (0.3.1 -> 1.0.0)
npm run release:major

# 指定具体版本
npm run release 1.2.3
```

### 2. 手动发布流程

如果需要更细粒度的控制：

```bash
# 1. 更新版本
npm version patch  # 或 minor, major

# 2. 构建项目
npm run build

# 3. 测试跨平台构建
npm run test:cross-platform

# 4. 本地构建所有平台包
npm run build:cross-platform

# 5. 提交和推送
git add .
git commit -m "chore: release v0.3.2"
git tag v0.3.2
git push origin main --tags
```

## 🤖 GitHub Actions 自动构建

当你推送标签到 GitHub 时，会自动触发跨平台构建：

### 触发条件
- 推送标签（如 `v1.0.0`）
- 手动触发工作流

### 构建矩阵
- **Linux**: Ubuntu Latest (x64, ARM64)
- **macOS**: macOS 13 (Intel) + macOS Latest (M1)
- **Windows**: Windows Latest (x64, ARM64)

### 产物
- 每个平台的独立包
- SHA256 校验和文件
- 自动创建 GitHub Release

## 📦 包结构

每个平台包都包含：

```
research-cli-{platform}-{arch}/
├── research-cli(.bat)    # 主执行脚本
├── node(.exe)           # Node.js 运行时
├── package.json         # 包元数据
├── dist/               # 构建的应用
│   └── index.js        # 主应用入口
├── bin/                # CLI 二进制文件
└── node_modules/       # 生产依赖
```

## 🧪 测试

### 本地测试
```bash
# 测试跨平台构建逻辑
npm run test:cross-platform

# 测试当前平台的完整构建
npm run build:standalone-simple
```

### 验证发布包
```bash
# 下载并测试包
curl -L https://github.com/iechor-research/research-cli/releases/download/v0.3.1/research-cli-darwin-arm64.tar.gz -o research-cli.tar.gz

# 提取和测试
tar -xzf research-cli.tar.gz
./research-cli-darwin-arm64/research-cli --version
```

## 📋 发布清单

在发布前确保：

- [ ] 所有测试通过
- [ ] 版本号已更新
- [ ] CHANGELOG.md 已更新
- [ ] 文档已更新
- [ ] 本地测试构建成功
- [ ] Git 工作目录干净

## 🔧 故障排除

### 常见问题

1. **Node.js 二进制下载失败**
   - 检查网络连接
   - 验证 Node.js 版本 URL 是否有效
   - 手动下载并放置在正确位置

2. **依赖安装失败**
   - 确保 package.json 中的依赖版本正确
   - 检查平台特定的依赖问题

3. **GitHub Actions 构建失败**
   - 检查 GitHub Actions 日志
   - 验证 secrets 和权限设置
   - 确保仓库设置正确

### 调试命令

```bash
# 检查构建环境
node --version
npm --version
git status

# 详细构建日志
DEBUG=1 npm run build:cross-platform

# 验证包内容
tar -tzf research-cli-*.tar.gz
```

## 🔗 相关文件

- `scripts/build-cross-platform-packages.js` - 跨平台构建脚本
- `scripts/release.js` - 自动发布脚本
- `scripts/test-cross-platform-build.js` - 测试脚本
- `.github/workflows/build-cross-platform.yml` - GitHub Actions 工作流
- `docs/packaging.md` - 打包详细文档

## 📈 版本策略

遵循 [Semantic Versioning](https://semver.org/):

- **PATCH** (0.3.1 → 0.3.2): 错误修复
- **MINOR** (0.3.1 → 0.4.0): 新功能，向后兼容
- **MAJOR** (0.3.1 → 1.0.0): 破坏性变更

## 🎉 发布后

发布完成后：

1. 📢 在社区宣布新版本
2. 📝 更新相关文档
3. 🧪 收集用户反馈
4. 🐛 监控问题报告
5. 📊 分析下载统计

## 💡 最佳实践

1. **定期发布**: 保持小而频繁的发布
2. **测试覆盖**: 在多个平台上测试
3. **文档同步**: 保持文档与代码同步
4. **用户沟通**: 及时沟通重大变更
5. **回滚计划**: 准备好回滚策略

通过这套完整的跨平台发布流程，Research CLI 可以轻松地为所有主要平台提供一致、可靠的分发包。
