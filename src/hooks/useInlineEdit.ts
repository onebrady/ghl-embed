"use client";

import { useState, useCallback } from "react";

type EditState = "idle" | "editing" | "saving";

export function useInlineEdit(onSave: (value: string) => Promise<void>) {
  const [state, setState] = useState<EditState>("idle");
  const [editValue, setEditValue] = useState("");

  const startEdit = useCallback((currentValue: string) => {
    setEditValue(currentValue);
    setState("editing");
  }, []);

  const cancelEdit = useCallback(() => {
    setState("idle");
    setEditValue("");
  }, []);

  const save = useCallback(async () => {
    setState("saving");
    try {
      await onSave(editValue);
      setState("idle");
      setEditValue("");
    } catch {
      setState("editing");
      throw new Error("Save failed");
    }
  }, [editValue, onSave]);

  return {
    state,
    editValue,
    setEditValue,
    startEdit,
    cancelEdit,
    save,
  };
}
