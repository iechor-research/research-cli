# Research CLI tools

The Research CLI includes built-in tools that the Research model uses to interact with your local environment, access information, and perform actions. These tools enhance the CLI's capabilities, enabling it to go beyond text generation and assist with a wide range of tasks.

## Overview of Research CLI tools

In the context of the Research CLI, tools are specific functions or modules that the Research model can request to be executed. For example, if you ask Research to "Summarize the contents of `my_document.txt`," the model will likely identify the need to read that file and will request the execution of the `read_file` tool.

The core component (`packages/core`) manages these tools, presents their definitions (schemas) to the Research model, executes them when requested, and returns the results to the model for further processing into a user-facing response.

These tools provide the following capabilities:

- **Access local information:** Tools allow Research to access your local file system, read file contents, list directories, etc.
- **Execute commands:** With tools like `run_shell_command`, Research can run shell commands (with appropriate safety measures and user confirmation).
- **Interact with the web:** Tools can fetch content from URLs.
- **Take actions:** Tools can modify files, write new files, or perform other actions on your system (again, typically with safeguards).
- **Ground responses:** By using tools to fetch real-time or specific local data, Research's responses can be more accurate, relevant, and grounded in your actual context.

## How to use Research CLI tools

To use Research CLI tools, provide a prompt to the Research CLI. The process works as follows:

1.  You provide a prompt to the Research CLI.
2.  The CLI sends the prompt to the core.
3.  The core, along with your prompt and conversation history, sends a list of available tools and their descriptions/schemas to the Research API.
4.  The Research model analyzes your request. If it determines that a tool is needed, its response will include a request to execute a specific tool with certain parameters.
5.  The core receives this tool request, validates it, and (often after user confirmation for sensitive operations) executes the tool.
6.  The output from the tool is sent back to the Research model.
7.  The Research model uses the tool's output to formulate its final answer, which is then sent back through the core to the CLI and displayed to you.

You will typically see messages in the CLI indicating when a tool is being called and whether it succeeded or failed.

## Security and confirmation

Many tools, especially those that can modify your file system or execute commands (`write_file`, `edit`, `run_shell_command`), are designed with safety in mind. The Research CLI will typically:

- **Require confirmation:** Prompt you before executing potentially sensitive operations, showing you what action is about to be taken.
- **Utilize sandboxing:** All tools are subject to restrictions enforced by sandboxing (see [Sandboxing in the Research CLI](../sandbox.md)). This means that when operating in a sandbox, any tools (including MCP servers) you wish to use must be available _inside_ the sandbox environment. For example, to run an MCP server through `npx`, the `npx` executable must be installed within the sandbox's Docker image or be available in the `sandbox-exec` environment.

It's important to always review confirmation prompts carefully before allowing a tool to proceed.

## Learn more about Research CLI's tools

Research CLI's built-in tools can be broadly categorized as follows:

- **[Research Tools](./research-tools.md):** Comprehensive academic research suite including paper writing, bibliography management, data analysis, and journal submission tools.
- **[File System Tools](./file-system.md):** For interacting with files and directories (reading, writing, listing, searching, etc.).
- **[Shell Tool](./shell.md) (`run_shell_command`):** For executing shell commands.
- **[Web Fetch Tool](./web-fetch.md) (`web_fetch`):** For retrieving content from URLs.
- **[Web Search Tool](./web-search.md) (`web_search`):** For performing web searches.
- **[Memory Tool](./memory.md) (`save_memory`):** For saving information to the AI's memory.
- **[Multi-file Tool](./multi-file.md) (`read_many_files`):** For reading and processing multiple files at once.
- **[MCP Server Tools](./mcp-server.md):** For integrating with Model Context Protocol servers to extend functionality.
