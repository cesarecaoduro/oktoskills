"use client";

import { useFlowEditorStore } from "@/lib/flow/store";
import { Coins } from "lucide-react";

export function CreditBalance() {
  const credits = useFlowEditorStore((s) => s.credits);

  if (!credits) return null;

  const balance = parseFloat(credits.balance);

  return (
    <div className="absolute top-14 right-3 z-10 flex items-center gap-1.5 rounded-full border bg-background/80 backdrop-blur-sm px-3 py-1 shadow-sm">
      <Coins className="size-3.5 text-muted-foreground" />
      <span className="text-xs tabular-nums font-medium">
        ${balance.toFixed(2)}
      </span>
    </div>
  );
}
