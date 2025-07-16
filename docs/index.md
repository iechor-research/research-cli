# Welcome to Research CLI documentation

This documentation provides a comprehensive guide to installing, using, and developing Research CLI. This tool lets you interact with Research models through a command-line interface and includes powerful academic research capabilities.

## Overview

Research CLI brings the capabilities of Research models to your terminal in an interactive Read-Eval-Print Loop (REPL) environment. Research CLI consists of a client-side application (`packages/cli`) that communicates with a local server (`packages/core`), which in turn manages requests to the Research API and its AI models. 

**New in this version:** Research CLI now includes a comprehensive suite of academic research tools for literature search, paper writing, data analysis, and journal submission - making it a complete research workflow platform.

## 🎓 Research Features

- **[Research Tools](./tools/research-tools.md):** Complete academic research workflow from literature search to paper submission
- **Paper Writing:** Outline generation, writing assistance, and LaTeX management
- **Bibliography Management:** Multi-database search with BibTeX support
- **Data Analysis:** Statistical analysis, machine learning, and visualization
- **Submission Tools:** Journal matching and submission preparation

## Navigating the documentation

This documentation is organized into the following sections:

- **[Execution and Deployment](./deployment.md):** Information for running Research CLI.
- **[Architecture Overview](./architecture.md):** Understand the high-level design of Research CLI, including its components and how they interact.
- **CLI Usage:** Documentation for `packages/cli`.
  - **[CLI Introduction](./cli/index.md):** Overview of the command-line interface.
  - **[Commands](./cli/commands.md):** Description of available CLI commands.
  - **[Configuration](./cli/configuration.md):** Information on configuring the CLI.
  - **[Checkpointing](./checkpointing.md):** Documentation for the checkpointing feature.
  - **[Extensions](./extension.md):** How to extend the CLI with new functionality.
  - **[Telemetry](./telemetry.md):** Overview of telemetry in the CLI.
- **Core Details:** Documentation for `packages/core`.
  - **[Core Introduction](./core/index.md):** Overview of the core component.
  - **[Tools API](./core/tools-api.md):** Information on how the core manages and exposes tools.
- **Tools:** Documentation for built-in tools.
  - **[Tools Overview](./tools/index.md):** Overview of all available tools.
  - **[Research Tools](./tools/research-tools.md):** Comprehensive academic research suite.
  - **[File System Tools](./tools/file-system.md):** For file and directory operations.
  - **[Shell Tool](./tools/shell.md):** For executing shell commands.
  - **[Web Tools](./tools/web-fetch.md):** For web content retrieval.
  - **[Memory Tool](./tools/memory.md):** For AI memory management.
  - **[MCP Server Tools](./tools/mcp-server.md):** For external tool integration.
- **Additional Information:**
  - **[Quota and Pricing](./quota-and-pricing.md):** Information on usage limits and costs.
  - **[Terms of Service and Privacy](./tos-privacy.md):** Legal and privacy information.
  - **[Troubleshooting](./troubleshooting.md):** Common issues and solutions.
  - **[Uninstall](./Uninstall.md):** How to remove Research CLI.

## Quick Start for Researchers

```bash
# Install Research CLI
npm install -g @iechor/research-cli

# Start the CLI
research

# Search for papers
/research search "machine learning" --source=arxiv --limit=10

# Generate paper outline
/paper outline "AI in Healthcare" --type=research --format=ieee

# Analyze your draft
/research analyze draft.tex --type=all

# Find suitable journals
/submit journal --topic "artificial intelligence"

# Prepare submission
/submit prepare --project ./my-paper --journal "Nature"
```

## Getting Started

For first-time users, we recommend starting with the [CLI Introduction](./cli/index.md) to understand the basic concepts and commands. Researchers should also explore the [Research Tools](./tools/research-tools.md) documentation to understand the full academic workflow capabilities.
