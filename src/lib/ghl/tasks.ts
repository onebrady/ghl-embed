import { ghl } from "./client";
import type {
  GHLTasksListResponse,
  GHLCreateTaskBody,
  GHLCreateTaskResponse,
} from "./types";

export async function getTasks(contactId: string) {
  const { data } = await ghl.get<GHLTasksListResponse>(
    `/contacts/${contactId}/tasks`
  );
  return data;
}

export async function createTask(contactId: string, body: GHLCreateTaskBody) {
  const { data } = await ghl.post<GHLCreateTaskResponse>(
    `/contacts/${contactId}/tasks`,
    body as unknown as Record<string, unknown>
  );
  return data;
}
