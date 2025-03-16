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
        markdown += `Contains server-side code and API endpoints.\n\n`;
      }
      
      if (
        fs.existsSync(join(cwd, 'tests')) || 
        fs.existsSync(join(cwd, '__tests__')) || 
        fs.existsSync(join(cwd, 'test'))
      ) {
        markdown += `### Tests\n`;
        markdown += `Contains test files for the application.\n\n`;
      }
      
      // Extract package.json dependencies if they exist
      const pkgPath = join(cwd, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkgContent = fs.readFileSync(pkgPath, 'utf8');
          const pkg = JSON.parse(pkgContent);
          
          if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
            markdown += `## Main Dependencies\n\n\`\`\`\n`;
            for (const [dep, version] of Object.entries(pkg.dependencies)) {
              markdown += `"${dep}": "${version}",\n`;
            }
            markdown += `\`\`\`\n\n`;
          }
          
          if (pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0) {
            markdown += `## Dev Dependencies\n\n\`\`\`\n`;
            for (const [dep, version] of Object.entries(pkg.devDependencies)) {
              markdown += `"${dep}": "${version}",\n`;
            }
            markdown += `\`\`\`\n\n`;
          }
        } catch (err) {
          console.error('Error parsing package.json:', err);
        }
      }
      
      // Add footer
      markdown += `\n*This document was automatically generated.*`;
      
      // Write the markdown to the output file
      fs.writeFileSync(outputFile, markdown, 'utf8');
      
      return markdown;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error generating project structure: ${error.message}`);
      }
      throw new Error("Unknown error generating project structure");
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
      } else {
        // Use our universal implementation
        this.generateProjectStructure(cwd);
        const output = "Project structure documentation updated!";
        await this.saveUpdateToHistory(true, output);
        return {
          success: true,
          content: output
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await this.saveUpdateToHistory(false, errorMessage);
      return {
        success: false,
        error: errorMessage
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
}
