import { NextRequest, NextResponse } from "next/server";
import { parseInboundWebhook } from "@/lib/postmark/inbound";
import {
  createDealEmail,
  findDealEmailByMessageId,
} from "@/lib/supabase/deal-emails";

export async function POST(request: NextRequest) {
  try {
    // Validate webhook token
    const token = request.nextUrl.searchParams.get("token");
    const expectedToken = process.env.POSTMARK_WEBHOOK_SECRET;

    if (!expectedToken || token !== expectedToken) {
      console.warn("Postmark inbound webhook: invalid token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the inbound payload
    const body = await request.json();
    const parsed = parseInboundWebhook(body);

    // Match to a deal
    let opportunityId = parsed.opportunityId || null;
    let threadId: string | null = null;
    let locationId: string | null = null;

    // Strategy B: If no direct address match, try In-Reply-To header
    if (!opportunityId && parsed.inReplyTo) {
      const original = await findDealEmailByMessageId(parsed.inReplyTo);
      if (original) {
        opportunityId = original.ghl_opportunity_id;
        threadId = original.thread_id;
        locationId = original.ghl_location_id;
      }
    }

    // If no match found, log and return 200 (don't make Postmark retry)
    if (!opportunityId) {
      console.warn(
        "Postmark inbound: unmatched email",
        parsed.fromEmail,
        parsed.subject
      );
      return NextResponse.json({ status: "unmatched" });
    }

    // Store in Supabase
    await createDealEmail({
      ghl_location_id:
        locationId || process.env.GHL_DEFAULT_LOCATION_ID || "",
      ghl_opportunity_id: opportunityId,
      message_id: parsed.messageId || null,
      thread_id: threadId,
      in_reply_to: parsed.inReplyTo || null,
      direction: "inbound",
      from_email: parsed.fromEmail,
      from_name: parsed.fromName || null,
      to_emails: parsed.toEmails,
      cc_emails: parsed.ccEmails,
      subject: parsed.subject || null,
      body_text: parsed.bodyText || null,
      body_html: parsed.bodyHtml || null,
      attachments: parsed.attachments,
      status: "delivered",
      sent_at: null,
      received_at: new Date().toISOString(),
    });

    return NextResponse.json({ status: "received" });
  } catch (err) {
    console.error("Postmark inbound webhook error:", err);
    // Return 200 even on error to prevent Postmark retries
    return NextResponse.json({ status: "error" });
  }
}
