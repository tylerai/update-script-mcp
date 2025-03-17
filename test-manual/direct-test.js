const path = require('path');
const fs = require('fs');

// Import the tool functions directly
const { 
  analyzeMetrics,
  createVisualDiagram,
  analyzeDependencies,
  generateMemoryBank 
} = require('../dist/mcp-tools.js');

async function testTools() {
  console.log('Testing tools directly...');
  
  // Create a mock request object
  const mockRequest = {
    params: {
      name: 'generate_metrics',
      arguments: {
        cwd: process.cwd(),
        includeComplexity: true,
        includeCoverage: false,
        includeLocMetrics: true,
        outputFormat: 'markdown'
      }
    },
    method: 'tools/call'
  };
  
  try {
    console.log('\n1. Testing metrics analyzer...');
    const metricsResult = await analyzeMetrics(mockRequest);
    console.log('Result:', metricsResult);
    
    console.log('\n2. Testing visual diagram generator...');
    const diagramRequest = {
      params: {
        name: 'create_visual_diagram',
        arguments: {
          cwd: process.cwd(),
          type: 'structure',
          format: 'mermaid'
        }
      },
      method: 'tools/call'
    };
    const diagramResult = await createVisualDiagram(diagramRequest);
    console.log('Result:', diagramResult);
    
    console.log('\n3. Testing dependency analyzer...');
    const dependencyRequest = {
      params: {
        name: 'analyze_dependencies',
        arguments: {
          cwd: process.cwd(),
          format: 'markdown',
          includeNodeModules: false,
          depth: 2
        }
      },
      method: 'tools/call'
    };
    const dependencyResult = await analyzeDependencies(dependencyRequest);
    console.log('Result:', dependencyResult);
    
    console.log('\n4. Testing memory bank generator...');
    const memoryRequest = {
      params: {
        name: 'generate_memory_bank',
        arguments: {
          cwd: process.cwd()
        }
      },
      method: 'tools/call'
    };
    const memoryResult = await generateMemoryBank(memoryRequest);
    console.log('Result:', memoryResult);
    
    // Check if files were created
    console.log('\n5. Checking generated files:');
    const metricsPath = path.join(process.cwd(), 'docs/analysis/metrics.markdown');
    const diagramPath = path.join(process.cwd(), 'docs/diagrams/structure-diagram.md');
    const depsPath = path.join(process.cwd(), 'docs/analysis/dependencies.md');
    const memoryPath = path.join(process.cwd(), 'docs/architecture/project-memory.md');
    
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
  } catch (error) {
    console.error('Error testing tools:', error);
  }
}

// Run the tests
testTools().catch(err => {
  console.error('Error during tests:', err);
  process.exit(1);
}); 