"use client";

import { useState, useRef } from "react";
import { StickyNote, CheckSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSubAccount } from "@/hooks/useSubAccount";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimelineComposerProps {
  contactId: string;
  onMutate: () => void;
}

export function TimelineComposer({ contactId, onMutate }: TimelineComposerProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <AddNotePopover contactId={contactId} onMutate={onMutate} />
      <CreateTaskPopover contactId={contactId} onMutate={onMutate} />
    </div>
  );
}

export function AddNotePopover({
  contactId,
  onMutate,
}: {
  contactId: string;
  onMutate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const { locationId } = useSubAccount();

  async function handleSave() {
    const body = bodyRef.current?.value?.trim();
    if (!body) return;

    setSaving(true);
    try {
      const res = await fetch("/api/ghl/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, body, locationId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create note");
      }

      toast.success("Note added");
      setOpen(false);
      onMutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <StickyNote className="h-3.5 w-3.5" />
        Add Note
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Add a note</Label>
          <Textarea
            ref={bodyRef}
            placeholder="Write a note..."
            className="min-h-[80px] resize-none text-sm"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CreateTaskPopover({
  contactId,
  onMutate,
}: {
  contactId: string;
  onMutate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const { locationId } = useSubAccount();

  async function handleSave() {
    const title = titleRef.current?.value?.trim();
    const dueDate = dueDateRef.current?.value;

    if (!title) {
      toast.error("Title is required");
      return;
    }
    if (!dueDate) {
      toast.error("Due date is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/ghl/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          locationId,
          title,
          dueDate: new Date(dueDate).toISOString(),
          body: bodyRef.current?.value?.trim() || undefined,
          completed: false,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create task");
      }

      toast.success("Task created");
      setOpen(false);
      onMutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <CheckSquare className="h-3.5 w-3.5" />
        Create Task
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Create a task</Label>
          <Input
            ref={titleRef}
            placeholder="Task title"
            className="text-sm"
            autoFocus
          />
          <Textarea
            ref={bodyRef}
            placeholder="Description (optional)"
            className="min-h-[60px] resize-none text-sm"
          />
          <div>
            <Label className="text-xs text-muted-foreground">Due date</Label>
            <Input
              ref={dueDateRef}
              type="date"
              className="mt-1 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              Create
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
