# Update Script MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Actions](https://github.com/tylerbuilds/update-script-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/tylerbuilds/update-script-mcp/actions/workflows/ci.yml)
[![GitHub issues](https://img.shields.io/github/issues/tylerbuilds/update-script-mcp)](https://github.com/tylerbuilds/update-script-mcp/issues)
[![GitHub stars](https://img.shields.io/github/stars/tylerbuilds/update-script-mcp)](https://github.com/tylerbuilds/update-script-mcp/stargazers)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/tylerbuilds/update-script-mcp)](https://github.com/tylerbuilds/update-script-mcp/pulls)

An MCP (Model Context Protocol) server for automatically generating and maintaining project structure documentation. Designed to work seamlessly with Cursor IDE.

## Overview

Update Script MCP provides tools to automatically document your project's structure, making it easier for developers to understand the codebase. It generates two main documentation files:

1. `project-structure.md` - Basic project structure documentation with:
   - Directory structure visualization
   - Key components overview
   - Dependencies listing

2. `project-memory.md` - Comprehensive AI-optimized memory bank that includes:
   - Project metadata
   - Executive summary
   - Directory hierarchy
   - Key files
   - Dependencies
   - AI context & guidance

## ✨ Key Features

- **One-Click Documentation**: Generate complete project documentation with a single command
- **AI-Optimized Memory Bank**: Create a comprehensive knowledge base for AI assistants
- **Zero Configuration**: Works with any project type without setup
- **Live Updates**: Automatically update documentation when files change
- **MCP Integration**: Seamless integration with Cursor's AI assistant
- **Project Templates**: Create new JavaScript projects from templates
- **Dependency Analysis**: Generate dependency graphs and reports
- **Code Metrics**: Analyze complexity, size, and structure
- **Visual Diagrams**: Create diagrams of project architecture

## 📋 Quick Start

### Installation

Since the package is not yet published to npm, install from GitHub:

```bash
# Clone the repository
git clone https://github.com/tylerbuilds/update-script-mcp.git

# Navigate to project directory
cd update-script-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Create a symlink to make it accessible globally
npm link
```

For detailed installation and usage instructions, see [USAGE.md](USAGE.md).

### Using with Cursor IDE

1. Open your project in Cursor
2. Press ⌘⇧P (Mac) or Ctrl+Shift+P (Windows/Linux) to open the command palette
3. Type "update script" to see available tools
4. Select `run_update` to generate documentation

### Documentation Location

After running the tools, documentation is generated at:

```
project-root/
└── docs/
    └── architecture/
        ├── project-structure.md   # Basic structure documentation
        └── project-memory.md      # Comprehensive AI-optimized memory bank
```

## 🛠️ Available Tools

Update Script MCP provides the following tools:

### 1. run_update

Generates or updates both the project structure documentation and AI memory bank.

**Parameters:**
- `cwd` (optional): The directory to document (defaults to current working directory)

### 2. generate_memory_bank

Generates only the AI-optimized memory bank file.

**Parameters:**
- `cwd` (optional): The directory to document (defaults to current working directory)

### 3. list_updates

Lists recent update operations and their results.

**Parameters:**
- None

### 4. watch_project

Starts watching a project for changes and automatically updates documentation.

**Parameters:**
- `cwd` (optional): The directory to watch (defaults to current working directory)
- `debounceMs` (optional): Debounce time in milliseconds (defaults to 1000ms)

### 5. stop_watching

Stops watching a project for changes.

**Parameters:**
- `cwd` (optional): The directory to stop watching (defaults to current working directory)

### 6. custom_template_js

Creates a new JavaScript project using the blank-js template.

**Parameters:**
- `projectName` (optional): Name of the new project (defaults to "new-js-project")
- `projectPath` (optional): Custom path for the project (defaults to current directory + project name)

### 7. analyze_dependencies

Analyzes project dependencies and generates a dependency graph.

**Parameters:**
- `cwd` (optional): Project directory to analyze (defaults to current working directory)
- `format` (optional): Output format - "json", "markdown", or "dot" (defaults to "markdown")
- `includeNodeModules` (optional): Whether to include node_modules dependencies (defaults to false)
- `depth` (optional): Maximum depth for dependency analysis (defaults to 3)

### 8. generate_metrics

Generates code metrics including complexity, lines of code, functions, etc.

**Parameters:**
- `cwd` (optional): Project directory to analyze (defaults to current working directory)
- `includeComplexity` (optional): Whether to include complexity metrics (defaults to true)
- `includeCoverage` (optional): Whether to include coverage data if available (defaults to false)
- `includeLocMetrics` (optional): Whether to include lines of code metrics (defaults to true)
- `outputFormat` (optional): Output format - "json" or "markdown" (defaults to "markdown")

### 9. create_visual_diagram

Creates visual diagrams of project structure, dependencies, or components.

**Parameters:**
- `cwd` (optional): Project directory to diagram (defaults to current working directory)
- `type` (optional): Type of diagram - "structure", "dependencies", "components", or "all" (defaults to "structure")
- `format` (optional): Output format - "mermaid", "dot", "svg", or "png" (defaults to "mermaid")
- `outputPath` (optional): Custom output path for the diagram (defaults to docs/diagrams)

## 📚 How It Works

### Documentation Generation

When you call `run_update`, the server automatically:

1. Creates a `docs/architecture` directory if it doesn't exist
2. Generates two files:
   - `project-structure.md`: Basic structure documentation
   - `project-memory.md`: AI-optimized memory bank
3. Saves the update to history for tracking

The memory bank contains additional AI-friendly sections that help AI assistants understand your project more effectively.

### Memory Bank Contents

The AI-optimized memory bank includes:

- **Project Metadata**: Name, version, path and generation date
- **Executive Summary**: Brief project overview
- **AI Navigation Guide**: Document structure explanation
- **Project Structure**: Directory hierarchy and core directories
- **Key Files**: Important files and their purposes
- **Dependencies**: Primary and development dependencies
- **AI Context & Guidance**: Tips for AI assistants working with the project

This structured format makes it easier for AI systems to understand your codebase and provide more accurate assistance.

### No Setup Required

The documentation is created **automatically** without any setup required. You don't need to initialize anything—just run the tool and the documentation will be generated.

## 💡 Tips

- Use `watch_project` for live documentation updates during development
- The AI memory bank works best when referenced by AI assistants in Cursor
- For custom documentation, create a script at `.scripts/update_structure.sh`
- For large projects, use `analyze_dependencies` with a lower depth value

## 🔍 Troubleshooting

If you encounter issues:

1. Check that Cursor's MCP integration is enabled
2. Ensure the update-script-mcp command is in your PATH
3. Try running with `--rootPath` set to a writable directory

For more help, see [USAGE.md](USAGE.md).

## 📦 Dependencies

- **@modelcontextprotocol/sdk**: For MCP server implementation
- **chokidar**: For file watching capability
- **fs-extra**: For enhanced file system operations

## 📄 License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
