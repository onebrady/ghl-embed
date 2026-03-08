import { NextRequest, NextResponse } from "next/server";
import { getLocation, searchLocations } from "@/lib/ghl/locations";
import { GHLApiError } from "@/lib/ghl/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locationId = searchParams.get("locationId");
  const companyId = searchParams.get("companyId") || undefined;

  try {
    // If a specific locationId is provided, return that single location
    if (locationId) {
      const result = await getLocation(locationId);
      return NextResponse.json(result);
    }

    // If no locationId and no default configured, return empty
    // (happens before any tokens are added via Settings)
    if (!process.env.GHL_DEFAULT_LOCATION_ID) {
      return NextResponse.json({ locations: [] });
    }

    // Otherwise, search for all locations
    const result = await searchLocations(companyId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/ghl/locations] Error:", error);
    if (error instanceof GHLApiError) {
      return NextResponse.json(
        { error: error.message, details: error.responseBody },
        { status: error.statusCode }
      );
    }
    // If token not found, return empty rather than 500
    if (error instanceof Error && error.message.includes("No GHL token found")) {
      return NextResponse.json({ locations: [] });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
