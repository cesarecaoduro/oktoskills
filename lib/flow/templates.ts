import type { AppNode, AppEdge } from "./types";

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: AppNode[];
  edges: AppEdge[];
}

export const flowTemplates: FlowTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start with an empty canvas",
    nodes: [],
    edges: [],
  },
  {
    id: "simple-llm",
    name: "Simple LLM",
    description: "Text Input → LLM → Output",
    nodes: [
      {
        id: "t-input",
        type: "textInput",
        position: { x: 50, y: 120 },
        data: { label: "Prompt", text: "Hi! Tell me a fun fact about space." },
      },
      {
        id: "t-model",
        type: "model",
        position: { x: 50, y: 0 },
        data: { label: "Model", modelId: "openai/gpt-4o-mini", temperature: 0.7, maxTokens: 1024 },
      },
      {
        id: "t-llm",
        type: "llm",
        position: { x: 350, y: 50 },
        data: {
          label: "LLM",
          systemPrompt: "You are a friendly and concise assistant. Keep answers short and helpful.",
          modelId: "",
          temperature: 0.7,
          maxTokens: 1024,
        },
      },
      {
        id: "t-output",
        type: "textOutput",
        position: { x: 650, y: 80 },
        data: { label: "Output", text: "" },
      },
    ],
    edges: [
      { id: "e-model-llm", source: "t-model", target: "t-llm", targetHandle: "llm-model", type: "animated" },
      { id: "e-input-llm", source: "t-input", target: "t-llm", targetHandle: "llm-prompt", type: "animated" },
      { id: "e-llm-output", source: "t-llm", target: "t-output", type: "animated" },
    ],
  },
  {
    id: "system-prompt-llm",
    name: "System + User Prompt",
    description: "LLM with system prompt, user input, and output",
    nodes: [
      {
        id: "t-input",
        type: "textInput",
        position: { x: 50, y: 150 },
        data: { label: "User Message", text: "" },
      },
      {
        id: "t-model",
        type: "model",
        position: { x: 50, y: 0 },
        data: { label: "Model", modelId: "", temperature: 0.7, maxTokens: 2048 },
      },
      {
        id: "t-llm",
        type: "llm",
        position: { x: 380, y: 60 },
        data: {
          label: "Assistant",
          systemPrompt: "You are a helpful assistant. Be concise and clear.",
          modelId: "",
          temperature: 0.7,
          maxTokens: 2048,
        },
      },
      {
        id: "t-output",
        type: "textOutput",
        position: { x: 700, y: 100 },
        data: { label: "Response", text: "" },
      },
    ],
    edges: [
      { id: "e-model-llm", source: "t-model", target: "t-llm", targetHandle: "llm-model", type: "animated" },
      { id: "e-input-llm", source: "t-input", target: "t-llm", targetHandle: "llm-prompt", type: "animated" },
      { id: "e-llm-output", source: "t-llm", target: "t-output", type: "animated" },
    ],
  },
];
