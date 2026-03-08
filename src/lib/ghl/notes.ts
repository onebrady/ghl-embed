import { ghl } from "./client";
import type {
  GHLNotesListResponse,
  GHLCreateNoteBody,
  GHLCreateNoteResponse,
} from "./types";

export async function getNotes(contactId: string, locationId?: string) {
  const { data } = await ghl.get<GHLNotesListResponse>(
    `/contacts/${contactId}/notes`,
    undefined,
    locationId
  );
  return data;
}

export async function createNote(contactId: string, body: GHLCreateNoteBody, locationId?: string) {
  const { data } = await ghl.post<GHLCreateNoteResponse>(
    `/contacts/${contactId}/notes`,
    body as unknown as Record<string, unknown>,
    locationId
  );
  return data;
}
