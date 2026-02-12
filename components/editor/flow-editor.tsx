"use client";

import type { AppEdge, AppNode, EdgeVariant } from "@/lib/flow/types";
import type {
  Connection,
  IsValidConnection,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";

import { Canvas } from "@/components/ai-elements/canvas";
import { Connection as ConnectionLine } from "@/components/ai-elements/connection";
import { Controls } from "@/components/ai-elements/controls";
import { Edge } from "@/components/ai-elements/edge";
import { ConfigPanel } from "@/components/editor/config-panel";
import { ExecutionPanel } from "@/components/editor/execution-panel";
import { NodePalette } from "@/components/editor/node-palette";
import { AgentNodeComponent } from "@/components/editor/nodes/agent-node";
import { DocumentNodeComponent } from "@/components/editor/nodes/document-node";
import { ModelNodeComponent } from "@/components/editor/nodes/model-node";
import { TextInputNodeComponent } from "@/components/editor/nodes/text-input-node";
import { TextOutputNodeComponent } from "@/components/editor/nodes/text-output-node";
import { EditorToolbar } from "@/components/editor/toolbar";
import { NavSidebar } from "@/components/nav-sidebar";
import {
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  addEdge,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";
import { useFlowEditorStore } from "@/lib/flow/store";

const nodeTypes = {
  textInput: TextInputNodeComponent,
  textOutput: TextOutputNodeComponent,
  model: ModelNodeComponent,
  document: DocumentNodeComponent,
  agent: AgentNodeComponent,
};

const edgeTypes = {
  animated: Edge.Animated,
  smoothStep: Edge.SmoothStep,
};

const initialNodes: AppNode[] = [
  {
    id: "1",
    type: "textInput",
    position: { x: 100, y: 100 },
    data: { label: "Text Input", text: "" },
  },
  {
    id: "2",
    type: "textOutput",
    position: { x: 600, y: 100 },
    data: { label: "Text Output", text: "" },
  },
];

const initialEdges: AppEdge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "animated",
  },
];

function FlowEditorInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialEdges);
  const {
    flowName,
    setFlowName,
    isExecutionOpen,
    setIsExecutionOpen,
    autoMode,
    setAutoMode,
    edgeType,
    setEdgeType,
    edgeAnimated,
    setEdgeAnimated,
  } = useFlowEditorStore();
  const { fitView, getNodes, getEdges } = useReactFlow();

  const isValidConnection: IsValidConnection = useCallback(
    (connection) => {
      const { source, target, targetHandle } = connection;
      if (source === target) return false;

      const currentNodes = getNodes();
      const sourceNode = currentNodes.find((n) => n.id === source);
      const targetNode = currentNodes.find((n) => n.id === target);
      if (!sourceNode || !targetNode) return false;

      // Enforce agent handle constraints
      if (targetNode.type === "agent" && targetHandle) {
        if (targetHandle === "model" && sourceNode.type !== "model") return false;
        if (targetHandle === "prompt" && sourceNode.type !== "textInput") return false;
        if (targetHandle === "context" && sourceNode.type !== "document" && sourceNode.type !== "textInput") return false;
      }

      const currentEdges = getEdges();
      const hasDuplicate = currentEdges.some(
        (e) =>
          e.source === source &&
          e.target === target &&
          e.targetHandle === targetHandle,
      );
      return !hasDuplicate;
    },
    [getNodes, getEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: edgeType,
            data: { animated: edgeAnimated },
          },
          eds,
        ),
      );
    },
    [setEdges, edgeType, edgeAnimated],
  );

  const handleRun = useCallback(() => {
    setIsExecutionOpen(true);
  }, [setIsExecutionOpen]);

  const handleExecutionToggle = useCallback(() => {
    setIsExecutionOpen(!isExecutionOpen);
  }, [isExecutionOpen, setIsExecutionOpen]);

  const defaultEdgeOptions = useMemo(
    () => ({ type: edgeType, data: { animated: edgeAnimated } }),
    [edgeType, edgeAnimated],
  );

  // Update all existing edges when edge type or animation changes
  useEffect(() => {
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        type: edgeType,
        data: { ...e.data, animated: edgeAnimated },
      })),
    );
  }, [edgeType, edgeAnimated, setEdges]);

  // Resize fitView
  useEffect(() => {
    const handleResize = () => fitView({ padding: 0.2, duration: 200 });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitView]);

  // Migrate legacy edge types on mount
  useEffect(() => {
    setEdges((eds) =>
      eds.map((e) => {
        const legacyTypes = ["straight", "simpleBezier"];
        if (legacyTypes.includes(e.type || "")) {
          return {
            ...e,
            type: "animated",
            data: { ...e.data, animated: edgeAnimated },
          };
        }
        return e;
      }),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen w-screen">
      <NavSidebar />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1">
          <div className="relative flex-1">
            <Canvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange as OnNodesChange}
              onEdgesChange={onEdgesChange as OnEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              connectionLineComponent={ConnectionLine}
              isValidConnection={isValidConnection}
              defaultEdgeOptions={defaultEdgeOptions}
            >
              <EditorToolbar
                flowName={flowName}
                onFlowNameChange={setFlowName}
                onRun={handleRun}
                autoMode={autoMode}
                onAutoModeChange={setAutoMode}
                edgeType={edgeType}
                onEdgeTypeChange={setEdgeType}
                edgeAnimated={edgeAnimated}
                onEdgeAnimatedChange={setEdgeAnimated}
                isExecutionOpen={isExecutionOpen}
                onExecutionToggle={handleExecutionToggle}
              />
              <NodePalette />
              <Controls />
            </Canvas>
          </div>
          <ConfigPanel />
        </div>
        <ExecutionPanel
          isOpen={isExecutionOpen}
          onClose={() => setIsExecutionOpen(false)}
        />
      </div>
    </div>
  );
}

export function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
}
