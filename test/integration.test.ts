import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { 
  analyzeMetrics,
  createVisualDiagram,
  analyzeDependencies,
  generateMemoryBank 
} from '../src/mcp-tools.js';

// Define our own result type that matches what the functions actually return
interface ToolResult {
  isError: boolean;
  content?: Array<{ type: string; text: string }>;
}

describe('Update Script Tools Integration Tests', () => {
  const TEST_DIR = path.resolve(__dirname, '../test-project');
  const DOCS_DIR = path.resolve(TEST_DIR, 'docs');
  
  // Setup test project structure
  beforeAll(async () => {
    // Create test project structure
    await fs.ensureDir(TEST_DIR);
    await fs.ensureDir(path.join(TEST_DIR, 'src'));
    await fs.ensureDir(path.join(TEST_DIR, 'src/components'));
    await fs.ensureDir(path.join(TEST_DIR, 'src/utils'));
    
    // Create some test files
    await fs.writeFile(path.join(TEST_DIR, 'package.json'), JSON.stringify({
      name: "test-project",
      version: "1.0.0",
      dependencies: {
        "react": "^18.0.0",
        "next": "^13.0.0"
      },
      devDependencies: {
        "typescript": "^5.0.0"
      }
    }, null, 2));
    
    await fs.writeFile(path.join(TEST_DIR, 'src/index.ts'), `
      import { App } from './components/App';
      import { setupUtils } from './utils';
      
      setupUtils();
      export default App;
    `);
    
    await fs.writeFile(path.join(TEST_DIR, 'src/components/App.tsx'), `
      import React from 'react';
      import { Button } from './Button';
      import { formatDate } from '../utils';
      
      export function App() {
        return (
          <div>
            <h1>Test App</h1>
            <p>Current date: {formatDate(new Date())}</p>
            <Button>Click me</Button>
          </div>
        );
      }
    `);
    
    await fs.writeFile(path.join(TEST_DIR, 'src/components/Button.tsx'), `
      import React from 'react';
      
      export function Button({ children }) {
        return (
          <button className="btn">{children}</button>
        );
      }
    `);
    
    await fs.writeFile(path.join(TEST_DIR, 'src/utils/index.ts'), `
      export function formatDate(date: Date): string {
        return date.toLocaleDateString();
      }
      
      export function setupUtils() {
        console.log('Utils initialized');
      }
    `);
  });
  
  // Cleanup after tests
  afterAll(async () => {
    await fs.remove(TEST_DIR);
  });
  
  describe('Metrics Analyzer', () => {
    it('should generate metrics in markdown format', async () => {
      const result = await analyzeMetrics({
        params: {
          name: 'generate_metrics',
          arguments: {
            cwd: TEST_DIR,
            includeComplexity: true,
            includeCoverage: false,
            includeLocMetrics: true,
            outputFormat: 'markdown'
          }
        },
        method: 'tools/call'
      }) as ToolResult;
      
      expect(result.isError).toBe(false);
      expect(result.content?.[0]?.text).toContain('Metrics analysis complete');
      
      const metricsFile = path.join(TEST_DIR, 'docs/analysis/metrics.markdown');
      expect(fs.existsSync(metricsFile)).toBe(true);
      
      const content = await fs.readFile(metricsFile, 'utf-8');
      expect(content).toContain('# Code Metrics Analysis');
      expect(content).toContain('Project Summary');
      expect(content).toContain('Language Statistics');
    });
  });
  
  describe('Visual Diagram Generator', () => {
    it('should generate project structure diagram', async () => {
      const result = await createVisualDiagram({
        params: {
          name: 'create_visual_diagram',
          arguments: {
            cwd: TEST_DIR,
            type: 'structure',
            format: 'mermaid',
          }
        },
        method: 'tools/call'
      }) as ToolResult;
      
      expect(result.isError).toBe(false);
      expect(result.content?.[0]?.text).toContain('Visual diagram created');
      
      const diagramFile = path.join(TEST_DIR, 'docs/diagrams/structure-diagram.md');
      expect(fs.existsSync(diagramFile)).toBe(true);
      
      const content = await fs.readFile(diagramFile, 'utf-8');
      expect(content).toContain('flowchart TD');
      expect(content).toMatch(/\[components\]/); // Match node with label "components"
      expect(content).toMatch(/\[utils\]/); // Match node with label "utils"
    });
  });
  
  describe('Dependency Analyzer', () => {
    it('should analyze project dependencies', async () => {
      const result = await analyzeDependencies({
        params: {
          name: 'analyze_dependencies',
          arguments: {
            cwd: TEST_DIR,
            format: 'markdown',
            includeNodeModules: false,
            depth: 2
          }
        },
        method: 'tools/call'
      }) as ToolResult;
      
      expect(result.isError).toBe(false);
      expect(result.content?.[0]?.text).toContain('Dependency analysis complete');
      
      const depsFile = path.join(TEST_DIR, 'docs/analysis/dependencies.md');
      expect(fs.existsSync(depsFile)).toBe(true);
      
      const content = await fs.readFile(depsFile, 'utf-8');
      expect(content).toContain('App.tsx');
      expect(content).toContain('Button.tsx');
      expect(content).toContain('utils/index.ts');
    });
  });
  
  describe('Memory Bank Generator', () => {
    it('should generate AI-optimized memory bank', async () => {
      const result = await generateMemoryBank({
        params: {
          name: 'generate_memory_bank',
          arguments: {
            cwd: TEST_DIR,
            includeMetrics: true,
            includeDiagrams: true
          }
        },
        method: 'tools/call'
      }) as ToolResult;
      
      expect(result.isError).toBe(false);
      expect(result.content?.[0]?.text).toContain('AI-optimized project memory bank generated');
      
      const memoryFile = path.join(TEST_DIR, 'docs/architecture/project-memory.md');
      expect(fs.existsSync(memoryFile)).toBe(true);
      
      const content = await fs.readFile(memoryFile, 'utf-8');
      expect(content).toContain('# AI-Optimized Project Memory Bank');
      expect(content).toContain('Project Metadata');
      expect(content).toContain('Directory Hierarchy');
      expect(content).toContain('Core Directories');
      expect(content).toContain('Dependencies');
      expect(content).toContain('Code Metrics');
    });
  });
}); 