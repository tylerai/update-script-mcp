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
  rootDir: string;
  outputDir: string;
  templateDir: string;
  watchDebounceMs: number;
}

export interface BaseCommand {
  operation: UpdateScriptOperation;
}

export interface ListUpdatesCommand extends BaseCommand {
  operation: "list_updates";
}

export interface RunUpdateCommand extends BaseCommand {
  operation: "run_update";
  cwd: string;
}

export interface WatchProjectCommand extends BaseCommand {
  operation: "watch_project";
  cwd: string;
  debounceMs?: number;
}

export interface StopWatchingCommand extends BaseCommand {
  operation: "stop_watching";
  cwd: string;
}

export interface CustomTemplateJsCommand extends BaseCommand {
  operation: "custom_template_js";
  projectName: string;
  projectPath: string;
}

export interface AnalyzeDependenciesCommand extends BaseCommand {
  operation: "analyze_dependencies";
  cwd: string;
  format: "json" | "markdown" | "dot";
  includeNodeModules?: boolean;
  depth?: number;
}

export interface GenerateMetricsCommand extends BaseCommand {
  operation: "generate_metrics";
  cwd: string;
  includeComplexity?: boolean;
  includeCoverage?: boolean;
  includeLocMetrics?: boolean;
  outputFormat: "json" | "markdown";
}

export interface CreateVisualDiagramCommand extends BaseCommand {
  operation: "create_visual_diagram";
  cwd: string;
  type: "structure" | "dependencies" | "components" | "all";
  format: "mermaid" | "dot" | "svg" | "png";
  outputPath?: string;
}

export interface GenerateMemoryBankCommand extends BaseCommand {
  operation: "generate_memory_bank";
  cwd: string;
  format?: "json" | "markdown";
  includeMetrics?: boolean;
  includeDiagrams?: boolean;
}

export type UpdateScriptCommand =
  | ListUpdatesCommand
  | RunUpdateCommand
  | WatchProjectCommand
  | StopWatchingCommand
  | CustomTemplateJsCommand
  | AnalyzeDependenciesCommand
  | GenerateMetricsCommand
  | CreateVisualDiagramCommand
  | GenerateMemoryBankCommand;

export interface UpdateScriptResult {
  success: boolean;
  content?: string;
  error?: string;
}

// Argument types for tool validation
export interface RunUpdateArgs {
  cwd: string;
}

export interface WatchProjectArgs {
  cwd: string;
  debounceMs?: number;
}

export interface StopWatchingArgs {
  cwd: string;
}

export interface CustomTemplateJsArgs {
  projectName: string;
  projectPath: string;
}

export interface AnalyzeDependenciesArgs {
  cwd: string;
  format: "json" | "markdown" | "dot";
  includeNodeModules?: boolean;
  depth?: number;
}

export interface GenerateMetricsArgs {
  cwd: string;
  includeComplexity?: boolean;
  includeCoverage?: boolean;
  includeLocMetrics?: boolean;
  outputFormat: "json" | "markdown";
}

export interface CreateVisualDiagramArgs {
  cwd: string;
  type: "structure" | "dependencies" | "components" | "all";
  format: "mermaid" | "dot" | "svg" | "png";
  outputPath?: string;
}

export interface GenerateMemoryBankArgs {
  cwd: string;
  format?: "json" | "markdown";
  includeMetrics?: boolean;
  includeDiagrams?: boolean;
}
