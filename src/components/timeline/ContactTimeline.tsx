"use client";

import { useTimeline } from "@/hooks/useTimeline";
import { TimelineFilter } from "./TimelineFilter";
import { TimelineItem } from "./TimelineItem";
import { TimelineComposer } from "./TimelineComposer";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactTimelineProps {
  contactId: string;
}

export function ContactTimeline({ contactId }: ContactTimelineProps) {
  const { items, allItems, isLoading, error, activeFilter, setFilter, mutate } =
    useTimeline(contactId);

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
      {/* Filter bar — sticky top */}
      <div className="shrink-0 border-b px-4 py-2">
        <TimelineFilter
          activeFilter={activeFilter}
          onFilterChange={setFilter}
          items={allItems}
        />
      </div>

      {/* Timeline items — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <TimelineSkeleton />
        ) : items.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            {allItems.length === 0
              ? "No activity found for this contact."
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

      {/* Composer — sticky bottom */}
      <div className="shrink-0 border-t">
        <TimelineComposer contactId={contactId} onMutate={mutate} />
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-lg border p-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
