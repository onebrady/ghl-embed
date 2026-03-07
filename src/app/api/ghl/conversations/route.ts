import { NextRequest, NextResponse } from "next/server";
import { searchConversations } from "@/lib/ghl/conversations";
import { GHLApiError } from "@/lib/ghl/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locationId =
    searchParams.get("locationId") || process.env.GHL_DEFAULT_LOCATION_ID;
  const contactId = searchParams.get("contactId");

  if (!locationId) {
    return NextResponse.json(
      { error: "locationId is required" },
      { status: 400 }
    );
  }

  if (!contactId) {
    return NextResponse.json(
      { error: "contactId is required" },
      { status: 400 }
    );
  }

  try {
    const result = await searchConversations({
      locationId,
      contactId,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : 20,
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
