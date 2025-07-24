# Research CLI Native Wrapper v0.2.6

## 🎯 What's New

This is a **native wrapper** for Research CLI that provides the **original terminal experience** with minimal overhead.

## ✨ Key Features

- **🚀 Ultra-lightweight**: Only 431KB (99% smaller than previous packaging attempts)
- **⚡ Lightning fast**: Direct process execution, no web interface overhead
- **🖥️ Native experience**: Full terminal compatibility with stdin/stdout/stderr
- **🔧 Zero dependencies**: Pure Rust wrapper, no Node.js bundling
- **📱 Cross-platform**: Supports macOS, Windows, and Linux

## 📦 Downloads

| Platform | Architecture  | Download                     | Size   |
| -------- | ------------- | ---------------------------- | ------ |
| macOS    | ARM64 (M1/M2) | `research-cli-darwin-arm64`  | 431KB  |
| macOS    | x64 (Intel)   | `research-cli-darwin-x64`    | ~450KB |
| Windows  | x64           | `research-cli-win32-x64.exe` | ~400KB |
| Linux    | x64           | `research-cli-linux-x64`     | ~420KB |

## 🛠️ Installation

1. Download the appropriate binary for your platform
2. Make it executable (Unix/Linux/macOS):
   ```bash
   chmod +x research-cli-darwin-arm64
   ```
3. Run it:
   ```bash
   ./research-cli-darwin-arm64
   ```

## 📋 Requirements

- Node.js (required for Research CLI core functionality)
- Built Research CLI packages in your project

## 🔧 Technical Details

This wrapper is built with Rust and directly executes the Research CLI Node.js process, inheriting all stdio streams for a completely native terminal experience. Unlike previous packaging attempts with Electron or bundled Node.js, this approach provides:

- **Minimal footprint**: No bundled runtime or web interface
- **Native performance**: Direct process execution
- **Full compatibility**: Works exactly like running `node packages/cli/dist/index.js`

## 🆚 Comparison with Previous Approaches

| Approach           | Size      | Experience       | Performance   |
| ------------------ | --------- | ---------------- | ------------- |
| PKG bundling       | 60-75MB   | Native CLI       | Good          |
| Tauri + Web UI     | 12MB      | Custom interface | Good          |
| **Native wrapper** | **431KB** | **Native CLI**   | **Excellent** |

Built: 2025-07-17T06:13:30.844Z
