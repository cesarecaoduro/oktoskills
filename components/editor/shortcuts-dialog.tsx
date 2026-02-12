"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFlowEditorStore } from "@/lib/flow/store";

const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const cmdKey = isMac ? "\u2318" : "Ctrl";

const shortcuts = [
  { keys: [`${cmdKey}`, "Z"], description: "Undo" },
  { keys: [`${cmdKey}`, "Shift", "Z"], description: "Redo" },
  { keys: [`${cmdKey}`, "S"], description: "Save" },
  { keys: [`${cmdKey}`, "A"], description: "Select all nodes" },
  { keys: ["Escape"], description: "Deselect / Close panel" },
  { keys: ["?"], description: "Open this dialog" },
  { keys: ["Delete"], description: "Delete selected" },
];

export function ShortcutsDialog() {
  const { shortcutsDialogOpen, setShortcutsDialogOpen } =
    useFlowEditorStore();

  return (
    <Dialog open={shortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.description}
              className="flex items-center justify-between py-1"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
