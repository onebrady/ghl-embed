"use client";

import { ContactTimeline } from "@/components/timeline/ContactTimeline";
import type { GHLOpportunity } from "@/lib/ghl/types";
import { Info } from "lucide-react";

interface DealTimelineProps {
  opportunity: GHLOpportunity;
}

export function DealTimeline({ opportunity }: DealTimelineProps) {
  if (!opportunity.contactId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No contact linked to this deal.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2">
        <Info className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Showing activity for linked contact. Deal-scoped emails coming in
          Phase 4.
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ContactTimeline contactId={opportunity.contactId} />
      </div>
    </div>
  );
}
