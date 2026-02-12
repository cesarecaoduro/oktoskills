import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { EdgeVariant } from "./types";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  maxTokens?: number;
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

  // AI Gateway data
  models: AIModel[];
  modelsLoading: boolean;
  modelsError: string | null;

  // Actions
  setFlowName: (name: string) => void;
  setAutoMode: (enabled: boolean) => void;
  setIsExecutionOpen: (open: boolean) => void;
  setEdgeType: (type: EdgeVariant) => void;
  setEdgeAnimated: (animated: boolean) => void;
  fetchModels: () => Promise<void>;
  getModelById: (id: string) => AIModel | undefined;
}

export const useFlowEditorStore = create<FlowEditorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        flowName: "Untitled Flow",
        autoMode: false,
        isExecutionOpen: false,
        edgeType: "animated",
        edgeAnimated: true,
        models: [],
        modelsLoading: false,
        modelsError: null,
        // Actions
        setFlowName: (name) => set({ flowName: name }),
        setAutoMode: (enabled) => set({ autoMode: enabled }),
        setIsExecutionOpen: (open) => set({ isExecutionOpen: open }),
        setEdgeType: (type) => set({ edgeType: type }),
        setEdgeAnimated: (animated) => set({ edgeAnimated: animated }),

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

        getModelById: (id) => {
          return get().models.find((model) => model.id === id);
        },
      }),
      {
        name: "flow-editor-storage",
        partialize: (state) => ({
          flowName: state.flowName,
          edgeType: state.edgeType,
          edgeAnimated: state.edgeAnimated,
          autoMode: state.autoMode,
        }),
      }
    ),
    {
      name: "FlowEditorStore",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);
