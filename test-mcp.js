// Test script to verify MCP integration
import { UpdateScriptServer } from './dist/index.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to check if a file exists and get its stats
function checkFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime
    };
  } catch (err) {
    return { exists: false };
  }
}

// Test MCP integration by spawning a server process and sending a tool call
async function testMcp() {
  console.log('🚀 Starting MCP server process...');
  
  // Create a process that runs the server
  const serverProcess = spawn('node', ['--no-warnings', './dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });
  
  let serverOutput = '';
  let serverError = '';
  
  // Log server output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    console.log(`📤 Server: ${output.trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    serverError += error;
    console.error(`❌ Server error: ${error.trim()}`);
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (serverError.includes('Error')) {
    console.error('❌ Server failed to start properly');
    serverProcess.kill();
    process.exit(1);
  }
  
  console.log('📝 Sending run_update tool call...');
  
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
  
  const structureFile = checkFile(structurePath);
  const memoryFile = checkFile(memoryPath);
  
  console.log('\n📋 Test Results:');
  console.log('----------------');
  
  if (structureFile.exists) {
    console.log(`✅ project-structure.md created successfully`);
    console.log(`   Size: ${structureFile.size} bytes`);
    console.log(`   Last modified: ${structureFile.modified}`);
  } else {
    console.log(`❌ project-structure.md was not created`);
  }
  
  if (memoryFile.exists) {
    console.log(`✅ project-memory.md created successfully`);
    console.log(`   Size: ${memoryFile.size} bytes`);
    console.log(`   Last modified: ${memoryFile.modified}`);
  } else {
    console.log(`❌ project-memory.md was not created`);
  }
  
  // Kill the server process
  console.log('\n🛑 Stopping MCP server...');
  serverProcess.kill();
  
  // Exit with success or failure
  if (structureFile.exists && memoryFile.exists) {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  } else {
    console.log('❌ Test failed: One or more files were not created');
    process.exit(1);
  }
}

testMcp().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
}); 