# Research CLI Standalone Packaging

This document describes how to create standalone packages for Research CLI, similar to the `agent-cli-package.tar.gz` structure.

## Overview

The standalone packaging creates a self-contained tar.gz file that includes:
- Built CLI application files
- Node.js runtime binary (no need for system Node.js)
- All required dependencies (node_modules)
- Shell wrapper script for easy execution

## Package Structure

The generated package follows this structure:

```
dist-package/
├── research-cli          # Main executable wrapper script
├── node                  # Bundled Node.js binary
├── package.json          # Package metadata
├── dist/                 # Built CLI application
│   └── index.js          # Main application entry point
├── bin/                  # CLI binary files
│   ├── research
│   └── research.js
└── node_modules/         # Production dependencies
    └── ...
```

## Building Standalone Packages

### Simple Approach (Recommended)

Use the simple standalone packaging approach which includes built files with dependencies:

```bash
npm run build:standalone-simple
```

This creates: `research-cli-standalone-{platform}-{arch}.tar.gz`

### Advanced Bundling Approach

For a more compact package with bundled JavaScript:

```bash
npm run build:standalone
```

**Note:** This approach may have compatibility issues with some dependencies that use dynamic requires.

## Package Details

### Generated Package Info
- **Size**: ~48MB (includes Node.js runtime + dependencies)
- **Platform**: Automatically detects current platform (darwin-arm64, linux-x64, etc.)
- **Node.js Version**: v20.18.1 (LTS)
- **Self-contained**: No external dependencies required

### Wrapper Script Features
- Handles symlinks properly
- Sets appropriate NODE_PATH for bundled modules
- Provides helpful error messages
- Executes with bundled Node.js binary

## Usage

### Extract and Run
```bash
# Extract the package
tar -xzf research-cli-standalone-darwin-arm64.tar.gz

# Run directly
./dist-package/research-cli --version
./dist-package/research-cli --help

# Test functionality
./dist-package/research-cli -p "Hello, world!"
```

### System Installation
```bash
# Install globally (requires sudo)
sudo cp dist-package/research-cli /usr/local/bin/research-cli

# Or install in user directory
mkdir -p ~/bin
cp dist-package/research-cli ~/bin/
export PATH="$HOME/bin:$PATH"
```

## Comparison with agent-cli-package.tar.gz

| Feature | agent-cli-package.tar.gz | research-cli-standalone |
|---------|-------------------------|------------------------|
| Size | ~132MB | ~48MB |
| Structure | Single bundled JS file | Built files + node_modules |
| Node.js Binary | ✅ Included | ✅ Included |
| Native Modules | ✅ SQLite3 | ⚠️ Optional dependencies |
| Wrapper Script | ✅ Bash script | ✅ Enhanced bash script |
| Self-contained | ✅ Yes | ✅ Yes |

## Cross-Platform Building

The current implementation builds for the current platform. To build for multiple platforms:

1. **Manual approach**: Run the build script on each target platform
2. **CI/CD approach**: Use GitHub Actions or similar to build for multiple platforms
3. **Docker approach**: Use Docker containers for different platforms

## Troubleshooting

### Common Issues

1. **Node.js binary download fails**: 
   - Manual solution: `cp $(which node) dist-package/node`
   
2. **Missing native modules**:
   - Some optional dependencies may not be included
   - Test thoroughly on target systems

3. **Permission issues**:
   - Ensure wrapper script is executable: `chmod +x research-cli`

### Debugging

Enable debug mode to see detailed execution:
```bash
DEBUG=1 ./dist-package/research-cli --version
```

## Future Improvements

1. **Multi-platform builds**: Automate building for Linux, macOS, Windows
2. **Size optimization**: Better dependency tree shaking
3. **Native module handling**: Improved detection and inclusion of platform-specific modules
4. **CI/CD integration**: Automated packaging in release pipeline
5. **Compression**: Use better compression algorithms for smaller packages

## Development

The packaging scripts are located in:
- `scripts/build-standalone-package.js` - Advanced bundling approach
- `scripts/build-simple-standalone-package.js` - Simple approach (recommended)

Both scripts can be customized for specific requirements or platforms.
