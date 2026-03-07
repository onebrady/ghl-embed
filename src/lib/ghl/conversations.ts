import { ghl } from "./client";
import type {
  GHLConversationsSearchResponse,
  GHLMessagesResponse,
} from "./types";

const CONVERSATIONS_API_VERSION = "2021-04-15";

export interface SearchConversationsParams {
  locationId: string;
  contactId: string;
  limit?: number;
}

export async function searchConversations(params: SearchConversationsParams) {
  const { data } = await ghl.get<GHLConversationsSearchResponse>(
    "/conversations/search",
    {
      locationId: params.locationId,
      contactId: params.contactId,
      limit: params.limit ?? 20,
    },
    params.locationId,
    CONVERSATIONS_API_VERSION
  );
  return data;
}

export interface GetMessagesParams {
  conversationId: string;
  locationId?: string;
  limit?: number;
  lastMessageId?: string;
}

export async function getMessages(params: GetMessagesParams) {
  const { data } = await ghl.get<GHLMessagesResponse>(
    `/conversations/${params.conversationId}/messages`,
    {
      limit: params.limit ?? 50,
      lastMessageId: params.lastMessageId,
    },
    params.locationId,
    CONVERSATIONS_API_VERSION
  );
  return data;
}
