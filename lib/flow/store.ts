import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { EdgeVariant } from "./types";
import type { ExecutionRun } from "./execution-types";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  maxTokens?: number;
  pricing?: { input: string; output: string };
  [key: string]: any;
}

interface FlowEditorState {
  // Flow metadata
  flowName: string;
  autoMode: boolean;
  isExecutionOpen: boolean;

  // Edge preferences
  edgeType: EdgeVariant;
  edgeAnimated: boolean;

  // Grid
  snapToGrid: boolean;

  // AI Gateway data
  models: AIModel[];
  modelsLoading: boolean;
  modelsError: string | null;
  credits: { balance: string; total_used: string } | null;

  // History (undo/redo)
  history: { nodes: string; edges: string }[];
  historyIndex: number;

  // Execution history
  executionHistory: ExecutionRun[];

  // UI state
  shortcutsDialogOpen: boolean;

  // Actions
  setFlowName: (name: string) => void;
  setAutoMode: (enabled: boolean) => void;
  setIsExecutionOpen: (open: boolean) => void;
  setEdgeType: (type: EdgeVariant) => void;
  setEdgeAnimated: (animated: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  fetchModels: () => Promise<void>;
  fetchCredits: () => Promise<void>;
  getModelById: (id: string) => AIModel | undefined;
  pushHistory: (nodes: string, edges: string) => void;
  undo: () => { nodes: string; edges: string } | null;
  redo: () => { nodes: string; edges: string } | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setShortcutsDialogOpen: (open: boolean) => void;
  addExecutionRun: (run: ExecutionRun) => void;
  clearExecutionHistory: () => void;
}

export const useFlowEditorStore = create<FlowEditorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        flowName: "Simple LLM",
        autoMode: false,
        isExecutionOpen: false,
        edgeType: "animated",
        edgeAnimated: true,
        snapToGrid: false,
        models: [],
        modelsLoading: false,
        modelsError: null,
        credits: null,
        history: [],
        historyIndex: -1,
        executionHistory: [],
        shortcutsDialogOpen: false,
        // Actions
        setFlowName: (name) => set({ flowName: name }),
        setAutoMode: (enabled) => set({ autoMode: enabled }),
        setIsExecutionOpen: (open) => set({ isExecutionOpen: open }),
        setEdgeType: (type) => set({ edgeType: type }),
        setEdgeAnimated: (animated) => set({ edgeAnimated: animated }),
        setSnapToGrid: (snap) => set({ snapToGrid: snap }),

        fetchModels: async () => {
          set({ modelsLoading: true, modelsError: null });
          try {
            const apiKey = process.env.NEXT_PUBLIC_AI_GATEWAY_API_KEY;
            if (!apiKey) {
              throw new Error("AI Gateway API key not configured");
            }

            const response = await fetch("https://ai-gateway.vercel.sh/v1/models", {
              headers: {
                Authorization: `Bearer ${apiKey}`,
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch models: ${response.statusText}`);
            }

            const data = await response.json();
            const modelsList = data.data || data.models || data;
            set({ models: modelsList, modelsLoading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            set({ modelsError: errorMessage, modelsLoading: false, models: [] });
          }
        },

        fetchCredits: async () => {
          try {
            const response = await fetch("/api/flow/credits");
            if (!response.ok) return;
            const data = await response.json();
            set({ credits: data });
          } catch {
            // silently fail — credits are optional
          }
        },

        getModelById: (id) => {
          return get().models.find((model) => model.id === id);
        },

        pushHistory: (nodes, edges) => {
          const { history, historyIndex } = get();
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push({ nodes, edges });
          if (newHistory.length > 50) newHistory.shift();
          set({ history: newHistory, historyIndex: newHistory.length - 1 });
        },
        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex <= 0) return null;
          const newIndex = historyIndex - 1;
          set({ historyIndex: newIndex });
          return history[newIndex];
        },
        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex >= history.length - 1) return null;
          const newIndex = historyIndex + 1;
          set({ historyIndex: newIndex });
          return history[newIndex];
        },
        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,
        setShortcutsDialogOpen: (open) => set({ shortcutsDialogOpen: open }),
        addExecutionRun: (run) =>
          set((state) => ({
            executionHistory: [run, ...state.executionHistory].slice(0, 20),
          })),
        clearExecutionHistory: () => set({ executionHistory: [] }),
      }),
      {
        name: "flow-editor-storage",
        partialize: (state) => ({
          flowName: state.flowName,
          edgeType: state.edgeType,
          edgeAnimated: state.edgeAnimated,
          autoMode: state.autoMode,
          snapToGrid: state.snapToGrid,
          executionHistory: state.executionHistory,
        }),
      }
    ),
    {
      name: "FlowEditorStore",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
