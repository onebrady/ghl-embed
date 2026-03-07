"use client";

import useSWR from "swr";
import type { GHLOpportunityResponse } from "@/lib/ghl/types";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  });

export function useOpportunity(opportunityId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<GHLOpportunityResponse>(
    opportunityId ? `/api/ghl/opportunities/${opportunityId}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return {
    opportunity: data?.opportunity ?? null,
    isLoading,
    error,
    mutate,
  };
}
