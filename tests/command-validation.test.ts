import { 
  RunUpdateCommand, 
  WatchProjectCommand,
  AnalyzeDependenciesCommand,
  UpdateScriptOperation 
} from '../src/types.js';

describe('Command Validation', () => {
  // Test for RunUpdateCommand
  test('RunUpdateCommand should have correct structure', () => {
    const command: RunUpdateCommand = {
      operation: 'run_update',
      cwd: '/test/path'
    };
    
    expect(command.operation).toBe('run_update');
    expect(command.cwd).toBe('/test/path');
  });

  // Test for WatchProjectCommand
  test('WatchProjectCommand should accept debounceMs', () => {
    const command: WatchProjectCommand = {
      operation: 'watch_project',
      cwd: '/test/path',
      debounceMs: 1000
    };
    
    expect(command.operation).toBe('watch_project');
    expect(command.cwd).toBe('/test/path');
    expect(command.debounceMs).toBe(1000);
  });

  // Test for AnalyzeDependenciesCommand
  test('AnalyzeDependenciesCommand should accept various options', () => {
    const command: AnalyzeDependenciesCommand = {
      operation: 'analyze_dependencies',
      cwd: '/test/path',
      format: 'markdown',
      includeNodeModules: true,
      depth: 3
    };
    
    expect(command.operation).toBe('analyze_dependencies');
    expect(command.cwd).toBe('/test/path');
    expect(command.format).toBe('markdown');
    expect(command.includeNodeModules).toBe(true);
    expect(command.depth).toBe(3);
  });

  // Test for operation type enforcement
  test('TypeScript should enforce operation type to be a valid operation', () => {
    // This test verifies at compile time that operations must be from the OPERATIONS constant
    // We're essentially just testing the TypeScript type system
    const validOperations: UpdateScriptOperation[] = [
      'run_update',
      'list_updates',
      'watch_project',
      'stop_watching',
      'custom_template_js',
      'analyze_dependencies',
      'generate_metrics',
      'create_visual_diagram'
    ];
    
    expect(validOperations.length).toBe(8);
    
    // We can't directly test invalid operations because TypeScript wouldn't compile,
    // but we can test that all operations are accounted for
    expect(validOperations).toContain('run_update');
    expect(validOperations).toContain('list_updates');
    expect(validOperations).toContain('watch_project');
  });
}); 