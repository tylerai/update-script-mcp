const { spawn } = require('child_process');

async function listTools() {
  // Start the MCP server
  console.log('Starting MCP server process...');
  const serverProcess = spawn('node', ['../dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });

  // Log server output
  serverProcess.stdout.on('data', (data) => {
    console.log(`[Server] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data.toString().trim()}`);
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // List available tools
  console.log('\nListing available tools...');
  const request = {
    jsonrpc: "2.0",
    id: "list-tools",
    method: "tools/list"
  };

  // Send the request
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Kill the server process
  console.log('\nTest complete, shutting down server...');
  serverProcess.kill();
}

// Run the test
listTools().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
}); 