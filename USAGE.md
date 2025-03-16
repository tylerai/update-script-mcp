# Update Script MCP Usage Guide

This guide provides detailed instructions on how to use the Update Script MCP server effectively within Cursor IDE and other compatible environments.

## Setting Up in Cursor

### Initial Setup

1. Ensure you have installed the Update Script MCP server:
   ```bash
   npm install -g update-script-mcp
   ```

2. Open Cursor IDE
3. Navigate to Settings > Features > MCP
4. Click "Add MCP Server"
5. Enter the following:
   - **Server Name**: Update Script
   - **Command**: update-script-mcp
   - **Arguments**: Leave empty or add `--rootPath /custom/path` if needed

### Using Tools in Cursor

1. Open the MCP tools panel with ⌘⇧P (Mac) or Ctrl+Shift+P (Windows/Linux)
2. Type "Update Script" to see available tools
3. Select the desired tool:

#### run_update

This tool generates or updates project structure documentation.

**When to use**: 
- When starting a new project
- After making significant changes to project structure
- When you want to refresh documentation

**Example**: 
1. Select "run_update" from the tools list
2. Optionally provide a custom working directory
3. The tool will create `docs/architecture/project-structure.md`

#### watch_project

This tool starts watching your project for changes and automatically updates documentation.

**When to use**:
- During active development
- When you want documentation to stay current without manual intervention

**Example**:
1. Select "watch_project" from the tools list
2. Optionally specify:
   - Custom working directory
   - Debounce time in milliseconds (default: 1000ms)
3. Make changes to your project and watch the documentation update automatically

#### stop_watching

This tool stops the file watcher for a specific project.

**When to use**:
- When you're done with development
- To conserve system resources
- When you no longer need automatic updates

**Example**:
1. Select "stop_watching" from the tools list
2. Optionally provide the project directory (if different from current)

#### list_updates

This tool shows recent update operations and their results.

**When to use**:
- To check the history of documentation updates
- To verify if updates completed successfully
- To troubleshoot issues with updates

**Example**:
1. Select "list_updates" from the tools list
2. View the history of recent updates with timestamps and status

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

## Troubleshooting

### Common Issues

1. **Documentation not generating**:
   - Check if you have necessary permissions in the target directory
   - Verify the project path is correct
   - Check for errors in your custom script (if used)

2. **File watcher not detecting changes**:
   - Ensure you're modifying files that aren't in ignored directories
   - Verify the watcher is running with `list_updates`

3. **Server not connecting**:
   - Check that `update-script-mcp` is in your PATH
   - Restart Cursor IDE
   - Verify MCP server configuration 