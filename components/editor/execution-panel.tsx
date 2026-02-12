"use client";

import type { NodeExecutionLog, ExecutionRun } from "@/lib/flow/execution-types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFlowEditorStore } from "@/lib/flow/store";
import {
  Bot,
  Brain,
  CheckCircle2,
  Download,
  FileOutput,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  Type,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const nodeTypeIcons: Record<string, typeof Type> = {
  textInput: Type,
  textOutput: FileOutput,
  model: Brain,
  document: FileText,
  agent: Bot,
  llm: Sparkles,
};

function formatDuration(ms?: number): string {
  if (ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatCost(cost?: number): string {
  if (cost === undefined || cost === 0) return "";
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

function exportRunAsJSON(run: ExecutionRun) {
  const blob = new Blob([JSON.stringify(run, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `run-${new Date(run.startedAt).toISOString().slice(0, 19)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function LogEntry({ log }: { log: NodeExecutionLog }) {
  const Icon = nodeTypeIcons[log.nodeType] ?? Type;
  return (
    <div className="flex items-start gap-2 border-b px-4 py-2 last:border-b-0">
      <div className="mt-0.5">
        {log.status === "running" && <Loader2 className="size-3.5 animate-spin text-blue-500" />}
        {log.status === "completed" && <CheckCircle2 className="size-3.5 text-emerald-500" />}
        {log.status === "error" && <XCircle className="size-3.5 text-destructive" />}
        {log.status === "pending" && <div className="size-3.5 rounded-full border-2 border-muted-foreground/30" />}
      </div>
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{log.nodeLabel}</span>
          <span className="text-[10px] text-muted-foreground">
            {log.nodeType}{log.modelId ? ` \u00b7 ${log.modelId}` : ""}
          </span>
          {log.durationMs !== undefined && (
            <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
              {formatDuration(log.durationMs)}
            </span>
          )}
        </div>
        {log.error && (
          <p className="mt-0.5 text-[10px] text-destructive">{log.error}</p>
        )}
        {log.usage && (
          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="tabular-nums">{log.usage.inputTokens} in</span>
            <span className="tabular-nums">{log.usage.outputTokens} out</span>
            {log.costUSD !== undefined && log.costUSD > 0 && (
              <span className="tabular-nums font-medium text-foreground">
                {formatCost(log.costUSD)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RunSummary({ run }: { run: ExecutionRun }) {
  const hasTokens = (run.totalInputTokens ?? 0) > 0 || (run.totalOutputTokens ?? 0) > 0;
  return (
    <div className="border-b bg-muted/30 px-4 py-1.5 text-[10px] text-muted-foreground space-y-0.5">
      <div className="flex items-center gap-3">
        <span className="tabular-nums">
          {new Date(run.startedAt).toLocaleTimeString()}
        </span>
        <span className="tabular-nums">{formatDuration(run.totalDurationMs)}</span>
        {run.totalCostUSD !== undefined && run.totalCostUSD > 0 && (
          <span className="tabular-nums font-medium text-foreground">
            {formatCost(run.totalCostUSD)}
          </span>
        )}
        <Badge
          variant={run.status === "completed" ? "secondary" : "destructive"}
          className="ml-auto text-[10px] px-1.5 py-0"
        >
          {run.status}
        </Badge>
      </div>
      {(hasTokens || (run.models && run.models.length > 0)) && (
        <div className="flex items-center gap-3">
          {run.models && run.models.length > 0 && (
            <span className="truncate max-w-[140px]">{run.models.join(", ")}</span>
          )}
          {hasTokens && (
            <>
              <span className="tabular-nums">{run.totalInputTokens ?? 0} in</span>
              <span className="tabular-nums">{run.totalOutputTokens ?? 0} out</span>
            </>
          )}
          {hasTokens && (!run.totalCostUSD || run.totalCostUSD === 0) && (
            <span className="text-muted-foreground">cost n/a</span>
          )}
        </div>
      )}
    </div>
  );
}

type ExecutionPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  logs?: NodeExecutionLog[];
  run?: ExecutionRun | null;
  isExecuting?: boolean;
};

export function ExecutionPanel({ isOpen, onClose, logs = [], run, isExecuting }: ExecutionPanelProps) {
  const [height, setHeight] = useState(192);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const { executionHistory, clearExecutionHistory } = useFlowEditorStore();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = height;
    e.preventDefault();
  }, [height]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startY.current - e.clientY;
      const newHeight = Math.min(600, Math.max(120, startHeight.current + delta));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex flex-col border-t bg-card shadow-lg animate-in slide-in-from-bottom-2 duration-200"
      style={{ height }}
    >
      {/* Resize handle */}
      <div
        className="flex h-2 cursor-ns-resize items-center justify-center hover:bg-accent/50"
        onMouseDown={handleMouseDown}
      >
        <div className="h-0.5 w-8 rounded-full bg-muted-foreground/30" />
      </div>
      <Tabs defaultValue="current" className="flex flex-1 flex-col gap-0 overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-1.5">
          <TabsList variant="line">
            <TabsTrigger value="current" className="gap-1.5 text-xs">
              Current Run
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {logs.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs">
              History
              {executionHistory.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {executionHistory.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            {run && (
              <Button variant="ghost" size="icon-xs" onClick={() => exportRunAsJSON(run)}>
                <Download className="size-3" />
              </Button>
            )}
            <Button variant="ghost" size="icon-xs" onClick={clearExecutionHistory}>
              <Trash2 className="size-3" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={onClose}>
              <X className="size-3" />
            </Button>
          </div>
        </div>
        <TabsContent value="current" className="flex-1">
          <ScrollArea className="h-full">
            {logs.length === 0 && !isExecuting ? (
              <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
                Run your flow to see execution logs here.
              </div>
            ) : (
              <div className="flex flex-col">
                {run && <RunSummary run={run} />}
                {logs.map((log) => (
                  <LogEntry key={log.nodeId} log={log} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="history" className="flex-1">
          <ScrollArea className="h-full">
            {executionHistory.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
                No execution history yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {executionHistory.map((histRun) => (
                  <div key={histRun.id}>
                    <RunSummary run={histRun} />
                    {histRun.logs.map((log) => (
                      <LogEntry key={`${histRun.id}-${log.nodeId}`} log={log} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
