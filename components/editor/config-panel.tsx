"use client";

import type { AppNode, FileAttachment, DocumentNodeData, AgentNodeData, ModelNodeData, LLMNodeData, TextOutputNodeData } from "@/lib/flow/types";
import { NODE_COLORS, type NodeColorKey } from "@/lib/flow/node-colors";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TextInputNodeData } from "@/lib/flow/types";
import { useReactFlow, useOnSelectionChange, useNodesData } from "@xyflow/react";
import {
  Bot,
  Brain,
  CheckCircle2,
  FileOutput,
  FileText,
  Sparkles,
  Type,
  X,
  Upload,
  Trash2,
  FileIcon,
  Image,
  File,
} from "lucide-react";
import { useCallback, useState, useRef } from "react";
import { ModelSelectorDialog } from "@/components/editor/model-selector-dialog";
import { MessageResponse } from "@/components/ai-elements/message";
import { nanoid } from "nanoid";

const nodeIcons: Record<string, typeof Type> = {
  textInput: Type,
  textOutput: FileOutput,
  model: Brain,
  document: FileText,
  agent: Bot,
  llm: Sparkles,
};

const nodelabels: Record<string, string> = {
  textInput: "Text Input Properties",
  textOutput: "Text Output Properties",
  model: "Model Properties",
  document: "Document Properties",
  agent: "Agent Properties",
  llm: "LLM Properties",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mediaType: string) {
  if (mediaType.startsWith("image/")) return Image;
  if (mediaType.includes("pdf")) return FileText;
  if (mediaType.includes("document") || mediaType.includes("word")) return FileIcon;
  if (mediaType.includes("spreadsheet") || mediaType.includes("excel")) return FileIcon;
  return File;
}

function LLMConfigSection({
  selectedNode,
  updateNodeData,
}: {
  selectedNode: AppNode;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
}) {
  const { getEdges, getNodes } = useReactFlow();

  // Use live reactive data from the store so edits propagate immediately
  const liveNodeData = useNodesData(selectedNode.id);
  const llmData = (liveNodeData?.data ?? selectedNode.data) as LLMNodeData;

  // Resolve connected Model and TextInput nodes
  const edges = getEdges();
  const nodes = getNodes();
  const incomingEdges = edges.filter((e) => e.target === selectedNode.id);

  const connectedModelNodeId = (() => {
    for (const edge of incomingEdges) {
      if (edge.targetHandle === "llm-model" || !edge.targetHandle) {
        const src = nodes.find((n) => n.id === edge.source);
        if (src?.type === "model") return src.id;
      }
    }
    return null;
  })();

  const connectedPromptNodeId = (() => {
    for (const edge of incomingEdges) {
      if (edge.targetHandle === "llm-prompt" || !edge.targetHandle) {
        const src = nodes.find((n) => n.id === edge.source);
        if (src?.type === "textInput") return src.id;
      }
    }
    return null;
  })();

  // Live reactive data for connected nodes
  const liveModelData = useNodesData(connectedModelNodeId ?? "");
  const livePromptData = useNodesData(connectedPromptNodeId ?? "");

  const hasModelConnection = !!connectedModelNodeId;
  const modelData = hasModelConnection
    ? (liveModelData?.data as ModelNodeData | undefined)
    : undefined;
  const promptData = connectedPromptNodeId
    ? (livePromptData?.data as TextInputNodeData | undefined)
    : undefined;

  // Resolved values: prefer connected Model node, fall back to LLM node's own
  const resolvedModelId = hasModelConnection && modelData ? modelData.modelId : llmData.modelId;
  const resolvedTemperature = hasModelConnection && modelData ? modelData.temperature : llmData.temperature;
  const resolvedMaxTokens = hasModelConnection && modelData ? modelData.maxTokens : llmData.maxTokens;

  // Two-way binding: write to the connected Model node when present, otherwise to self
  const targetNodeId = hasModelConnection ? connectedModelNodeId! : selectedNode.id;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          System Prompt
        </label>
        <Textarea
          value={llmData.systemPrompt || ""}
          onChange={(e) =>
            updateNodeData(selectedNode.id, { systemPrompt: e.target.value })
          }
          className="min-h-20 resize-none text-sm"
          placeholder="You are a helpful assistant..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Model
          {hasModelConnection && (
            <span className="ml-1 text-[10px] text-emerald-600">(bound)</span>
          )}
        </label>
        <ModelSelectorDialog
          value={resolvedModelId || ""}
          onSelect={(modelId) => updateNodeData(targetNodeId, { modelId })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Temperature
          {hasModelConnection && (
            <span className="ml-1 text-[10px] text-emerald-600">(bound)</span>
          )}
        </label>
        <Input
          type="number"
          min={0}
          max={2}
          step={0.1}
          value={resolvedTemperature ?? 0.7}
          onChange={(e) =>
            updateNodeData(targetNodeId, { temperature: parseFloat(e.target.value) || 0 })
          }
          className="h-8 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Max Tokens
          {hasModelConnection && (
            <span className="ml-1 text-[10px] text-emerald-600">(bound)</span>
          )}
        </label>
        <Input
          type="number"
          min={1}
          max={128000}
          step={256}
          value={resolvedMaxTokens ?? 1024}
          onChange={(e) =>
            updateNodeData(targetNodeId, { maxTokens: parseInt(e.target.value) || 1024 })
          }
          className="h-8 text-sm"
        />
      </div>

      {promptData && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Prompt <span className="text-[10px] text-emerald-600">(bound)</span>
          </label>
          <div className="max-h-32 overflow-y-auto rounded border bg-muted/30 p-2">
            <p className="whitespace-pre-wrap text-xs text-muted-foreground">
              {promptData.text || <span className="italic">Empty</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConfigPanel() {
  const { updateNodeData, setNodes } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useOnSelectionChange({
    onChange: useCallback(({ nodes }: { nodes: AppNode[] }) => {
      if (nodes.length === 1) {
        setSelectedNodeId(nodes[0].id);
      } else {
        setSelectedNodeId(null);
      }
    }, []),
  });

  // Live reactive data from the store — updates whenever node data changes
  const liveNodeData = useNodesData(selectedNodeId ?? "");
  const selectedNode = selectedNodeId && liveNodeData
    ? ({ id: selectedNodeId, type: liveNodeData.type, data: liveNodeData.data } as AppNode)
    : null;

  const handleClose = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    setSelectedNodeId(null);
  }, [setNodes]);

  const handleFileUpload = useCallback(
    (files: FileList) => {
      if (!selectedNode || selectedNode.type !== "document") return;

      const currentFiles = (selectedNode.data as DocumentNodeData).files || [];
      const maxFiles = 10;
      const maxFileSize = 10 * 1024 * 1024; // 10MB

      const newFiles: FileAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        if (currentFiles.length + newFiles.length >= maxFiles) {
          alert(`Maximum ${maxFiles} files allowed`);
          break;
        }

        const file = files[i];
        const validTypes = [".md", ".docx", ".xlsx", ".pdf"];
        const ext = file.name.substring(file.name.lastIndexOf("."));

        if (!validTypes.includes(ext.toLowerCase())) {
          alert(`Invalid file type: ${file.name}. Allowed: ${validTypes.join(", ")}`);
          continue;
        }

        if (file.size > maxFileSize) {
          alert(`File too large: ${file.name}. Maximum size: 10MB`);
          continue;
        }

        newFiles.push({
          id: nanoid(),
          filename: file.name,
          mediaType: file.type || "application/octet-stream",
          url: URL.createObjectURL(file),
          size: file.size,
        });
      }

      if (newFiles.length > 0) {
        updateNodeData(selectedNode.id, {
          files: [...currentFiles, ...newFiles],
        });
      }
    },
    [selectedNode, updateNodeData]
  );

  const handleFileRemove = useCallback(
    (fileId: string) => {
      if (!selectedNode || selectedNode.type !== "document") return;

      const currentFiles = (selectedNode.data as DocumentNodeData).files || [];
      const file = currentFiles.find((f) => f.id === fileId);

      if (file?.url) {
        URL.revokeObjectURL(file.url);
      }

      updateNodeData(selectedNode.id, {
        files: currentFiles.filter((f) => f.id !== fileId),
      });
    },
    [selectedNode, updateNodeData]
  );

  const isOpen = !!selectedNode;
  const Icon = selectedNode ? (nodeIcons[selectedNode.type!] ?? Type) : Type;
  const typelabel = selectedNode ? (nodelabels[selectedNode.type!] ?? "Properties") : "";

  return (
    <div
      className={`absolute top-0 right-0 z-20 flex h-full w-72 flex-col border-l bg-card shadow-lg transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {!selectedNode ? null : (<>
    <div className="flex w-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: NODE_COLORS[selectedNode.type as NodeColorKey]?.accent }}
          />
          <Icon className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{typelabel}</h2>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={handleClose}>
          <X className="size-3" />
        </Button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <Badge
          variant="secondary"
          className="w-fit gap-1 text-[10px] font-medium text-emerald-600"
        >
          <CheckCircle2 className="size-3" />
          Node is valid
        </Badge>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Name
          </label>
          <Input
            value={selectedNode.data.label}
            onChange={(e) =>
              updateNodeData(selectedNode.id, { label: e.target.value })
            }
            className="h-8 text-sm"
          />
        </div>

        {selectedNode.type === "textInput" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Text Content
            </label>
            <Textarea
              value={(selectedNode.data as { text: string }).text}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { text: e.target.value })
              }
              className="min-h-24 resize-none text-sm"
              placeholder="Enter text..."
            />
          </div>
        )}

        {selectedNode.type === "model" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Model
              </label>
              <ModelSelectorDialog
                value={(selectedNode.data as ModelNodeData).modelId || ""}
                onSelect={(modelId) =>
                  updateNodeData(selectedNode.id, { modelId })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Temperature
              </label>
              <Input
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={(selectedNode.data as ModelNodeData).temperature ?? 0.7}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { temperature: parseFloat(e.target.value) || 0 })
                }
                className="h-8 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Max Tokens
              </label>
              <Input
                type="number"
                min={1}
                max={128000}
                step={256}
                value={(selectedNode.data as ModelNodeData).maxTokens ?? 1024}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { maxTokens: parseInt(e.target.value) || 1024 })
                }
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}

        {selectedNode.type === "document" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Files
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.docx,.xlsx,.pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files);
                  }
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 size-4" />
                Upload Files
              </Button>
            </div>

            {((selectedNode.data as DocumentNodeData).files || []).length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Attached Files ({(selectedNode.data as DocumentNodeData).files?.length || 0})
                </label>
                <div className="max-h-48 space-y-1.5 overflow-y-auto">
                  {((selectedNode.data as DocumentNodeData).files || []).map((file) => {
                    const FileIcon_ = getFileIcon(file.mediaType);
                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 rounded border bg-muted/50 p-1.5"
                      >
                        <FileIcon_ className="size-3 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">
                            {file.filename}
                          </p>
                          <p className="text-[10px] text-muted-foreground tabular-nums">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleFileRemove(file.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Content Preview
              </label>
              <Textarea
                value={(selectedNode.data as DocumentNodeData).content || ""}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { content: e.target.value })
                }
                className="min-h-24 resize-none text-xs"
                placeholder="Optional content preview..."
              />
            </div>
          </div>
        )}

        {selectedNode.type === "agent" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Web Search
              </label>
              <Switch
                checked={(selectedNode.data as AgentNodeData).webSearchEnabled || false}
                onCheckedChange={(checked) =>
                  updateNodeData(selectedNode.id, { webSearchEnabled: checked })
                }
              />
            </div>

            <div className="rounded border bg-muted/30 p-2">
              <p className="text-xs text-muted-foreground font-medium">
                Context Inputs: <span className="tabular-nums">{((selectedNode.data as AgentNodeData).contextNodes || []).length}</span>
              </p>
              {((selectedNode.data as AgentNodeData).contextNodes || []).length > 0 && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Connected to <span className="tabular-nums">{((selectedNode.data as AgentNodeData).contextNodes || []).length}</span> node(s)
                </p>
              )}
            </div>
          </div>
        )}

        {selectedNode.type === "llm" && (
          <LLMConfigSection
            selectedNode={selectedNode}
            updateNodeData={updateNodeData}
          />
        )}

        {selectedNode.type === "textOutput" && (selectedNode.data as TextOutputNodeData).text && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Output
            </label>
            <div className="max-h-64 overflow-y-auto rounded border bg-muted/30 p-3">
              <MessageResponse className="text-xs">
                {(selectedNode.data as TextOutputNodeData).text}
              </MessageResponse>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto border-t px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          ID: {selectedNode.id}
        </span>
      </div>
    </div>
      </>)}
    </div>
  );
}
