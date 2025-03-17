import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

interface FileMetrics {
  filePath: string;
  loc: number;        // Lines of code
  sloc: number;       // Source lines of code (non-empty, non-comment)
  comments: number;   // Comment lines
  functions: number;  // Number of functions
  classes: number;    // Number of classes
  complexity: number; // Estimated cyclomatic complexity
  fileSize: number;   // File size in bytes
}

interface DirMetrics {
  dirPath: string;
  totalFiles: number;
  metrics: {
    loc: number;
    sloc: number;
    comments: number;
    functions: number;
    classes: number;
    averageComplexity: number;
    totalSize: number;
  };
  topComplexFiles: FileMetrics[];
}

interface ProjectMetrics {
  projectPath: string;
  timestamp: string;
  summary: {
    totalFiles: number;
    totalLoc: number;
    totalSloc: number;
    totalComments: number;
    totalFunctions: number;
    totalClasses: number;
    averageComplexity: number;
    totalSize: number; // in bytes
  };
  byLanguage: Record<string, {
    files: number;
    loc: number;
    sloc: number;
  }>;
  byDirectory: DirMetrics[];
  topComplexFiles: FileMetrics[];
}

export class MetricsAnalyzer {
  private cwd: string;
  private includeComplexity: boolean;
  private includeCoverage: boolean;
  private includeLocMetrics: boolean;
  private fileMetrics: Map<string, FileMetrics> = new Map();
  private dirMetrics: Map<string, DirMetrics> = new Map();
  private languageStats: Map<string, { files: number; loc: number; sloc: number }> = new Map();
  
  constructor(
    cwd: string, 
    includeComplexity = true, 
    includeCoverage = false, 
    includeLocMetrics = true
  ) {
    this.cwd = cwd;
    this.includeComplexity = includeComplexity;
    this.includeCoverage = includeCoverage;
    this.includeLocMetrics = includeLocMetrics;
  }
  
  async analyze(): Promise<ProjectMetrics> {
    // Reset state
    this.fileMetrics.clear();
    this.dirMetrics.clear();
    this.languageStats.clear();
    
    // Find all source files
    const sourceFiles = await glob('**/*.{js,jsx,ts,tsx,css,scss,html,md,json}', {
      cwd: this.cwd,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/package-lock.json',
        '**/yarn.lock'
      ],
    });
    
    // Process each file
    for (const filePath of sourceFiles) {
      const fullPath = path.join(this.cwd, filePath);
      await this.processFile(fullPath);
    }
    
    // Calculate directory metrics
    this.calculateDirectoryMetrics();
    
    // Generate project summary
    const summary = this.generateSummary();
    
    // Get top complex files
    const topComplexFiles = Array.from(this.fileMetrics.values())
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 10);
    
    // Transform directory metrics to array
    const dirMetricsArray = Array.from(this.dirMetrics.values());
    
    // Create language stats
    const byLanguage: Record<string, { files: number; loc: number; sloc: number }> = {};
    this.languageStats.forEach((stat, lang) => {
      byLanguage[lang] = stat;
    });
    
    return {
      projectPath: this.cwd,
      timestamp: new Date().toISOString(),
      summary,
      byLanguage,
      byDirectory: dirMetricsArray,
      topComplexFiles,
    };
  }
  
  private async processFile(filePath: string): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      const relativePath = path.relative(this.cwd, filePath);
      const ext = path.extname(filePath).toLowerCase().substring(1);
      
      // Update language stats
      if (!this.languageStats.has(ext)) {
        this.languageStats.set(ext, { files: 0, loc: 0, sloc: 0 });
      }
      const langStat = this.languageStats.get(ext)!;
      langStat.files++;
      
      // Calculate metrics
      const lines = content.split('\n');
      const loc = lines.length;
      const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
      
      // Simple comment detection (can be improved for different languages)
      const commentRegex = /^\s*(\/\/|\/\*|\*|#)/;
      const commentLines = lines.filter(line => commentRegex.test(line.trim())).length;
      
      // Simple function detection (approximation)
      const functionRegex = /function\s+\w+\s*\(|=>\s*{|\)\s*{|[^a-zA-Z0-9_]async\s+\w+\s*\(|\w+\s*\([^)]*\)\s*{/g;
      const functionMatches = content.match(functionRegex) || [];
      const functions = functionMatches.length;
      
      // Simple class detection
      const classRegex = /class\s+\w+/g;
      const classMatches = content.match(classRegex) || [];
      const classes = classMatches.length;
      
      // Simple complexity estimation
      // Count control structures as a very basic approximation of cyclomatic complexity
      const controlRegex = /if\s*\(|else|for\s*\(|while\s*\(|switch\s*\(|case\s+|catch\s*\(|&&|\|\|/g;
      const controlMatches = content.match(controlRegex) || [];
      const complexity = 1 + controlMatches.length; // Base complexity of 1 plus control structures
      
      // Create metrics object
      const metrics: FileMetrics = {
        filePath: relativePath,
        loc,
        sloc: nonEmptyLines - commentLines,
        comments: commentLines,
        functions,
        classes,
        complexity,
        fileSize: stats.size,
      };
      
      this.fileMetrics.set(relativePath, metrics);
      
      // Update language stats
      langStat.loc += loc;
      langStat.sloc += (nonEmptyLines - commentLines);
      this.languageStats.set(ext, langStat);
      
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
  
  private calculateDirectoryMetrics(): void {
    // Group files by directory
    const dirFiles: Map<string, FileMetrics[]> = new Map();
    
    for (const metrics of this.fileMetrics.values()) {
      const dirPath = path.dirname(metrics.filePath);
      if (!dirFiles.has(dirPath)) {
        dirFiles.set(dirPath, []);
      }
      dirFiles.get(dirPath)!.push(metrics);
    }
    
    // Calculate metrics for each directory
    for (const [dirPath, files] of dirFiles.entries()) {
      const totalLoc = files.reduce((sum, file) => sum + file.loc, 0);
      const totalSloc = files.reduce((sum, file) => sum + file.sloc, 0);
      const totalComments = files.reduce((sum, file) => sum + file.comments, 0);
      const totalFunctions = files.reduce((sum, file) => sum + file.functions, 0);
      const totalClasses = files.reduce((sum, file) => sum + file.classes, 0);
      const totalComplexity = files.reduce((sum, file) => sum + file.complexity, 0);
      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
      
      const averageComplexity = totalComplexity / files.length || 0;
      
      // Get top complex files in this directory
      const topComplexFiles = [...files]
        .sort((a, b) => b.complexity - a.complexity)
        .slice(0, 5);
      
      const dirMetric: DirMetrics = {
        dirPath,
        totalFiles: files.length,
        metrics: {
          loc: totalLoc,
          sloc: totalSloc,
          comments: totalComments,
          functions: totalFunctions,
          classes: totalClasses,
          averageComplexity,
          totalSize,
        },
        topComplexFiles,
      };
      
      this.dirMetrics.set(dirPath, dirMetric);
    }
  }
  
  private generateSummary() {
    const allFiles = Array.from(this.fileMetrics.values());
    const totalFiles = allFiles.length;
    const totalLoc = allFiles.reduce((sum, file) => sum + file.loc, 0);
    const totalSloc = allFiles.reduce((sum, file) => sum + file.sloc, 0);
    const totalComments = allFiles.reduce((sum, file) => sum + file.comments, 0);
    const totalFunctions = allFiles.reduce((sum, file) => sum + file.functions, 0);
    const totalClasses = allFiles.reduce((sum, file) => sum + file.classes, 0);
    const totalComplexity = allFiles.reduce((sum, file) => sum + file.complexity, 0);
    const totalSize = allFiles.reduce((sum, file) => sum + file.fileSize, 0);
    
    return {
      totalFiles,
      totalLoc,
      totalSloc,
      totalComments,
      totalFunctions,
      totalClasses,
      averageComplexity: totalComplexity / totalFiles || 0,
      totalSize,
    };
  }
  
  async formatJson(): Promise<string> {
    const metrics = await this.analyze();
    return JSON.stringify(metrics, null, 2);
  }

  async formatMarkdown(): Promise<string> {
    const metrics = await this.analyze();
    let markdown = `# Code Metrics Analysis\n\n`;
    markdown += `Generated on: ${metrics.timestamp}\n\n`;

    // Project Summary
    markdown += `## Project Summary\n\n`;
    markdown += `- Total Files: ${metrics.summary.totalFiles}\n`;
    markdown += `- Total Lines of Code: ${metrics.summary.totalLoc}\n`;
    markdown += `- Source Lines of Code: ${metrics.summary.totalSloc}\n`;
    markdown += `- Comment Lines: ${metrics.summary.totalComments}\n`;
    markdown += `- Total Functions: ${metrics.summary.totalFunctions}\n`;
    markdown += `- Total Classes: ${metrics.summary.totalClasses}\n`;
    markdown += `- Average Complexity: ${metrics.summary.averageComplexity.toFixed(2)}\n`;
    markdown += `- Total Size: ${(metrics.summary.totalSize / 1024).toFixed(2)} KB\n\n`;

    // Language Statistics
    markdown += `## Language Statistics\n\n`;
    markdown += `| Language | Files | Lines of Code | Source Lines |\n`;
    markdown += `|----------|--------|--------------|--------------|`;
    Object.entries(metrics.byLanguage).forEach(([lang, stats]) => {
      markdown += `\n| ${lang} | ${stats.files} | ${stats.loc} | ${stats.sloc} |`;
    });
    markdown += `\n\n`;

    // Top Complex Files
    markdown += `## Most Complex Files\n\n`;
    markdown += `| File | Complexity | Functions | Classes | Lines of Code |\n`;
    markdown += `|------|------------|-----------|---------|--------------|`;
    metrics.topComplexFiles.forEach(file => {
      markdown += `\n| ${file.filePath} | ${file.complexity} | ${file.functions} | ${file.classes} | ${file.loc} |`;
    });
    markdown += `\n\n`;

    // Directory Metrics
    markdown += `## Directory Metrics\n\n`;
    metrics.byDirectory.forEach(dir => {
      markdown += `### ${dir.dirPath || '/'}\n\n`;
      markdown += `- Files: ${dir.totalFiles}\n`;
      markdown += `- Lines of Code: ${dir.metrics.loc}\n`;
      markdown += `- Source Lines: ${dir.metrics.sloc}\n`;
      markdown += `- Comments: ${dir.metrics.comments}\n`;
      markdown += `- Functions: ${dir.metrics.functions}\n`;
      markdown += `- Classes: ${dir.metrics.classes}\n`;
      markdown += `- Average Complexity: ${dir.metrics.averageComplexity.toFixed(2)}\n`;
      markdown += `- Size: ${(dir.metrics.totalSize / 1024).toFixed(2)} KB\n\n`;

      if (dir.topComplexFiles.length > 0) {
        markdown += `Most complex files in this directory:\n\n`;
        dir.topComplexFiles.forEach(file => {
          markdown += `- ${file.filePath} (complexity: ${file.complexity})\n`;
        });
        markdown += `\n`;
      }
    });

    return markdown;
  }
} 