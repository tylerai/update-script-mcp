# MCP Integration Details

This document explains how Update Script MCP integrates with the Model Context Protocol (MCP) and how it interfaces with Cursor IDE.

## What is MCP?

The Model Context Protocol (MCP) is a standardized protocol for communication between AI assistants and external tools. It allows AI assistants to access and manipulate data outside their context window through specialized tools.

## How Update Script MCP Uses the Protocol

Update Script MCP implements the MCP protocol to provide project structure documentation tools to AI assistants within Cursor IDE. The implementation follows best practices:

1. **Tool Registration**: The server registers four tools with the MCP protocol:
   - `run_update`: Generates project structure documentation
   - `list_updates`: Lists recent update operations
   - `watch_project`: Starts watching a project for file changes
   - `stop_watching`: Stops project watching

2. **Stdio Communication**: Uses the `StdioServerTransport` for communication with Cursor

3. **Error Handling**: Implements proper error handling with MCP error codes

4. **Type Safety**: Maintains type safety throughout the codebase

## MCP Server Architecture

The Update Script MCP server follows a standard architecture:

```
└── src/
    ├── index.ts              # Main server entry point and MCP implementation
    ├── services/
    │   └── FileHandler.ts    # Core functionality for handling update operations
    └── types.ts              # TypeScript types and interfaces
```

### Server Initialization

The server initializes with:

1. Configuration loading (from environment or arguments)
2. FileHandler initialization
3. MCP Server creation and tool registration
4. Connection establishment via StdioServerTransport

### Tool Registration

Tools are registered with schemas defining their parameters:

```typescript
const updateScriptTools = {
  run_update: {
    name: "run_update",
    description: "Generate or update the project structure documentation",
    inputSchema: {
      type: "object",
      properties: {
        cwd: { type: "string" },
      },
      required: [],
    },
  },
  // Additional tools...
};
```

### Request Handling

Incoming requests are validated and routed to the appropriate handler:

```typescript
this.server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest): Promise<ServerResult> => {
    const { name, arguments: args } = request.params;
    // Validation and command handling...
    const result = await this.fileHandler.handleCommand(command);
    // Result formatting...
  }
);
```

## Integration with Cursor IDE

### Configuration in Cursor

To add the Update Script MCP server to Cursor:

1. Go to Settings > Features > MCP
2. Add a new MCP server with:
   - **Command**: `update-script-mcp`
   - **Arguments**: Optional flags like `--rootPath`

### How Cursor Interacts with the Server

1. Cursor spawns the MCP server as a child process
2. Communication occurs via stdin/stdout using the MCP protocol
3. Tool invocations from the AI assistant are passed to the server
4. Results are returned to the AI assistant

## Debugging MCP Integration

When debugging MCP integration issues:

1. Check the Cursor Developer Tools console for errors
2. Verify the server is executing with `ps aux | grep update-script-mcp`
3. Test the server directly with the demo script in `examples/demo.js`
4. Check for issues in the MCP transport by running the server with verbose logging

## Custom Server Options

The server supports custom options:

- `--rootPath`: Specify a custom path for storing history and configuration

## Security Considerations

The Update Script MCP server follows security best practices:

1. Operates only on the file system (no network access)
2. Validates all inputs before processing
3. Prevents directory traversal attacks
4. Uses proper error handling

## Resources

- [MCP Protocol Specification](https://github.com/cursor-io/model-context-protocol)
- [MCP SDK Documentation](https://github.com/cursor-io/model-context-protocol/tree/main/typescript/sdk)
- [Cursor MCP Documentation](https://cursor.sh/docs/mcp) 