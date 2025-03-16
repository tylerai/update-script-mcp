# Update Script MCP

An MCP (Model Context Protocol) server for automatically generating and maintaining project structure documentation. Designed to work seamlessly with Cursor IDE.

## Overview

Update Script MCP provides tools to automatically document your project's structure, making it easier for developers to understand the codebase. It generates a comprehensive `project-structure.md` file that includes:

- Directory structure visualization
- Key components overview
- Dependencies listing
- Custom documentation sections (when using custom scripts)

## Features

- **Universal Documentation Generation**: Works with any project type without configuration
- **Custom Script Support**: Use your own documentation scripts if needed
- **File Watching**: Automatically update documentation when files change
- **History Tracking**: Keep track of update operations
- **MCP Integration**: Seamless integration with Cursor's MCP protocol
- **Project Templates**: Create new JavaScript projects from templates
- **Dependency Analysis**: Generate dependency graphs and reports
- **Code Metrics**: Analyze code complexity, size, and structure
- **Visual Diagrams**: Create visual diagrams of project architecture

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/update-script-mcp.git

# Install dependencies
cd update-script-mcp
npm install

# Build the project
npm run build

# Create a symlink to make it accessible globally
ln -sf $(pwd)/dist/index.js /path/to/your/bin/update-script-mcp
chmod +x /path/to/your/bin/update-script-mcp
```

Ensure that `/path/to/your/bin` is in your PATH environment variable.

## Available Tools

Update Script MCP provides the following tools:

### 1. run_update

Generates or updates the project structure documentation.

**Parameters:**
- `cwd` (optional): The directory to document (defaults to current working directory)

### 2. list_updates

Lists recent update operations and their results.

**Parameters:**
- None

### 3. watch_project

Starts watching a project for changes and automatically updates documentation when files change.

**Parameters:**
- `cwd` (optional): The directory to watch (defaults to current working directory)
- `debounceMs` (optional): Debounce time in milliseconds (defaults to 1000ms)

### 4. stop_watching

Stops watching a project for changes.

**Parameters:**
- `cwd` (optional): The directory to stop watching (defaults to current working directory)

### 5. custom_template_js

Creates a new JavaScript project using the blank-js template.

**Parameters:**
- `projectName` (optional): Name of the new project (defaults to "new-js-project")
- `projectPath` (optional): Custom path for the project (defaults to current directory + project name)

### 6. analyze_dependencies

Analyzes project dependencies and generates a dependency graph.

**Parameters:**
- `cwd` (optional): Project directory to analyze (defaults to current working directory)
- `format` (optional): Output format - "json", "markdown", or "dot" (defaults to "markdown")
- `includeNodeModules` (optional): Whether to include node_modules dependencies (defaults to false)
- `depth` (optional): Maximum depth for dependency analysis (defaults to 3)

### 7. generate_metrics

Generates code metrics including complexity, lines of code, functions, etc.

**Parameters:**
- `cwd` (optional): Project directory to analyze (defaults to current working directory)
- `includeComplexity` (optional): Whether to include complexity metrics (defaults to true)
- `includeCoverage` (optional): Whether to include coverage data if available (defaults to false)
- `includeLocMetrics` (optional): Whether to include lines of code metrics (defaults to true)
- `outputFormat` (optional): Output format - "json" or "markdown" (defaults to "markdown")

### 8. create_visual_diagram

Creates visual diagrams of project structure, dependencies, or components.

**Parameters:**
- `cwd` (optional): Project directory to diagram (defaults to current working directory)
- `type` (optional): Type of diagram - "structure", "dependencies", "components", or "all" (defaults to "structure")
- `format` (optional): Output format - "mermaid", "dot", "svg", or "png" (defaults to "mermaid")
- `outputPath` (optional): Custom output path for the diagram (defaults to docs/diagrams)

## Usage in Cursor

1. Start Cursor
2. Go to Settings > Features > MCP
3. Ensure "Update Script" is listed with the command `update-script-mcp`
4. Open the MCP tools panel (⌘⇧P on Mac, Ctrl+Shift+P on Windows/Linux)
5. Search for and select one of the Update Script tools

## Command Line Usage

```bash
# Start the MCP server
update-script-mcp [options]

# Options:
#   --rootPath <path>  Path to store history and configuration
```

## How It Works

### Documentation Generation

When you call `run_update`, the server:

1. Checks if a custom script exists at `.scripts/update_structure.sh`
2. If the custom script exists, it executes it
3. If not, it uses the universal implementation to:
   - Create a `docs/architecture` directory if it doesn't exist
   - Generate a `project-structure.md` file with:
     - Directory structure visualization
     - Key components overview
     - Dependencies listing
   - Save the update to history

### File Watching

When you call `watch_project`, the server:

1. Sets up a file watcher using chokidar to monitor project changes
2. Excludes common directories like `node_modules`, `.git`, etc.
3. When changes are detected, it automatically runs an update after a debounce period
4. The watcher continues until `stop_watching` is called or the server is terminated

### Project Templates

The `custom_template_js` tool provides:

1. A starting template for JavaScript/TypeScript projects with Next.js, React, and Tailwind CSS
2. Automatic project initialization with the correct dependencies
3. Git repository setup and basic project structure

### Dependency Analysis

The `analyze_dependencies` tool:

1. Scans your project for imported modules
2. Builds a dependency graph showing relationships between files
3. Identifies key dependencies and potential issues
4. Outputs the analysis in several formats (markdown, JSON, DOT)

### Code Metrics

The `generate_metrics` tool analyzes:

1. Lines of code (total, source, comments)
2. Cyclomatic complexity
3. Function and class counts
4. File and directory statistics
5. Language breakdown

### Visual Diagrams

The `create_visual_diagram` tool generates:

1. Project structure diagrams showing directory layout
2. Dependency diagrams showing file relationships
3. Component diagrams for React/UI components
4. Outputs in formats like Mermaid markdown or DOT for further processing

## Custom Documentation Script

To use a custom documentation script:

1. Create a file at `.scripts/update_structure.sh` in your project
2. Make it executable: `chmod +x .scripts/update_structure.sh`
3. Implement your custom documentation logic

Example custom script:

```bash
#!/bin/bash

# Create directories if they don't exist
mkdir -p docs/architecture

# Generate documentation
echo "# My Project Structure" > docs/architecture/project-structure.md
echo "" >> docs/architecture/project-structure.md
echo "## Custom Documentation" >> docs/architecture/project-structure.md

# Add more sections as needed...

echo "Documentation updated!"
```

## Dependencies

- **@modelcontextprotocol/sdk**: For MCP server implementation
- **chokidar**: For file watching capability
- **fs-extra**: For enhanced file system operations
- **glob**: For finding files based on patterns
- **tailwindcss**: For template support

## Development

```bash
# Run in development mode
npm run dev

# Build the project
npm run build
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
