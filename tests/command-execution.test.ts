/**
 * @jest-environment node
 */
import { jest } from '@jest/globals';
import { MockFileHandler } from './mocks/FileHandler.mock.js';
import { UpdateScriptCommand, CommandResult } from '../src/types.js';

describe('Command Execution', () => {
  let fileHandler: MockFileHandler;

  beforeEach(() => {
    fileHandler = new MockFileHandler({ rootPath: '/test/path' });
  });

  test('should execute run_update command successfully', async () => {
    const command: UpdateScriptCommand = {
      operation: 'run_update',
      cwd: '/test/project'
    };

    // Setup mock result
    const mockResult: CommandResult = {
      success: true,
      content: 'Documentation updated successfully'
    };
    fileHandler.setMockResult('run_update', mockResult);

    const result = await fileHandler.executeCommand(command);
    expect(result.success).toBe(true);
    expect(result.content).toBe('Documentation updated successfully');
  });

  test('should handle error in watch_project command', async () => {
    const command: UpdateScriptCommand = {
      operation: 'watch_project',
      cwd: '/test/project',
      debounceMs: 1000
    };

    // Setup mock result with error
    const mockResult: CommandResult = {
      success: false,
      error: 'Failed to start watching: directory not found'
    };
    fileHandler.setMockResult('watch_project', mockResult);

    const result = await fileHandler.executeCommand(command);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to start watching: directory not found');
  });

  test('should execute analyze_dependencies command with default success response', async () => {
    const command: UpdateScriptCommand = {
      operation: 'analyze_dependencies',
      cwd: '/test/project',
      format: 'json',
      depth: 2
    };

    // No explicit mock setup, should use default success response

    const result = await fileHandler.executeCommand(command);
    expect(result.success).toBe(true);
    expect(result.content).toBe('Mock result for analyze_dependencies');
  });
}); 