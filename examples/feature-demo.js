#!/usr/bin/env node

/**
 * Update Script MCP - Feature Demo
 * 
 * This script demonstrates all the features of the Update Script MCP server.
 */

import { spawn } from 'child_process';
import { MCP } from '@modelcontextprotocol/sdk/client/mcp.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Starting Update Script MCP Feature Demo');
  
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
    console.log(tools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n'));
    
    // Create a demo project folder
    const demoDir = path.join(__dirname, 'demo-project');
    if (!fs.existsSync(demoDir)) {
      fs.mkdirSync(demoDir, { recursive: true });
    }
    
    // Example 1: Create a new project from template
    console.log('\n1. Creating a new project from template...');
    try {
      const templateResult = await mcp.callTool('custom_template_js', {
        projectName: 'demo-app',
        projectPath: path.join(demoDir, 'demo-app')
      });
      console.log('Template result:', templateResult.content[0].text);
    } catch (error) {
      console.error('Error creating template:', error);
    }
    
    // Example 2: Run update to generate documentation
    console.log('\n2. Running update to generate documentation...');
    try {
      const updateResult = await mcp.callTool('run_update', {
        cwd: __dirname
      });
      console.log('Update result:', updateResult.content[0].text);
    } catch (error) {
      console.error('Error running update:', error);
    }
    
    // Example 3: Analyze dependencies
    console.log('\n3. Analyzing dependencies...');
    try {
      const dependencyResult = await mcp.callTool('analyze_dependencies', {
        cwd: __dirname,
        format: 'markdown',
        depth: 2
      });
      console.log('Dependency analysis result:', dependencyResult.content[0].text);
    } catch (error) {
      console.error('Error analyzing dependencies:', error);
    }
    
    // Example 4: Generate metrics
    console.log('\n4. Generating code metrics...');
    try {
      const metricsResult = await mcp.callTool('generate_metrics', {
        cwd: __dirname,
        includeComplexity: true,
        outputFormat: 'markdown'
      });
      console.log('Metrics result:', metricsResult.content[0].text);
    } catch (error) {
      console.error('Error generating metrics:', error);
    }
    
    // Example 5: Create visual diagram
    console.log('\n5. Creating visual diagram...');
    try {
      const diagramResult = await mcp.callTool('create_visual_diagram', {
        cwd: __dirname,
        type: 'structure',
        format: 'mermaid'
      });
      console.log('Diagram result:', diagramResult.content[0].text);
    } catch (error) {
      console.error('Error creating diagram:', error);
    }
    
    // Example 6: Start watching project
    console.log('\n6. Start watching project...');
    try {
      const watchResult = await mcp.callTool('watch_project', {
        cwd: __dirname,
        debounceMs: 2000
      });
      console.log('Watch result:', watchResult.content[0].text);
      
      // Wait a bit to show the watcher is running
      console.log('Watcher is running. Waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error('Error starting watch:', error);
    }
    
    // Example 7: Stop watching project
    console.log('\n7. Stop watching project...');
    try {
      const stopWatchResult = await mcp.callTool('stop_watching', {
        cwd: __dirname
      });
      console.log('Stop watch result:', stopWatchResult.content[0].text);
    } catch (error) {
      console.error('Error stopping watch:', error);
    }
    
    // Example 8: List updates history
    console.log('\n8. Listing update history...');
    try {
      const historyResult = await mcp.callTool('list_updates', {});
      console.log('History result:', historyResult.content[0].text.substring(0, 200) + '...');
    } catch (error) {
      console.error('Error listing updates:', error);
    }
    
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