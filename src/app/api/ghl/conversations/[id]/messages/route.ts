import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/ghl/conversations";
import { GHLApiError } from "@/lib/ghl/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const locationId =
    searchParams.get("locationId") ||
    process.env.GHL_DEFAULT_LOCATION_ID ||
    undefined;

  try {
    const result = await getMessages({
      conversationId: id,
      locationId,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : 50,
      lastMessageId: searchParams.get("lastMessageId") || undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GHLApiError) {
      return NextResponse.json(
        { error: error.message, details: error.responseBody },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
