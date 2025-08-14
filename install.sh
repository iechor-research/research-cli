#!/usr/bin/env bash

# Research CLI Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO="iechor-research/research-cli"
BINARY_NAME="research-cli"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
TEMP_DIR=$(mktemp -d)

# Cleanup function
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print banner
print_banner() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                     Research CLI Installer                   ║
║                                                              ║
║  AI-powered research and development CLI tool for developers ║
╚══════════════════════════════════════════════════════════════╝
EOF
}

# Detect platform and architecture
detect_platform() {
    local os arch
    
    case "$(uname -s)" in
        Linux*)     os="linux" ;;
        Darwin*)    os="darwin" ;;
        CYGWIN*|MINGW*|MSYS*) os="win32" ;;
        *)          log_error "Unsupported operating system: $(uname -s)"; exit 1 ;;
    esac
    
    case "$(uname -m)" in
        x86_64|amd64)   arch="x64" ;;
        arm64|aarch64)  arch="arm64" ;;
        armv7l)         arch="arm64" ;; # Fallback for some ARM systems
        *)              log_error "Unsupported architecture: $(uname -m)"; exit 1 ;;
    esac
    
    echo "${os}-${arch}"
}

# Get latest release version
get_latest_version() {
    local version
    
    log_info "Fetching latest release information..."
    
    if command -v curl >/dev/null 2>&1; then
        version=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)
    elif command -v wget >/dev/null 2>&1; then
        version=$(wget -qO- "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)
    else
        log_error "curl or wget is required to download Research CLI"
        exit 1
    fi
    
    if [ -z "$version" ]; then
        log_error "Failed to get latest version"
        exit 1
    fi
    
    echo "$version"
}

# Download and extract package
download_and_extract() {
    local version="$1"
    local platform="$2"
    local download_url archive_name extract_dir
    
    if [[ "$platform" == win32-* ]]; then
        archive_name="research-cli-${platform}.zip"
    else
        archive_name="research-cli-${platform}.tar.gz"
    fi
    
    download_url="https://github.com/$REPO/releases/download/$version/$archive_name"
    
    log_info "Downloading Research CLI $version for $platform..."
    log_info "URL: $download_url"
    
    cd "$TEMP_DIR"
    
    if command -v curl >/dev/null 2>&1; then
        if ! curl -fsSL -o "$archive_name" "$download_url"; then
            log_error "Failed to download Research CLI"
            exit 1
        fi
    elif command -v wget >/dev/null 2>&1; then
        if ! wget -q -O "$archive_name" "$download_url"; then
            log_error "Failed to download Research CLI"
            exit 1
        fi
    fi
    
    log_info "Extracting archive..."
    
    if [[ "$archive_name" == *.zip ]]; then
        if command -v unzip >/dev/null 2>&1; then
            unzip -q "$archive_name"
        else
            log_error "unzip is required to extract Windows packages"
            exit 1
        fi
    else
        tar -xzf "$archive_name"
    fi
    
    extract_dir="research-cli-${platform}"
    if [ ! -d "$extract_dir" ]; then
        log_error "Extraction failed: directory $extract_dir not found"
        exit 1
    fi
    
    echo "$extract_dir"
}

# Install binary
install_binary() {
    local extract_dir="$1"
    local platform="$2"
    local binary_path install_path
    
    if [[ "$platform" == win32-* ]]; then
        binary_path="$extract_dir/research-cli.bat"
    else
        binary_path="$extract_dir/research-cli"
    fi
    
    if [ ! -f "$binary_path" ]; then
        log_error "Binary not found: $binary_path"
        exit 1
    fi
    
    # Determine install path
    if [ -w "$INSTALL_DIR" ]; then
        install_path="$INSTALL_DIR/$BINARY_NAME"
    else
        log_info "No write permission to $INSTALL_DIR, trying with sudo..."
        if command -v sudo >/dev/null 2>&1; then
            install_path="$INSTALL_DIR/$BINARY_NAME"
        else
            log_warn "sudo not available, installing to ~/bin instead"
            INSTALL_DIR="$HOME/bin"
            mkdir -p "$INSTALL_DIR"
            install_path="$INSTALL_DIR/$BINARY_NAME"
        fi
    fi
    
    log_info "Installing Research CLI to $install_path..."
    
    # Copy the entire directory to preserve dependencies
    local target_dir
    target_dir="$(dirname "$install_path")/research-cli-bundle"
    
    if [ -w "$(dirname "$install_path")" ]; then
        cp -r "$extract_dir" "$target_dir"
        ln -sf "$target_dir/research-cli" "$install_path" 2>/dev/null || cp "$target_dir/research-cli" "$install_path"
    else
        sudo cp -r "$extract_dir" "$target_dir"
        sudo ln -sf "$target_dir/research-cli" "$install_path" 2>/dev/null || sudo cp "$target_dir/research-cli" "$install_path"
    fi
    
    # Make executable
    if [ -w "$install_path" ]; then
        chmod +x "$install_path"
    else
        sudo chmod +x "$install_path"
    fi
    
    echo "$install_path"
}

# Verify installation
verify_installation() {
    local install_path="$1"
    
    log_info "Verifying installation..."
    
    if [ -x "$install_path" ]; then
        local version_output
        if version_output=$("$install_path" --version 2>&1); then
            log_success "Research CLI installed successfully!"
            log_success "Version: $version_output"
            return 0
        else
            log_warn "Binary installed but version check failed: $version_output"
            return 1
        fi
    else
        log_error "Installation verification failed: $install_path is not executable"
        return 1
    fi
}

# Add to PATH if needed
add_to_path() {
    local install_dir="$1"
    
    if [[ ":$PATH:" != *":$install_dir:"* ]]; then
        log_info "Adding $install_dir to PATH..."
        
        # Determine shell config file
        local shell_config
        case "$SHELL" in
            */bash) shell_config="$HOME/.bashrc" ;;
            */zsh)  shell_config="$HOME/.zshrc" ;;
            */fish) shell_config="$HOME/.config/fish/config.fish" ;;
            *)      shell_config="$HOME/.profile" ;;
        esac
        
        if [ -f "$shell_config" ]; then
            echo "" >> "$shell_config"
            echo "# Added by Research CLI installer" >> "$shell_config"
            echo "export PATH=\"$install_dir:\$PATH\"" >> "$shell_config"
            log_success "Added to PATH in $shell_config"
            log_info "Please run: source $shell_config"
        else
            log_warn "Could not add to PATH automatically. Please add $install_dir to your PATH manually."
        fi
    fi
}

# Main installation function
main() {
    local version platform extract_dir install_path
    
    print_banner
    echo
    
    # Check for help flag
    if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
        cat << EOF
Research CLI Installer

USAGE:
    curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
    
    # Or with custom install directory:
    INSTALL_DIR=/usr/local/bin curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash

ENVIRONMENT VARIABLES:
    INSTALL_DIR    Directory to install the binary (default: /usr/local/bin)

EXAMPLES:
    # Install to /usr/local/bin (requires sudo)
    curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
    
    # Install to ~/bin (user directory)
    INSTALL_DIR=~/bin curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash
    
    # Install specific version
    VERSION=v0.3.1 curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install.sh | bash

EOF
        exit 0
    fi
    
    # Detect platform
    platform=$(detect_platform)
    log_info "Detected platform: $platform"
    
    # Get version
    if [ -n "${VERSION:-}" ]; then
        version="$VERSION"
        log_info "Using specified version: $version"
    else
        version=$(get_latest_version)
        log_info "Latest version: $version"
    fi
    
    # Download and extract
    extract_dir=$(download_and_extract "$version" "$platform")
    
    # Install
    install_path=$(install_binary "$extract_dir" "$platform")
    
    # Verify
    if verify_installation "$install_path"; then
        log_success "Installation completed successfully!"
        
        # Add to PATH if needed
        if [[ "$INSTALL_DIR" != "/usr/local/bin" ]] && [[ "$INSTALL_DIR" != "/usr/bin" ]]; then
            add_to_path "$INSTALL_DIR"
        fi
        
        echo
        log_info "🚀 Get started with Research CLI:"
        log_info "   $BINARY_NAME --help"
        log_info "   $BINARY_NAME --version"
        log_info ""
        log_info "📖 Documentation: https://github.com/$REPO"
        
    else
        log_error "Installation failed"
        exit 1
    fi
}

# Run main function
main "$@"
