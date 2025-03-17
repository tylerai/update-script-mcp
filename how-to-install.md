# How to Install Update Script MCP

This guide explains how to install and set up the Update Script MCP for automatic project documentation.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Cursor IDE (for MCP integration)

## Installation Methods

### Method 1: Install from npm (Recommended)

```bash
# Install globally
npm install -g update-script-mcp

# Verify installation
update-script-mcp --version
```

### Method 2: Install from GitHub

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

If you're installing from GitHub and need to set up the project manually, ensure these core dependencies are installed:

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

### Method 3: Local Project Installation

```bash
# Navigate to your project
cd your-project

# Install as a dev dependency
npm install --save-dev update-script-mcp
```

## Cursor IDE Configuration

To use Update Script MCP with Cursor IDE:

1. Open Cursor IDE
2. Go to Settings > Features > MCP
3. Ensure "Update Script" is listed with the command `update-script-mcp`
   - If not, add it manually:
     - Name: Update Script
     - Command: update-script-mcp
4. Restart Cursor IDE

## Verifying Installation

To verify the installation and MCP integration:

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

## Basic Usage

### Using with Cursor IDE

1. Open your project in Cursor IDE
2. Open the MCP tools panel (⌘⇧P on Mac, Ctrl+Shift+P on Windows/Linux)
3. Search for and select one of the Update Script tools:
   - `run_update`: Generate or update both project structure and memory bank docs
   - `generate_memory_bank`: Generate only the AI-optimized memory bank
   - And other available tools

### Using from Command Line

```bash
# Start the MCP server
update-script-mcp [options]

# Options:
#   --rootPath <path>  Path to store history and configuration
```

## Troubleshooting

### Common Issues

1. **Command not found** 
   ```
   update-script-mcp: command not found
   ```
   Solution: Ensure the package is installed globally or the binary is in your PATH.

2. **MCP Tool not showing in Cursor**
   Solution: Verify the MCP configuration in Cursor settings and restart Cursor.

3. **No documentation generated**
   Solution: Check if you have the necessary permissions to create directories and files.

### Logs and Debugging

The MCP server logs errors to stderr. To capture detailed logs:

```bash
update-script-mcp 2> mcp-debug.log
```

## Working with Generated Documentation

After installation and running `run_update`, you'll find these files:

```
project-root/
└── docs/
    └── architecture/
        ├── project-structure.md   # Basic structure documentation
        └── project-memory.md      # Comprehensive AI-optimized memory bank
```

The project will automatically create all necessary directories and files the first time you run it. 