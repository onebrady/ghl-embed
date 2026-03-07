import { ghl } from "./client";
import type { GHLAppointmentsResponse } from "./types";

export async function getAppointments(contactId: string) {
  const { data } = await ghl.get<GHLAppointmentsResponse>(
    `/contacts/${contactId}/appointments`
  );
  return data;
}
