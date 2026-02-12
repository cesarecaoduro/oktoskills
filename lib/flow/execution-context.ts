import { createContext, useContext } from "react";

interface FlowExecutionContext {
  executeFromNode: (nodeId: string) => Promise<void>;
}

const FlowExecutionCtx = createContext<FlowExecutionContext | null>(null);
export const FlowExecutionProvider = FlowExecutionCtx.Provider;
export const useFlowExecution = () => {
  const ctx = useContext(FlowExecutionCtx);
  if (!ctx) throw new Error("useFlowExecution must be within FlowExecutionProvider");
  return ctx;
};
