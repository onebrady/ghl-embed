import { NextRequest, NextResponse } from "next/server";
import { listContacts } from "@/lib/ghl/contacts";
import { GHLApiError } from "@/lib/ghl/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locationId =
    searchParams.get("locationId") || process.env.GHL_DEFAULT_LOCATION_ID;

  if (!locationId) {
    return NextResponse.json(
      { error: "locationId is required" },
      { status: 400 }
    );
  }

  try {
    const result = await listContacts({
      locationId,
      query: searchParams.get("query") || undefined,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : 20,
      startAfterId: searchParams.get("startAfterId") || undefined,
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
