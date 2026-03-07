import { NextRequest, NextResponse } from "next/server";
import { getDealEmails, createDealEmail } from "@/lib/supabase/deal-emails";
import { sendDealEmail } from "@/lib/postmark/send";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const opportunityId = searchParams.get("opportunityId");
    const locationId =
      searchParams.get("locationId") ||
      process.env.GHL_DEFAULT_LOCATION_ID;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!opportunityId) {
      return NextResponse.json(
        { error: "opportunityId is required" },
        { status: 400 }
      );
    }
    if (!locationId) {
      return NextResponse.json(
        { error: "locationId is required" },
        { status: 400 }
      );
    }

    const emails = await getDealEmails(locationId, opportunityId, {
      limit,
      offset,
    });

    return NextResponse.json({ emails });
  } catch (err) {
    console.error("GET /api/deal-emails error:", err);
    return NextResponse.json(
      { error: "Failed to fetch deal emails" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      cc,
      subject,
      htmlBody,
      textBody,
      opportunityId,
      locationId: bodyLocationId,
      threadId,
      inReplyTo,
    } = body;

    const locationId = bodyLocationId || process.env.GHL_DEFAULT_LOCATION_ID;
    const fromEmail = process.env.POSTMARK_FROM_EMAIL;

    if (!fromEmail) {
      return NextResponse.json(
        { error: "POSTMARK_FROM_EMAIL is not configured" },
        { status: 500 }
      );
    }
    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json(
        { error: "At least one recipient (to) is required" },
        { status: 400 }
      );
    }
    if (!subject?.trim()) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }
    if (!htmlBody?.trim()) {
      return NextResponse.json(
        { error: "Email body is required" },
        { status: 400 }
      );
    }
    if (!opportunityId) {
      return NextResponse.json(
        { error: "opportunityId is required" },
        { status: 400 }
      );
    }
    if (!locationId) {
      return NextResponse.json(
        { error: "locationId is required" },
        { status: 400 }
      );
    }

    // Generate a new thread ID if this is not a reply
    const emailThreadId = threadId || randomUUID();

    // Send via Postmark
    const result = await sendDealEmail({
      from: fromEmail,
      to,
      cc: cc || [],
      subject,
      htmlBody,
      textBody: textBody || "",
      opportunityId,
      locationId,
      threadId: emailThreadId,
      inReplyTo,
    });

    // Store in Supabase
    const email = await createDealEmail({
      ghl_location_id: locationId,
      ghl_opportunity_id: opportunityId,
      message_id: result.messageId,
      thread_id: emailThreadId,
      in_reply_to: inReplyTo || null,
      direction: "outbound",
      from_email: fromEmail,
      from_name: null,
      to_emails: to.map((email: string) => ({ email })),
      cc_emails: (cc || []).map((email: string) => ({ email })),
      subject,
      body_text: textBody || null,
      body_html: htmlBody,
      attachments: [],
      status: "sent",
      sent_at: result.submittedAt,
      received_at: null,
    });

    return NextResponse.json({ email });
  } catch (err) {
    console.error("POST /api/deal-emails error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
