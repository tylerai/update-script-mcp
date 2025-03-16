import { CommandResult, UpdateScriptCommand, UpdateScriptConfig } from '../../src/types.js';

export class MockFileHandler {
  private config: UpdateScriptConfig;
  private mockResults: Map<string, CommandResult> = new Map();

  constructor(config: Partial<UpdateScriptConfig> = {}) {
    this.config = { 
      rootPath: config.rootPath || '/mock-root-path',
    };
  }

  // Setup mock results for commands
  setMockResult(operation: string, result: CommandResult): void {
    this.mockResults.set(operation, result);
  }

  async executeCommand(command: UpdateScriptCommand): Promise<CommandResult> {
    // Return mocked result if available
    const mockResult = this.mockResults.get(command.operation);
    if (mockResult) {
      return mockResult;
    }

    // Default successful mock response
    return {
      success: true,
      content: `Mock result for ${command.operation}`,
    };
  }

  getRootPath(): string {
    return this.config.rootPath;
  }

  // Mock methods that would interact with the file system
  async readHistoryFile(): Promise<any[]> {
    return [
      {
        timestamp: new Date().toISOString(),
        operation: 'run_update',
        cwd: '/mock/project/path',
        success: true,
      }
    ];
  }

  async writeHistoryFile(history: any[]): Promise<void> {
    // Mock implementation - does nothing
    return;
  }

  async watchDirectory(): Promise<void> {
    // Mock implementation - does nothing
    return;
  }

  async stopWatching(): Promise<void> {
    // Mock implementation - does nothing
    return;
  }
} 