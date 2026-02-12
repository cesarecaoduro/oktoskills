import type { AppNode } from "@/lib/flow/types";
import { Bot, Brain, FileOutput, FileText, GitBranch, Sparkles, Type, Wrench } from "lucide-react";

export const paletteItems = [
  { type: "textInput", label: "Text", icon: Type },
  { type: "document", label: "Document", icon: FileText },
  { type: "model", label: "Model", icon: Brain },
  { type: "llm", label: "LLM", icon: Sparkles },
  { type: "agent", label: "Agent", icon: Bot },
  { type: "condition", label: "Condition", icon: GitBranch },
  { type: "tool", label: "Tool", icon: Wrench },
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
    id: "logic",
    label: "Logic",
    items: [
      paletteItems[5], // Condition
    ],
  },
  {
    id: "tools",
    label: "Tools",
    items: [
      paletteItems[6], // Tool
    ],
  },
  {
    id: "outputs",
    label: "Outputs",
    items: [
      paletteItems[7], // Output
    ],
  },
];

export const defaultNodeData: Record<string, Record<string, unknown>> = {
  textInput: { label: "Text Input", text: "" },
  textOutput: { label: "Text Output", text: "", outputFormat: "markdown" },
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
  condition: {
    label: "Condition",
    description: "",
    conditionType: "if-else",
    expression: "",
  },
  tool: {
    label: "Tool",
    description: "",
    toolType: "api-call",
    config: {},
  },
};
