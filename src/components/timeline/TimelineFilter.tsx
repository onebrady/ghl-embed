"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TimelineFilterValue, TimelineItem } from "@/types/timeline";

interface TimelineFilterProps {
  activeFilter: TimelineFilterValue;
  onFilterChange: (filter: TimelineFilterValue) => void;
  items: TimelineItem[];
}

const filters: { value: TimelineFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "email", label: "Emails" },
  { value: "sms", label: "SMS" },
  { value: "call", label: "Calls" },
  { value: "note", label: "Notes" },
  { value: "task", label: "Tasks" },
  { value: "appointment", label: "Meetings" },
];

export function TimelineFilter({
  activeFilter,
  onFilterChange,
  items,
}: TimelineFilterProps) {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
  }

  return (
    <Tabs
      value={activeFilter}
      onValueChange={(value) => onFilterChange(value as TimelineFilterValue)}
    >
      <TabsList variant="line" className="h-auto flex-wrap gap-0">
        {filters.map(({ value, label }) => {
          const count = value === "all" ? items.length : (counts.get(value) ?? 0);
          return (
            <TabsTrigger key={value} value={value} className="text-xs px-2 py-1.5">
              {label}
              {count > 0 && (
                <span className="ml-1 text-[10px] text-muted-foreground">
                  {count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
