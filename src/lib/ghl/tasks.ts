import { ghl } from "./client";
import type {
  GHLTasksListResponse,
  GHLCreateTaskBody,
  GHLCreateTaskResponse,
} from "./types";

export async function getTasks(contactId: string, locationId?: string) {
  const { data } = await ghl.get<GHLTasksListResponse>(
    `/contacts/${contactId}/tasks`,
    undefined,
    locationId
  );
  return data;
}

export async function createTask(contactId: string, body: GHLCreateTaskBody, locationId?: string) {
  const { data } = await ghl.post<GHLCreateTaskResponse>(
    `/contacts/${contactId}/tasks`,
    body as unknown as Record<string, unknown>,
    locationId
  );
  return data;
}
