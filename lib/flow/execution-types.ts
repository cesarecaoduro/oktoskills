import type { LanguageModelUsage } from "ai";

export type NodeExecutionStatus = "pending" | "running" | "completed" | "error";

export interface NodeExecutionLog {
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: NodeExecutionStatus;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  output?: string;
  error?: string;
  usage?: LanguageModelUsage;
  modelId?: string;
  costUSD?: number;
}

export type ExecutionRunStatus = "running" | "completed" | "error";

export interface ExecutionRun {
  id: string;
  status: ExecutionRunStatus;
  startedAt: number;
  completedAt?: number;
  totalDurationMs?: number;
  logs: NodeExecutionLog[];
  totalCostUSD?: number;
  totalInputTokens?: number;
  totalOutputTokens?: number;
  models?: string[];
}

export interface LLMExecuteRequest {
  modelId: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMExecuteResponse {
  text: string;
  usage: LanguageModelUsage;
  finishReason: string;
  error?: string;
}
