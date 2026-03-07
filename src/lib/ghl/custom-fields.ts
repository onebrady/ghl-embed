import { ghl } from "./client";
import type { GHLCustomFieldsResponse } from "./types";

export async function getCustomFields(
  locationId: string,
  model: "contact" | "opportunity" | "all" = "contact"
) {
  const { data } = await ghl.get<GHLCustomFieldsResponse>(
    `/locations/${locationId}/customFields`,
    { model },
    locationId
  );
  return data;
}
