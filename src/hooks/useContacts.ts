"use client";

import useSWR from "swr";
import { useSubAccount } from "./useSubAccount";
import type { GHLContactsListResponse } from "@/lib/ghl/types";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  });

interface UseContactsOptions {
  query?: string;
  limit?: number;
  startAfterId?: string;
}

export function useContacts(options: UseContactsOptions = {}) {
  const { locationId } = useSubAccount();

  const params = new URLSearchParams();
  params.set("locationId", locationId);
  if (options.query) params.set("query", options.query);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.startAfterId) params.set("startAfterId", options.startAfterId);

  const { data, error, isLoading, mutate } =
    useSWR<GHLContactsListResponse>(
      `/api/ghl/contacts?${params.toString()}`,
      fetcher,
      { revalidateOnFocus: false, dedupingInterval: 5000 }
    );

  return {
    contacts: data?.contacts ?? [],
    count: data?.count ?? 0,
    isLoading,
    error,
    mutate,
  };
}
