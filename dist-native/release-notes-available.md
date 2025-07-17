# Research CLI Native Wrapper v0.2.6

## 🎯 What's New

This is a **native wrapper** for Research CLI that provides the **original terminal experience** with minimal overhead.

## ✨ Key Features

- **🚀 Ultra-lightweight**: Only ~400-500KB per platform (99% smaller than previous packaging attempts)
- **⚡ Lightning fast**: Direct process execution, no web interface overhead  
- **🖥️ Native experience**: Full terminal compatibility with stdin/stdout/stderr
- **🔧 Zero dependencies**: Pure Rust wrapper, no Node.js bundling

## 📦 Available Downloads

| Platform | Architecture | Download | Size |
|----------|-------------|----------|------|
| **macOS Apple Silicon** | ARM64 | [`research-cli-darwin-arm64`](https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-darwin-arm64) | 431KB |
| **macOS Intel** | x64 | [`research-cli-darwin-x64`](https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-darwin-x64) | 420KB |

## 🛠️ Quick Installation

### macOS Apple Silicon (M1/M2/M3)
```bash
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-darwin-arm64
chmod +x research-cli && ./research-cli
```

### macOS Intel
```bash
curl -L -o research-cli https://github.com/iechor-research/research-cli/releases/download/v0.2.6-native/research-cli-darwin-x64
chmod +x research-cli && ./research-cli
```

## 📋 Requirements

- Node.js (required for Research CLI core functionality)
- Built Research CLI packages in your project

## 🔧 Technical Details

This wrapper is built with Rust and directly executes the Research CLI Node.js process, inheriting all stdio streams for a completely native terminal experience.

- **Minimal footprint**: No bundled runtime or web interface
- **Native performance**: Direct process execution
- **Full compatibility**: Works exactly like running `node packages/cli/dist/index.js`

## 🆚 Comparison with Previous Approaches

| Approach | Size | Experience | Performance |
|----------|------|------------|-------------|
| PKG bundling | 60-75MB | Native CLI | Good |
| Tauri + Web UI | 12MB | Custom interface | Good |
| **Native wrapper** | **~400-500KB** | **Native CLI** | **Excellent** |

Built: 2025-07-17T06:31:10.210Z