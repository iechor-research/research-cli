# Research CLI 跨平台打包演示

## 📦 现已支持多种分发方式

Research CLI 现在支持像 [Hyper 终端](https://github.com/vercel/hyper) 一样的多种分发方式！

### 🎯 三种安装方式

#### 1. NPM 包 (最简单)
```bash
npm install -g @iechor/research-cli
research
```

#### 2. 独立可执行文件 (无需 Node.js)
- 下载对应平台的可执行文件
- 直接运行，无需安装任何依赖
- 支持: Linux x64, macOS (Intel/ARM), Windows x64

#### 3. 桌面应用 (图形界面)
- 类似 VS Code 的终端体验
- 支持主题、快捷键等桌面功能
- 跨平台支持: macOS (.dmg), Windows (.exe), Linux (.AppImage/.deb/.rpm)

## 🛠️ 构建命令

### 构建所有平台包
```bash
npm run package
```

### 构建独立可执行文件
```bash
npm run package:standalone
```

### 构建桌面应用
```bash
# 当前平台
npm run package:electron

# 特定平台
npm run package:electron:mac     # macOS
npm run package:electron:win     # Windows  
npm run package:electron:linux   # Linux
```

## 📁 输出文件结构

```
research-cli/
├── dist-pkg/                    # 独立可执行文件
│   ├── research-cli-linux-x64
│   ├── research-cli-macos-x64
│   ├── research-cli-macos-arm64
│   ├── research-cli-win-x64.exe
│   └── release-info.json
└── dist-electron/               # 桌面应用
    ├── Research CLI-0.2.6.dmg      # macOS
    ├── Research CLI Setup 0.2.6.exe # Windows
    └── research-cli_0.2.6_amd64.deb # Linux
```

## 🖥️ 桌面应用特性

- **VS Code 风格界面**：深色主题，专业外观
- **实时交互**：与 CLI 进程实时通信
- **彩色输出**：支持不同类型消息的颜色区分
- **快捷操作**：清除、帮助等快捷按钮
- **自动聚焦**：输入框自动获得焦点

## 🚀 技术实现

### 独立可执行文件
- 使用 **pkg** 打包 Node.js 应用
- 支持 Node.js 18 运行时
- GZip 压缩减小文件大小
- 包含所有依赖，无需外部安装

### 桌面应用
- 使用 **Electron** 构建跨平台应用
- 自定义终端界面
- IPC 通信处理用户输入
- 支持各平台原生安装包格式

## 📊 对比其他工具

| 特性 | Research CLI | Hyper | VS Code Terminal |
|------|-------------|-------|------------------|
| NPM 安装 | ✅ | ✅ | ❌ |
| 独立可执行文件 | ✅ | ❌ | ❌ |
| 桌面应用 | ✅ | ✅ | ✅ |
| 跨平台支持 | ✅ | ✅ | ✅ |
| AI 集成 | ✅ | ❌ | 部分 |
| 研究工具 | ✅ | ❌ | ❌ |

## 🎨 用户体验

### 独立可执行文件
```bash
# Linux/macOS
chmod +x research-cli-linux-x64
./research-cli-linux-x64

# Windows
research-cli-win-x64.exe
```

### 桌面应用
1. 安装对应平台的包
2. 从应用菜单启动 "Research CLI"
3. 享受图形化的终端体验

## 📚 完整文档

详细的打包指南请参考：[docs/packaging.md](docs/packaging.md)

## 🔄 发布流程

1. **版本管理**: `npm version patch`
2. **构建所有包**: `npm run package`
3. **发布到 NPM**: `npm publish --access public`
4. **创建 GitHub Release**: 上传构建的文件

---

**现在用户可以选择最适合自己的安装方式！** 🎉 