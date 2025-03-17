export const OPERATIONS = [
  "run_update",
  "generate_memory_bank",
  "list_updates",
  "watch_project",
  "stop_watching",
  "custom_template_js",
  "analyze_dependencies",
  "generate_metrics",
  "create_visual_diagram",
] as const;

export type UpdateScriptOperation = typeof OPERATIONS[number];

export interface UpdateScriptConfig {
  rootPath: string;
}

export interface BaseUpdateScriptCommand {
  operation: UpdateScriptOperation;
  cwd?: string;
}

export interface RunUpdateCommand extends BaseUpdateScriptCommand {
  operation: "run_update";
}

export interface GenerateMemoryBankCommand extends BaseUpdateScriptCommand {
  operation: "generate_memory_bank";
}

export interface ListUpdatesCommand extends BaseUpdateScriptCommand {
  operation: "list_updates";
}

export interface WatchProjectCommand extends BaseUpdateScriptCommand {
  operation: "watch_project";
  debounceMs?: number;
}

export interface StopWatchingCommand extends BaseUpdateScriptCommand {
  operation: "stop_watching";
}

export interface CustomTemplateJsCommand extends BaseUpdateScriptCommand {
  operation: "custom_template_js";
  projectName?: string;
  projectPath?: string;
}

export interface AnalyzeDependenciesCommand extends BaseUpdateScriptCommand {
  operation: "analyze_dependencies";
  format?: "json" | "markdown" | "dot";
  includeNodeModules?: boolean;
  depth?: number;
}

export interface GenerateMetricsCommand extends BaseUpdateScriptCommand {
  operation: "generate_metrics";
  includeComplexity?: boolean;
  includeCoverage?: boolean;
  includeLocMetrics?: boolean;
  outputFormat?: "json" | "markdown";
}

export interface CreateVisualDiagramCommand extends BaseUpdateScriptCommand {
  operation: "create_visual_diagram";
  type?: "structure" | "dependencies" | "components" | "all";
  format?: "mermaid" | "dot" | "svg" | "png";
  outputPath?: string;
}

export type UpdateScriptCommand =
  | RunUpdateCommand
  | GenerateMemoryBankCommand
  | ListUpdatesCommand
  | WatchProjectCommand
  | StopWatchingCommand
  | CustomTemplateJsCommand
  | AnalyzeDependenciesCommand
  | GenerateMetricsCommand
  | CreateVisualDiagramCommand;

export interface CommandResult {
  success: boolean;
  content?: string;
  error?: string;
}
