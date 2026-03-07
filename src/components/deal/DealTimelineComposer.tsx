"use client";

import {
  AddNotePopover,
  CreateTaskPopover,
} from "@/components/timeline/TimelineComposer";
import { DealEmailComposer } from "./DealEmailComposer";

interface DealTimelineComposerProps {
  contactId: string | null;
  opportunityId: string;
  onMutate: () => void;
}

export function DealTimelineComposer({
  contactId,
  opportunityId,
  onMutate,
}: DealTimelineComposerProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      {contactId && (
        <>
          <AddNotePopover contactId={contactId} onMutate={onMutate} />
          <CreateTaskPopover contactId={contactId} onMutate={onMutate} />
        </>
      )}
      <DealEmailComposer opportunityId={opportunityId} onSent={onMutate} />
    </div>
  );
}
