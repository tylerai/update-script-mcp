import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export interface DependencyNode {
  id: string;
  dependencies: string[];
  type: 'file' | 'package';
  size?: number;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  root: string;
}

export class DependencyAnalyzer {
  private cwd: string;
  private includeNodeModules: boolean;
  private maxDepth: number;
  private visitedPaths: Set<string> = new Set();
  private dependencyMap: Map<string, DependencyNode> = new Map();

  constructor(cwd: string, includeNodeModules = false, maxDepth = 3) {
    this.cwd = cwd;
    this.includeNodeModules = includeNodeModules;
    this.maxDepth = maxDepth;
  }

  async analyze(): Promise<DependencyGraph> {
    // Reset state
    this.visitedPaths.clear();
    this.dependencyMap.clear();

    // Get all JavaScript/TypeScript files
    const jsFiles = await glob('**/*.{js,jsx,ts,tsx}', {
      cwd: this.cwd,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
      ],
    });

    // Process each file
    for (const filePath of jsFiles) {
      const fullPath = path.join(this.cwd, filePath);
      await this.processFile(fullPath, 0);
    }

    return {
      nodes: Array.from(this.dependencyMap.values()),
      root: this.cwd,
    };
  }

  private async processFile(
    filePath: string,
    depth: number
  ): Promise<DependencyNode | null> {
    if (depth > this.maxDepth || this.visitedPaths.has(filePath)) {
      return this.dependencyMap.get(filePath) || null;
    }

    this.visitedPaths.add(filePath);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const dependencies = this.extractDependencies(content);
    const relativePath = path.relative(this.cwd, filePath);
    const stats = await fs.stat(filePath);

    const node: DependencyNode = {
      id: relativePath,
      dependencies: [],
      type: 'file',
      size: stats.size,
    };

    this.dependencyMap.set(filePath, node);

    // Process dependencies
    for (const dep of dependencies) {
      try {
        const resolvedPath = this.resolveDependency(dep, filePath);
        if (resolvedPath) {
          const isNodeModule = resolvedPath.includes('node_modules');
          
          if (isNodeModule && !this.includeNodeModules) {
            node.dependencies.push(dep);
            continue;
          }

          if (fs.existsSync(resolvedPath)) {
            const childNode = await this.processFile(resolvedPath, depth + 1);
            if (childNode) {
              node.dependencies.push(childNode.id);
            } else {
              node.dependencies.push(dep);
            }
          }
        } else {
          node.dependencies.push(dep);
        }
      } catch (error) {
        node.dependencies.push(dep);
      }
    }

    this.dependencyMap.set(filePath, node);
    return node;
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    
    // ES Modules (import statements)
    const importRegex = /import\s+(?:.+\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    // CommonJS (require statements)
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    // TypeScript dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    return [...new Set(dependencies)]; // Remove duplicates
  }

  private resolveDependency(dependency: string, fromFile: string): string | null {
    const fromDir = path.dirname(fromFile);

    // Handle relative imports
    if (dependency.startsWith('./') || dependency.startsWith('../')) {
      const resolvedPath = path.resolve(fromDir, dependency);
      
      // Check if file exists directly
      if (fs.existsSync(resolvedPath)) {
        return resolvedPath;
      }

      // Try adding extensions
      for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
        const withExt = `${resolvedPath}${ext}`;
        if (fs.existsSync(withExt)) {
          return withExt;
        }
      }

      // Try as a directory with index file
      for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
        const indexFile = path.join(resolvedPath, `index${ext}`);
        if (fs.existsSync(indexFile)) {
          return indexFile;
        }
      }
    }

    // TODO: Add proper resolution for node modules if needed
    return null;
  }

  // Formats the dependency graph in different formats
  async formatGraph(format: 'json' | 'markdown' | 'dot'): Promise<string> {
    const graph = await this.analyze();

    switch (format) {
      case 'json':
        return JSON.stringify(graph, null, 2);

      case 'markdown':
        return this.formatMarkdown();

      case 'dot':
        return this.formatDot();

      default:
        return JSON.stringify(graph, null, 2);
    }
  }

  private formatMarkdown(): string {
    let output = '# Dependency Analysis\n\n';
    
    // Generate summary
    const nodeCount = this.dependencyMap.size;
    output += `## Summary\n\n`;
    output += `- Total files analyzed: ${nodeCount}\n`;
    
    // List files with most dependencies
    const sortedByDepsCount = Array.from(this.dependencyMap.values())
      .sort((a, b) => b.dependencies.length - a.dependencies.length)
      .slice(0, 10);
    
    output += '\n## Files with Most Dependencies\n\n';
    output += '| File | Dependencies |\n';
    output += '| ---- | ------------ |\n';
    
    for (const node of sortedByDepsCount) {
      output += `| \`${node.id}\` | ${node.dependencies.length} |\n`;
    }
    
    // List files with most dependents (files that import this file)
    const dependents = new Map<string, string[]>();
    
    for (const node of this.dependencyMap.values()) {
      for (const dep of node.dependencies) {
        if (!dependents.has(dep)) {
          dependents.set(dep, []);
        }
        dependents.get(dep)?.push(node.id);
      }
    }
    
    const sortedByDependents = Array.from(dependents.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10);
    
    output += '\n## Most Imported Files\n\n';
    output += '| File | Imported by |\n';
    output += '| ---- | ----------- |\n';
    
    for (const [file, deps] of sortedByDependents) {
      output += `| \`${file}\` | ${deps.length} |\n`;
    }
    
    return output;
  }

  private formatDot(): string {
    let dot = 'digraph Dependencies {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box, style=filled, fillcolor=lightblue];\n\n';
    
    // Add nodes
    for (const node of this.dependencyMap.values()) {
      const label = node.id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      dot += `  "${label}" [label="${label}"];\n`;
    }
    
    dot += '\n';
    
    // Add edges
    for (const node of this.dependencyMap.values()) {
      const sourceLabel = node.id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      
      for (const dep of node.dependencies) {
        const targetLabel = dep.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        dot += `  "${sourceLabel}" -> "${targetLabel}";\n`;
      }
    }
    
    dot += '}\n';
    return dot;
  }
} 