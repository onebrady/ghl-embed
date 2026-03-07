import { createServerClient } from "./server";

export interface DealEmail {
  id: string;
  ghl_location_id: string;
  ghl_opportunity_id: string;
  message_id: string | null;
  thread_id: string | null;
  in_reply_to: string | null;
  direction: "inbound" | "outbound";
  from_email: string;
  from_name: string | null;
  to_emails: { email: string; name?: string }[];
  cc_emails: { email: string; name?: string }[];
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  attachments: {
    name: string;
    contentType: string;
    contentLength: number;
    url?: string;
  }[];
  status: "draft" | "sent" | "delivered" | "bounced" | "failed";
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DealEmailInsert = Omit<DealEmail, "id" | "created_at" | "updated_at">;

export interface GetDealEmailsOptions {
  limit?: number;
  offset?: number;
}

export async function getDealEmails(
  locationId: string,
  opportunityId: string,
  options?: GetDealEmailsOptions
): Promise<DealEmail[]> {
  const supabase = createServerClient();
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const { data, error } = await supabase
    .from("deal_emails")
    .select("*")
    .eq("ghl_location_id", locationId)
    .eq("ghl_opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data as DealEmail[]) ?? [];
}

export async function getDealEmailThread(
  threadId: string
): Promise<DealEmail[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("deal_emails")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as DealEmail[]) ?? [];
}

export async function createDealEmail(
  email: DealEmailInsert
): Promise<DealEmail> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("deal_emails")
    .insert(email as never)
    .select()
    .single();

  if (error) throw error;
  return data as DealEmail;
}

export async function updateDealEmailStatus(
  id: string,
  status: DealEmail["status"]
): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("deal_emails")
    .update({ status } as never)
    .eq("id", id);

  if (error) throw error;
}

export async function findDealEmailByMessageId(
  messageId: string
): Promise<DealEmail | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("deal_emails")
    .select("*")
    .eq("message_id", messageId)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as DealEmail) ?? null;
}
