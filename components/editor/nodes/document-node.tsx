"use client";

import type { NodeProps } from "@xyflow/react";
import type { DocumentNode, FileAttachment } from "@/lib/flow/types";

import { memo, useMemo, useRef, useCallback } from "react";
import {
  Node,
  NodeAction,
  NodeContent,
  NodeHeader,
  NodeTitle,
} from "@/components/ai-elements/node";
import { Button } from "@/components/ui/button";
import { NODE_COLORS } from "@/lib/flow/node-colors";
import { useReactFlow } from "@xyflow/react";
import { FileText, Trash2, FileIcon, Image, File, Upload } from "lucide-react";
import { nanoid } from "nanoid";

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

function DocumentNodeComponentInner({
  id,
  data,
  selected,
}: NodeProps<DocumentNode>) {
  const { deleteElements, updateNodeData } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const files = data.files || [];

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0),
    [files]
  );

  const handleFileUpload = useCallback(
    (fileList: FileList) => {
      const maxFiles = 10;
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const validTypes = [".md", ".docx", ".xlsx", ".pdf"];

      const newFiles: FileAttachment[] = [];

      for (let i = 0; i < fileList.length; i++) {
        if (files.length + newFiles.length >= maxFiles) {
          alert(`Maximum ${maxFiles} files allowed`);
          break;
        }

        const file = fileList[i];
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
        updateNodeData(id, { files: [...files, ...newFiles] });
      }
    },
    [id, files, updateNodeData]
  );

  return (
    <Node
      handles={{ target: false, source: true }}
      selected={selected}
      accentColor={NODE_COLORS.document.accent}
    >
      <NodeHeader className="p-3">
        <NodeTitle className="flex items-center gap-1.5 text-sm font-semibold leading-none">
          <FileText className="size-3.5" style={{ color: NODE_COLORS.document.accent }} />
          {data.label}
        </NodeTitle>
        <NodeAction className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => deleteElements({ nodes: [{ id }] })}
          >
            <Trash2 className="size-3" />
          </Button>
        </NodeAction>
      </NodeHeader>
      <NodeContent className="p-3 space-y-1.5">
        {files.length > 0 && (
          <>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
              <span>{files.length} file{files.length !== 1 ? "s" : ""}</span>
              <span className="tabular-nums">{formatFileSize(totalSize)}</span>
            </div>
            <div className="space-y-1">
              {files.slice(0, 3).map((file) => {
                const Icon = getFileIcon(file.mediaType);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-1.5 rounded border bg-background px-2 py-1"
                  >
                    <Icon className="size-3 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-xs">{file.filename}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                );
              })}
              {files.length > 3 && (
                <div className="text-center text-[10px] text-muted-foreground">
                  +{files.length - 3} more
                </div>
              )}
            </div>
          </>
        )}

        <div className="nodrag nowheel">
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
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-1.5 size-3" />
            Upload Files
          </Button>
        </div>

        <div className="text-[10px] text-muted-foreground text-center">
          Supports: .md, .docx, .xlsx, .pdf
        </div>
      </NodeContent>
    </Node>
  );
}

export const DocumentNodeComponent = memo(DocumentNodeComponentInner);
