"use client";

import type { AppNode, FileAttachment, DocumentNodeData, AgentNodeData, ModelNodeData } from "@/lib/flow/types";
import { NODE_COLORS, type NodeColorKey } from "@/lib/flow/node-colors";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useReactFlow, useOnSelectionChange } from "@xyflow/react";
import {
  Bot,
  Brain,
  CheckCircle2,
  FileOutput,
  FileText,
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
import { nanoid } from "nanoid";

const nodeIcons: Record<string, typeof Type> = {
  textInput: Type,
  textOutput: FileOutput,
  model: Brain,
  document: FileText,
  agent: Bot,
};

const nodelabels: Record<string, string> = {
  textInput: "Text Input Properties",
  textOutput: "Text Output Properties",
  model: "Model Properties",
  document: "Document Properties",
  agent: "Agent Properties",
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

export function ConfigPanel() {
  const { updateNodeData, setNodes } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useOnSelectionChange({
    onChange: useCallback(({ nodes }: { nodes: AppNode[] }) => {
      if (nodes.length === 1) {
        setSelectedNode(nodes[0]);
      } else {
        setSelectedNode(null);
      }
    }, []),
  });

  const handleClose = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    setSelectedNode(null);
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

  if (!selectedNode) return null;

  const Icon = nodeIcons[selectedNode.type!] ?? Type;
  const typelabel = nodelabels[selectedNode.type!] ?? "Properties";

  return (
    <div className="flex w-72 flex-col border-l bg-card">
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
      </div>

      <div className="mt-auto border-t px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          ID: {selectedNode.id}
        </span>
      </div>
    </div>
  );
}
