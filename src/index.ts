#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  ServerResult,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { FileHandler } from "./services/FileHandler.js";
import {
  UpdateScriptCommand,
  UpdateScriptConfig,
} from "./types.js";
import { execSync } from "child_process";
import { resolve, join } from "path";
import fs from "fs";
import { 
  memoryBankTool, 
  generateMemoryBank,
  metricsAnalyzerTool,
  analyzeMetrics,
  diagramGeneratorTool,
  createVisualDiagram,
  dependencyAnalyzerTool,
  analyzeDependencies,
} from "./mcp-tools.js";

// Use types to fix Node process and console references
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      UPDATE_SCRIPT_ROOT?: string;
      HOME?: string;
      USERPROFILE?: string;
    }
  }
}

const DEFAULT_CONFIG: UpdateScriptConfig = {
  rootPath: process.env.UPDATE_SCRIPT_ROOT || `${process.env.HOME || process.env.USERPROFILE}/.update-script`,
};

interface RunUpdateArgs {
  cwd?: string;
}

interface GenerateMemoryBankArgs {
  cwd?: string;
}

interface WatchProjectArgs {
  cwd?: string;
  debounceMs?: number;
}

interface StopWatchingArgs {
  cwd?: string;
}

interface CustomTemplateJsArgs {
  projectName?: string;
  projectPath?: string;
}

interface AnalyzeDependenciesArgs {
  cwd?: string;
  format?: 'json' | 'markdown' | 'dot';
  includeNodeModules?: boolean;
  depth?: number;
}

interface GenerateMetricsArgs {
  cwd?: string;
  includeComplexity?: boolean;
  includeCoverage?: boolean;
  includeLocMetrics?: boolean;
  outputFormat?: 'json' | 'markdown';
}

interface CreateVisualDiagramArgs {
  cwd?: string;
  type?: 'structure' | 'dependencies' | 'components' | 'all';
  format?: 'mermaid' | 'dot' | 'svg' | 'png';
  outputPath?: string;
}

export const updateScriptTools = {
  run_update: {
    name: "run_update",
    description: "Run the update script in a specified directory",
    parameters: {
      type: "object",
      properties: {
        cwd: {
          type: "string",
          description: "Working directory to run the update in",
        },
      },
      required: ["cwd"],
    },
  },
  generate_memory_bank: memoryBankTool,
  list_updates: {
    name: "list_updates",
    description: "List all available updates",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  watch_project: {
    name: "watch_project",
    description: "Watch a project directory for changes",
    parameters: {
      type: "object",
      properties: {
        cwd: {
          type: "string",
          description: "Directory to watch",
        },
        debounceMs: {
          type: "number",
          description: "Debounce time in milliseconds",
          default: 1000,
        },
      },
      required: ["cwd"],
    },
  },
  stop_watching: {
    name: "stop_watching",
    description: "Stop watching a project directory",
    parameters: {
      type: "object",
      properties: {
        cwd: {
          type: "string",
          description: "Directory to stop watching",
        },
      },
      required: ["cwd"],
    },
  },
  custom_template_js: {
    name: "custom_template_js",
    description: "Generate a custom JavaScript template",
    parameters: {
      type: "object",
      properties: {
        projectName: {
          type: "string",
          description: "Name of the project",
        },
        projectPath: {
          type: "string",
          description: "Path where the project will be created",
        },
      },
      required: ["projectName", "projectPath"],
    },
  },
  analyze_dependencies: dependencyAnalyzerTool,
  generate_metrics: metricsAnalyzerTool,
  create_visual_diagram: diagramGeneratorTool,
};

export class UpdateScriptServer {
  private server: Server;
  private fileHandler: FileHandler;

  constructor(config: Partial<UpdateScriptConfig> = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    this.fileHandler = new FileHandler(finalConfig);

    this.server = new Server(
      {
        name: "update-script",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {
            run_update: updateScriptTools.run_update,
            generate_memory_bank: updateScriptTools.generate_memory_bank,
            list_updates: updateScriptTools.list_updates,
            watch_project: updateScriptTools.watch_project,
            stop_watching: updateScriptTools.stop_watching,
            custom_template_js: updateScriptTools.custom_template_js,
            analyze_dependencies: updateScriptTools.analyze_dependencies,
            generate_metrics: updateScriptTools.generate_metrics,
            create_visual_diagram: updateScriptTools.create_visual_diagram,
          },
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error: unknown) =>
      console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private validateArgs<T>(args: Record<string, unknown>): T {
    const validatedArgs = args as T;
    // Basic validation, can be extended later
    return validatedArgs;
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        updateScriptTools.run_update,
        updateScriptTools.generate_memory_bank,
        updateScriptTools.list_updates,
        updateScriptTools.watch_project,
        updateScriptTools.stop_watching,
        updateScriptTools.custom_template_js,
        updateScriptTools.analyze_dependencies,
        updateScriptTools.generate_metrics,
        updateScriptTools.create_visual_diagram,
      ],
    }));

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest): Promise<ServerResult> => {
        const { name, arguments: args } = request.params;

        if (!args || typeof args !== "object") {
          throw new McpError(ErrorCode.InvalidParams, "No arguments provided");
        }

        try {
          switch (name) {
            case "generate_memory_bank":
              return await generateMemoryBank(request);

            case "generate_metrics":
              return await analyzeMetrics(request);

            case "create_visual_diagram":
              return await createVisualDiagram(request);

            case "analyze_dependencies":
              return await analyzeDependencies(request);

            default: {
              let command: UpdateScriptCommand;

              switch (name) {
                case "list_updates": {
                  command = {
                    operation: "list_updates",
                  };
                  break;
                }

                case "run_update": {
                  command = {
                    operation: "run_update",
                    cwd: this.validateArgs<RunUpdateArgs>(args).cwd,
                  };
                  break;
                }

                case "watch_project": {
                  const watchArgs = this.validateArgs<WatchProjectArgs>(args);
                  command = {
                    operation: "watch_project",
                    cwd: watchArgs.cwd,
                    debounceMs: watchArgs.debounceMs,
                  };
                  break;
                }

                case "stop_watching": {
                  const stopArgs = this.validateArgs<StopWatchingArgs>(args);
                  command = {
                    operation: "stop_watching",
                    cwd: stopArgs.cwd,
                  };
                  break;
                }

                case "custom_template_js": {
                  const templateArgs = this.validateArgs<CustomTemplateJsArgs>(args);
                  command = {
                    operation: "custom_template_js",
                    projectName: templateArgs.projectName,
                    projectPath: templateArgs.projectPath,
                  };
                  break;
                }

                default:
                  throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${name}`
                  );
              }

              const result = await this.fileHandler.handleCommand(command);

              if (!result.success) {
                throw new McpError(
                  ErrorCode.InternalError,
                  result.error || "Unknown error"
                );
              }

              return {
                content: [
                  {
                    type: "text",
                    text: result.content || "Operation completed successfully",
                  },
                ],
                isError: false,
              };
            }
          }
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }

          console.error("[Tool Error]", error);
          throw new McpError(
            ErrorCode.InternalError,
            error instanceof Error
              ? error.message
              : "An unknown error occurred"
          );
        }
      }
    );
  }

  async run(): Promise<void> {
    // Use the StdioServerTransport for communication with Cursor
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.log("Update Script MCP server started");
  }
}

async function main() {
  try {
    // Parse command line arguments for configuration
    const args = process.argv.slice(2);
    const config: Partial<UpdateScriptConfig> = {};

    let i = 0;
    while (i < args.length) {
      const arg = args[i];
      if (arg === "--rootPath" && i + 1 < args.length) {
        config.rootPath = args[i + 1];
        i += 2;
      } else {
        // Skip unknown arguments
        i++;
      }
    }

    const server = new UpdateScriptServer(config);
    await server.run();
  } catch (error) {
    console.error("Failed to start Update Script MCP server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
