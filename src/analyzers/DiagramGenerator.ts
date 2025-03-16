import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { DependencyAnalyzer } from './DependencyAnalyzer.js';

interface DiagramOptions {
  type: 'structure' | 'dependencies' | 'components' | 'all';
  format: 'mermaid' | 'dot' | 'svg' | 'png';
  outputPath?: string;
  cwd: string;
}

export class DiagramGenerator {
  private options: DiagramOptions;
  
  constructor(options: DiagramOptions) {
    this.options = {
      ...options,
    };
  }
  
  async generate(): Promise<string> {
    switch (this.options.type) {
      case 'structure':
        return this.generateStructureDiagram();
        
      case 'dependencies':
        return this.generateDependencyDiagram();
        
      case 'components':
        return this.generateComponentsDiagram();
        
      case 'all':
        const structure = await this.generateStructureDiagram();
        const dependencies = await this.generateDependencyDiagram();
        const components = await this.generateComponentsDiagram();
        
        return `${structure}\n\n${dependencies}\n\n${components}`;
        
      default:
        return this.generateStructureDiagram();
    }
  }
  
  private async generateStructureDiagram(): Promise<string> {
    // Get directory structure
    const directories = await this.getDirectoryStructure();
    
    switch (this.options.format) {
      case 'mermaid':
        return this.structureToMermaid(directories);
        
      case 'dot':
        return this.structureToDot(directories);
        
      default:
        return this.structureToMermaid(directories);
    }
  }
  
  private async generateDependencyDiagram(): Promise<string> {
    // Use DependencyAnalyzer to get dependencies
    const analyzer = new DependencyAnalyzer(this.options.cwd, false, 2);
    const dependencies = await analyzer.analyze();
    
    switch (this.options.format) {
      case 'mermaid':
        return this.dependenciesToMermaid(dependencies);
        
      case 'dot':
        return analyzer.formatGraph('dot');
        
      default:
        return this.dependenciesToMermaid(dependencies);
    }
  }
  
  private async generateComponentsDiagram(): Promise<string> {
    // Focus on React components
    const componentFiles = await glob('**/*.{jsx,tsx}', {
      cwd: this.options.cwd,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
      ],
    });
    
    const components = await this.extractComponents(componentFiles);
    
    switch (this.options.format) {
      case 'mermaid':
        return this.componentsToMermaid(components);
        
      case 'dot':
        return this.componentsToDot(components);
        
      default:
        return this.componentsToMermaid(components);
    }
  }
  
  private async getDirectoryStructure(): Promise<Map<string, string[]>> {
    const directories = new Map<string, string[]>();
    
    // Get all directories
    const allDirs = await glob('**/', {
      cwd: this.options.cwd,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/.git/**',
      ],
    });
    
    // Add root
    directories.set('.', []);
    
    // Process each directory
    for (const dir of allDirs) {
      const normalizedDir = dir.endsWith('/') ? dir.slice(0, -1) : dir;
      const parent = path.dirname(normalizedDir);
      
      if (!directories.has(normalizedDir)) {
        directories.set(normalizedDir, []);
      }
      
      if (parent && parent !== '.') {
        if (!directories.has(parent)) {
          directories.set(parent, []);
        }
        directories.get(parent)?.push(normalizedDir);
      } else {
        directories.get('.')?.push(normalizedDir);
      }
    }
    
    return directories;
  }
  
  private structureToMermaid(directories: Map<string, string[]>): string {
    let mermaid = '```mermaid\nflowchart TD\n';
    
    // Create unique IDs for directories
    const dirIds = new Map<string, string>();
    let idCounter = 0;
    
    for (const dir of directories.keys()) {
      dirIds.set(dir, `dir${idCounter++}`);
    }
    
    // Add nodes
    for (const [dir, _] of directories.entries()) {
      const id = dirIds.get(dir) || '';
      const displayName = dir === '.' ? 'Root' : path.basename(dir);
      mermaid += `  ${id}[${displayName}]\n`;
    }
    
    // Add relationships
    for (const [parent, children] of directories.entries()) {
      const parentId = dirIds.get(parent) || '';
      
      for (const child of children) {
        const childId = dirIds.get(child) || '';
        mermaid += `  ${parentId} --> ${childId}\n`;
      }
    }
    
    mermaid += '```';
    return mermaid;
  }
  
  private structureToDot(directories: Map<string, string[]>): string {
    let dot = 'digraph G {\n';
    dot += '  rankdir=TB;\n';
    dot += '  node [shape=box, style=filled, fillcolor=lightblue];\n\n';
    
    // Create unique IDs for directories
    const dirIds = new Map<string, string>();
    let idCounter = 0;
    
    for (const dir of directories.keys()) {
      dirIds.set(dir, `dir${idCounter++}`);
    }
    
    // Add nodes
    for (const [dir, _] of directories.entries()) {
      const id = dirIds.get(dir) || '';
      const displayName = dir === '.' ? 'Root' : dir;
      dot += `  ${id} [label="${displayName}"];\n`;
    }
    
    dot += '\n';
    
    // Add relationships
    for (const [parent, children] of directories.entries()) {
      const parentId = dirIds.get(parent) || '';
      
      for (const child of children) {
        const childId = dirIds.get(child) || '';
        dot += `  ${parentId} -> ${childId};\n`;
      }
    }
    
    dot += '}\n';
    return dot;
  }
  
  private dependenciesToMermaid(dependencies: any): string {
    let mermaid = '```mermaid\nflowchart LR\n';
    
    // Add nodes (limit to reasonable number)
    const nodes = dependencies.nodes.slice(0, 30);
    
    // Create simplified IDs for readability
    const nodeIds = new Map<string, string>();
    let idCounter = 0;
    
    for (const node of nodes) {
      const simpleId = `file${idCounter++}`;
      nodeIds.set(node.id, simpleId);
      
      // Use shortened filename for display
      const displayName = path.basename(node.id);
      mermaid += `  ${simpleId}["${displayName}"]\n`;
    }
    
    // Add relationships (limit to avoid overly complex diagrams)
    for (const node of nodes) {
      const sourceId = nodeIds.get(node.id);
      if (!sourceId) continue;
      
      // Limit dependencies per node to keep diagram readable
      const shownDeps = node.dependencies.slice(0, 5);
      
      for (const dep of shownDeps) {
        const targetId = nodeIds.get(dep);
        if (targetId) {
          mermaid += `  ${sourceId} --> ${targetId}\n`;
        }
      }
    }
    
    mermaid += '```';
    return mermaid;
  }
  
  private async extractComponents(componentFiles: string[]): Promise<Map<string, string[]>> {
    const components = new Map<string, string[]>();
    const imports = new Map<string, string[]>();
    
    for (const file of componentFiles) {
      const fullPath = path.join(this.options.cwd, file);
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Extract component name (simplistic approach)
        const componentNameMatch = content.match(/(?:function|const)\s+(\w+)(?:\s*=\s*\([^)]*\)\s*=>|\s*\([^)]*\)\s*:)/);
        let componentName = componentNameMatch ? componentNameMatch[1] : path.basename(file, path.extname(file));
        
        // Extract imports with simple regex
        const importMatches = content.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g) || [];
        const importedComponents: string[] = [];
        
        for (const importStr of importMatches) {
          const importedMatch = importStr.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/);
          if (importedMatch) {
            const importedNames = importedMatch[1].split(',').map(name => name.trim());
            importedComponents.push(...importedNames);
          }
        }
        
        components.set(componentName, []);
        imports.set(componentName, importedComponents);
        
      } catch (error) {
        console.error(`Error processing component file ${file}:`, error);
      }
    }
    
    // Link components based on imports
    for (const [component, importedNames] of imports.entries()) {
      for (const importedName of importedNames) {
        if (components.has(importedName)) {
          components.get(component)?.push(importedName);
        }
      }
    }
    
    return components;
  }
  
  private componentsToMermaid(components: Map<string, string[]>): string {
    let mermaid = '```mermaid\nflowchart TD\n';
    
    // Add component nodes
    for (const component of components.keys()) {
      mermaid += `  ${component}["${component}"]\n`;
    }
    
    // Add relationships
    for (const [component, dependencies] of components.entries()) {
      for (const dependency of dependencies) {
        mermaid += `  ${component} --> ${dependency}\n`;
      }
    }
    
    mermaid += '```';
    return mermaid;
  }
  
  private componentsToDot(components: Map<string, string[]>): string {
    let dot = 'digraph Components {\n';
    dot += '  rankdir=TB;\n';
    dot += '  node [shape=box, style=filled, fillcolor=lightgreen];\n\n';
    
    // Add component nodes
    for (const component of components.keys()) {
      const escapedName = component.replace(/"/g, '\\"');
      dot += `  "${escapedName}" [label="${escapedName}"];\n`;
    }
    
    dot += '\n';
    
    // Add relationships
    for (const [component, dependencies] of components.entries()) {
      const escapedComponent = component.replace(/"/g, '\\"');
      
      for (const dependency of dependencies) {
        const escapedDependency = dependency.replace(/"/g, '\\"');
        dot += `  "${escapedComponent}" -> "${escapedDependency}";\n`;
      }
    }
    
    dot += '}\n';
    return dot;
  }
} 