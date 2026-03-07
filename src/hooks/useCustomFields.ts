"use client";

import useSWR from "swr";
import { useSubAccount } from "./useSubAccount";
import type { GHLCustomFieldsResponse, GHLCustomFieldDefinition } from "@/lib/ghl/types";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  });

export function useCustomFieldDefinitions() {
  const { locationId } = useSubAccount();

  const { data, isLoading } = useSWR<GHLCustomFieldsResponse>(
    locationId
      ? `/api/ghl/custom-fields?locationId=${locationId}&model=contact`
      : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const fieldMap = new Map<string, GHLCustomFieldDefinition>(
    (data?.customFields ?? []).map((f) => [f.id, f])
  );

  return { fieldMap, customFields: data?.customFields ?? [], isLoading };
}
