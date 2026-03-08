"use client";

import { useEffect, useCallback } from "react";

interface ShortcutOptions {
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  enabled?: boolean;
}

/**
 * Register a global keyboard shortcut.
 * Automatically ignores events when focus is in an input, textarea, or contenteditable element.
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: ShortcutOptions = {}
) {
  const { ctrl, meta, shift, alt, enabled = true } = options;

  const handler = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in form elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // Check modifier keys
      if (ctrl && !e.ctrlKey) return;
      if (meta && !e.metaKey) return;
      if (shift && !e.shiftKey) return;
      if (alt && !e.altKey) return;

      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    },
    [key, callback, ctrl, meta, shift, alt]
  );

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handler, enabled]);
}
