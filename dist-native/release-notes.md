# Research CLI Native Wrapper v0.2.6

## 🎯 What's New

This is a **native wrapper** for Research CLI that provides the **original terminal experience** with minimal overhead.

## ✨ Key Features

- **🚀 Ultra-lightweight**: Only 431KB (99% smaller than previous packaging attempts)
- **⚡ Lightning fast**: Direct process execution, no web interface overhead  
- **🖥️ Native experience**: Full terminal compatibility with stdin/stdout/stderr
- **🔧 Zero dependencies**: Pure Rust wrapper, no Node.js bundling
- **📱 Cross-platform**: Supports macOS, Windows, and Linux

## 🛠️ Installation

### macOS (ARM64 - M1/M2)
```bash
# Download and make executable
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-darwin-arm64
chmod +x research-cli

# Run
./research-cli
```

### Requirements

- Node.js (required for Research CLI core functionality)
- Built Research CLI packages in your project

## 🔧 Technical Details

This wrapper is built with Rust and directly executes the Research CLI Node.js process, inheriting all stdio streams for a completely native terminal experience. Unlike previous packaging attempts with Electron or bundled Node.js, this approach provides:

- **Minimal footprint**: No bundled runtime or web interface
- **Native performance**: Direct process execution
- **Full compatibility**: Works exactly like running `node packages/cli/dist/index.js`

## 🆚 Comparison with Previous Approaches

| Approach | Size | Experience | Performance |
|----------|------|------------|-------------|
| PKG bundling | 60-75MB | Native CLI | Good |
| Tauri + Web UI | 12MB | Custom interface | Good |
| **Native wrapper** | **431KB** | **Native CLI** | **Excellent** |

Built: 2025-07-17T06:20:47.029Z