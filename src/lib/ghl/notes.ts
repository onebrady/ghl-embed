import { ghl } from "./client";
import type {
  GHLNotesListResponse,
  GHLCreateNoteBody,
  GHLCreateNoteResponse,
} from "./types";

export async function getNotes(contactId: string) {
  const { data } = await ghl.get<GHLNotesListResponse>(
    `/contacts/${contactId}/notes`
  );
  return data;
}

export async function createNote(contactId: string, body: GHLCreateNoteBody) {
  const { data } = await ghl.post<GHLCreateNoteResponse>(
    `/contacts/${contactId}/notes`,
    body as Record<string, unknown>
  );
  return data;
}
