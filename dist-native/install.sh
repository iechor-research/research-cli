#!/bin/bash

# Research CLI Native Wrapper - Enhanced Installer
# Usage: curl -sSL https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect platform
detect_platform() {
    local os=$(uname -s)
    local arch=$(uname -m)
    
    case "$os" in
        Darwin)
            case "$arch" in
                arm64|aarch64)
                    echo "research-cli-darwin-arm64"
                    ;;
                x86_64)
                    echo "research-cli-darwin-x64"
                    ;;
                *)
                    echo "unsupported"
                    ;;
            esac
            ;;
        Linux)
            case "$arch" in
                x86_64)
                    echo "research-cli-linux-x64"
                    ;;
                aarch64|arm64)
                    echo "research-cli-linux-arm64"
                    ;;
                *)
                    echo "unsupported"
                    ;;
            esac
            ;;
        CYGWIN*|MINGW*|MSYS*)
            case "$arch" in
                x86_64)
                    echo "research-cli-win32-x64.exe"
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

# Find the best installation directory
find_install_dir() {
    # Try common system paths in order of preference
    local paths=("/usr/local/bin" "$HOME/.local/bin" "$HOME/bin")
    
    for path in "${paths[@]}"; do
        if [ -d "$path" ] && [ -w "$path" ]; then
            echo "$path"
            return
        elif [ ! -d "$path" ] && mkdir -p "$path" 2>/dev/null; then
            echo "$path"
            return
        fi
    done
    
    # Fallback to creating ~/.local/bin
    mkdir -p "$HOME/.local/bin"
    echo "$HOME/.local/bin"
}

# Add directory to PATH if needed
add_to_path() {
    local install_dir="$1"
    
    # Skip if already in PATH
    if [[ ":$PATH:" == *":$install_dir:"* ]]; then
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
    echo "export PATH=\"$install_dir:\$PATH\"" >> "$shell_config"
    
    echo -e "${YELLOW}📝 Added $install_dir to PATH in $shell_config${NC}"
    echo -e "${YELLOW}🔄 Please restart your terminal or run: source $shell_config${NC}"
}

# Main installation function
install_research_cli() {
    local platform=$(detect_platform)
    
    if [ "$platform" = "unsupported" ]; then
        echo -e "${RED}❌ Unsupported platform: $(uname -s) $(uname -m)${NC}"
        echo "Supported platforms:"
        echo "  - macOS (Intel & Apple Silicon)"
        echo "  - Linux (x64 & ARM64)"
        echo "  - Windows (x64)"
        exit 1
    fi
    
    echo -e "${BLUE}🚀 Installing Research CLI Native Wrapper v0.2.8...${NC}"
    echo -e "${YELLOW}📦 Platform: $platform${NC}"
    
    # Find installation directory
    local install_dir=$(find_install_dir)
    echo -e "${BLUE}📁 Installing to: $install_dir${NC}"
    
    # Download URL
    local version="v0.2.8-native"
    local download_url="https://github.com/iechor-research/research-cli/releases/download/$version/$platform"
    
    echo -e "${BLUE}📥 Downloading from: $download_url${NC}"
    
    # Download the binary
    local binary_path="$install_dir/research-cli"
    if command -v curl >/dev/null 2>&1; then
        curl -sSL "$download_url" -o "$binary_path"
    elif command -v wget >/dev/null 2>&1; then
        wget -q "$download_url" -O "$binary_path"
    else
        echo -e "${RED}❌ Neither curl nor wget is available${NC}"
        exit 1
    fi
    
    # Make executable
    chmod +x "$binary_path"
    
    # Create symlink for 'research' command
    local research_link="$install_dir/research"
    if [ -L "$research_link" ] || [ -f "$research_link" ]; then
        rm -f "$research_link"
    fi
    ln -s "$binary_path" "$research_link"
    
    echo -e "${GREEN}✅ Binary installed: $binary_path${NC}"
    echo -e "${GREEN}🔗 Symlink created: $research_link${NC}"
    
    # Add to PATH if needed
    add_to_path "$install_dir"
    
    echo ""
    echo -e "${GREEN}✅ Installation completed successfully!${NC}"
    echo -e "${GREEN}🎉 You can now use either command:${NC}"
    echo -e "${GREEN}   - research${NC}"
    echo -e "${GREEN}   - research-cli${NC}"
    echo ""
    echo -e "${BLUE}📚 Quick start:${NC}"
    echo "  research --help"
    echo "  research config show"
    echo "  research models list"
    echo ""
    echo -e "${BLUE}🌟 For more information, visit:${NC}"
    echo "  https://github.com/iechor-research/research-cli"
    
    # Test if commands are available
    echo ""
    echo -e "${BLUE}🧪 Testing installation...${NC}"
    if command -v research >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 'research' command is available${NC}"
    else
        echo -e "${YELLOW}⚠️  'research' command not yet available (restart terminal)${NC}"
    fi
}

# Run installation
install_research_cli
