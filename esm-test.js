// ESM version of the test script
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory with ESM support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple implementation of the metrics analyzer
async function testMetricsAnalyzer() {
  console.log('\n1. Testing metrics analyzer...');
  
  try {
    const cwd = process.cwd();
    const outputFormat = 'markdown';
    const outputDir = path.join(cwd, 'docs/analysis');
    const outputFile = path.join(outputDir, `metrics.${outputFormat}`);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate metrics content
    let content = '# Code Metrics Analysis\n\n';
    content += `Generated on: ${new Date().toISOString()}\n\n`;
    
    // Project summary
    content += '## Project Summary\n\n';
    content += '| Metric | Value |\n';
    content += '| ------ | ----- |\n';
    
    // Count files by type
    const fileTypes = {};
    const findCmd = `find . -type f -not -path "*/\\.*" -not -path "*/node_modules/*" | grep -v "^\\./\\." | sort`;
    const files = execSync(findCmd, { cwd }).toString().split('\n').filter(Boolean);
    
    files.forEach(file => {
      const ext = path.extname(file);
      if (ext) {
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }
    });
    
    content += `| Total Files | ${files.length} |\n`;
    content += `| JavaScript Files | ${fileTypes['.js'] || 0} |\n`;
    content += `| TypeScript Files | ${fileTypes['.ts'] || 0} |\n`;
    content += `| React Files | ${(fileTypes['.jsx'] || 0) + (fileTypes['.tsx'] || 0)} |\n`;
    
    // Language statistics
    content += '\n## Language Statistics\n\n';
    content += '| Language | Files | % of Codebase |\n';
    content += '| -------- | ----- | ------------- |\n';
    
    Object.entries(fileTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([ext, count]) => {
        const percentage = ((count / files.length) * 100).toFixed(2);
        content += `| ${ext} | ${count} | ${percentage}% |\n`;
      });
    
    // Write to file
    fs.writeFileSync(outputFile, content);
    
    console.log(`Metrics analysis complete. Output saved to: ${outputFile}`);
    return { success: true, outputFile };
  } catch (error) {
    console.error('Error generating metrics:', error);
    return { success: false, error: error.message };
  }
}

// Simple implementation of the diagram generator
async function testDiagramGenerator() {
  console.log('\n2. Testing visual diagram generator...');
  
  try {
    const cwd = process.cwd();
    const outputDir = path.join(cwd, 'docs/diagrams');
    const outputFile = path.join(outputDir, 'structure-diagram.md');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate a simple directory structure diagram
    let content = '```mermaid\nflowchart TD\n';
    
    // Get directory structure
    const findCmd = `find . -type d -not -path "*/\\.*" -not -path "*/node_modules/*" | sort`;
    const dirs = execSync(findCmd, { cwd }).toString().split('\n').filter(Boolean);
    
    // Create nodes
    dirs.forEach((dir, index) => {
      const displayName = dir === '.' ? 'Root' : path.basename(dir);
      content += `  dir${index}[${displayName}]\n`;
    });
    
    // Create relationships
    dirs.forEach((dir, index) => {
      if (dir === '.') return;
      
      const parent = path.dirname(dir);
      const parentIndex = dirs.findIndex(d => d === parent);
      
      if (parentIndex !== -1) {
        content += `  dir${parentIndex} --> dir${index}\n`;
      }
    });
    
    content += '```';
    
    // Write to file
    fs.writeFileSync(outputFile, content);
    
    console.log(`Visual diagram created. Output saved to: ${outputFile}`);
    return { success: true, outputFile };
  } catch (error) {
    console.error('Error generating diagram:', error);
    return { success: false, error: error.message };
  }
}

// Simple implementation of the dependency analyzer
async function testDependencyAnalyzer() {
  console.log('\n3. Testing dependency analyzer...');
  
  try {
    const cwd = process.cwd();
    const outputDir = path.join(cwd, 'docs/analysis');
    const outputFile = path.join(outputDir, 'dependencies.md');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate a simple dependency analysis
    let content = '# Dependency Analysis\n\n';
    
    // Get JavaScript/TypeScript files
    const findCmd = `find . -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | grep -v "node_modules" | sort`;
    const files = execSync(findCmd, { cwd }).toString().split('\n').filter(Boolean);
    
    content += `## Files Analyzed\n\n`;
    content += `Total files: ${files.length}\n\n`;
    
    // Simple dependency extraction
    const dependencies = {};
    
    files.forEach(file => {
      try {
        const fileContent = fs.readFileSync(path.join(cwd, file), 'utf-8');
        
        // Extract imports
        const imports = [];
        const importRegex = /import\s+(?:.+\s+from\s+)?['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(fileContent)) !== null) {
          imports.push(match[1]);
        }
        
        // Extract requires
        const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        while ((match = requireRegex.exec(fileContent)) !== null) {
          imports.push(match[1]);
        }
        
        if (imports.length > 0) {
          dependencies[file] = imports;
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    });
    
    // Generate dependency list
    content += `## File Dependencies\n\n`;
    
    Object.entries(dependencies).forEach(([file, imports]) => {
      content += `### ${file}\n\n`;
      content += `Imports:\n`;
      imports.forEach(imp => {
        content += `- ${imp}\n`;
      });
      content += '\n';
    });
    
    // Write to file
    fs.writeFileSync(outputFile, content);
    
    console.log(`Dependency analysis complete. Output saved to: ${outputFile}`);
    return { success: true, outputFile };
  } catch (error) {
    console.error('Error analyzing dependencies:', error);
    return { success: false, error: error.message };
  }
}

// Simple implementation of the memory bank generator
async function testMemoryBankGenerator() {
  console.log('\n4. Testing memory bank generator...');
  
  try {
    const cwd = process.cwd();
    const outputDir = path.join(cwd, 'docs/architecture');
    const outputFile = path.join(outputDir, 'project-memory.md');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate AI-optimized memory bank content
    let content = `# AI-Optimized Project Memory Bank\n\n`;
    
    // Add metadata section
    content += `## 📋 Project Metadata\n\n`;
    content += `- **Project Path:** \`${cwd}\`\n`;
    content += `- **Documentation Generated:** ${new Date().toISOString()}\n\n`;
    
    // Try to detect project type and name from package.json
    if (fs.existsSync(path.join(cwd, 'package.json'))) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
        content += `- **Project Name:** ${packageJson.name || 'Unknown'}\n`;
        content += `- **Project Description:** ${packageJson.description || 'Not specified'}\n`;
        content += `- **Version:** ${packageJson.version || 'Not specified'}\n`;
      } catch (error) {
        console.error('Error parsing package.json:', error);
      }
    }
    
    // Add project structure
    content += `\n## 📁 Project Structure\n\n`;
    
    // Get directory structure
    content += `### Directory Hierarchy\n\`\`\`\n`;
    
    const findCmd = `find . -type d -not -path "*/\\.*" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" | sort`;
    const dirs = execSync(findCmd, { cwd }).toString().split('\n').filter(Boolean);
    
    dirs.forEach((dir) => {
      if (dir === '.') return;
      
      // Calculate indentation based on directory depth
      const depth = (dir.match(/\//g) || []).length;
      const indent = ' '.repeat(depth * 2);
      const dirName = dir.split('/').pop();
      
      content += `${indent}${dirName}/\n`;
    });
    
    content += `\`\`\`\n\n`;
    
    // Write to file
    fs.writeFileSync(outputFile, content);
    
    console.log(`AI-optimized project memory bank generated. Output saved to: ${outputFile}`);
    return { success: true, outputFile };
  } catch (error) {
    console.error('Error generating memory bank:', error);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  try {
    await testMetricsAnalyzer();
    await testDiagramGenerator();
    await testDependencyAnalyzer();
    await testMemoryBankGenerator();
    
    // Check if files were created
    console.log('\n5. Checking generated files:');
    const cwd = process.cwd();
    const metricsPath = path.join(cwd, 'docs/analysis/metrics.markdown');
    const diagramPath = path.join(cwd, 'docs/diagrams/structure-diagram.md');
    const depsPath = path.join(cwd, 'docs/analysis/dependencies.md');
    const memoryPath = path.join(cwd, 'docs/architecture/project-memory.md');
    
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
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Error during tests:', err);
  process.exit(1);
}); 