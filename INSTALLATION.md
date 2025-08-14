# 🚀 Research CLI 安装指南

Research CLI 提供多种安装方式，支持所有主流平台。

## 🎯 一键安装 (推荐)

### Linux / macOS

使用我们的自动安装脚本：

```bash
curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
```

**自定义安装目录：**
```bash
# 安装到用户目录 (无需 sudo)
INSTALL_DIR=~/bin curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash

# 安装到自定义目录
INSTALL_DIR=/opt/research-cli curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
```

### Windows

使用 PowerShell 安装：

```powershell
iwr -useb https://raw.githubusercontent.com/iechor-research/research-cli/main/install.ps1 | iex
```

**自定义安装目录：**
```powershell
# 安装到自定义目录
$InstallDir = "C:\Tools\research-cli"; iwr -useb https://raw.githubusercontent.com/iechor-research/research-cli/main/install.ps1 | iex
```

## 📦 手动安装

### 1. 下载预编译包

从 [GitHub Releases](https://github.com/iechor-research/research-cli/releases/latest) 下载对应平台的包：

| 平台 | 架构 | 下载链接 |
|------|------|----------|
| 🐧 Linux | x64 | [research-cli-linux-x64.tar.gz](https://github.com/iechor-research/research-cli/releases/latest/download/research-cli-linux-x64.tar.gz) |
| 🐧 Linux | ARM64 | [research-cli-linux-arm64.tar.gz](https://github.com/iechor-research/research-cli/releases/latest/download/research-cli-linux-arm64.tar.gz) |
| 🍎 macOS | Intel | [research-cli-darwin-x64.tar.gz](https://github.com/iechor-research/research-cli/releases/latest/download/research-cli-darwin-x64.tar.gz) |
| 🍎 macOS | M1/M2 | [research-cli-darwin-arm64.tar.gz](https://github.com/iechor-research/research-cli/releases/latest/download/research-cli-darwin-arm64.tar.gz) |
| 🪟 Windows | x64 | [research-cli-win32-x64.zip](https://github.com/iechor-research/research-cli/releases/latest/download/research-cli-win32-x64.zip) |
| 🪟 Windows | ARM64 | [research-cli-win32-arm64.zip](https://github.com/iechor-research/research-cli/releases/latest/download/research-cli-win32-arm64.zip) |

### 2. 解压和安装

**Linux/macOS:**
```bash
# 解压
tar -xzf research-cli-*.tar.gz

# 移动到系统路径 (需要 sudo)
sudo cp research-cli-*/research-cli /usr/local/bin/

# 或移动到用户路径 (无需 sudo)
mkdir -p ~/bin
cp research-cli-*/research-cli ~/bin/
export PATH="$HOME/bin:$PATH"
```

**Windows:**
```powershell
# 解压到程序目录
Expand-Archive research-cli-*.zip -DestinationPath "C:\Program Files\research-cli"

# 添加到系统 PATH (需要管理员权限)
[Environment]::SetEnvironmentVariable("Path", "$env:Path;C:\Program Files\research-cli", "Machine")
```

## 🔐 安全验证

所有发布包都提供 SHA256 校验和。下载 `checksums.txt` 文件验证：

```bash
# 下载校验和文件
curl -fsSL https://github.com/iechor-research/research-cli/releases/latest/download/checksums.txt -o checksums.txt

# 验证文件完整性
shasum -a 256 -c checksums.txt
```

## 🧪 验证安装

安装完成后，验证 Research CLI 是否正常工作：

```bash
# 检查版本
research-cli --version

# 查看帮助
research-cli --help

# 测试基本功能
research-cli -p "Hello, Research CLI!"
```

## 🔄 更新

### 使用安装脚本更新

重新运行安装脚本即可更新到最新版本：

```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash

# Windows
iwr -useb https://raw.githubusercontent.com/iechor-research/research-cli/main/install.ps1 | iex
```

### 手动更新

1. 下载最新版本的包
2. 替换现有的可执行文件
3. 验证更新是否成功

## 🗑️ 卸载

### 自动卸载

我们正在开发自动卸载脚本。目前请使用手动卸载方法。

### 手动卸载

**Linux/macOS:**
```bash
# 删除二进制文件
sudo rm -f /usr/local/bin/research-cli
rm -f ~/bin/research-cli

# 删除安装目录 (如果使用了bundled安装)
sudo rm -rf /usr/local/bin/research-cli-bundle
rm -rf ~/bin/research-cli-bundle

# 从 PATH 中移除 (编辑 ~/.bashrc, ~/.zshrc 等)
# 删除类似这样的行: export PATH="/path/to/research-cli:$PATH"
```

**Windows:**
```powershell
# 删除程序目录
Remove-Item "C:\Program Files\research-cli" -Recurse -Force

# 从系统 PATH 中移除
# 通过 系统属性 > 环境变量 手动移除
```

## ❓ 故障排除

### 常见问题

1. **"command not found" 错误**
   - 确保安装目录在 PATH 环境变量中
   - 重新启动终端或运行 `source ~/.bashrc`

2. **权限被拒绝**
   - 确保文件有执行权限：`chmod +x research-cli`
   - 在 Linux/macOS 上可能需要 `sudo`

3. **Windows 安全警告**
   - 右键点击文件 → 属性 → 解除阻止
   - 或在 PowerShell 中运行：`Unblock-File research-cli.bat`

4. **网络连接问题**
   - 检查防火墙设置
   - 使用代理：`export https_proxy=http://proxy:port`

### 获取帮助

- 📖 [文档](https://github.com/iechor-research/research-cli/tree/main/docs)
- 🐛 [问题报告](https://github.com/iechor-research/research-cli/issues)
- 💬 [讨论](https://github.com/iechor-research/research-cli/discussions)

## 🛠️ 开发者安装

如果你想从源码构建或参与开发：

```bash
# 克隆仓库
git clone https://github.com/iechor-research/research-cli.git
cd research-cli

# 安装依赖
npm install

# 构建项目
npm run build

# 运行开发版本
npm start

# 构建独立包
npm run build:standalone-simple
```

---

**现在就开始使用 Research CLI 吧！** 🎉

选择最适合你的安装方式，几分钟内就能开始使用这个强大的 AI 研发工具。
