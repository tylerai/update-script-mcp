#!/usr/bin/env node

/**
 * Update Script MCP Client Demo
 * 
 * This script demonstrates how to interact with the Update Script MCP server
 * programmatically using the MCP client.
 */

const { spawn } = require('child_process');
const { MCP } = require('@modelcontextprotocol/sdk');

async function main() {
  console.log('Starting Update Script MCP Demo');
  
  // Start the MCP server (normally this would be done by Cursor)
  const server = spawn('update-script-mcp', [], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create MCP client
  const mcp = new MCP();
  
  try {
    // Connect to the server
    await mcp.connect({
      stdin: server.stdin,
      stdout: server.stdout,
      stderr: server.stderr
    });
    
    console.log('Connected to Update Script MCP server');
    
    // List available tools
    const tools = await mcp.listTools();
    console.log('\nAvailable tools:');
    console.log(tools);
    
    // Example 1: Run update in current directory
    console.log('\nRunning update in current directory...');
    const updateResult = await mcp.callTool('run_update', {});
    console.log('Update result:', updateResult);
    
    // Example 2: List recent updates
    console.log('\nListing recent updates...');
    const historyResult = await mcp.callTool('list_updates', {});
    console.log('History result:', historyResult);
    
    // Example 3: Start watching project
    console.log('\nStarting file watcher...');
    const watchResult = await mcp.callTool('watch_project', {
      debounceMs: 2000 // 2 second debounce
    });
    console.log('Watch result:', watchResult);
    
    // Wait a bit to show the watcher is running
    console.log('\nWatcher is running. Make some changes to files to trigger an update...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Example 4: Stop watching project
    console.log('\nStopping file watcher...');
    const stopWatchResult = await mcp.callTool('stop_watching', {});
    console.log('Stop watch result:', stopWatchResult);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    console.log('\nClosing connection...');
    await mcp.close();
    server.kill();
    console.log('Demo completed');
  }
}

main().catch(console.error); 