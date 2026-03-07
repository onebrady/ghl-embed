"use client";

import useSWR from "swr";
import type { GHLContactResponse } from "@/lib/ghl/types";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  });

export function useContact(contactId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<GHLContactResponse>(
    contactId ? `/api/ghl/contacts/${contactId}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return {
    contact: data?.contact ?? null,
    isLoading,
    error,
    mutate,
  };
}
