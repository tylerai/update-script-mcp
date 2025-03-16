/**
 * @jest-environment node
 */
import { jest } from '@jest/globals';
import { UpdateScriptServer } from '../src/index.js';
import { MockFileHandler } from './mocks/FileHandler.mock.js';
import { UpdateScriptConfig } from '../src/types.js';

// Mock console methods to avoid cluttering test output
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Mock process.exit to prevent tests from exiting
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
  return undefined as never;
});

// Mock modules before importing
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: class MockServer {
    onerror: any;
    constructor() {
      this.onerror = null;
    }
    setRequestHandler() {}
    listen() {
      return Promise.resolve();
    }
    close() {
      return Promise.resolve();
    }
  },
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: class MockStdioTransport {},
}));

// Mock the FileHandler
jest.mock('../src/services/FileHandler.js', () => ({
  FileHandler: jest.fn().mockImplementation(() => {
    return new MockFileHandler();
  }),
}));

describe('UpdateScriptServer', () => {
  let server: UpdateScriptServer;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new server instance
    server = new UpdateScriptServer({
      rootPath: '/test/path',
    });
  });

  afterEach(() => {
    // Trigger the SIGINT handler to clean up
    process.emit('SIGINT');
  });

  afterAll(() => {
    // Restore process.exit
    mockExit.mockRestore();
  });

  test('should instantiate without errors', () => {
    expect(server).toBeInstanceOf(UpdateScriptServer);
  });

  test('run method should not throw errors', async () => {
    await expect(server.run()).resolves.not.toThrow();
  });
}); 