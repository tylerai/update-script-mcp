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
import { memoryBankTool, generateMemoryBank } from "./mcp-tools.js";

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
    description: "Generate or update the project structure documentation and comprehensive memory bank",
    inputSchema: {
      type: "object",
      properties: {
        cwd: {
          type: "string",
          description: "The directory to generate documentation for",
        },
      },
      required: [],
    },
  },
  generate_memory_bank: memoryBankTool,
  list_updates: {
    name: "list_updates",
    description: "List recent update operations",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  watch_project: {
    name: "watch_project",
    description: "Start watching a project for changes and automatically update documentation",
    inputSchema: {
      type: "object",
      properties: {
        cwd: { type: "string" },
        debounceMs: { type: "number" }
      },
      required: [],
    },
  },
  stop_watching: {
    name: "stop_watching",
    description: "Stop watching a project for changes",
    inputSchema: {
      type: "object",
      properties: {
        cwd: { type: "string" },
      },
      required: [],
    },
  },
  custom_template_js: {
    name: "custom_template_js",
    description: "Create a new JavaScript project from a template",
    inputSchema: {
      type: "object",
      properties: {
        projectName: { type: "string" },
        projectPath: { type: "string" },
      },
      required: [],
    },
  },
  analyze_dependencies: {
    name: "analyze_dependencies",
    description: "Analyze project dependencies and generate a dependency graph",
    inputSchema: {
      type: "object",
      properties: {
        cwd: { type: "string" },
        format: { type: "string", enum: ["json", "markdown", "dot"] },
        includeNodeModules: { type: "boolean" },
        depth: { type: "number" },
      },
      required: [],
    },
  },
  generate_metrics: {
    name: "generate_metrics",
    description: "Generate code metrics including complexity, lines of code, etc.",
    inputSchema: {
      type: "object",
      properties: {
        cwd: { type: "string" },
        includeComplexity: { type: "boolean" },
        includeCoverage: { type: "boolean" },
        includeLocMetrics: { type: "boolean" },
        outputFormat: { type: "string", enum: ["json", "markdown"] },
      },
      required: [],
    },
  },
  create_visual_diagram: {
    name: "create_visual_diagram",
    description: "Create visual diagrams of project structure, dependencies, or components",
    inputSchema: {
      type: "object",
      properties: {
        cwd: { type: "string" },
        type: { type: "string", enum: ["structure", "dependencies", "components", "all"] },
        format: { type: "string", enum: ["mermaid", "dot", "svg", "png"] },
        outputPath: { type: "string" },
      },
      required: [],
    },
  },
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

            case "analyze_dependencies": {
              const dependencyArgs = this.validateArgs<AnalyzeDependenciesArgs>(args);
              command = {
                operation: "analyze_dependencies",
                cwd: dependencyArgs.cwd,
                format: dependencyArgs.format,
                includeNodeModules: dependencyArgs.includeNodeModules,
                depth: dependencyArgs.depth,
              };
              break;
            }

            case "generate_metrics": {
              const metricsArgs = this.validateArgs<GenerateMetricsArgs>(args);
              command = {
                operation: "generate_metrics",
                cwd: metricsArgs.cwd,
                includeComplexity: metricsArgs.includeComplexity,
                includeCoverage: metricsArgs.includeCoverage,
                includeLocMetrics: metricsArgs.includeLocMetrics,
                outputFormat: metricsArgs.outputFormat,
              };
              break;
            }

            case "create_visual_diagram": {
              const diagramArgs = this.validateArgs<CreateVisualDiagramArgs>(args);
              command = {
                operation: "create_visual_diagram",
                cwd: diagramArgs.cwd,
                type: diagramArgs.type,
                format: diagramArgs.format,
                outputPath: diagramArgs.outputPath,
              };
              break;
            }

            case "generate_memory_bank": {
              return await generateMemoryBank(request);
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
