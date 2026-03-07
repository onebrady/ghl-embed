export interface InboundEmailAddress {
  email: string;
  name?: string;
}

export interface InboundAttachment {
  name: string;
  contentType: string;
  contentLength: number;
}

export interface ParsedInboundEmail {
  fromEmail: string;
  fromName: string;
  toEmails: InboundEmailAddress[];
  ccEmails: InboundEmailAddress[];
  subject: string;
  bodyText: string;
  bodyHtml: string;
  attachments: InboundAttachment[];
  messageId: string;
  inReplyTo?: string;
  opportunityId?: string;
}

interface PostmarkInboundPayload {
  From: string;
  FromName?: string;
  FromFull?: { Email: string; Name?: string };
  To: string;
  ToFull?: { Email: string; Name?: string }[];
  Cc?: string;
  CcFull?: { Email: string; Name?: string }[];
  Subject?: string;
  TextBody?: string;
  HtmlBody?: string;
  MessageID?: string;
  Attachments?: {
    Name: string;
    ContentType: string;
    ContentLength: number;
  }[];
  Headers?: { Name: string; Value: string }[];
}

/**
 * Parse a Postmark inbound webhook payload into a normalized structure.
 */
export function parseInboundWebhook(
  payload: unknown
): ParsedInboundEmail {
  const data = payload as PostmarkInboundPayload;

  const toEmails: InboundEmailAddress[] = data.ToFull
    ? data.ToFull.map((r) => ({ email: r.Email, name: r.Name || undefined }))
    : parseAddressList(data.To);

  const ccEmails: InboundEmailAddress[] = data.CcFull
    ? data.CcFull.map((r) => ({ email: r.Email, name: r.Name || undefined }))
    : parseAddressList(data.Cc || "");

  const inReplyTo = findHeader(data.Headers, "In-Reply-To");

  const allAddresses = [
    ...toEmails.map((a) => a.email),
    ...ccEmails.map((a) => a.email),
  ];
  const opportunityId = extractOpportunityId(allAddresses);

  return {
    fromEmail: data.FromFull?.Email || data.From,
    fromName: data.FromFull?.Name || data.FromName || "",
    toEmails,
    ccEmails,
    subject: data.Subject || "",
    bodyText: data.TextBody || "",
    bodyHtml: data.HtmlBody || "",
    attachments: (data.Attachments || []).map((a) => ({
      name: a.Name,
      contentType: a.ContentType,
      contentLength: a.ContentLength,
    })),
    messageId: data.MessageID || "",
    inReplyTo: inReplyTo || undefined,
    opportunityId: opportunityId || undefined,
  };
}

/**
 * Extract an opportunity ID from email addresses matching the pattern
 * deal-{opportunityId}@...
 */
export function extractOpportunityId(
  addresses: string[]
): string | null {
  const pattern = /^deal-([a-zA-Z0-9]+)@/;
  for (const addr of addresses) {
    const match = addr.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function findHeader(
  headers: { Name: string; Value: string }[] | undefined,
  name: string
): string | null {
  if (!headers) return null;
  const header = headers.find(
    (h) => h.Name.toLowerCase() === name.toLowerCase()
  );
  return header?.Value || null;
}

function parseAddressList(str: string): InboundEmailAddress[] {
  if (!str.trim()) return [];
  return str.split(",").map((part) => {
    const trimmed = part.trim();
    // Handle "Name <email>" format
    const match = trimmed.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return { email: match[2].trim(), name: match[1].trim() };
    }
    return { email: trimmed };
  });
}
