import type { AppNode } from "@/lib/flow/types";
import { Bot, Brain, FileOutput, FileText, Sparkles, Type } from "lucide-react";

export const paletteItems = [
  { type: "textInput", label: "Text", icon: Type },
  { type: "document", label: "Document", icon: FileText },
  { type: "model", label: "Model", icon: Brain },
  { type: "llm", label: "LLM", icon: Sparkles },
  { type: "agent", label: "Agent", icon: Bot },
  { type: "textOutput", label: "Output", icon: FileOutput },
] as const;

export type NodeCategoryGroup = {
  id: string;
  label: string;
  items: typeof paletteItems[number][];
};

export const nodeCategories: NodeCategoryGroup[] = [
  {
    id: "inputs",
    label: "Inputs",
    items: [
      paletteItems[0], // Text
      paletteItems[1], // Document
    ],
  },
  {
    id: "ai",
    label: "AI",
    items: [
      paletteItems[2], // Model
      paletteItems[3], // LLM
      paletteItems[4], // Agent
    ],
  },
  {
    id: "outputs",
    label: "Outputs",
    items: [
      paletteItems[5], // Output
    ],
  },
];

export const defaultNodeData: Record<string, Record<string, unknown>> = {
  textInput: { label: "Text Input", text: "" },
  textOutput: { label: "Text Output", text: "" },
  model: { label: "Model", modelId: "", temperature: 0.7, maxTokens: 1024 },
  document: { label: "Document", content: "", files: [] },
  llm: {
    label: "LLM",
    systemPrompt: "",
    modelId: "",
    temperature: 0.7,
    maxTokens: 1024,
  },
  agent: {
    label: "Agent",
    webSearchEnabled: false,
    contextNodes: [],
  },
};
