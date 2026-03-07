"use client";

import { useDealTimeline } from "@/hooks/useDealTimeline";
import { TimelineFilter } from "@/components/timeline/TimelineFilter";
import { TimelineItem } from "@/components/timeline/TimelineItem";
import { DealTimelineComposer } from "./DealTimelineComposer";
import { Skeleton } from "@/components/ui/skeleton";
import type { GHLOpportunity } from "@/lib/ghl/types";

interface DealTimelineProps {
  opportunity: GHLOpportunity;
}

export function DealTimeline({ opportunity }: DealTimelineProps) {
  const { items, allItems, isLoading, error, activeFilter, setFilter, mutate } =
    useDealTimeline(opportunity.contactId || null, opportunity.id);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-destructive">
          Failed to load activity timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Filter bar */}
      <div className="shrink-0 border-b px-4 py-2">
        <TimelineFilter
          activeFilter={activeFilter}
          onFilterChange={setFilter}
          items={allItems}
        />
      </div>

      {/* Timeline items */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <TimelineSkeleton />
        ) : items.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            {allItems.length === 0
              ? "No activity found for this deal."
              : "No matching activity for this filter."}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Composer — note, task, AND email */}
      <div className="shrink-0 border-t">
        <DealTimelineComposer
          contactId={opportunity.contactId || null}
          opportunityId={opportunity.id}
          onMutate={mutate}
        />
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
