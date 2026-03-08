import { ghl } from "./client";
import type { GHLAppointmentsResponse } from "./types";

export async function getAppointments(contactId: string, locationId?: string) {
  const { data } = await ghl.get<GHLAppointmentsResponse>(
    `/contacts/${contactId}/appointments`,
    undefined,
    locationId
  );
  return data;
}
