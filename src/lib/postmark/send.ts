import { getPostmarkClient } from "./client";
import { Models } from "postmark";
import type { Header } from "postmark/dist/client/models";

export interface SendDealEmailOptions {
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  opportunityId: string;
  locationId: string;
  threadId?: string;
  inReplyTo?: string;
}

export interface SendDealEmailResult {
  messageId: string;
  submittedAt: string;
}

export async function sendDealEmail(
  options: SendDealEmailOptions
): Promise<SendDealEmailResult> {
  const client = getPostmarkClient();

  const inboundAddress = process.env.POSTMARK_INBOUND_ADDRESS;
  if (!inboundAddress) {
    throw new Error("POSTMARK_INBOUND_ADDRESS environment variable is not set");
  }

  const inboundDomain = inboundAddress.split("@")[1];
  const replyTo = `deal-${options.opportunityId}@${inboundDomain}`;

  const headers: Header[] = [
    { Name: "X-Deal-Id", Value: options.opportunityId },
    { Name: "X-Location-Id", Value: options.locationId },
  ];

  if (options.inReplyTo) {
    headers.push({ Name: "In-Reply-To", Value: options.inReplyTo });
    headers.push({ Name: "References", Value: options.inReplyTo });
  }

  const response = await client.sendEmail({
    From: options.from,
    To: options.to.join(", "),
    Cc: options.cc?.join(", ") || undefined,
    Subject: options.subject,
    HtmlBody: options.htmlBody,
    TextBody: options.textBody || undefined,
    ReplyTo: replyTo,
    Tag: "deal-email",
    Metadata: {
      opportunityId: options.opportunityId,
      locationId: options.locationId,
      threadId: options.threadId || "",
    },
    Headers: headers,
    TrackOpens: true,
    TrackLinks: Models.LinkTrackingOptions.HtmlAndText,
    MessageStream: "outbound",
  });

  return {
    messageId: response.MessageID,
    submittedAt: response.SubmittedAt,
  };
}
