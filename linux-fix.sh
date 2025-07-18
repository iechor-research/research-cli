#!/bin/bash

# Research CLI Linux Quick Fix
# 临时解决方案，直到我们发布包含Node.js代码的完整版本

set -e

echo "Research CLI Linux 快速修复脚本"
echo "================================"
echo ""

# 检查是否已安装native二进制
if [ -f "/usr/local/bin/research-cli" ] || [ -f "$HOME/.local/bin/research-cli" ]; then
    echo "✅ 检测到已安装的native二进制文件"
else
    echo "❌ 未检测到native二进制文件，请先运行官方安装脚本："
    echo "   curl -sSL https://github.com/iechor-research/research-cli/releases/download/v0.2.7-native/install.sh | bash"
    exit 1
fi

# 检查Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "❌ 未检测到Node.js，请先安装Node.js："
    echo "   访问: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 已安装: $(node --version)"

# 创建临时工作目录
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo ""
echo "📥 下载Research CLI源代码..."

# 克隆仓库（浅克隆以节省时间）
cd $TEMP_DIR
git clone --depth 1 https://github.com/iechor-research/research-cli.git

echo "📦 安装依赖..."
cd research-cli
npm ci

echo "🔨 构建项目..."
npm run build

# 确定安装目录
if [ -w "/usr/local/lib" ]; then
    INSTALL_DIR="/usr/local/lib/research-cli"
    sudo mkdir -p $INSTALL_DIR
    sudo cp -r packages package.json package-lock.json $INSTALL_DIR/
    sudo chown -R $(whoami) $INSTALL_DIR
else
    INSTALL_DIR="$HOME/.local/lib/research-cli"
    mkdir -p $INSTALL_DIR
    cp -r packages package.json package-lock.json $INSTALL_DIR/
fi

echo ""
echo "✅ Research CLI 已安装到: $INSTALL_DIR"

# 创建wrapper脚本
WRAPPER_SCRIPT="/tmp/research-wrapper"
cat > $WRAPPER_SCRIPT << EOF
#!/bin/bash
export RESEARCH_CLI_HOME="$INSTALL_DIR"
exec node "$INSTALL_DIR/packages/cli/dist/index.js" "\$@"
EOF

chmod +x $WRAPPER_SCRIPT

# 安装wrapper
if [ -w "/usr/local/bin" ]; then
    sudo mv $WRAPPER_SCRIPT /usr/local/bin/research
    sudo ln -sf /usr/local/bin/research /usr/local/bin/research-cli
    echo "✅ 命令已安装到: /usr/local/bin/"
else
    mkdir -p $HOME/.local/bin
    mv $WRAPPER_SCRIPT $HOME/.local/bin/research
    ln -sf $HOME/.local/bin/research $HOME/.local/bin/research-cli
    echo "✅ 命令已安装到: $HOME/.local/bin/"
    echo ""
    echo "⚠️  请确保 $HOME/.local/bin 在您的PATH中"
fi

echo ""
echo "🎉 安装完成！"
echo ""
echo "测试安装："
research --version || echo "如果命令未找到，请重启终端或运行: source ~/.bashrc"

echo ""
echo "使用方法："
echo "  research --help"
echo "  research config show"
echo "  research models list" 