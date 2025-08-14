#!/usr/bin/env bash

# Simple test installer
set -euo pipefail

VERSION="v0.3.1-test"
PLATFORM="darwin-arm64"
INSTALL_DIR="$HOME/bin"

echo "🚀 Testing Research CLI installation"
echo "📦 Version: $VERSION"
echo "🖥️  Platform: $PLATFORM"
echo "📂 Install dir: $INSTALL_DIR"

# Create install directory
mkdir -p "$INSTALL_DIR"

# Download
DOWNLOAD_URL="https://github.com/iechor-research/research-cli/releases/download/$VERSION/research-cli-standalone-$PLATFORM.tar.gz"
TEMP_DIR=$(mktemp -d)

echo "📥 Downloading from: $DOWNLOAD_URL"
cd "$TEMP_DIR"

if curl -fsSL -o "package.tar.gz" "$DOWNLOAD_URL"; then
    echo "✅ Download successful"
else
    echo "❌ Download failed"
    exit 1
fi

# Extract
echo "📦 Extracting..."
tar -xzf "package.tar.gz"

EXTRACT_DIR="dist-package"
if [ -d "$EXTRACT_DIR" ]; then
    echo "✅ Extraction successful"
    
    # Install
    echo "🔧 Installing..."
    cp -r "$EXTRACT_DIR" "$INSTALL_DIR/"
    
    # Create symlink
    ln -sf "$INSTALL_DIR/$EXTRACT_DIR/research-cli" "$INSTALL_DIR/research-cli"
    
    echo "✅ Installation complete!"
    echo "📍 Installed to: $INSTALL_DIR/research-cli"
    
    # Test
    echo "🧪 Testing installation..."
    if "$INSTALL_DIR/research-cli" --version; then
        echo "🎉 Installation successful!"
    else
        echo "❌ Installation test failed"
    fi
else
    echo "❌ Extraction failed"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"
