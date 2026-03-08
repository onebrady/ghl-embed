import { NextRequest, NextResponse } from "next/server";
import { getAppointments } from "@/lib/ghl/calendars";
import { GHLApiError } from "@/lib/ghl/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const contactId = searchParams.get("contactId");
  const locationId =
    searchParams.get("locationId") ||
    process.env.GHL_DEFAULT_LOCATION_ID ||
    undefined;

  if (!contactId) {
    return NextResponse.json(
      { error: "contactId is required" },
      { status: 400 }
    );
  }

  try {
    const result = await getAppointments(contactId, locationId);
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
