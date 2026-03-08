"use client";

import { useRef, useEffect, useCallback } from "react";
import { Pencil, Loader2, Check, X } from "lucide-react";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export type InputType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "url"
  | "date"
  | "number"
  | "select";

export interface SelectOption {
  value: string;
  label: string;
}

interface InlineEditFieldProps {
  value: string;
  fieldKey: string;
  inputType?: InputType;
  selectOptions?: SelectOption[];
  displayType?: "text" | "date" | "link";
  mono?: boolean;
  onSave: (fieldKey: string, newValue: string) => Promise<void>;
}

function formatDisplayDate(isoString: string): string {
  try {
    return format(parseISO(isoString), "MMM d, yyyy h:mm a");
  } catch {
    return isoString;
  }
}

function formatDisplayValue(
  value: string,
  displayType?: "text" | "date" | "link"
): string {
  if (!value) return "";
  if (displayType === "date") return formatDisplayDate(value);
  return value;
}

export function InlineEditField({
  value,
  fieldKey,
  inputType = "text",
  selectOptions,
  displayType,
  mono,
  onSave,
}: InlineEditFieldProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  const handleSave = useCallback(
    async (newValue: string) => {
      if (newValue === value) return;
      await onSave(fieldKey, newValue);
    },
    [fieldKey, value, onSave]
  );

  const { state, editValue, setEditValue, startEdit, cancelEdit, save } =
    useInlineEdit(handleSave);

  // Focus input when entering edit mode
  useEffect(() => {
    if (state === "editing" && inputRef.current) {
      inputRef.current.focus();
      if (
        inputRef.current instanceof HTMLInputElement &&
        inputRef.current.type !== "date"
      ) {
        inputRef.current.select();
      }
    }
  }, [state]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    } else if (e.key === "Enter" && inputType !== "textarea") {
      e.preventDefault();
      save();
    }
  };

  const handleBlur = () => {
    // Small delay to allow clicking save/cancel buttons
    setTimeout(() => {
      if (state === "editing") {
        save();
      }
    }, 150);
  };

  // Select input saves immediately on change
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditValue(e.target.value);
    // Save on next tick after state updates
    setTimeout(() => {
      onSave(fieldKey, e.target.value).catch(() => {});
      cancelEdit();
    }, 0);
  };

  // Editing state
  if (state === "editing" || state === "saving") {
    return (
      <div className="group relative flex items-center gap-1">
        {inputType === "textarea" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={state === "saving"}
            rows={3}
            className="w-full resize-none rounded border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        ) : inputType === "select" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={handleSelectChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={state === "saving"}
            className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {selectOptions?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={
              inputType === "number"
                ? "number"
                : inputType === "date"
                  ? "date"
                  : inputType === "email"
                    ? "email"
                    : inputType === "url"
                      ? "url"
                      : inputType === "phone"
                        ? "tel"
                        : "text"
            }
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={state === "saving"}
            step={inputType === "number" ? "0.01" : undefined}
            className={cn(
              "w-full rounded border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
              mono && "font-mono text-xs"
            )}
          />
        )}
        {state === "saving" ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
        ) : inputType === "textarea" ? (
          <div className="flex shrink-0 flex-col gap-0.5">
            <button
              type="button"
              onClick={() => save()}
              className="rounded p-0.5 hover:bg-muted"
              title="Save"
            >
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded p-0.5 hover:bg-muted"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  // Display state
  const displayValue = formatDisplayValue(value, displayType);

  return (
    <button
      type="button"
      onClick={() => startEdit(value)}
      className={cn(
        "group flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-sm leading-snug transition-colors hover:bg-muted/60",
        mono && "font-mono text-xs"
      )}
      title="Click to edit"
    >
      <span className="min-w-0 flex-1 break-words">
        {displayType === "link" && value ? (
          <span
            className="text-primary"
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                value.startsWith("http") ? value : `https://${value}`,
                "_blank"
              );
            }}
          >
            {value}
          </span>
        ) : (
          displayValue || <span className="text-muted-foreground/40">—</span>
        )}
      </span>
      <Pencil className="h-3 w-3 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/60" />
    </button>
  );
}
