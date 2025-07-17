#!/bin/bash
# Research CLI Native Wrapper Quick Install Script

set -e

echo "🚀 Installing Research CLI Native Wrapper v0.2.6..."

# 检测平台
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Darwin)
        case "$ARCH" in
            arm64|aarch64)
                BINARY="research-cli-darwin-arm64"
                ;;
            x86_64)
                BINARY="research-cli-darwin-x64"
                ;;
            *)
                echo "❌ Unsupported architecture: $ARCH"
                exit 1
                ;;
        esac
        ;;
    Linux)
        case "$ARCH" in
            x86_64)
                BINARY="research-cli-linux-x64"
                ;;
            arm64|aarch64)
                BINARY="research-cli-linux-arm64"
                ;;
            *)
                echo "❌ Unsupported architecture: $ARCH"
                exit 1
                ;;
        esac
        ;;
    *)
        echo "❌ Unsupported OS: $OS"
        echo "Please download manually from: https://github.com/iechor-research/research-cli/releases/tag/v0.2.6-native"
        exit 1
        ;;
esac

# 下载二进制文件
URL="https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/$BINARY"
echo "📥 Downloading $BINARY..."

if command -v curl >/dev/null 2>&1; then
    curl -L -o research-cli "$URL"
elif command -v wget >/dev/null 2>&1; then
    wget -O research-cli "$URL"
else
    echo "❌ Neither curl nor wget found. Please install one of them."
    exit 1
fi

# 设置执行权限
chmod +x research-cli

echo "✅ Research CLI Native Wrapper installed successfully!"
echo "🏃 Run with: ./research-cli"
