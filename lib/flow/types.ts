import type { Edge, Node } from "@xyflow/react";

export type TextInputNodeData = {
  label: string;
  text: string;
};

export type TextOutputNodeData = {
  label: string;
  text: string;
};

export type ModelNodeData = {
  label: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
};

export interface FileAttachment {
  id: string;
  filename: string;
  mediaType: string;
  url: string;
  size: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  maxTokens?: number;
  [key: string]: any;
}

export type DocumentNodeData = {
  label: string;
  files: FileAttachment[];
  content: string;
};

export type AgentNodeData = {
  label: string;
  webSearchEnabled: boolean;
  contextNodes: string[]; // tracked from incoming edges
};

export type EdgeVariant = "animated" | "smoothStep";

export type TextInputNode = Node<TextInputNodeData, "textInput">;
export type TextOutputNode = Node<TextOutputNodeData, "textOutput">;
export type ModelNode = Node<ModelNodeData, "model">;
export type DocumentNode = Node<DocumentNodeData, "document">;
export type AgentNode = Node<AgentNodeData, "agent">;

export type AppNode =
  | TextInputNode
  | TextOutputNode
  | ModelNode
  | DocumentNode
  | AgentNode;

export type AppEdge = Edge;

export type NodeCategory = {
  type: string;
  label: string;
  icon: string;
  description: string;
};
