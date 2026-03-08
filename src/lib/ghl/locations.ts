import { ghl } from "./client";
import type { GHLLocationResponse, GHLLocationsSearchResponse } from "./types";

export async function getLocation(locationId: string) {
  const { data } = await ghl.get<GHLLocationResponse>(
    `/locations/${locationId}`,
    undefined,
    locationId
  );
  return data;
}

export async function searchLocations(companyId?: string, locationId?: string) {
  const { data } = await ghl.get<GHLLocationsSearchResponse>(
    "/locations/search",
    {
      companyId,
      limit: 100,
    },
    locationId
  );
  return data;
}
