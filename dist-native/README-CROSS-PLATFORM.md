# Research CLI Native Wrapper - Cross Platform

## 📦 Available Downloads

| Platform | Architecture | Download | Size | Status |
|----------|-------------|----------|------|--------|
| macOS Intel | | `research-cli-darwin-x64` | 456KB | ✅ Ready |
| macOS Apple Silicon | | `research-cli-darwin-arm64` | 470KB | ✅ Ready |
| Windows x64 | | `research-cli-win32-x64.exe` | N/A | ❌ Failed |
| Linux x64 | | `research-cli-linux-x64` | N/A | ⏭️ Skipped |
| Linux ARM64 | | `research-cli-linux-arm64` | N/A | ⏭️ Skipped |

## 🛠️ Installation Instructions

### One-line installer (all platforms)
```bash
curl -sSL https://github.com/iechor-research/research-cli/releases/download/v0.2.7-native/install-complete.sh | bash
```

### Manual Installation

#### macOS
```bash
# Intel Macs
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.7-native/research-cli-darwin-x64
chmod +x research-cli

# Apple Silicon (M1/M2/M3)
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.7-native/research-cli-darwin-arm64
chmod +x research-cli
```

#### Windows
```powershell
# Download and run
Invoke-WebRequest -Uri "https://github.com/iechor-research/research-cli/releases/download/v0.2.7-native/research-cli-win32-x64.exe" -OutFile "research-cli.exe"
.\research-cli.exe
```

#### Linux
```bash
# x64
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.7-native/research-cli-linux-x64
chmod +x research-cli

# ARM64
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.7-native/research-cli-linux-arm64
chmod +x research-cli
```

## 📋 Requirements

- Node.js (required for Research CLI core functionality)
- Built Research CLI packages in your project

## ✨ Features

- **🚀 Ultra-lightweight**: ~400-500KB per platform
- **⚡ Lightning fast**: Direct process execution
- **🖥️ Native experience**: Full terminal compatibility
- **🔧 Zero dependencies**: Pure Rust wrapper
- **📱 Cross-platform**: Works on all major platforms

## 🔧 Build Information

Built: 2025-07-23T21:52:08.534Z
Version: 0.2.7

### Build Results
- ✅ Successful builds: 2
- ❌ Failed builds: 1
- ⏭️ Skipped builds: 2


### Failed Builds
- **Windows x64**: Command failed: cargo build --release --target x86_64-pc-windows-msvc

💡 **Note**: Failed builds are normal when cross-compilation tools aren't available.
For complete cross-platform builds, use GitHub Actions or build on each target platform.


### Recommendations
- For production releases, use GitHub Actions to build on native platforms
- For local development, the available builds should be sufficient
- Users can always use the complete installer which handles platform detection
