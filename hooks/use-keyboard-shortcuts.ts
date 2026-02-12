"use client";

import { useEffect } from "react";

export type ShortcutDefinition = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  handler: (e: KeyboardEvent) => void;
  ignoreInputs?: boolean;
};

export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl
          ? e.metaKey || e.ctrlKey
          : !e.metaKey && !e.ctrlKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && keyMatch) {
          if (isInput && shortcut.ignoreInputs !== false) continue;
          e.preventDefault();
          shortcut.handler(e);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
