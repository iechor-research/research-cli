# Research CLI 跨平台打包指南

Research CLI 现在支持多种分发方式，类似于 [Hyper 终端](https://github.com/vercel/hyper)，可以打包成不同平台的可执行文件和桌面应用。

## 分发方式

### 1. NPM 包 (推荐)
最简单的安装方式：
```bash
npm install -g @iechor/research-cli
research
```

### 2. 独立可执行文件
无需安装 Node.js，直接运行：
- 下载对应平台的可执行文件
- 直接运行，无需额外依赖

### 3. 桌面应用 (Electron)
带图形界面的桌面版本：
- 类似 VS Code 的终端体验
- 支持主题、快捷键等桌面功能
- 跨平台支持

## 构建命令

### 构建所有平台包
```bash
npm run package
```

### 构建独立可执行文件
```bash
# 所有平台
npm run package:standalone

# 或者使用 pkg 直接构建
npx pkg packages/cli/dist/index.js --targets node20-linux-x64,node20-macos-x64,node20-macos-arm64,node20-win-x64 --out-path dist-pkg
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

## 支持的平台

### 独立可执行文件
- **Linux**: `research-cli-linux-x64`
- **macOS**: `research-cli-macos-x64`, `research-cli-macos-arm64`
- **Windows**: `research-cli-win-x64.exe`

### 桌面应用

#### macOS
- `.dmg` - 磁盘镜像安装包
- `.zip` - 压缩包
- 支持 Intel (x64) 和 Apple Silicon (ARM64)

#### Windows
- `.exe` - NSIS 安装程序
- `-portable.exe` - 便携版
- `.zip` - 压缩包
- 支持 x64 和 x32 架构

#### Linux
- `.AppImage` - 便携应用镜像
- `.deb` - Debian/Ubuntu 包
- `.rpm` - Red Hat/SUSE 包
- `.tar.gz` - 压缩包

## 使用方式

### 独立可执行文件

1. **下载**：从 GitHub Releases 下载对应平台的文件
2. **权限**：Linux/macOS 需要添加执行权限
   ```bash
   chmod +x research-cli-linux-x64
   ```
3. **运行**：
   ```bash
   ./research-cli-linux-x64
   # 或者 Windows
   research-cli-win-x64.exe
   ```

### 桌面应用

1. **安装**：
   - macOS: 打开 `.dmg` 文件，拖拽到 Applications
   - Windows: 运行 `.exe` 安装程序
   - Linux: 运行 `.AppImage` 或安装 `.deb`/`.rpm`

2. **运行**：
   - 从应用菜单启动 "Research CLI"
   - 享受图形化的终端体验

## 桌面应用功能

### 界面特性
- **VS Code 风格**：深色主题，类似 VS Code 终端
- **响应式设计**：支持窗口缩放
- **状态栏**：显示连接状态和信息
- **快捷按钮**：清除、帮助等快捷操作

### 功能特性
- **完整 CLI 功能**：支持所有命令行功能
- **实时交互**：与 CLI 进程实时通信
- **错误处理**：彩色输出，区分不同类型的消息
- **自动聚焦**：输入框自动获得焦点

### 快捷键
- `Enter`: 执行命令
- `Cmd/Ctrl + K`: 清除输出 (通过 Clear 按钮)

## 开发和自定义

### 修改桌面应用界面
编辑 `build/renderer/index.html` 来自定义界面：
- 修改 CSS 样式
- 添加新的快捷按钮
- 调整布局和主题

### 修改 Electron 配置
编辑 `build/electron.config.js` 来调整：
- 窗口大小和行为
- 菜单和快捷键
- 与 CLI 进程的通信

### 修改构建配置
编辑 `build/electron-builder.config.js` 来调整：
- 目标平台和架构
- 图标和资源
- 安装程序选项

## 发布流程

### 1. 版本管理
```bash
npm version patch  # 或 minor, major
```

### 2. 构建所有包
```bash
npm run package
```

### 3. 发布到 NPM
```bash
npm publish --access public
```

### 4. 创建 GitHub Release
- 上传 `dist-pkg/` 中的独立可执行文件
- 上传 `dist-electron/` 中的桌面应用安装包
- 包含 `release-info.json` 中的发布信息

## 文件结构

```
research-cli/
├── dist-pkg/                    # 独立可执行文件
│   ├── research-cli-linux-x64
│   ├── research-cli-macos-x64
│   ├── research-cli-macos-arm64
│   ├── research-cli-win-x64.exe
│   └── release-info.json
├── dist-electron/               # 桌面应用
│   ├── Research CLI-0.2.6.dmg
│   ├── Research CLI Setup 0.2.6.exe
│   └── research-cli_0.2.6_amd64.deb
└── build/                       # 构建配置
    ├── electron.config.js       # Electron 主进程
    ├── electron-builder.config.js  # 构建配置
    ├── package.json             # Electron 应用配置
    └── renderer/
        └── index.html           # 桌面应用界面
```

## 故障排除

### 构建问题

1. **pkg 构建失败**：
   - 确保 Node.js 版本 >= 20
   - 检查依赖是否完整构建

2. **Electron 构建失败**：
   - 确保有足够的磁盘空间
   - 检查平台特定的构建工具

3. **权限问题**：
   - macOS: 可能需要开发者签名
   - Linux: 确保有执行权限

### 运行问题

1. **独立可执行文件无法运行**：
   - 检查文件权限
   - 确保架构匹配

2. **桌面应用无法启动**：
   - 检查系统要求
   - 查看错误日志

## 最佳实践

1. **版本一致性**：确保所有包的版本号一致
2. **测试覆盖**：在目标平台上测试构建的包
3. **资源优化**：优化包大小，排除不必要的依赖
4. **用户体验**：提供清晰的安装和使用说明

## 参考

- [pkg 文档](https://github.com/vercel/pkg)
- [Electron Builder 文档](https://www.electron.build/)
- [Hyper 终端](https://github.com/vercel/hyper) - 类似的打包方案 