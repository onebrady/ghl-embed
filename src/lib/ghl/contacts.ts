import { ghl } from "./client";
import type {
  GHLContactResponse,
  GHLContactsListResponse,
  GHLContactUpdateResponse,
  GHLUpdateContactBody,
} from "./types";

export interface ListContactsParams {
  locationId: string;
  query?: string;
  limit?: number;
  startAfterId?: string;
}

export async function listContacts(params: ListContactsParams) {
  const { data } = await ghl.get<GHLContactsListResponse>("/contacts/", {
    locationId: params.locationId,
    query: params.query,
    limit: params.limit ?? 20,
    startAfterId: params.startAfterId,
  });
  return data;
}

export async function getContact(contactId: string) {
  const { data } = await ghl.get<GHLContactResponse>(
    `/contacts/${contactId}`
  );
  return data;
}

export async function updateContact(
  contactId: string,
  body: GHLUpdateContactBody
) {
  const { data } = await ghl.put<GHLContactUpdateResponse>(
    `/contacts/${contactId}`,
    body as unknown as Record<string, unknown>
  );
  return data;
}
