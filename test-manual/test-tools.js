const { spawn } = require('child_process');
const { join } = require('path');
const fs = require('fs');

async function testTools() {
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

  // Test the analyze_metrics tool
  console.log('\n1. Testing metrics analyzer...');
  const metricsRequest = {
    jsonrpc: "2.0",
    id: "test-metrics",
    method: "tools/call",
    params: {
      name: "generate_metrics",
      arguments: {
        cwd: process.cwd(),
        includeComplexity: true,
        includeCoverage: false,
        includeLocMetrics: true,
        outputFormat: "markdown"
      }
    }
  };

  // Send the request
  serverProcess.stdin.write(JSON.stringify(metricsRequest) + '\n');
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test the create_visual_diagram tool
  console.log('\n2. Testing visual diagram generator...');
  const diagramRequest = {
    jsonrpc: "2.0",
    id: "test-diagram",
    method: "tools/call",
    params: {
      name: "create_visual_diagram",
      arguments: {
        cwd: process.cwd(),
        type: "structure",
        format: "mermaid"
      }
    }
  };

  // Send the request
  serverProcess.stdin.write(JSON.stringify(diagramRequest) + '\n');
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test the analyze_dependencies tool
  console.log('\n3. Testing dependency analyzer...');
  const dependencyRequest = {
    jsonrpc: "2.0",
    id: "test-deps",
    method: "tools/call",
    params: {
      name: "analyze_dependencies",
      arguments: {
        cwd: process.cwd(),
        format: "markdown",
        includeNodeModules: false,
        depth: 2
      }
    }
  };

  // Send the request
  serverProcess.stdin.write(JSON.stringify(dependencyRequest) + '\n');
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test the generate_memory_bank tool
  console.log('\n4. Testing memory bank generator...');
  const memoryRequest = {
    jsonrpc: "2.0",
    id: "test-memory",
    method: "tools/call",
    params: {
      name: "generate_memory_bank",
      arguments: {
        cwd: process.cwd(),
      }
    }
  };

  // Send the request
  serverProcess.stdin.write(JSON.stringify(memoryRequest) + '\n');
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check if files were created
  console.log('\n5. Checking generated files:');
  const metricsPath = join(process.cwd(), 'docs/analysis/metrics.markdown');
  const diagramPath = join(process.cwd(), 'docs/diagrams/structure-diagram.md');
  const depsPath = join(process.cwd(), 'docs/analysis/dependencies.md');
  const memoryPath = join(process.cwd(), 'docs/architecture/project-memory.md');
  
  if (fs.existsSync(metricsPath)) {
    console.log('✅ metrics.markdown created successfully');
    console.log(`   Path: ${metricsPath}`);
  } else {
    console.log('❌ metrics.markdown was not created');
  }
  
  if (fs.existsSync(diagramPath)) {
    console.log('✅ structure-diagram.md created successfully');
    console.log(`   Path: ${diagramPath}`);
  } else {
    console.log('❌ structure-diagram.md was not created');
  }
  
  if (fs.existsSync(depsPath)) {
    console.log('✅ dependencies.md created successfully');
    console.log(`   Path: ${depsPath}`);
  } else {
    console.log('❌ dependencies.md was not created');
  }
  
  if (fs.existsSync(memoryPath)) {
    console.log('✅ project-memory.md created successfully');
    console.log(`   Path: ${memoryPath}`);
  } else {
    console.log('❌ project-memory.md was not created');
  }
  
  // Kill the server process
  console.log('\nTests complete, shutting down server...');
  serverProcess.kill();
}

// Run the tests
testTools().catch(err => {
  console.error('Error during tests:', err);
  process.exit(1);
}); 