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
import { AgentNodeComponent } from "@/components/editor/nodes/agent-node";
import { DocumentNodeComponent } from "@/components/editor/nodes/document-node";
import { LLMNodeComponent } from "@/components/editor/nodes/llm-node";
import { ModelNodeComponent } from "@/components/editor/nodes/model-node";
import { TextInputNodeComponent } from "@/components/editor/nodes/text-input-node";
import { ConditionNodeComponent } from "@/components/editor/nodes/condition-node";
import { TextOutputNodeComponent } from "@/components/editor/nodes/text-output-node";
import { ToolNodeComponent } from "@/components/editor/nodes/tool-node";
import { EditorToolbar } from "@/components/editor/toolbar";
import { NavSidebar } from "@/components/nav-sidebar";
import { defaultNodeData } from "@/lib/flow/node-defaults";
import { executeFlow, executeFromNode } from "@/lib/flow/execution-engine";
import type { NodeExecutionLog, ExecutionRun } from "@/lib/flow/execution-types";
import { FlowExecutionProvider } from "@/lib/flow/execution-context";
import {
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  addEdge,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFlowEditorStore } from "@/lib/flow/store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ShortcutsDialog } from "@/components/editor/shortcuts-dialog";
import { CanvasContextMenu } from "@/components/editor/canvas-context-menu";
import { flowTemplates, type FlowTemplate } from "@/lib/flow/templates";

const defaultTemplate = flowTemplates.find((t) => t.id === "simple-llm")!;

const nodeTypes = {
  textInput: TextInputNodeComponent,
  textOutput: TextOutputNodeComponent,
  model: ModelNodeComponent,
  document: DocumentNodeComponent,
  agent: AgentNodeComponent,
  llm: LLMNodeComponent,
  condition: ConditionNodeComponent,
  tool: ToolNodeComponent,
};

const edgeTypes = {
  animated: Edge.Animated,
  smoothStep: Edge.SmoothStep,
};

const initialNodes: AppNode[] = defaultTemplate.nodes.map((n) => ({ ...n }));
const initialEdges: AppEdge[] = defaultTemplate.edges.map((e) => ({ ...e }));

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
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    setShortcutsDialogOpen,
    addExecutionRun,
    snapToGrid,
    setSnapToGrid,
    fetchCredits,
    models,
  } = useFlowEditorStore();
  const { fitView, getNodes, getEdges, screenToFlowPosition } = useReactFlow();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [executionLogs, setExecutionLogs] = useState<NodeExecutionLog[]>([]);
  const [executionRun, setExecutionRun] = useState<ExecutionRun | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Autorun refs
  const prevFingerprintRef = useRef<string>("");
  const autoRunTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Build pricing map from store models
  const buildPricingMap = useCallback(() => {
    const map = new Map<string, { input: string; output: string }>();
    for (const m of models) {
      if (m.pricing) map.set(m.id, m.pricing);
    }
    return map;
  }, [models]);

  const onPaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

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

      // Enforce LLM handle constraints
      if (targetNode.type === "llm" && targetHandle) {
        if (targetHandle === "llm-model" && sourceNode.type !== "model") return false;
        if (targetHandle === "llm-prompt" && sourceNode.type !== "textInput") return false;
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

  const handleRun = useCallback(async () => {
    setIsExecutionOpen(true);
    setIsExecuting(true);
    setExecutionLogs([]);
    setExecutionRun(null);

    try {
      const currentNodes = getNodes() as AppNode[];
      const currentEdges = getEdges() as AppEdge[];

      const run = await executeFlow(currentNodes, currentEdges, (logs) => {
        setExecutionLogs(logs);
      }, buildPricingMap());

      setExecutionRun(run);
      addExecutionRun(run);

      // Update textOutput nodes with their results
      for (const log of run.logs) {
        if (log.nodeType === "textOutput" && log.output !== undefined) {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === log.nodeId
                ? { ...n, data: { ...n.data, text: log.output } }
                : n
            ) as AppNode[]
          );
        }
      }
    } finally {
      setIsExecuting(false);
      // Update fingerprint after run to prevent autorun re-triggering from output updates
      const postNodes = getNodes() as AppNode[];
      const postEdges = getEdges() as AppEdge[];
      prevFingerprintRef.current = JSON.stringify(
        postNodes.map((n) => ({ id: n.id, type: n.type, data: n.data }))
      ) + JSON.stringify(
        postEdges.map((e) => ({ source: e.source, target: e.target, targetHandle: e.targetHandle }))
      );
      fetchCredits();
    }
  }, [setIsExecutionOpen, getNodes, getEdges, addExecutionRun, setNodes, buildPricingMap, fetchCredits]);

  // Handle partial execution from a specific node
  const handleExecuteFromNode = useCallback(async (startNodeId: string) => {
    setIsExecutionOpen(true);
    setIsExecuting(true);
    setExecutionLogs([]);
    setExecutionRun(null);

    try {
      const currentNodes = getNodes() as AppNode[];
      const currentEdges = getEdges() as AppEdge[];

      const run = await executeFromNode(startNodeId, currentNodes, currentEdges, (logs) => {
        setExecutionLogs(logs);
      }, buildPricingMap());

      setExecutionRun(run);
      addExecutionRun(run);

      // Update textOutput nodes with their results
      for (const log of run.logs) {
        if (log.nodeType === "textOutput" && log.output !== undefined) {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === log.nodeId
                ? { ...n, data: { ...n.data, text: log.output } }
                : n
            ) as AppNode[]
          );
        }
      }
    } finally {
      setIsExecuting(false);
      fetchCredits();
    }
  }, [setIsExecutionOpen, getNodes, getEdges, addExecutionRun, setNodes, buildPricingMap, fetchCredits]);

  const handleExecutionToggle = useCallback(() => {
    setIsExecutionOpen(!isExecutionOpen);
  }, [isExecutionOpen, setIsExecutionOpen]);

  const defaultEdgeOptions = useMemo(
    () => ({ type: edgeType, data: { animated: edgeAnimated } }),
    [edgeType, edgeAnimated],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/octoskills-node");
      if (!nodeType || !defaultNodeData[nodeType]) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: nanoid(),
        type: nodeType as AppNode["type"],
        position,
        data: { ...defaultNodeData[nodeType] } as AppNode["data"],
      } as AppNode;

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes],
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

  // Autorun: auto-execute when nodes/edges change in auto mode
  useEffect(() => {
    if (!autoMode || isExecuting) return;

    const fingerprint = JSON.stringify(
      nodes.map((n) => ({ id: n.id, type: n.type, data: n.data }))
    ) + JSON.stringify(
      edges.map((e) => ({ source: e.source, target: e.target, targetHandle: e.targetHandle }))
    );

    if (fingerprint === prevFingerprintRef.current) return;
    prevFingerprintRef.current = fingerprint;

    if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current);
    autoRunTimeoutRef.current = setTimeout(() => {
      handleRun();
    }, 500);

    return () => {
      if (autoRunTimeoutRef.current) clearTimeout(autoRunTimeoutRef.current);
    };
  }, [nodes, edges, autoMode, isExecuting, handleRun]);

  // Fetch credits on mount
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

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

  // History tracking with debounce
  const historyTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const snapshotHistory = useCallback(() => {
    if (historyTimeout.current) clearTimeout(historyTimeout.current);
    historyTimeout.current = setTimeout(() => {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      pushHistory(JSON.stringify(currentNodes), JSON.stringify(currentEdges));
    }, 300);
  }, [getNodes, getEdges, pushHistory]);

  const handleNodesChange: OnNodesChange<AppNode> = useCallback(
    (changes) => {
      onNodesChange(changes);
      snapshotHistory();
    },
    [onNodesChange, snapshotHistory],
  );

  const handleEdgesChange: OnEdgesChange<AppEdge> = useCallback(
    (changes) => {
      onEdgesChange(changes);
      snapshotHistory();
    },
    [onEdgesChange, snapshotHistory],
  );

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    const entry = undo();
    if (entry) {
      setNodes(JSON.parse(entry.nodes));
      setEdges(JSON.parse(entry.edges));
    }
  }, [undo, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const entry = redo();
    if (entry) {
      setNodes(JSON.parse(entry.nodes));
      setEdges(JSON.parse(entry.edges));
    }
  }, [redo, setNodes, setEdges]);

  const handleSave = useCallback(() => {
    // placeholder - will be wired to actual save logic
    console.log("Save triggered");
  }, []);

  const handleAddNode = useCallback(
    (type: string) => {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      const newNode = {
        id: nanoid(),
        type: type as AppNode["type"],
        position,
        data: { ...defaultNodeData[type] } as AppNode["data"],
      } as AppNode;
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  const handleLoadTemplate = useCallback(
    (template: FlowTemplate) => {
      const nodesWithIds = template.nodes.map((n) => ({
        ...n,
        id: n.id.startsWith("t-") ? nanoid() : n.id,
      }));
      // Remap edge source/target to new IDs
      const idMap = new Map(
        template.nodes.map((orig, i) => [orig.id, nodesWithIds[i].id]),
      );
      const edgesWithIds = template.edges.map((e) => ({
        ...e,
        id: nanoid(),
        source: idMap.get(e.source) ?? e.source,
        target: idMap.get(e.target) ?? e.target,
      }));
      setNodes(nodesWithIds as AppNode[]);
      setEdges(edgesWithIds as AppEdge[]);
      setFlowName(template.name);
      setTimeout(() => fitView({ padding: 0.2, duration: 200 }), 50);
    },
    [setNodes, setEdges, setFlowName, fitView],
  );

  // Keyboard shortcuts
  useKeyboardShortcuts(
    useMemo(
      () => [
        { key: "z", ctrl: true, handler: () => handleUndo() },
        { key: "z", ctrl: true, shift: true, handler: () => handleRedo() },
        { key: "s", ctrl: true, handler: () => handleSave() },
        {
          key: "a",
          ctrl: true,
          handler: () => {
            setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
          },
        },
        {
          key: "Escape",
          handler: () => {
            setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
            setIsExecutionOpen(false);
          },
        },
        {
          key: "?",
          handler: () => setShortcutsDialogOpen(true),
        },
      ],
      [handleUndo, handleRedo, handleSave, setNodes, setIsExecutionOpen, setShortcutsDialogOpen],
    ),
  );

  return (
    <FlowExecutionProvider value={{ executeFromNode: handleExecuteFromNode }}>
      <div className="flex h-screen w-screen">
        <NavSidebar />
        <div className="relative flex-1 overflow-hidden">
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange as OnNodesChange}
            onEdgesChange={handleEdgesChange as OnEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionLineComponent={ConnectionLine}
            isValidConnection={isValidConnection}
            defaultEdgeOptions={defaultEdgeOptions}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onPaneContextMenu={onPaneContextMenu}
            onPaneClick={() => setContextMenu(null)}
            snapToGrid={snapToGrid}
            snapGrid={[24, 24]}
          >
            <EditorToolbar
              flowName={flowName}
              onFlowNameChange={setFlowName}
              onRun={handleRun}
              onSave={handleSave}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo()}
              canRedo={canRedo()}
              autoMode={autoMode}
              onAutoModeChange={setAutoMode}
              edgeType={edgeType}
              onEdgeTypeChange={setEdgeType}
              edgeAnimated={edgeAnimated}
              onEdgeAnimatedChange={setEdgeAnimated}
              isExecutionOpen={isExecutionOpen}
              onExecutionToggle={handleExecutionToggle}
              isExecuting={isExecuting}
              onLoadTemplate={handleLoadTemplate}
              snapToGrid={snapToGrid}
              onSnapToGridChange={setSnapToGrid}
              onAddNode={handleAddNode}
            />
            <Controls position="top-left" />
          </Canvas>
          <ConfigPanel />
          <ExecutionPanel
            isOpen={isExecutionOpen}
            onClose={() => setIsExecutionOpen(false)}
            logs={executionLogs}
            run={executionRun}
            isExecuting={isExecuting}
          />
        </div>
        {contextMenu && (
          <CanvasContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
          />
        )}
        <ShortcutsDialog />
      </div>
    </FlowExecutionProvider>
  );
}

export function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
}
