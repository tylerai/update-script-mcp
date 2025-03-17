const { spawn } = require('child_process');
const { join } = require('path');
const fs = require('fs');

async function testSingleTool() {
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

  // Test the generate_metrics tool
  console.log('\nTesting the generate_metrics tool...');
  const request = {
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

  console.log('Sending request:', JSON.stringify(request, null, 2));
  
  // Send the request
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Check if files were created
  console.log('\nChecking for generated files:');
  const metricsPath = join(process.cwd(), 'docs/analysis/metrics.markdown');
  
  if (fs.existsSync(metricsPath)) {
    console.log('✅ metrics.markdown created successfully');
    console.log(`   Path: ${metricsPath}`);
    console.log('File contents:');
    console.log('------------------------------------------');
    console.log(fs.readFileSync(metricsPath, 'utf-8').slice(0, 500) + '...');
    console.log('------------------------------------------');
  } else {
    console.log('❌ metrics.markdown was not created');
  }
  
  // Kill the server process
  console.log('\nTest complete, shutting down server...');
  serverProcess.kill();
}

// Run the test
testSingleTool().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
}); 