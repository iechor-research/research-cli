#!/bin/bash

# Research CLI Complete Installer
# This script installs both the native binary wrapper and the Node.js application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERSION="v0.2.7-native"
GITHUB_REPO="iechor-research/research-cli"
INSTALL_BASE="/usr/local"
USER_INSTALL_BASE="$HOME/.local"

# Detect platform
detect_platform() {
    local os=$(uname -s)
    local arch=$(uname -m)
    
    case "$os" in
        Darwin)
            case "$arch" in
                arm64|aarch64)
                    echo "darwin-arm64"
                    ;;
                x86_64)
                    echo "darwin-x64"
                    ;;
                *)
                    echo "unsupported"
                    ;;
            esac
            ;;
        Linux)
            case "$arch" in
                x86_64)
                    echo "linux-x64"
                    ;;
                aarch64|arm64)
                    echo "linux-arm64"
                    ;;
                *)
                    echo "unsupported"
                    ;;
            esac
            ;;
        *)
            echo "unsupported"
            ;;
    esac
}

# Check if running as root
is_root() {
    [ "$EUID" -eq 0 ]
}

# Determine installation directory
get_install_dirs() {
    if is_root || [ -w "$INSTALL_BASE" ]; then
        echo "$INSTALL_BASE/bin" "$INSTALL_BASE/lib/research-cli"
    else
        mkdir -p "$USER_INSTALL_BASE/bin" "$USER_INSTALL_BASE/lib/research-cli"
        echo "$USER_INSTALL_BASE/bin" "$USER_INSTALL_BASE/lib/research-cli"
    fi
}

# Download file with progress
download_file() {
    local url="$1"
    local output="$2"
    
    echo -e "${BLUE}📥 Downloading: $(basename "$output")${NC}"
    
    if command -v curl >/dev/null 2>&1; then
        curl -sSL "$url" -o "$output" --progress-bar
    elif command -v wget >/dev/null 2>&1; then
        wget -q --show-progress "$url" -O "$output"
    else
        echo -e "${RED}❌ Neither curl nor wget is available${NC}"
        exit 1
    fi
}

# Add to PATH
add_to_path() {
    local bin_dir="$1"
    
    # Skip if already in PATH
    if [[ ":$PATH:" == *":$bin_dir:"* ]]; then
        return
    fi
    
    # Determine shell config file
    local shell_config=""
    if [ -n "$BASH_VERSION" ] || [[ "$SHELL" == *"bash"* ]]; then
        shell_config="$HOME/.bashrc"
        [ ! -f "$shell_config" ] && shell_config="$HOME/.bash_profile"
    elif [ -n "$ZSH_VERSION" ] || [[ "$SHELL" == *"zsh"* ]]; then
        shell_config="$HOME/.zshrc"
    else
        shell_config="$HOME/.profile"
    fi
    
    # Add to PATH
    echo "" >> "$shell_config"
    echo "# Added by Research CLI installer" >> "$shell_config"
    echo "export PATH=\"$bin_dir:\$PATH\"" >> "$shell_config"
    
    echo -e "${YELLOW}📝 Added $bin_dir to PATH in $shell_config${NC}"
    echo -e "${YELLOW}🔄 Please restart your terminal or run: source $shell_config${NC}"
}

# Main installation
main() {
    echo -e "${BLUE}🚀 Research CLI Complete Installer${NC}"
    echo -e "${BLUE}📦 Version: $VERSION${NC}"
    echo ""
    
    # Detect platform
    local platform=$(detect_platform)
    if [ "$platform" = "unsupported" ]; then
        echo -e "${RED}❌ Unsupported platform: $(uname -s) $(uname -m)${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Platform detected: $platform${NC}"
    
    # Get installation directories
    read -r bin_dir lib_dir <<< $(get_install_dirs)
    echo -e "${BLUE}📁 Binary directory: $bin_dir${NC}"
    echo -e "${BLUE}📁 Library directory: $lib_dir${NC}"
    
    # Create temporary directory
    local temp_dir=$(mktemp -d)
    trap "rm -rf $temp_dir" EXIT
    
    # Download native binary
    local binary_name="research-cli-$platform"
    local binary_url="https://github.com/$GITHUB_REPO/releases/download/$VERSION/$binary_name"
    local binary_path="$temp_dir/$binary_name"
    
    download_file "$binary_url" "$binary_path"
    
    # Download Node.js package
    local package_url="https://github.com/$GITHUB_REPO/releases/download/$VERSION/research-cli-node.tar.gz"
    local package_path="$temp_dir/research-cli-node.tar.gz"
    
    download_file "$package_url" "$package_path"
    
    # Install binary
    echo -e "${BLUE}📦 Installing native binary...${NC}"
    chmod +x "$binary_path"
    cp "$binary_path" "$bin_dir/research-cli"
    
    # Create symlink
    ln -sf "$bin_dir/research-cli" "$bin_dir/research"
    
    # Install Node.js package
    echo -e "${BLUE}📦 Installing Node.js package...${NC}"
    mkdir -p "$lib_dir"
    tar -xzf "$package_path" -C "$lib_dir"
    
    # Add to PATH if needed
    add_to_path "$bin_dir"
    
    # Set environment variable hint
    echo ""
    echo -e "${GREEN}✅ Installation completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Installation summary:${NC}"
    echo -e "  Binary: $bin_dir/research-cli"
    echo -e "  Symlink: $bin_dir/research"
    echo -e "  Library: $lib_dir"
    echo ""
    
    # Test installation
    if [ -x "$bin_dir/research-cli" ]; then
        echo -e "${GREEN}✅ Binary is executable${NC}"
        
        # Try to run version command
        if command -v node >/dev/null 2>&1; then
            echo -e "${BLUE}🧪 Testing installation...${NC}"
            export RESEARCH_CLI_HOME="$lib_dir"
            if "$bin_dir/research-cli" --version 2>/dev/null; then
                echo -e "${GREEN}✅ Research CLI is working!${NC}"
            else
                echo -e "${YELLOW}⚠️  Could not verify installation (this might be normal)${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js to use Research CLI${NC}"
            echo -e "${BLUE}   Visit: https://nodejs.org/${NC}"
        fi
    fi
    
    echo ""
    echo -e "${BLUE}🎉 You can now use:${NC}"
    echo -e "  ${GREEN}research${NC} - Main command"
    echo -e "  ${GREEN}research-cli${NC} - Alternative command"
    echo ""
    echo -e "${BLUE}📚 Quick start:${NC}"
    echo "  research --help"
    echo "  research config show"
    echo "  research models list"
    echo ""
    echo -e "${BLUE}🌟 For more information:${NC}"
    echo "  https://github.com/$GITHUB_REPO"
}

# Run main installation
main "$@" 