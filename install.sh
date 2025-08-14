#!/usr/bin/env bash

# Research CLI Simple Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/iechor-research/research-cli/main/install-simple.sh | bash

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO="iechor-research/research-cli"
BINARY_NAME="research-cli"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Banner
echo -e "${BLUE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                     Research CLI Installer                   ║
║                                                              ║
║  AI-powered research and development CLI tool for developers ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Detect platform
detect_platform() {
    local os arch
    case "$(uname -s)" in
        Linux*)     os="linux" ;;
        Darwin*)    os="darwin" ;;
        CYGWIN*|MINGW*|MSYS*) os="win32" ;;
        *)          log_error "Unsupported OS: $(uname -s)"; exit 1 ;;
    esac
    
    case "$(uname -m)" in
        x86_64|amd64)   arch="x64" ;;
        arm64|aarch64)  arch="arm64" ;;
        *)              log_error "Unsupported architecture: $(uname -m)"; exit 1 ;;
    esac
    
    echo "${os}-${arch}"
}

# Get latest version
get_latest_version() {
    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" 2>/dev/null | \
        grep '"tag_name"' | cut -d'"' -f4
    elif command -v wget >/dev/null 2>&1; then
        wget -qO- "https://api.github.com/repos/$REPO/releases/latest" 2>/dev/null | \
        grep '"tag_name"' | cut -d'"' -f4
    else
        log_error "curl or wget is required"
        exit 1
    fi
}

# Main installation
main() {
    # Detect platform
    local platform
    platform=$(detect_platform)
    log_info "Detected platform: $platform"
    
    # Get version
    local version
    if [ -n "${VERSION:-}" ]; then
        version="$VERSION"
        log_info "Using specified version: $version"
    else
        log_info "Fetching latest release..."
        version=$(get_latest_version)
        if [ -z "$version" ]; then
            log_error "Could not determine version"
            exit 1
        fi
        log_info "Latest version: $version"
    fi
    
    # Create temp directory
    local temp_dir
    temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Download
    local archive_name download_url
    if [[ "$platform" == win32-* ]]; then
        archive_name="research-cli-${platform}.zip"
    else
        archive_name="research-cli-${platform}.tar.gz"
    fi
    
    download_url="https://github.com/$REPO/releases/download/$version/$archive_name"
    log_info "Downloading from: $download_url"
    
    if command -v curl >/dev/null 2>&1; then
        if ! curl -fsSL -o "$archive_name" "$download_url"; then
            log_error "Download failed"
            exit 1
        fi
    elif command -v wget >/dev/null 2>&1; then
        if ! wget -q -O "$archive_name" "$download_url"; then
            log_error "Download failed"
            exit 1
        fi
    fi
    
    log_success "Download completed"
    
    # Extract
    log_info "Extracting..."
    if [[ "$archive_name" == *.zip ]]; then
        if command -v unzip >/dev/null 2>&1; then
            unzip -q "$archive_name"
        else
            log_error "unzip required for Windows packages"
            exit 1
        fi
    else
        tar -xzf "$archive_name"
    fi
    
    # Check extraction
    if [ ! -d "dist-package" ]; then
        log_error "Extraction failed"
        exit 1
    fi
    
    log_success "Extraction completed"
    
    # Install
    log_info "Installing to $INSTALL_DIR..."
    
    # Create install directory if needed
    if [ ! -d "$INSTALL_DIR" ]; then
        if [ -w "$(dirname "$INSTALL_DIR")" ]; then
            mkdir -p "$INSTALL_DIR"
        else
            log_info "Creating directory with sudo..."
            sudo mkdir -p "$INSTALL_DIR"
        fi
    fi
    
    # Install the bundle
    local bundle_dir="$INSTALL_DIR/research-cli-bundle"
    if [ -w "$INSTALL_DIR" ]; then
        cp -r "dist-package" "$bundle_dir"
        ln -sf "$bundle_dir/research-cli" "$INSTALL_DIR/$BINARY_NAME"
    else
        log_info "Installing with sudo..."
        sudo cp -r "dist-package" "$bundle_dir"
        sudo ln -sf "$bundle_dir/research-cli" "$INSTALL_DIR/$BINARY_NAME"
    fi
    
    # Make executable
    if [ -w "$INSTALL_DIR/$BINARY_NAME" ]; then
        chmod +x "$INSTALL_DIR/$BINARY_NAME"
    else
        sudo chmod +x "$INSTALL_DIR/$BINARY_NAME"
    fi
    
    log_success "Installation completed!"
    
    # Test installation
    log_info "Testing installation..."
    if "$INSTALL_DIR/$BINARY_NAME" --version >/dev/null 2>&1; then
        local installed_version
        installed_version=$("$INSTALL_DIR/$BINARY_NAME" --version 2>/dev/null | head -1)
        log_success "Research CLI installed successfully!"
        log_success "Version: $installed_version"
        log_success "Location: $INSTALL_DIR/$BINARY_NAME"
    else
        log_warn "Installation completed but version check failed"
    fi
    
    # Show usage
    echo
    log_info "🚀 Get started:"
    log_info "   $BINARY_NAME --help"
    log_info "   $BINARY_NAME --version"
    log_info "   $BINARY_NAME -p \"Hello, Research CLI!\""
    echo
    log_info "📖 Documentation: https://github.com/$REPO"
    
    # Cleanup
    cd /
    rm -rf "$temp_dir"
}

# Run main function
main "$@"
