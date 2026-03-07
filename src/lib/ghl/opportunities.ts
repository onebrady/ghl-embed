import { ghl } from "./client";
import type { GHLOpportunitiesSearchResponse } from "./types";

export interface SearchOpportunitiesParams {
  locationId: string;
  contactId: string;
  status?: string;
  limit?: number;
}

export async function searchOpportunities(params: SearchOpportunitiesParams) {
  const { data } = await ghl.get<GHLOpportunitiesSearchResponse>(
    "/opportunities/search",
    {
      location_id: params.locationId,
      contact_id: params.contactId,
      status: params.status ?? "all",
      limit: params.limit ?? 20,
    },
    params.locationId
  );
  return data;
}
