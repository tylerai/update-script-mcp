import { 
  OPERATIONS, 
  UpdateScriptOperation,
  CommandResult
} from '../src/types.js';

describe('Types', () => {
  test('OPERATIONS should contain all expected operation types', () => {
    expect(OPERATIONS).toContain('run_update');
    expect(OPERATIONS).toContain('list_updates');
    expect(OPERATIONS).toContain('watch_project');
    expect(OPERATIONS).toContain('stop_watching');
    expect(OPERATIONS).toContain('custom_template_js');
    expect(OPERATIONS).toContain('analyze_dependencies');
    expect(OPERATIONS).toContain('generate_metrics');
    expect(OPERATIONS).toContain('create_visual_diagram');
    expect(OPERATIONS.length).toBe(8);
  });

  test('CommandResult type can be instantiated with success and content', () => {
    const result: CommandResult = {
      success: true,
      content: 'Test content'
    };
    expect(result.success).toBe(true);
    expect(result.content).toBe('Test content');
    expect(result.error).toBeUndefined();
  });

  test('CommandResult type can be instantiated with failure and error', () => {
    const result: CommandResult = {
      success: false,
      error: 'Test error'
    };
    expect(result.success).toBe(false);
    expect(result.error).toBe('Test error');
    expect(result.content).toBeUndefined();
  });
}); 