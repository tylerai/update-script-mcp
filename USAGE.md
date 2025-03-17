# Update Script MCP: Complete Guide

This comprehensive guide covers how to install, configure, and use the Update Script MCP server effectively within Cursor IDE and other compatible environments.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Cursor IDE (for MCP integration)

## Installation

### Method 1: Install from GitHub (Recommended)

Since the package is not yet published to npm, this is currently the recommended installation method:

```bash
# Clone the repository
git clone https://github.com/username/update-script-mcp.git

# Navigate to project directory
cd update-script-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Create a symlink to make it accessible globally
npm link
```

#### Required Dependencies

When installing from GitHub, the following dependencies will be installed automatically from package.json. If you need to install them manually:

```bash
# Install core dependencies
npm install @modelcontextprotocol/sdk@^1.5.0 chokidar@^3.5.3 fs-extra@^11.2.0 glob@^10.3.10

# Install development dependencies
npm install --save-dev typescript@^5.3.3 @types/node@^20.11.19 @types/fs-extra@^11.0.4 @types/glob@^8.1.0
```

These are the key packages needed for the project to function properly:

- **@modelcontextprotocol/sdk**: For MCP server implementation
- **chokidar**: For file watching capability
- **fs-extra**: For enhanced file system operations
- **glob**: For finding files based on patterns
- **typescript**: For TypeScript compilation

### Method 2: Install from npm (Coming Soon)

> **Note:** This method will be available after the package is published to npm.

Once published, you'll be able to install globally with:

```bash
# Install globally
npm install -g update-script-mcp

# Verify installation
update-script-mcp --version
```

### Method 3: Local Project Installation

For development within a specific project:

```bash
# Navigate to your project
cd your-project

# Clone the repository to a local folder
git clone https://github.com/username/update-script-mcp.git ./tools/update-script-mcp

# Navigate to the tool directory
cd ./tools/update-script-mcp

# Install dependencies and build
npm install
npm run build

# Navigate back to your project
cd ../..

# Use the tool with relative path
./tools/update-script-mcp/dist/index.js
```

## Verifying Installation

Run this test script to verify your installation is working correctly:

```bash
# Create a test script
cat > test-mcp.js << 'EOF'
// Test script to verify MCP integration
import { spawn } from 'child_process';
import { join } from 'path';
import fs from 'fs';

async function testMcp() {
  console.log('Starting MCP server process...');
  
  // Create a process that runs the server
  const serverProcess = spawn('update-script-mcp', [], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });
  
  // Log server output
  serverProcess.stdout.on('data', (data) => {
    console.log(`Server stdout: ${data}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`Server stderr: ${data}`);
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Sending run_update tool call...');
  
  // Send a tool call request
  const request = {
    jsonrpc: "2.0",
    id: "test-1",
    method: "call_tool",
    params: {
      name: "run_update",
      arguments: {
        cwd: process.cwd()
      }
    }
  };
  
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
  
  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Check if files were created
  const structurePath = join(process.cwd(), 'docs/architecture/project-structure.md');
  const memoryPath = join(process.cwd(), 'docs/architecture/project-memory.md');
  
  if (fs.existsSync(structurePath)) {
    console.log('✅ project-structure.md created successfully');
  } else {
    console.log('❌ project-structure.md was not created');
  }
  
  if (fs.existsSync(memoryPath)) {
    console.log('✅ project-memory.md created successfully');
  } else {
    console.log('❌ project-memory.md was not created');
  }
  
  // Kill the server process
  serverProcess.kill();
}

testMcp().catch(err => {
  console.error('Error:', err);
});
EOF

# Run the test script
node test-mcp.js
```

## Setting Up in Cursor

### Initial Setup

1. Open Cursor IDE
2. Navigate to Settings > Features > MCP
3. Click "Add MCP Server"
4. Enter the following:
   - **Server Name**: Update Script
   - **Command**: Based on your installation method:
     - If installed via npm link: `update-script-mcp`
     - If installed locally: `/absolute/path/to/your/tools/update-script-mcp/dist/index.js`
   - **Arguments**: Leave empty or add `--rootPath /custom/path` if needed
5. Restart Cursor IDE

### Using Tools in Cursor

1. Open the MCP tools panel with ⌘⇧P (Mac) or Ctrl+Shift+P (Windows/Linux)
2. Type "Update Script" to see available tools
3. Select the desired tool:

## Available Tools

### 1. run_update

Generates or updates both project structure documentation and AI memory bank.

**When to use**: 
- When starting a new project
- After making significant changes to project structure
- When you want to refresh documentation

**Example**: 
1. Select "run_update" from the tools list
2. Optionally provide a custom working directory
3. The tool will create:
   - `docs/architecture/project-structure.md` - Basic project structure
   - `docs/architecture/project-memory.md` - AI-optimized memory bank

### 2. generate_memory_bank

Generates only the AI-optimized memory bank file.

**When to use**:
- When you specifically need to update the AI memory bank
- When you want AI assistants to have better context about your project

**Example**:
1. Select "generate_memory_bank" from the tools list
2. Optionally provide a custom working directory
3. The tool will create `docs/architecture/project-memory.md`

### 3. watch_project

Starts watching a project for changes and automatically updates documentation.

**When to use**:
- During active development
- When you want documentation to stay current without manual intervention

**Example**:
1. Select "watch_project" from the tools list
2. Optionally specify:
   - Custom working directory
   - Debounce time in milliseconds (default: 1000ms)
3. Make changes to your project and watch the documentation update automatically

### 4. stop_watching

Stops watching a project for changes.

**When to use**:
- When you're done with development
- To conserve system resources
- When you no longer need automatic updates

**Example**:
1. Select "stop_watching" from the tools list
2. Optionally provide the project directory (if different from current)

### 5. list_updates

Shows recent update operations and their results.

**When to use**:
- To check the history of documentation updates
- To verify if updates completed successfully
- To troubleshoot issues with updates

**Example**:
1. Select "list_updates" from the tools list
2. View the history of recent updates with timestamps and status

### 6. custom_template_js

Creates a new JavaScript project using the blank-js template.

**When to use**:
- When starting a new JavaScript/TypeScript project
- When you want a pre-configured project structure

**Example**:
1. Select "custom_template_js" from the tools list
2. Optionally specify:
   - Project name
   - Project path

### 7. analyze_dependencies

Analyzes project dependencies and generates a dependency graph.

**When to use**:
- To understand project dependencies
- To identify dependency issues
- To document relationships between modules

**Example**:
1. Select "analyze_dependencies" from the tools list
2. Optionally specify:
   - Custom working directory
   - Output format (json, markdown, dot)
   - Whether to include node_modules
   - Maximum depth for dependency analysis

### 8. generate_metrics

Generates code metrics including complexity, lines of code, functions, etc.

**When to use**:
- To measure code complexity
- To identify potential refactoring targets
- To document code size and structure

**Example**:
1. Select "generate_metrics" from the tools list
2. Optionally specify:
   - Custom working directory
   - Whether to include complexity metrics
   - Whether to include coverage data
   - Whether to include lines of code metrics
   - Output format (json, markdown)

### 9. create_visual_diagram

Creates visual diagrams of project structure, dependencies, or components.

**When to use**:
- To visualize project architecture
- To document component relationships
- To create diagrams for documentation

**Example**:
1. Select "create_visual_diagram" from the tools list
2. Optionally specify:
   - Custom working directory
   - Diagram type (structure, dependencies, components, all)
   - Output format (mermaid, dot, svg, png)
   - Custom output path

## Command Line Usage

```bash
# Start the MCP server
update-script-mcp [options]

# Options:
#   --rootPath <path>  Path to store history and configuration
```

## Using Custom Documentation Scripts

If you need more customized documentation than the universal implementation provides:

1. Create a file at `.scripts/update_structure.sh` in your project root
2. Make it executable with `chmod +x .scripts/update_structure.sh`
3. Implement your custom documentation logic

The Update Script MCP server will automatically detect and use your custom script instead of the universal implementation.

### Example Custom Script

```bash
#!/bin/bash

# Create directories if they don't exist
mkdir -p docs/architecture

# Generate documentation 
echo "# Project: $(basename $(pwd))" > docs/architecture/project-structure.md
echo "" >> docs/architecture/project-structure.md
echo "Last updated: $(date)" >> docs/architecture/project-structure.md
echo "" >> docs/architecture/project-structure.md

# Add custom sections
echo "## Key Features" >> docs/architecture/project-structure.md
echo "" >> docs/architecture/project-structure.md
echo "- Feature 1: Description" >> docs/architecture/project-structure.md
echo "- Feature 2: Description" >> docs/architecture/project-structure.md
echo "" >> docs/architecture/project-structure.md

# List directories
echo "## Directory Structure" >> docs/architecture/project-structure.md
echo "" >> docs/architecture/project-structure.md
echo "\`\`\`" >> docs/architecture/project-structure.md
find . -type d -not -path "*/\.*" -not -path "*/node_modules/*" | sort >> docs/architecture/project-structure.md
echo "\`\`\`" >> docs/architecture/project-structure.md

echo "Documentation updated successfully!"
```

## Programmatic Usage

You can also use the Update Script MCP server programmatically using the MCP SDK:

```javascript
const { MCP } = require('@modelcontextprotocol/sdk');

async function updateProjectDocs() {
  // Create MCP client
  const mcp = new MCP();
  
  // Connect to the running MCP server
  await mcp.connect();
  
  // Call the run_update tool
  const result = await mcp.callTool('run_update', {
    cwd: '/path/to/your/project'
  });
  
  console.log(result);
  
  // Close the connection
  await mcp.close();
}

updateProjectDocs().catch(console.error);
```

For a complete example, see the demo script in the `examples` directory.

## Documentation Output

After running the tools, documentation is generated at:

```
project-root/
└── docs/
    └── architecture/
        ├── project-structure.md   # Basic structure documentation
        └── project-memory.md      # Comprehensive AI-optimized memory bank
```

The project will automatically create all necessary directories and files the first time you run it.

## AI-Optimized Memory Bank

The memory bank file (`project-memory.md`) is designed to be a comprehensive reference for AI assistants. It includes:

- **Project Metadata**: Name, version, path and generation date
- **Executive Summary**: Brief project overview
- **AI Navigation Guide**: Document structure explanation
- **Project Structure**: Directory hierarchy and core directories
- **Key Files**: Important files and their purposes
- **Dependencies**: Primary and development dependencies
- **AI Context & Guidance**: Tips for AI assistants working with the project

This structured format makes it easier for AI systems to understand your codebase and provide more accurate assistance.

## Troubleshooting

### Common Issues

1. **Command not found** 
   ```
   update-script-mcp: command not found
   ```
   Solution: Ensure the package is installed via npm link or the binary path is correct in your PATH.

2. **MCP Tool not showing in Cursor**
   Solution: Verify the MCP configuration in Cursor settings and restart Cursor.

3. **No documentation generated**
   Solution: Check if you have the necessary permissions to create directories and files.

4. **Documentation not generating**:
   - Check if you have necessary permissions in the target directory
   - Verify the project path is correct
   - Check for errors in your custom script (if used)

5. **File watcher not detecting changes**:
   - Ensure you're modifying files that aren't in ignored directories
   - Verify the watcher is running with `list_updates`

6. **Server not connecting**:
   - Check that `update-script-mcp` is in your PATH (if installed via npm link)
   - If installed locally, make sure you're using the correct path
   - Restart Cursor IDE
   - Verify MCP server configuration

### Logs and Debugging

The MCP server logs errors to stderr. To capture detailed logs:

```bash
update-script-mcp 2> mcp-debug.log
```

## Tips for Effective Use

- Use `watch_project` for live documentation updates during development
- The AI memory bank works best when referenced by AI assistants in Cursor
- For custom documentation, create a script at `.scripts/update_structure.sh`
- For large projects, use `analyze_dependencies` with a lower depth value 