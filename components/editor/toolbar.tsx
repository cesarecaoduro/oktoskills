"use client";

import { Panel } from "@/components/ai-elements/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EdgeVariant } from "@/lib/flow/types";
import {
  ChevronDown,
  CornerDownRight,
  Download,
  Pencil,
  Play,
  Redo2,
  Save,
  Spline,
  Terminal,
  Undo2,
} from "lucide-react";

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
}: EditorToolbarProps) {
  return (
    <Panel position="top-center" className="flex items-center gap-1">
      <TooltipProvider>
        <div className="flex items-center gap-0.5">
          <Input
            value={flowName}
            onChange={(e) => onFlowNameChange(e.target.value)}
            className="h- w-36 border-none bg-transparent px-2 text-sm font-medium shadow-none focus-visible:ring-0"
          />
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Pencil className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={onSave}>
              <Save className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Download className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-5" />

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
          <TooltipContent>Undo</TooltipContent>
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
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-5" />

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
        </div>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <div className="flex items-center gap-1.5 px-1">
          <span className="text-xs text-muted-foreground">Animate</span>
          <Switch size="sm" checked={edgeAnimated} onCheckedChange={onEdgeAnimatedChange} />
        </div>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={isExecutionOpen ? "secondary" : "ghost"} size="icon-sm" onClick={onExecutionToggle}>
              <Terminal className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle logs</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <div className="flex items-center gap-1.5">
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
              >
                <Play className="size-4" />
                Run
              </Button>
            </TooltipTrigger>
            <TooltipContent>Run flow</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </Panel>
  );
}
