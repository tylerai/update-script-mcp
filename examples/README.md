# Update Script MCP Examples

This directory contains examples and demos for using the Update Script MCP server.

## Contents

- **feature-demo.js**: A comprehensive demo script that tests all features of the Update Script MCP server
- **demo-project/**: A sample project structure for testing documentation generation and other features

## Running the Feature Demo

To run the feature demo:

```bash
# Make sure the script is executable
chmod +x feature-demo.js

# Run the demo
./feature-demo.js
```

The demo script will:

1. Start the Update Script MCP server
2. Connect to the server using the MCP client
3. List all available tools
4. Test each feature with example commands
5. Show the results of each operation

## Testing File Watching

The demo includes a test of the file watching feature. To test this manually:

1. Start the Update Script MCP server
2. Run the following command to start watching a project:
   ```
   mcp.callTool('watch_project', {
     cwd: '/path/to/project',
     debounceMs: 2000
   })
   ```
3. Make changes to files in the project
4. Observe that the documentation is automatically updated
5. Stop watching with:
   ```
   mcp.callTool('stop_watching', {
     cwd: '/path/to/project'
   })
   ```

## Custom Templates

The demo also shows how to create a new project from a template:

```javascript
const templateResult = await mcp.callTool('custom_template_js', {
  projectName: 'my-app',
  projectPath: '/path/to/my-app'
});
```

## Other Features

The demo script demonstrates all other features of the Update Script MCP server, including:

- Dependency analysis
- Code metrics generation
- Visual diagram creation
- Update history listing 