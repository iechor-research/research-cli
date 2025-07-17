# Research CLI Native Wrapper - Cross Platform

## 📦 Available Downloads

| Platform | Architecture | Download | Size | Status |
|----------|-------------|----------|------|--------|
| macOS Intel | | `research-cli-darwin-x64` | 420KB | ✅ Ready |
| macOS Apple Silicon | | `research-cli-darwin-arm64` | 431KB | ✅ Ready |
| Windows x64 | | `research-cli-win32-x64.exe` | N/A | ❌ Failed |
| Linux x64 | | `research-cli-linux-x64` | N/A | ❌ Failed |
| Linux ARM64 | | `research-cli-linux-arm64` | N/A | ❌ Failed |

## 🛠️ Installation Instructions

### macOS
```bash
# Intel Macs
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-darwin-x64
chmod +x research-cli

# Apple Silicon (M1/M2/M3)
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-darwin-arm64
chmod +x research-cli
```

### Windows
```powershell
# Download and run
Invoke-WebRequest -Uri "https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-win32-x64.exe" -OutFile "research-cli.exe"
.\research-cli.exe
```

### Linux
```bash
# x64
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-linux-x64
chmod +x research-cli

# ARM64
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-linux-arm64
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

Built: 2025-07-17T06:31:10.203Z
Version: 0.2.6
