/**
 * Custom MCP tools for the update-script project
 * This implements the AI-optimized memory bank generator directly
 */

import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  ServerResult,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

// Memory bank generator tool definition
export const memoryBankTool = {
  name: "generate_memory_bank",
  description: "Generate an AI-optimized project memory bank file to help AI assistants understand the project",
  inputSchema: {
    type: "object",
    properties: {
      cwd: {
        type: "string",
        description: "The directory to generate the memory bank for (defaults to current working directory)",
      },
    },
    required: [],
  },
};

// Function to generate the memory bank
export async function generateMemoryBank(request: CallToolRequest): Promise<ServerResult> {
  try {
    const args = request.params.arguments as { cwd?: string };
    const cwd = args?.cwd || process.cwd();
    
    // Set up paths
    const docsDir = join(cwd, 'docs/architecture');
    const memoryBankPath = join(docsDir, 'project-memory.md');
    
    // Create docs directory if it doesn't exist
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Generate AI-optimized memory bank content
    let markdown = `# AI-Optimized Project Memory Bank\n\n`;
    
    // Add metadata section
    markdown += `## 📋 Project Metadata\n\n`;
    markdown += `- **Project Path:** \`${cwd}\`\n`;
    markdown += `- **Documentation Generated:** ${new Date().toISOString()}\n\n`;
    
    // Try to detect project type and name from package.json
    if (fs.existsSync(join(cwd, 'package.json'))) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(join(cwd, 'package.json'), 'utf8'));
        markdown += `- **Project Name:** ${packageJson.name || 'Unknown'}\n`;
        markdown += `- **Project Description:** ${packageJson.description || 'Not specified'}\n`;
        markdown += `- **Version:** ${packageJson.version || 'Not specified'}\n`;
      } catch (error) {
        console.error('Error parsing package.json:', error);
      }
    }
    
    markdown += `\n`;
    
    // Add executive summary
    markdown += `## 🔍 Executive Summary\n\n`;
    markdown += `This document provides an AI-friendly overview of the project structure, dependencies, and architecture. It is organized to help AI assistants quickly understand the project's organization and key components.\n\n`;
    
    // Add AI navigation guidance
    markdown += `## 🧭 AI Navigation Guide\n\n`;
    markdown += `This document is structured for rapid project comprehension. Sections are organized in order of importance:\n\n`;
    markdown += `1. **Project Structure**: Core organization and file hierarchy\n`;
    markdown += `2. **Key Files**: Important files that define the project's behavior\n`;
    markdown += `3. **Dependencies**: External libraries and internal module relationships\n`;
    markdown += `4. **Code Metrics**: Size, complexity, and organization statistics\n`;
    markdown += `5. **Visual Diagrams**: Visual representations of structure and relationships\n\n`;
    
    // Add project structure
    markdown += `## 📁 Project Structure\n\n`;
    
    // Get directory structure using find command
    markdown += `### Directory Hierarchy\n\`\`\`\n`;
    
    const findCmd = `find . -type d -not -path "*/\\.*" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" | sort`;
    const dirs = execSync(findCmd, { cwd }).toString().split('\n').filter(Boolean);
    
    dirs.forEach((dir) => {
      if (dir === '.') return;
      
      // Calculate indentation based on directory depth
      const depth = (dir.match(/\//g) || []).length;
      const indent = ' '.repeat(depth * 2);
      const dirName = dir.split('/').pop();
      
      markdown += `${indent}${dirName}/\n`;
    });
    
    markdown += `\`\`\`\n\n`;
    
    // Check for important directories and describe them
    markdown += `### Core Directories\n\n`;
    
    const coreDirectories = {
      'src': 'Source code directory containing the main application code',
      'app': 'Application code in a Next.js or modern framework structure',
      'components': 'UI components or reusable modules',
      'pages': 'Page components or routing structure',
      'public': 'Static assets served directly by the web server',
      'api': 'API routes or server endpoints',
      'lib': 'Library code, utilities, or shared functionality',
      'utils': 'Utility functions and helper code',
      'services': 'Service implementations, data fetching, or business logic',
      'hooks': 'React hooks or composable functionality',
      'styles': 'CSS, SCSS, or styling code',
      'tests': 'Test files and testing utilities',
      'docs': 'Documentation files',
      'config': 'Configuration files for the application or build process'
    };
    
    for (const [dir, description] of Object.entries(coreDirectories)) {
      if (fs.existsSync(join(cwd, dir))) {
        markdown += `- **${dir}/**: ${description}\n`;
      }
    }
    markdown += `\n`;
    
    // List key files
    markdown += `## 📄 Key Files\n\n`;
    
    const keyFiles = {
      'package.json': 'Node.js project configuration and dependencies',
      'tsconfig.json': 'TypeScript configuration',
      '.eslintrc.js': 'ESLint configuration for code linting',
      'jest.config.js': 'Jest testing configuration',
      'next.config.js': 'Next.js framework configuration',
      'webpack.config.js': 'Webpack bundler configuration',
      'tailwind.config.js': 'Tailwind CSS configuration',
      'README.md': 'Project documentation and overview',
      'Dockerfile': 'Docker container configuration',
      'docker-compose.yml': 'Docker Compose multi-container configuration',
      '.github/workflows': 'GitHub Actions CI/CD pipelines'
    };
    
    for (const [file, description] of Object.entries(keyFiles)) {
      if (fs.existsSync(join(cwd, file))) {
        markdown += `- **${file}**: ${description}\n`;
      }
    }
    
    // Check for main entry points
    const entryPoints = [
      'src/index.js', 'src/index.ts', 'src/app.js', 'src/app.ts',
      'src/main.js', 'src/main.ts', 'app/page.js', 'app/page.tsx',
      'pages/index.js', 'pages/index.tsx'
    ];
    
    for (const entry of entryPoints) {
      if (fs.existsSync(join(cwd, entry))) {
        markdown += `- **${entry}**: Main entry point/component\n`;
      }
    }
    
    markdown += `\n`;
    
    // Add dependency analysis
    markdown += `## 🔗 Dependencies\n\n`;
    
    // Add main dependencies from package.json if it exists
    if (fs.existsSync(join(cwd, 'package.json'))) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(join(cwd, 'package.json'), 'utf8'));
        
        if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
          markdown += `### Primary Dependencies\n\n`;
          markdown += `\`\`\`json\n`;
          
          for (const [name, version] of Object.entries(packageJson.dependencies)) {
            markdown += `"${name}": "${version}",\n`;
          }
          
          markdown += `\`\`\`\n\n`;
        }
        
        // Add dev dependencies
        if (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0) {
          markdown += `### Development Dependencies\n\n`;
          markdown += `\`\`\`json\n`;
          
          for (const [name, version] of Object.entries(packageJson.devDependencies)) {
            markdown += `"${name}": "${version}",\n`;
          }
          
          markdown += `\`\`\`\n\n`;
        }
      } catch (error) {
        console.error('Error parsing package.json:', error);
      }
    }
    
    // Add AI assistant prompt section
    markdown += `## 🤖 AI Context & Guidance\n\n`;
    markdown += `When working with this project, consider the following:\n\n`;
    markdown += `1. **Project Structure**: Review the directory hierarchy to understand the organization\n`;
    markdown += `2. **Key Files**: Examine important configuration and entry point files\n`;
    markdown += `3. **Dependencies**: Note the primary frameworks and libraries in use\n\n`;
    
    // Add note about generation
    markdown += `---\n\n`;
    markdown += `*This AI-optimized memory bank was generated on ${new Date().toLocaleString()} to facilitate project comprehension.*`;
    
    // Write the markdown to the file
    fs.writeFileSync(memoryBankPath, markdown);
    
    return {
      content: [
        {
          type: "text",
          text: `AI-optimized project memory bank generated at: ${memoryBankPath}`
        }
      ],
      isError: false
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to generate memory bank: ${error instanceof Error ? error.message : String(error)}`
    );
  }
} 