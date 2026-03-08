"use client";

import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  InlineEditField,
  type InputType,
  type SelectOption,
} from "./InlineEditField";

export interface FieldDefinition {
  label: string;
  value?: string | null;
  type?: "text" | "date" | "link";
  mono?: boolean;
  // Inline editing support
  editable?: boolean;
  fieldKey?: string;
  inputType?: InputType;
  selectOptions?: SelectOption[];
}

interface FieldGroupProps {
  title: string;
  fields: FieldDefinition[];
  onSave?: (fieldKey: string, newValue: string) => Promise<void>;
}

function formatDate(isoString: string): string {
  try {
    return format(parseISO(isoString), "MMM d, yyyy h:mm a");
  } catch {
    return isoString;
  }
}

export function FieldGroup({ title, fields, onSave }: FieldGroupProps) {
  // Show editable fields even when empty (so user can fill them in)
  const visible = fields.filter(
    (f) => f.value || (f.editable && onSave)
  );
  if (visible.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <dl className="space-y-2.5">
        {visible.map((field) => (
          <div key={field.label} className="flex flex-col gap-0.5">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
              {field.label}
            </dt>
            {field.editable && field.fieldKey && onSave ? (
              <dd>
                <InlineEditField
                  value={field.value ?? ""}
                  fieldKey={field.fieldKey}
                  inputType={field.inputType ?? "text"}
                  selectOptions={field.selectOptions}
                  displayType={field.type}
                  mono={field.mono}
                  onSave={onSave}
                />
              </dd>
            ) : (
              <dd
                className={cn(
                  "px-1 text-sm leading-snug",
                  field.mono && "font-mono text-xs"
                )}
              >
                {field.type === "date" && field.value ? (
                  formatDate(field.value)
                ) : field.type === "link" && field.value ? (
                  <a
                    href={
                      field.value.startsWith("http")
                        ? field.value
                        : `https://${field.value}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {field.value}
                  </a>
                ) : (
                  field.value
                )}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}
