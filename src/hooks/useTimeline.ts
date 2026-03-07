"use client";

import useSWR from "swr";
import { useState, useMemo } from "react";
import { useSubAccount } from "./useSubAccount";
import {
  aggregateTimeline,
  filterTimeline,
  type TimelineSources,
} from "@/lib/utils/timeline-aggregator";
import type { TimelineItem, TimelineFilterValue } from "@/types/timeline";

const MAX_CONVERSATIONS_FOR_MESSAGES = 10;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function timelineFetcher([, contactId, locationId]: [
  string,
  string,
  string,
]): Promise<TimelineSources> {
  // Parallel fetch all sources
  const [conversationsRes, notesRes, tasksRes, appointmentsRes, opportunitiesRes] =
    await Promise.allSettled([
      fetchJson<{ conversations?: Array<{ id: string }>; total?: number }>(
        `/api/ghl/conversations?contactId=${contactId}&locationId=${locationId}`
      ),
      fetchJson<{ notes?: Array<Record<string, unknown>> }>(
        `/api/ghl/notes?contactId=${contactId}`
      ),
      fetchJson<{ tasks?: Array<Record<string, unknown>> }>(
        `/api/ghl/tasks?contactId=${contactId}`
      ),
      fetchJson<{ events?: Array<Record<string, unknown>> }>(
        `/api/ghl/calendars?contactId=${contactId}`
      ),
      fetchJson<{ opportunities?: Array<Record<string, unknown>> }>(
        `/api/ghl/opportunities?contactId=${contactId}&locationId=${locationId}`
      ),
    ]);

  // Extract conversations, then fetch messages for up to N most recent
  const conversations =
    conversationsRes.status === "fulfilled"
      ? (conversationsRes.value.conversations ?? [])
      : [];

  const messageArrays = await Promise.all(
    conversations.slice(0, MAX_CONVERSATIONS_FOR_MESSAGES).map((conv) =>
      fetchJson<{ messages?: { messages?: Array<Record<string, unknown>> } }>(
        `/api/ghl/conversations/${conv.id}/messages?limit=50`
      )
        .then((data) => data.messages?.messages ?? [])
        .catch(() => [])
    )
  );

  return {
    messages: messageArrays.flat() as TimelineSources["messages"],
    notes:
      notesRes.status === "fulfilled"
        ? ((notesRes.value.notes ?? []) as TimelineSources["notes"])
        : [],
    tasks:
      tasksRes.status === "fulfilled"
        ? ((tasksRes.value.tasks ?? []) as TimelineSources["tasks"])
        : [],
    appointments:
      appointmentsRes.status === "fulfilled"
        ? ((appointmentsRes.value.events ?? []) as TimelineSources["appointments"])
        : [],
    opportunities:
      opportunitiesRes.status === "fulfilled"
        ? ((opportunitiesRes.value.opportunities ?? []) as TimelineSources["opportunities"])
        : [],
  };
}

export interface UseTimelineReturn {
  items: TimelineItem[];
  allItems: TimelineItem[];
  isLoading: boolean;
  error: Error | null;
  activeFilter: TimelineFilterValue;
  setFilter: (filter: TimelineFilterValue) => void;
  mutate: () => void;
}

export function useTimeline(contactId: string | null): UseTimelineReturn {
  const { locationId } = useSubAccount();
  const [activeFilter, setFilter] = useState<TimelineFilterValue>("all");

  const { data, error, isLoading, mutate } = useSWR(
    contactId && locationId
      ? ["timeline", contactId, locationId]
      : null,
    timelineFetcher,
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );

  const allItems = useMemo(
    () => (data ? aggregateTimeline(data) : []),
    [data]
  );

  const items = useMemo(
    () => filterTimeline(allItems, activeFilter),
    [allItems, activeFilter]
  );

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
