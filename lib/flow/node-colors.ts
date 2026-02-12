export const NODE_COLORS = {
  textInput:  { accent: "var(--editor-node-text)" },    // Blue
  textOutput: { accent: "var(--editor-node-output)" },   // Green
  model:      { accent: "var(--editor-node-text)" },     // Blue (same as text)
  document:   { accent: "var(--editor-node-text)" },     // Blue (same as text)
  agent:      { accent: "var(--editor-node-agent)" },    // Purple
  llm:        { accent: "var(--editor-node-llm)" },      // Amber
} as const;

export type NodeColorKey = keyof typeof NODE_COLORS;
