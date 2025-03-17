import fs from "fs-extra";
import { join } from "path";
import { execSync } from "child_process";
import chokidar from "chokidar";
import {
  UpdateScriptCommand,
  CommandResult,
  UpdateScriptConfig,
} from "../types.js";

// Import new analyzers and template generators
import { TemplateGenerator } from '../templates/TemplateGenerator.js';
import { DependencyAnalyzer } from '../analyzers/DependencyAnalyzer.js';
import { MetricsAnalyzer } from '../analyzers/MetricsAnalyzer.js';
import { DiagramGenerator } from '../analyzers/DiagramGenerator.js';

interface UpdateRecord {
  timestamp: string;
  success: boolean;
  output: string;
}

interface HistoryData {
  updates: UpdateRecord[];
}

// Map to store active watchers by project path
const activeWatchers = new Map<string, chokidar.FSWatcher>();

export class FileHandler {
  private rootPath: string;
  private historyPath: string;
  
  constructor(config: UpdateScriptConfig) {
    this.rootPath = config.rootPath;
    this.historyPath = join(this.rootPath, "history.json");
    this.ensureHistoryFile();
  }
  
  private ensureHistoryFile() {
    try {
      if (!fs.existsSync(this.rootPath)) {
        fs.mkdirSync(this.rootPath, { recursive: true });
      }
      
      if (!fs.existsSync(this.historyPath)) {
        fs.writeFileSync(this.historyPath, JSON.stringify({ updates: [] }), "utf8");
      }
    } catch (error) {
      console.error("Error initializing history file:", error);
    }
  }
  
  private generateProjectStructure(cwd: string): string {
    try {
      // Create docs directory
      const docsDir = join(cwd, 'docs/architecture');
      fs.mkdirSync(docsDir, { recursive: true });
      
      const outputFile = join(docsDir, 'project-structure.md');
      
      // Start building the markdown content
      let markdown = `# Project Structure\n\n`;
      markdown += `This document provides an overview of the project structure, explaining the purpose of key directories and files.\n\n`;
      
      // Get directory structure using find command
      markdown += `## Directory Structure Overview\n\`\`\`\n`;
      
      const findCmd = `find . -type d -not -path "*/\\.*" -not -path "*/node_modules/*" | sort`;
      const dirs = execSync(findCmd, { cwd }).toString().split('\n').filter(Boolean);
      
      dirs.forEach((dir: string) => {
        if (dir === '.') return;
        
        // Calculate indentation based on directory depth
        const depth = (dir.match(/\//g) || []).length;
        const indent = ' '.repeat(depth * 2);
        const dirName = dir.split('/').pop();
        
        markdown += `${indent}${dirName}/\n`;
      });
      
      markdown += `\`\`\`\n\n`;
      
      // Key components sections
      markdown += `## Key Components\n\n`;
      
      // Check for important directories
      if (fs.existsSync(join(cwd, 'src')) || fs.existsSync(join(cwd, 'app'))) {
        markdown += `### Application Code\n`;
        markdown += `Contains the core application code including components, utilities, and business logic.\n\n`;
      }
      
      if (fs.existsSync(join(cwd, 'public')) || fs.existsSync(join(cwd, 'static'))) {
        markdown += `### Static Assets\n`;
        markdown += `Contains static files like images, fonts, and other assets served directly.\n\n`;
      }
      
      if (fs.existsSync(join(cwd, 'api')) || fs.existsSync(join(cwd, 'server'))) {
        markdown += `### API/Server\n`;
        markdown += `Contains server-side code, API routes, and backend logic.\n\n`;
      }
      
      if (fs.existsSync(join(cwd, 'docs'))) {
        markdown += `### Documentation\n`;
        markdown += `Contains project documentation, guides, and architecture information.\n\n`;
      }
      
      if (fs.existsSync(join(cwd, 'tests')) || fs.existsSync(join(cwd, '__tests__'))) {
        markdown += `### Tests\n`;
        markdown += `Contains test files for the application code.\n\n`;
      }
      
      // Add main dependencies from package.json if it exists
      if (fs.existsSync(join(cwd, 'package.json'))) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(join(cwd, 'package.json'), 'utf8'));
          
          markdown += `## Main Dependencies\n\n\`\`\`\n`;
          
          if (packageJson.dependencies) {
            Object.entries(packageJson.dependencies).forEach(([name, version]) => {
              markdown += `"${name}": "${version}",\n`;
            });
          }
          
          markdown += `\`\`\`\n\n`;
          
          // Add dev dependencies
          markdown += `## Dev Dependencies\n\n\`\`\`\n`;
          
          if (packageJson.devDependencies) {
            Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
              markdown += `"${name}": "${version}",\n`;
            });
          }
          
          markdown += `\`\`\`\n\n`;
        } catch (error) {
          console.error('Error parsing package.json:', error);
        }
      }
      
      // Add note about generation
      markdown += `\n\n*This document was automatically generated.*`;
      
      // Write the markdown to the file
      fs.writeFileSync(outputFile, markdown);
      
      return outputFile;
    } catch (error) {
      console.error('Error generating project structure:', error);
      return '';
    }
  }
  
  private async runCustomScript(cwd: string): Promise<string> {
    const customScriptPath = join(cwd, '.scripts/update_structure.sh');
    if (fs.existsSync(customScriptPath)) {
      return execSync(`bash ${customScriptPath}`, { cwd }).toString();
    }
    return "";
  }
  
  private async saveUpdateToHistory(success: boolean, output: string): Promise<void> {
    try {
      let history: HistoryData = { updates: [] };
      if (fs.existsSync(this.historyPath)) {
        const historyContent = fs.readFileSync(this.historyPath, 'utf8');
        history = JSON.parse(historyContent) as HistoryData;
      }
      
      const updateRecord: UpdateRecord = {
        timestamp: new Date().toISOString(),
        success,
        output
      };
      
      history.updates.unshift(updateRecord);
      
      // Keep only last 20 updates
      if (history.updates.length > 20) {
        history.updates = history.updates.slice(0, 20);
      }
      
      fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2), 'utf8');
    } catch (error) {
      console.error("Error saving update to history:", error);
    }
  }
  
  private async startWatching(cwd: string, debounceMs = 1000): Promise<CommandResult> {
    const projectPath = cwd || process.cwd();
    
    // Check if already watching this project
    if (activeWatchers.has(projectPath)) {
      return {
        success: true,
        content: `Already watching project at ${projectPath}`
      };
    }
    
    try {
      // Execute initial update
      await this.handleUpdateOperation(projectPath);
      
      console.log(`Starting file watcher for ${projectPath}`);
      
      // Create a debounced update function
      let debounceTimeout: NodeJS.Timeout | null = null;
      const debouncedUpdate = () => {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(async () => {
          console.log(`Project changed, updating documentation for ${projectPath}`);
          await this.handleUpdateOperation(projectPath);
        }, debounceMs);
      };
      
      // Setup watcher
      const watcher = chokidar.watch(projectPath, {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/docs/architecture/**', // Avoid triggering on our own output
          '**/.DS_Store'
        ],
        persistent: true,
        ignoreInitial: true
      });
      
      // Add event listeners for file changes
      watcher.on('add', debouncedUpdate)
             .on('change', debouncedUpdate)
             .on('unlink', debouncedUpdate)
             .on('addDir', debouncedUpdate)
             .on('unlinkDir', debouncedUpdate)
             .on('error', (error) => console.error(`Watcher error: ${error}`));
      
      // Store the watcher
      activeWatchers.set(projectPath, watcher);
      
      return {
        success: true,
        content: `Started watching project at ${projectPath}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to start watching: ${errorMessage}`
      };
    }
  }
  
  private async stopWatching(cwd: string): Promise<CommandResult> {
    const projectPath = cwd || process.cwd();
    
    // Check if we're watching this project
    if (!activeWatchers.has(projectPath)) {
      return {
        success: false,
        error: `Not watching project at ${projectPath}`
      };
    }
    
    try {
      // Close the watcher
      const watcher = activeWatchers.get(projectPath);
      await watcher?.close();
      
      // Remove from active watchers
      activeWatchers.delete(projectPath);
      
      console.log(`Stopped watching project at ${projectPath}`);
      
      return {
        success: true,
        content: `Stopped watching project at ${projectPath}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to stop watching: ${errorMessage}`
      };
    }
  }
  
  private async handleUpdateOperation(cwd: string): Promise<CommandResult> {
    try {
      // Check if there's a custom update script
      const customScriptPath = join(cwd, '.scripts/update_structure.sh');
      if (fs.existsSync(customScriptPath)) {
        const output = await this.runCustomScript(cwd);
        await this.saveUpdateToHistory(true, output || "Custom update script executed successfully");
        return {
          success: true,
          content: output || "Project structure documentation updated!"
        };
      }
      
      // Generate standard documentation
      const structureFile = this.generateProjectStructure(cwd);
      
      // Generate the comprehensive memory bank
      const memoryFile = await this.generateProjectMemory(cwd);
      
      // Save the update to history
      await this.saveUpdateToHistory(true, `Documentation updated: ${structureFile}, ${memoryFile}`);
      
      return {
        success: true,
        content: `Project documentation updated! Structure saved to ${structureFile} and comprehensive memory bank saved to ${memoryFile}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.saveUpdateToHistory(false, `Error updating documentation: ${errorMessage}`);
      return {
        success: false,
        error: `Failed to update project structure: ${errorMessage}`
      };
    }
  }
  
  public async handleCommand(
    command: UpdateScriptCommand
  ): Promise<CommandResult> {
    try {
      if (command.operation === "list_updates") {
        if (fs.existsSync(this.historyPath)) {
          const historyContent = fs.readFileSync(this.historyPath, 'utf8');
          return {
            success: true,
            content: historyContent
          };
        }
        return {
          success: true,
          content: JSON.stringify({ updates: [] })
        };
      }
      
      if (command.operation === "run_update") {
        const cwd = command.cwd || process.cwd();
        return this.handleUpdateOperation(cwd);
      }
      
      if (command.operation === "watch_project") {
        const cwd = command.cwd || process.cwd();
        const debounceMs = command.debounceMs || 1000;
        return this.startWatching(cwd, debounceMs);
      }
      
      if (command.operation === "stop_watching") {
        const cwd = command.cwd || process.cwd();
        return this.stopWatching(cwd);
      }
      
      if (command.operation === "generate_memory_bank") {
        const cwd = command.cwd || process.cwd();
        try {
          const memoryFile = await this.generateProjectMemory(cwd);
          await this.saveUpdateToHistory(true, `Memory bank generated: ${memoryFile}`);
          return {
            success: true,
            content: `Project memory bank generated and saved to ${memoryFile}`
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await this.saveUpdateToHistory(false, `Error generating memory bank: ${errorMessage}`);
          return {
            success: false,
            error: `Failed to generate project memory bank: ${errorMessage}`
          };
        }
      }
      
      return {
        success: false,
        error: "Invalid operation"
      };
    } catch (error) {
      return {
        success: false,
        error: `Operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      };
    }
  }

  // NEW METHODS FOR CUSTOM TEMPLATE

  private async applyCustomTemplateJs(
    projectName: string = 'new-js-project',
    projectPath: string = ''
  ): Promise<CommandResult> {
    try {
      // If project path is not specified, use current directory + project name
      const targetPath = projectPath || join(process.cwd(), projectName);
      
      const generator = new TemplateGenerator({
        templateName: 'blank-js',
        projectName,
        projectPath: targetPath,
      });
      
      const result = await generator.generate();
      
      return {
        success: result.success,
        content: result.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // NEW METHODS FOR DEPENDENCY ANALYSIS

  private async analyzeDependencies(
    cwd: string,
    format: 'json' | 'markdown' | 'dot' = 'markdown',
    includeNodeModules = false,
    depth = 3
  ): Promise<CommandResult> {
    try {
      const analyzer = new DependencyAnalyzer(cwd, includeNodeModules, depth);
      
      // Create output directory if it doesn't exist
      const outputDir = join(cwd, 'docs', 'analysis');
      await fs.ensureDir(outputDir);
      
      let outputContent = '';
      let outputFile = '';
      
      switch (format) {
        case 'json':
          outputContent = JSON.stringify(await analyzer.analyze(), null, 2);
          outputFile = join(outputDir, 'dependencies.json');
          break;
          
        case 'dot':
          outputContent = await analyzer.formatGraph('dot');
          outputFile = join(outputDir, 'dependencies.dot');
          break;
          
        case 'markdown':
        default:
          outputContent = await analyzer.formatGraph('markdown');
          outputFile = join(outputDir, 'dependencies.md');
          break;
      }
      
      // Write the output to a file
      await fs.writeFile(outputFile, outputContent);
      
      return {
        success: true,
        content: `Dependency analysis complete! Output saved to ${outputFile}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // NEW METHODS FOR METRICS

  private async generateMetrics(
    cwd: string,
    includeComplexity = true,
    includeCoverage = false,
    includeLocMetrics = true,
    outputFormat: 'json' | 'markdown' = 'markdown'
  ): Promise<CommandResult> {
    try {
      const analyzer = new MetricsAnalyzer(
        cwd,
        includeComplexity,
        includeCoverage,
        includeLocMetrics
      );
      
      // Create output directory if it doesn't exist
      const outputDir = join(cwd, 'docs', 'analysis');
      await fs.ensureDir(outputDir);
      
      let outputContent = '';
      let outputFile = '';
      
      if (outputFormat === 'json') {
        outputContent = await analyzer.formatJson();
        outputFile = join(outputDir, 'metrics.json');
      } else {
        outputContent = await analyzer.formatMarkdown();
        outputFile = join(outputDir, 'metrics.md');
      }
      
      // Write the output to a file
      await fs.writeFile(outputFile, outputContent);
      
      return {
        success: true,
        content: `Code metrics analysis complete! Output saved to ${outputFile}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // NEW METHODS FOR VISUAL DIAGRAMS

  private async createVisualDiagram(
    cwd: string,
    type: 'structure' | 'dependencies' | 'components' | 'all' = 'structure',
    format: 'mermaid' | 'dot' | 'svg' | 'png' = 'mermaid',
    outputPath?: string
  ): Promise<CommandResult> {
    try {
      const generator = new DiagramGenerator({
        type,
        format,
        cwd,
        outputPath,
      });
      
      // Create output directory if it doesn't exist
      const outputDir = outputPath || join(cwd, 'docs', 'diagrams');
      await fs.ensureDir(outputDir);
      
      const diagram = await generator.generate();
      
      // Determine filename based on type and format
      const filename = `${type}-diagram.${format === 'mermaid' ? 'md' : format}`;
      const outputFile = join(outputDir, filename);
      
      // Write the diagram to a file
      await fs.writeFile(outputFile, diagram);
      
      return {
        success: true,
        content: `Visual diagram created! Output saved to ${outputFile}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Add a new method to generate a comprehensive project memory file
  private async generateProjectMemory(cwd: string): Promise<string> {
    try {
      // Create docs directory
      const docsDir = join(cwd, 'docs/architecture');
      fs.mkdirSync(docsDir, { recursive: true });
      
      const outputFile = join(docsDir, 'project-memory.md');
      
      // Start building the markdown content
      let markdown = `# AI-Optimized Project Memory Bank\n\n`;
      
      // Add metadata section for quick AI comprehension
      markdown += `## 📋 Project Metadata\n\n`;
      markdown += `- **Project Path:** \`${cwd}\`\n`;
      markdown += `- **Documentation Generated:** ${new Date().toISOString()}\n`;
      
      // Try to detect project type and name from package.json
      if (fs.existsSync(join(cwd, 'package.json'))) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(join(cwd, 'package.json'), 'utf8'));
          markdown += `- **Project Name:** ${packageJson.name || 'Unknown'}\n`;
          markdown += `- **Project Description:** ${packageJson.description || 'Not specified'}\n`;
          markdown += `- **Version:** ${packageJson.version || 'Not specified'}\n`;
          markdown += `- **Main Technology:** ${this.detectMainTechnology(packageJson)}\n`;
        } catch (error) {
          console.error('Error parsing package.json:', error);
        }
      }
      
      markdown += `\n`;
      
      // Add executive summary for quick understanding
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
      
      // Include project structure
      markdown += `## 📁 Project Structure\n\n`;
      
      // Get directory structure using find command
      markdown += `### Directory Hierarchy\n\`\`\`\n`;
      
      const findCmd = `find . -type d -not -path "*/\\.*" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" | sort`;
      const dirs = execSync(findCmd, { cwd }).toString().split('\n').filter(Boolean);
      
      dirs.forEach((dir: string) => {
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
            
            // Categorize and sort dependencies by importance
            const importantDeps = ['react', 'next', 'vue', 'angular', 'express', 'nestjs', 'redux'];
            const sortedDeps = Object.entries(packageJson.dependencies).sort(([a], [b]) => {
              const aImportant = importantDeps.includes(a);
              const bImportant = importantDeps.includes(b);
              
              if (aImportant && !bImportant) return -1;
              if (!aImportant && bImportant) return 1;
              return a.localeCompare(b);
            });
            
            for (const [name, version] of sortedDeps) {
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
          
          // Add framework-specific analysis
          const frameworks = this.detectFrameworks(packageJson);
          if (frameworks.length > 0) {
            markdown += `### Framework Analysis\n\n`;
            markdown += `This project appears to use the following frameworks/libraries:\n\n`;
            
            for (const framework of frameworks) {
              markdown += `- **${framework.name}**: ${framework.description}\n`;
            }
            
            markdown += `\n`;
          }
        } catch (error) {
          console.error('Error parsing package.json:', error);
        }
      }
      
      // Create dependency analyzer and get summary for internal dependencies
      const analyzer = new DependencyAnalyzer(cwd, false, 2);
      try {
        const dependencyGraph = await analyzer.analyze();
        
        markdown += `### Module Dependencies\n\n`;
        markdown += `Total modules: ${dependencyGraph.nodes.length}\n\n`;
        
        // Get top modules with most dependencies
        const topDeps = [...dependencyGraph.nodes]
          .sort((a, b) => b.dependencies.length - a.dependencies.length)
          .slice(0, 7);
        
        if (topDeps.length > 0) {
          markdown += `#### Key Modules (Most Connected)\n\n`;
          
          for (const module of topDeps) {
            markdown += `- **${module.id}**: ${module.dependencies.length} connections\n`;
          }
          
          markdown += `\n`;
        }
      } catch (error) {
        markdown += `*Dependency analysis unavailable*\n\n`;
      }
      
      // Add code metrics
      markdown += `## 📊 Code Metrics\n\n`;
      
      // Create metrics analyzer and get summary
      const metricsAnalyzer = new MetricsAnalyzer(cwd, true, false, true);
      try {
        const metrics = await metricsAnalyzer.analyze();
        
        markdown += `### Project Statistics\n\n`;
        markdown += `| Metric | Value |\n`;
        markdown += `| ------ | ----- |\n`;
        markdown += `| Total Files | ${metrics.summary.totalFiles} |\n`;
        markdown += `| Lines of Code | ${metrics.summary.totalLoc} |\n`;
        markdown += `| Source Lines | ${metrics.summary.totalSloc} |\n`;
        markdown += `| Comments | ${metrics.summary.totalComments} |\n`;
        markdown += `| Functions | ${metrics.summary.totalFunctions} |\n`;
        markdown += `| Average Complexity | ${metrics.summary.averageComplexity.toFixed(2)} |\n\n`;
        
        markdown += `### Complexity Analysis\n\n`;
        markdown += `Top complex files (potential core logic or refactoring candidates):\n\n`;
        
        metrics.topComplexFiles.slice(0, 5).forEach(file => {
          markdown += `- **${file.filePath}**: Complexity ${file.complexity}\n`;
        });
        
        markdown += `\n`;
      } catch (error) {
        markdown += `*Code metrics unavailable*\n\n`;
      }
      
      // Add visual diagrams
      markdown += `## 📈 Visual Representations\n\n`;
      
      // Create diagram generator and get structure diagram
      const diagramGenerator = new DiagramGenerator({
        type: 'structure',
        format: 'mermaid',
        cwd,
      });
      
      try {
        const structureDiagram = await diagramGenerator.generate();
        markdown += `### Project Structure Diagram\n\n`;
        markdown += `\`\`\`mermaid\n${structureDiagram.replace(/```mermaid|```/g, '')}\n\`\`\`\n\n`;
      } catch (error) {
        markdown += `*Structure diagram unavailable*\n\n`;
      }
      
      // Try to generate a dependency diagram too
      const depDiagramGenerator = new DiagramGenerator({
        type: 'dependencies',
        format: 'mermaid',
        cwd,
      });
      
      try {
        const depDiagram = await depDiagramGenerator.generate();
        markdown += `### Dependency Diagram\n\n`;
        markdown += `\`\`\`mermaid\n${depDiagram.replace(/```mermaid|```/g, '')}\n\`\`\`\n\n`;
      } catch (error) {
        markdown += `*Dependency diagram unavailable*\n\n`;
      }
      
      // Add AI assistant prompt section
      markdown += `## 🤖 AI Context & Guidance\n\n`;
      markdown += `When working with this project, consider the following:\n\n`;
      markdown += `1. **Project Structure**: Review the directory hierarchy to understand the organization\n`;
      markdown += `2. **Key Files**: Examine important configuration and entry point files\n`;
      markdown += `3. **Dependencies**: Note the primary frameworks and libraries in use\n`;
      markdown += `4. **Complex Components**: Pay attention to files with high complexity scores\n\n`;
      
      markdown += `### Suggested Starting Points\n\n`;
      
      const startingPoints = [];
      
      // Add entry points
      for (const entry of entryPoints) {
        if (fs.existsSync(join(cwd, entry))) {
          startingPoints.push(`- **${entry}**: Main entry point`);
        }
      }
      
      // Add key configuration files
      for (const file of ['package.json', 'tsconfig.json', 'next.config.js']) {
        if (fs.existsSync(join(cwd, file))) {
          startingPoints.push(`- **${file}**: Configuration`);
        }
      }
      
      if (startingPoints.length > 0) {
        markdown += startingPoints.join('\n') + '\n\n';
      } else {
        markdown += `*No suggested starting points available*\n\n`;
      }
      
      // Add note about generation
      markdown += `---\n\n`;
      markdown += `*This AI-optimized memory bank was generated on ${new Date().toLocaleString()} to facilitate project comprehension.*`;
      
      // Write the markdown to the file
      fs.writeFileSync(outputFile, markdown);
      
      return outputFile;
    } catch (error) {
      console.error('Error generating project memory:', error);
      return '';
    }
  }
  
  // Helper method to detect main technology
  private detectMainTechnology(packageJson: any): string {
    if (!packageJson || !packageJson.dependencies) return 'Unknown';
    
    const deps = packageJson.dependencies;
    
    if (deps.react) {
      if (deps.next) return 'Next.js (React Framework)';
      if (deps['react-native']) return 'React Native';
      return 'React';
    }
    
    if (deps.vue) return 'Vue.js';
    if (deps.angular || deps['@angular/core']) return 'Angular';
    if (deps.express || deps.fastify || deps.koa) return 'Node.js Server';
    if (deps.electron) return 'Electron';
    
    if (packageJson.devDependencies?.typescript) return 'TypeScript';
    
    return 'JavaScript';
  }
  
  // Helper method to detect frameworks
  private detectFrameworks(packageJson: any): Array<{name: string, description: string}> {
    if (!packageJson || !packageJson.dependencies) return [];
    
    const frameworks = [];
    const deps = {...packageJson.dependencies, ...packageJson.devDependencies};
    
    // UI Frameworks
    if (deps.react) {
      frameworks.push({
        name: 'React',
        description: 'UI library for building component-based interfaces'
      });
      
      if (deps.next) {
        frameworks.push({
          name: 'Next.js',
          description: 'React framework with built-in SSR, routing, and optimization'
        });
      }
      
      if (deps['react-native']) {
        frameworks.push({
          name: 'React Native',
          description: 'Framework for building native mobile apps using React'
        });
      }
    }
    
    if (deps.vue) {
      frameworks.push({
        name: 'Vue.js',
        description: 'Progressive JavaScript framework for building UIs'
      });
      
      if (deps.nuxt) {
        frameworks.push({
          name: 'Nuxt.js',
          description: 'Vue framework with powerful features like SSR and file-based routing'
        });
      }
    }
    
    if (deps.angular || deps['@angular/core']) {
      frameworks.push({
        name: 'Angular',
        description: 'Platform for building web applications with TypeScript'
      });
    }
    
    // Backend Frameworks
    if (deps.express) {
      frameworks.push({
        name: 'Express',
        description: 'Fast, unopinionated web framework for Node.js'
      });
    }
    
    if (deps['@nestjs/core']) {
      frameworks.push({
        name: 'NestJS',
        description: 'Progressive Node.js framework for building server-side applications'
      });
    }
    
    // UI Libraries
    if (deps.tailwindcss) {
      frameworks.push({
        name: 'Tailwind CSS',
        description: 'Utility-first CSS framework'
      });
    }
    
    if (deps['@mui/material'] || deps['@material-ui/core']) {
      frameworks.push({
        name: 'Material UI',
        description: 'React UI component library implementing Material Design'
      });
    }
    
    if (deps['@chakra-ui/react']) {
      frameworks.push({
        name: 'Chakra UI',
        description: 'Component library for React applications'
      });
    }
    
    // State Management
    if (deps.redux || deps['@reduxjs/toolkit']) {
      frameworks.push({
        name: 'Redux',
        description: 'Predictable state container for JavaScript apps'
      });
    }
    
    if (deps.zustand) {
      frameworks.push({
        name: 'Zustand',
        description: 'Small, fast state management solution for React'
      });
    }
    
    return frameworks;
  }
}
