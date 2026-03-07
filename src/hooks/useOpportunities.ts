"use client";

import useSWR from "swr";
import { useSubAccount } from "./useSubAccount";
import type { GHLOpportunitiesSearchResponse } from "@/lib/ghl/types";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  });

interface UseOpportunitiesOptions {
  q?: string;
  pipelineId?: string;
  pipelineStageId?: string;
  status?: string;
  contactId?: string;
  limit?: number;
  page?: number;
}

export function useOpportunities(options: UseOpportunitiesOptions = {}) {
  const { locationId } = useSubAccount();

  const params = new URLSearchParams();
  params.set("locationId", locationId);
  if (options.q) params.set("q", options.q);
  if (options.pipelineId) params.set("pipelineId", options.pipelineId);
  if (options.pipelineStageId)
    params.set("pipelineStageId", options.pipelineStageId);
  if (options.status) params.set("status", options.status);
  if (options.contactId) params.set("contactId", options.contactId);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.page) params.set("page", String(options.page));

  const { data, error, isLoading, mutate } =
    useSWR<GHLOpportunitiesSearchResponse>(
      `/api/ghl/opportunities?${params.toString()}`,
      fetcher,
      { revalidateOnFocus: false, dedupingInterval: 5000 }
    );

  return {
    opportunities: data?.opportunities ?? [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}
