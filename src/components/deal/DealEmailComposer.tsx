"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  MailPlus,
  X,
  ChevronDown,
} from "lucide-react";
import { useSubAccount } from "@/hooks/useSubAccount";

interface DealEmailComposerProps {
  opportunityId: string;
  onSent: () => void;
  replyTo?: {
    threadId: string;
    inReplyTo: string;
    subject: string;
    fromEmail: string;
  };
}

interface EmailChip {
  email: string;
  valid: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DealEmailComposer({
  opportunityId,
  onSent,
  replyTo,
}: DealEmailComposerProps) {
  const { locationId } = useSubAccount();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const [toChips, setToChips] = useState<EmailChip[]>(
    replyTo ? [{ email: replyTo.fromEmail, valid: true }] : []
  );
  const [toInput, setToInput] = useState("");

  const [showCc, setShowCc] = useState(false);
  const [ccChips, setCcChips] = useState<EmailChip[]>([]);
  const [ccInput, setCcInput] = useState("");

  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject}` : ""
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your email..." }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[150px] focus:outline-none p-3",
      },
    },
  });

  const addChip = useCallback(
    (
      input: string,
      setChips: React.Dispatch<React.SetStateAction<EmailChip[]>>,
      setInput: React.Dispatch<React.SetStateAction<string>>
    ) => {
      const email = input.trim();
      if (!email) return;
      setChips((prev) => [
        ...prev,
        { email, valid: EMAIL_REGEX.test(email) },
      ]);
      setInput("");
    },
    []
  );

  const handleChipKeyDown = useCallback(
    (
      e: KeyboardEvent<HTMLInputElement>,
      input: string,
      chips: EmailChip[],
      setChips: React.Dispatch<React.SetStateAction<EmailChip[]>>,
      setInput: React.Dispatch<React.SetStateAction<string>>
    ) => {
      if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
        if (input.trim()) {
          e.preventDefault();
          addChip(input, setChips, setInput);
        }
      } else if (e.key === "Backspace" && !input && chips.length > 0) {
        setChips((prev) => prev.slice(0, -1));
      }
    },
    [addChip]
  );

  const removeChip = useCallback(
    (
      index: number,
      setChips: React.Dispatch<React.SetStateAction<EmailChip[]>>
    ) => {
      setChips((prev) => prev.filter((_, i) => i !== index));
    },
    []
  );

  async function handleSend() {
    // Flush any pending input
    if (toInput.trim()) {
      addChip(toInput, setToChips, setToInput);
    }

    const finalToChips = toInput.trim()
      ? [...toChips, { email: toInput.trim(), valid: EMAIL_REGEX.test(toInput.trim()) }]
      : toChips;

    if (finalToChips.length === 0) {
      toast.error("At least one recipient is required");
      return;
    }

    const invalidEmails = finalToChips.filter((c) => !c.valid);
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email: ${invalidEmails[0].email}`);
      return;
    }

    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (!editor || editor.isEmpty) {
      toast.error("Email body is required");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/deal-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: finalToChips.map((c) => c.email),
          cc: ccChips.map((c) => c.email),
          subject,
          htmlBody: editor.getHTML(),
          textBody: editor.getText(),
          opportunityId,
          locationId,
          threadId: replyTo?.threadId,
          inReplyTo: replyTo?.inReplyTo,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send email");
      }

      toast.success("Email sent");
      setOpen(false);
      resetForm();
      onSent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  function resetForm() {
    setToChips(replyTo ? [{ email: replyTo.fromEmail, valid: true }] : []);
    setToInput("");
    setCcChips([]);
    setCcInput("");
    setSubject(replyTo ? `Re: ${replyTo.subject}` : "");
    setShowCc(false);
    editor?.commands.clearContent();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MailPlus className="h-3.5 w-3.5" />
        {replyTo ? "Reply" : "Send Email"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {replyTo ? "Reply to Thread" : "New Deal Email"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* To field */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">To</Label>
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  CC <ChevronDown className="h-3 w-3" />
                </button>
              )}
            </div>
            <ChipInput
              chips={toChips}
              input={toInput}
              onInputChange={setToInput}
              onKeyDown={(e) =>
                handleChipKeyDown(e, toInput, toChips, setToChips, setToInput)
              }
              onBlur={() => addChip(toInput, setToChips, setToInput)}
              onRemove={(i) => removeChip(i, setToChips)}
              placeholder="recipient@example.com"
              disabled={sending}
            />
          </div>

          {/* CC field */}
          {showCc && (
            <div>
              <Label className="text-xs text-muted-foreground">CC</Label>
              <ChipInput
                chips={ccChips}
                input={ccInput}
                onInputChange={setCcInput}
                onKeyDown={(e) =>
                  handleChipKeyDown(e, ccInput, ccChips, setCcChips, setCcInput)
                }
                onBlur={() => addChip(ccInput, setCcChips, setCcInput)}
                onRemove={(i) => removeChip(i, setCcChips)}
                placeholder="cc@example.com"
                disabled={sending}
              />
            </div>
          )}

          {/* Subject */}
          <div>
            <Label className="text-xs text-muted-foreground">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="mt-1 text-sm"
              disabled={sending}
            />
          </div>

          {/* Rich text editor */}
          <div>
            <Label className="text-xs text-muted-foreground">Body</Label>
            <div className="mt-1 rounded-md border">
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 border-b px-2 py-1">
                <ToolbarButton
                  active={editor?.isActive("bold") ?? false}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  disabled={sending}
                >
                  <Bold className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive("italic") ?? false}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  disabled={sending}
                >
                  <Italic className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive("link") ?? false}
                  onClick={() => {
                    if (editor?.isActive("link")) {
                      editor.chain().focus().unsetLink().run();
                    } else {
                      const url = window.prompt("URL:");
                      if (url) {
                        editor?.chain().focus().setLink({ href: url }).run();
                      }
                    }
                  }}
                  disabled={sending}
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                </ToolbarButton>
                <div className="mx-1 h-4 w-px bg-border" />
                <ToolbarButton
                  active={editor?.isActive("bulletList") ?? false}
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  disabled={sending}
                >
                  <List className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive("orderedList") ?? false}
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  disabled={sending}
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                </ToolbarButton>
              </div>

              {/* Editor */}
              <EditorContent
                editor={editor}
                className="max-h-64 overflow-y-auto text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSend} disabled={sending}>
              {sending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ───

function ToolbarButton({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded p-1 transition-colors ${
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

function ChipInput({
  chips,
  input,
  onInputChange,
  onKeyDown,
  onBlur,
  onRemove,
  placeholder,
  disabled,
}: {
  chips: EmailChip[];
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1 rounded-md border px-2 py-1.5">
      {chips.map((chip, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${
            chip.valid
              ? "bg-indigo-100 text-indigo-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {chip.email}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="hover:text-foreground"
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder={chips.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        disabled={disabled}
      />
    </div>
  );
}
