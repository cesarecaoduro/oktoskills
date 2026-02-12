"use client";

import { Panel } from "@/components/ai-elements/panel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { flowTemplates, type FlowTemplate } from "@/lib/flow/templates";
import type { EdgeVariant } from "@/lib/flow/types";
import { NODE_COLORS, type NodeColorKey } from "@/lib/flow/node-colors";
import { paletteItems } from "@/lib/flow/node-defaults";
import { useFlowEditorStore } from "@/lib/flow/store";
import {
  Coins,
  CornerDownRight,
  Download,
  FilePlus2,
  Grid3X3,
  Loader2,
  Pencil,
  Play,
  Plus,
  Redo2,
  Save,
  Spline,
  Terminal,
  Undo2,
} from "lucide-react";
import { useState } from "react";

const Divider = () => (
  <div className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />
);

const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const mod = isMac ? "\u2318" : "Ctrl+";

type EditorToolbarProps = {
  flowName: string;
  onFlowNameChange: (name: string) => void;
  onRun?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  autoMode?: boolean;
  onAutoModeChange?: (enabled: boolean) => void;
  edgeType: EdgeVariant;
  onEdgeTypeChange: (t: EdgeVariant) => void;
  edgeAnimated: boolean;
  onEdgeAnimatedChange: (a: boolean) => void;
  isExecutionOpen: boolean;
  onExecutionToggle: () => void;
  isExecuting?: boolean;
  onLoadTemplate?: (template: FlowTemplate) => void;
  snapToGrid?: boolean;
  onSnapToGridChange?: (snap: boolean) => void;
  onAddNode?: (type: string) => void;
};

export function EditorToolbar({
  flowName,
  onFlowNameChange,
  onRun,
  onSave,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  autoMode = false,
  onAutoModeChange,
  edgeType = "animated",
  onEdgeTypeChange,
  edgeAnimated = true,
  onEdgeAnimatedChange,
  isExecutionOpen = false,
  onExecutionToggle,
  isExecuting = false,
  onLoadTemplate,
  snapToGrid = false,
  onSnapToGridChange,
  onAddNode,
}: EditorToolbarProps) {
  const [newFlowOpen, setNewFlowOpen] = useState(false);
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const credits = useFlowEditorStore((s) => s.credits);

  return (
    <Panel position="top-center" className="flex items-center gap-1">
      <TooltipProvider>
        {/* ── Group 1: File ── */}
        <Popover open={newFlowOpen} onOpenChange={setNewFlowOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
                  <FilePlus2 className="size-4" />
                  New
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>New workflow</TooltipContent>
          </Tooltip>
          <PopoverContent align="start" className="w-64 p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              New Workflow
            </div>
            {flowTemplates.map((template) => (
              <button
                key={template.id}
                className="flex w-full flex-col items-start gap-0.5 rounded-sm px-2 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => {
                  onLoadTemplate?.(template);
                  setNewFlowOpen(false);
                }}
              >
                <span className="text-sm font-medium">{template.name}</span>
                <span className="text-xs text-muted-foreground">{template.description}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={onSave}>
              <Save className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save ({mod}S)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Download className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export</TooltipContent>
        </Tooltip>

        <Divider />

        {/* ── Group 2: Flow name ── */}
        {isEditingName ? (
          <input
            autoFocus
            value={flowName}
            onChange={(e) => onFlowNameChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsEditingName(false);
              e.stopPropagation();
            }}
            className="h-7 w-48 rounded-md border border-input bg-transparent px-2 text-sm font-medium shadow-none outline-none"
          />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap hover:bg-accent/50 transition-colors"
                onClick={() => setIsEditingName(true)}
              >
                {flowName}
                <Pencil className="size-3 text-muted-foreground shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Rename flow</TooltipContent>
          </Tooltip>
        )}

        <Divider />

        {/* ── Group 3: History ── */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!canUndo}
              onClick={onUndo}
            >
              <Undo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo ({mod}Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!canRedo}
              onClick={onRedo}
            >
              <Redo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo ({mod}Shift+Z)</TooltipContent>
        </Tooltip>

        <Divider />

        {/* ── Group 4: Edge style ── */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={edgeType === "animated" ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={() => onEdgeTypeChange("animated")}
              >
                <Spline className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bezier</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={edgeType === "smoothStep" ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={() => onEdgeTypeChange("smoothStep")}
              >
                <CornerDownRight className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Smooth Step</TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-xs text-muted-foreground">Animate</span>
            <Switch size="sm" checked={edgeAnimated} onCheckedChange={onEdgeAnimatedChange} />
          </div>
        </div>

        <Divider />

        {/* ── Group 5: Canvas ── */}
        <div className="flex items-center gap-1.5 px-1">
          <Grid3X3 className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Snap</span>
          <Switch size="sm" checked={snapToGrid} onCheckedChange={onSnapToGridChange} />
        </div>

        <Divider />

        {/* ── Group 6: Execution ── */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={isExecutionOpen ? "secondary" : "ghost"} size="icon-sm" onClick={onExecutionToggle}>
              <Terminal className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle logs</TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-1 px-1">
          <span className="text-xs text-muted-foreground">Auto</span>
          <Switch
            size="sm"
            checked={autoMode}
            onCheckedChange={onAutoModeChange}
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={onRun}
              disabled={isExecuting || autoMode}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Run
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {autoMode ? "Auto mode is on" : "Run flow"}
          </TooltipContent>
        </Tooltip>

        <Divider />

        {/* ── Group 7: Add node + Credits ── */}
        <Popover open={addNodeOpen} onOpenChange={setAddNodeOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon-sm">
                  <Plus className="size-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Add node</TooltipContent>
          </Tooltip>
          <PopoverContent align="end" className="w-48 p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Add Node
            </div>
            {paletteItems.map((item) => (
              <button
                key={item.type}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => {
                  onAddNode?.(item.type);
                  setAddNodeOpen(false);
                }}
              >
                <span
                  className="inline-block size-2 rounded-full shrink-0"
                  style={{ backgroundColor: NODE_COLORS[item.type as NodeColorKey]?.accent }}
                />
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {credits && (
          <div className="flex items-center gap-1.5 px-1">
            <Coins className="size-3.5 text-muted-foreground" />
            <span className="text-xs tabular-nums font-medium">
              ${parseFloat(credits.balance).toFixed(2)}
            </span>
          </div>
        )}
      </TooltipProvider>
    </Panel>
  );
}
