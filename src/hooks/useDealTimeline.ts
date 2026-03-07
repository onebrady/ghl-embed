"use client";

import useSWR from "swr";
import { useState, useMemo } from "react";
import { useSubAccount } from "./useSubAccount";
import { useTimeline } from "./useTimeline";
import { normalizeDealEmails } from "@/lib/utils/timeline-aggregator";
import { filterTimeline } from "@/lib/utils/timeline-aggregator";
import type { TimelineItem, TimelineFilterValue } from "@/types/timeline";
import type { DealEmail } from "@/lib/supabase/deal-emails";

async function fetchDealEmails([, opportunityId, locationId]: [
  string,
  string,
  string,
]): Promise<DealEmail[]> {
  const res = await fetch(
    `/api/deal-emails?opportunityId=${opportunityId}&locationId=${locationId}`
  );
  if (!res.ok) {
    // Return empty array instead of throwing so the timeline still renders
    // with GHL contact activity even if deal emails are unavailable
    console.warn(`Deal emails fetch failed: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.emails ?? [];
}

export interface UseDealTimelineReturn {
  items: TimelineItem[];
  allItems: TimelineItem[];
  isLoading: boolean;
  error: Error | null;
  activeFilter: TimelineFilterValue;
  setFilter: (filter: TimelineFilterValue) => void;
  mutate: () => void;
}

export function useDealTimeline(
  contactId: string | null,
  opportunityId: string
): UseDealTimelineReturn {
  const { locationId } = useSubAccount();
  const [activeFilter, setFilter] = useState<TimelineFilterValue>("all");

  // Source 1: GHL contact activity (reuses existing hook)
  const contactTimeline = useTimeline(contactId);

  // Source 2: Deal emails from Supabase
  const {
    data: dealEmails,
    error: dealEmailsError,
    isLoading: dealEmailsLoading,
    mutate: mutateDealEmails,
  } = useSWR(
    opportunityId && locationId
      ? ["deal-emails", opportunityId, locationId]
      : null,
    fetchDealEmails,
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );

  // Merge both sources
  const allItems = useMemo(() => {
    const contactItems = contactTimeline.allItems;
    const emailItems = dealEmails ? normalizeDealEmails(dealEmails) : [];

    return [...contactItems, ...emailItems].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [contactTimeline.allItems, dealEmails]);

  const items = useMemo(
    () => filterTimeline(allItems, activeFilter),
    [allItems, activeFilter]
  );

  const isLoading = contactTimeline.isLoading || dealEmailsLoading;
  const error = contactTimeline.error || dealEmailsError || null;

  function mutate() {
    contactTimeline.mutate();
    mutateDealEmails();
  }

  return {
    items,
    allItems,
    isLoading,
    error: error ?? null,
    activeFilter,
    setFilter,
    mutate,
  };
}
