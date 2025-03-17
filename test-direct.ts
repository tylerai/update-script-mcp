// Test script to generate the AI-optimized memory bank directly from source
import { FileHandler } from './src/services/FileHandler';
import { join } from 'path';
import fs from 'fs';

// Create the file handler with minimal required config
const handler = new FileHandler({
  rootPath: process.cwd(),
  historyFile: './history.json'
});

// Run the command to generate the memory bank
async function main() {
  try {
    console.log('Generating project documentation...');
    
    // Call the generateProjectMemory method directly
    const memoryBankPath = join(process.cwd(), 'docs/architecture/project-memory.md');
    
    // Create docs directory if it doesn't exist
    const docsDir = join(process.cwd(), 'docs/architecture');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Generate AI-optimized memory bank content
    let markdown = `# AI-Optimized Project Memory Bank\n\n`;
    
    // Add metadata section
    markdown += `## 📋 Project Metadata\n\n`;
    markdown += `- **Project Path:** \`${process.cwd()}\`\n`;
    markdown += `- **Documentation Generated:** ${new Date().toISOString()}\n\n`;
    
    // Add executive summary
    markdown += `## 🔍 Executive Summary\n\n`;
    markdown += `This document provides an AI-friendly overview of the project structure, dependencies, and architecture. It is organized to help AI assistants quickly understand the project's organization and key components.\n\n`;
    
    // Add project structure
    markdown += `## 📁 Project Structure\n\n`;
    markdown += `### Directory Hierarchy\n\`\`\`\n`;
    
    const { execSync } = require('child_process');
    const findCmd = `find . -type d -not -path "*/\\.*" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" | sort`;
    const dirs = execSync(findCmd, { cwd: process.cwd() }).toString().split('\n').filter(Boolean);
    
    dirs.forEach((dir: string) => {
      if (dir === '.') return;
      
      // Calculate indentation based on directory depth
      const depth = (dir.match(/\//g) || []).length;
      const indent = ' '.repeat(depth * 2);
      const dirName = dir.split('/').pop();
      
      markdown += `${indent}${dirName}/\n`;
    });
    
    markdown += `\`\`\`\n\n`;
    
    // Add note about generation
    markdown += `---\n\n`;
    markdown += `*This AI-optimized memory bank was generated on ${new Date().toLocaleString()} to facilitate project comprehension.*`;
    
    // Write the markdown to the file
    fs.writeFileSync(memoryBankPath, markdown);
    
    console.log('✅ Success!');
    console.log('Memory bank generated at:', memoryBankPath);
    console.log('Memory bank content preview:');
    console.log(markdown.substring(0, 500) + '...');
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 