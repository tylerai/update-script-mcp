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

// Add imports for analyzers
import { MetricsAnalyzer } from './analyzers/MetricsAnalyzer.js';
import { DiagramGenerator } from './analyzers/DiagramGenerator.js';
import { DependencyAnalyzer } from './analyzers/DependencyAnalyzer.js';

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

// Add new tool definitions
export const metricsAnalyzerTool = {
  name: "analyze_metrics",
  description: "Analyze code metrics including complexity, lines of code, functions, etc.",
  inputSchema: {
    type: "object",
    properties: {
      cwd: {
        type: "string",
        description: "The directory to analyze (defaults to current working directory)",
      },
      includeComplexity: {
        type: "boolean",
        description: "Whether to include complexity metrics",
        default: true,
      },
      includeCoverage: {
        type: "boolean",
        description: "Whether to include coverage data",
        default: false,
      },
      includeLocMetrics: {
        type: "boolean",
        description: "Whether to include lines of code metrics",
        default: true,
      },
    },
    required: [],
  },
};

export const diagramGeneratorTool = {
  name: "create_visual_diagram",
  description: "Create visual diagrams of project structure, dependencies, or components",
  inputSchema: {
    type: "object",
    properties: {
      cwd: {
        type: "string",
        description: "The directory to analyze (defaults to current working directory)",
      },
      type: {
        type: "string",
        enum: ["structure", "dependencies", "components", "all"],
        description: "Type of diagram to generate",
        default: "all",
      },
      format: {
        type: "string",
        enum: ["mermaid", "dot", "svg", "png"],
        description: "Output format for the diagram",
        default: "mermaid",
      },
      outputPath: {
        type: "string",
        description: "Custom output path for the diagram",
      },
    },
    required: [],
  },
};

export const dependencyAnalyzerTool = {
  name: "analyze_dependencies",
  description: "Analyze project dependencies and generate a dependency graph",
  inputSchema: {
    type: "object",
    properties: {
      cwd: {
        type: "string",
        description: "The directory to analyze (defaults to current working directory)",
      },
      includeNodeModules: {
        type: "boolean",
        description: "Whether to include node_modules in the analysis",
        default: false,
      },
      maxDepth: {
        type: "number",
        description: "Maximum depth for dependency analysis",
        default: 2,
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
    
    // Add code metrics section
    markdown += `## 📊 Code Metrics\n\n`;
    
    try {
      const metricsAnalyzer = new MetricsAnalyzer(cwd, true, false, true);
      const metrics = await metricsAnalyzer.analyze();
      
      markdown += `### Project Summary\n\n`;
      markdown += `- Total Files: ${metrics.summary.totalFiles}\n`;
      markdown += `- Lines of Code: ${metrics.summary.totalLoc}\n`;
      markdown += `- Source Lines of Code: ${metrics.summary.totalSloc}\n`;
      markdown += `- Comments: ${metrics.summary.totalComments}\n`;
      markdown += `- Functions: ${metrics.summary.totalFunctions}\n`;
      markdown += `- Classes: ${metrics.summary.totalClasses}\n`;
      markdown += `- Average Complexity: ${metrics.summary.averageComplexity.toFixed(2)}\n\n`;
      
      markdown += `### Language Distribution\n\n`;
      for (const [lang, stats] of Object.entries(metrics.byLanguage)) {
        markdown += `- ${lang}: ${stats.files} files, ${stats.loc} lines\n`;
      }
      markdown += `\n`;
      
      markdown += `### Most Complex Files\n\n`;
      metrics.topComplexFiles.slice(0, 5).forEach(file => {
        markdown += `- \`${file.filePath}\` (Complexity: ${file.complexity})\n`;
      });
      markdown += `\n`;
    } catch (error) {
      console.error('Error generating metrics:', error);
      markdown += `*Error generating metrics*\n\n`;
    }
    
    // Add visual diagrams section
    markdown += `## 📈 Visual Diagrams\n\n`;
    
    try {
      const diagramGenerator = new DiagramGenerator({
        type: 'all',
        format: 'mermaid',
        cwd
      });
      
      const diagrams = await diagramGenerator.generate();
      markdown += diagrams + '\n\n';
    } catch (error) {
      console.error('Error generating diagrams:', error);
      markdown += `*Error generating diagrams*\n\n`;
    }
    
    // Add dependency analysis
    markdown += `## 🔄 Dependency Analysis\n\n`;
    
    try {
      const depAnalyzer = new DependencyAnalyzer(cwd, false, 2);
      const deps = await depAnalyzer.analyze();
      
      markdown += `### Key Dependencies\n\n`;
      deps.nodes.slice(0, 10).forEach(node => {
        markdown += `- \`${node.id}\` depends on:\n`;
        node.dependencies.slice(0, 5).forEach(dep => {
          markdown += `  - \`${dep}\`\n`;
        });
      });
      markdown += `\n`;
    } catch (error) {
      console.error('Error analyzing dependencies:', error);
      markdown += `*Error analyzing dependencies*\n\n`;
    }
    
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

// Function to analyze metrics
export async function analyzeMetrics(request: CallToolRequest): Promise<ServerResult> {
  try {
    const args = request.params.arguments as {
      cwd?: string;
      includeComplexity?: boolean;
      includeCoverage?: boolean;
      includeLocMetrics?: boolean;
      outputFormat?: 'json' | 'markdown';
    };

    const cwd = args?.cwd || process.cwd();
    const analyzer = new MetricsAnalyzer(
      cwd,
      args?.includeComplexity ?? true,
      args?.includeCoverage ?? false,
      args?.includeLocMetrics ?? true
    );

    // Create output directory
    const outputDir = join(cwd, 'docs/analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate metrics in requested format
    const outputFormat = args?.outputFormat || 'markdown';
    const content = outputFormat === 'json' 
      ? await analyzer.formatJson()
      : await analyzer.formatMarkdown();

    // Write to file
    const outputFile = join(outputDir, `metrics.${outputFormat}`);
    fs.writeFileSync(outputFile, content);

    return {
      content: [
        {
          type: 'text',
          text: `Metrics analysis complete! Output saved to ${outputFile}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Function to create visual diagrams
export async function createVisualDiagram(request: CallToolRequest): Promise<ServerResult> {
  try {
    const args = request.params.arguments as {
      cwd?: string;
      type?: 'structure' | 'dependencies' | 'components' | 'all';
      format?: 'mermaid' | 'dot' | 'svg' | 'png';
      outputPath?: string;
    };

    const cwd = args?.cwd || process.cwd();
    const generator = new DiagramGenerator({
      type: args?.type || 'structure',
      format: args?.format || 'mermaid',
      cwd,
      outputPath: args?.outputPath,
    });

    // Create output directory
    const outputDir = args?.outputPath || join(cwd, 'docs/diagrams');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate diagram
    const diagram = await generator.generate();

    // Determine filename based on type and format
    const filename = `${args?.type || 'structure'}-diagram.${args?.format === 'mermaid' ? 'md' : args?.format || 'mermaid'}`;
    const outputFile = join(outputDir, filename);

    // Write to file
    fs.writeFileSync(outputFile, diagram);

    return {
      content: [
        {
          type: 'text',
          text: `Visual diagram created! Output saved to ${outputFile}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Function to analyze dependencies
export async function analyzeDependencies(request: CallToolRequest): Promise<ServerResult> {
  try {
    const args = request.params.arguments as {
      cwd?: string;
      format?: 'json' | 'markdown' | 'dot';
      includeNodeModules?: boolean;
      depth?: number;
    };

    const cwd = args?.cwd || process.cwd();
    const analyzer = new DependencyAnalyzer(
      cwd,
      args?.includeNodeModules ?? false,
      args?.depth ?? 3
    );

    // Create output directory
    const outputDir = join(cwd, 'docs/analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate dependency analysis in requested format
    const format = args?.format || 'markdown';
    let content = '';
    let extension = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(await analyzer.analyze(), null, 2);
        extension = 'json';
        break;
      case 'dot':
        content = await analyzer.formatGraph('dot');
        extension = 'dot';
        break;
      case 'markdown':
      default:
        content = await analyzer.formatGraph('markdown');
        extension = 'md';
        break;
    }

    // Write to file
    const outputFile = join(outputDir, `dependencies.${extension}`);
    fs.writeFileSync(outputFile, content);

    return {
      content: [
        {
          type: 'text',
          text: `Dependency analysis complete! Output saved to ${outputFile}`,
        },
      ],
      isError: false,
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      error instanceof Error ? error.message : String(error)
    );
  }
} 