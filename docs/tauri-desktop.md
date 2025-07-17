# Research CLI Tauri 桌面应用

## 概述

Research CLI 现在支持使用 Tauri 构建跨平台桌面应用。Tauri 是一个用 Rust 构建的现代应用框架，相比传统的 Electron 方案具有显著优势。

## Tauri vs Electron 对比

### 文件体积
- **Tauri**: 10-20MB（使用系统 WebView）
- **Electron**: 60-75MB（包含完整 Chromium）

### 性能
- **Tauri**: 更低内存占用，更快启动速度
- **Electron**: 较高资源占用

### 安全性
- **Tauri**: 基于 Rust，内存安全，细粒度权限控制
- **Electron**: Node.js 运行时，潜在安全风险

### 系统集成
- **Tauri**: 原生系统集成，更好的用户体验
- **Electron**: 通过额外插件实现系统集成

## 功能特性

### 🖥️ 现代化界面
- VS Code 风格的终端界面
- 毛玻璃效果和现代设计
- 响应式布局，支持各种屏幕尺寸

### ⚡ 高性能
- 使用系统原生 WebView
- Rust 后端处理，性能优异
- 低内存占用

### 🔧 完整功能
- 完整的 Research CLI 功能支持
- 命令历史记录
- 快速操作按钮
- 键盘快捷键支持

### 🔐 安全性
- 沙盒化执行环境
- 细粒度权限控制
- 安全的进程间通信

## 开发和构建

### 安装依赖

```bash
# 安装 Tauri CLI（如果还没有安装）
npm install --save-dev @tauri-apps/cli @tauri-apps/api

# 安装 Rust（如果还没有安装）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 开发模式

```bash
# 启动开发服务器
npm run tauri:dev
```

这将：
1. 构建 Research CLI
2. 启动 Tauri 开发服务器
3. 打开桌面应用窗口
4. 支持热重载

### 构建生产版本

```bash
# 构建所有平台
npm run tauri:build

# 构建调试版本（更快）
npm run tauri:build:debug
```

构建产物位置：
- **macOS**: `src-tauri/target/release/bundle/macos/`
- **Windows**: `src-tauri/target/release/bundle/msi/`
- **Linux**: `src-tauri/target/release/bundle/deb/` 或 `appimage/`

## 应用界面

### 主界面组件

1. **标题栏**: 显示应用名称和版本信息
2. **终端区域**: 
   - VS Code 风格的终端界面
   - 支持命令输入和输出显示
   - 语法高亮和错误提示
3. **侧边栏**:
   - 快速操作按钮
   - 最近使用的命令
4. **状态栏**: 显示应用状态

### 键盘快捷键

- `Enter`: 执行命令
- `↑/↓`: 浏览命令历史
- `Ctrl/Cmd + K`: 聚焦到输入框
- `Ctrl/Cmd + L`: 清空终端输出

## 系统要求

### Windows
- Windows 10 或更高版本
- WebView2 运行时

### macOS
- macOS 10.13 或更高版本
- 支持 Intel 和 Apple Silicon

### Linux
- 现代 Linux 发行版
- WebKitGTK 4.0

## 分发方式

### macOS
- `.app` 应用包
- `.dmg` 安装镜像
- Apple 代码签名支持

### Windows
- `.msi` 安装包
- `.exe` 便携版本
- 代码签名支持

### Linux
- `.deb` 包（Debian/Ubuntu）
- `.rpm` 包（RedHat/Fedora）
- `.AppImage` 便携版本

## 配置选项

### 窗口设置
```json
{
  "width": 1200,
  "height": 800,
  "minWidth": 800,
  "minHeight": 600,
  "resizable": true,
  "center": true
}
```

### 权限配置
- 文件系统访问
- Shell 命令执行
- 网络访问
- 剪贴板操作
- 系统通知

## 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 确保 Rust 已安装
   rustc --version
   
   # 更新 Rust
   rustup update
   ```

2. **WebView 问题**
   - Windows: 安装 WebView2 运行时
   - Linux: 安装 webkit2gtk

3. **权限问题**
   - 检查 `tauri.conf.json` 中的权限配置
   - 确保必要的系统权限已授予

### 调试模式

开发模式下会自动打开开发者工具，可以：
- 检查控制台输出
- 调试 JavaScript 代码
- 监控网络请求
- 分析性能

## 与 CLI 版本的区别

| 特性 | CLI 版本 | Tauri 桌面版 |
|------|----------|-------------|
| 界面 | 终端 TUI | 图形界面 |
| 安装 | npm 全局安装 | 原生安装包 |
| 体积 | 较小 | 中等（10-20MB） |
| 系统集成 | 有限 | 完整 |
| 用户体验 | 开发者友好 | 普通用户友好 |

## 未来规划

- [ ] 主题系统
- [ ] 插件支持
- [ ] 多标签页
- [ ] 工作区管理
- [ ] 云同步配置
- [ ] 自动更新 