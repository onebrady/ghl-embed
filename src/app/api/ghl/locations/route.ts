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

    // Otherwise, search for all locations
    const result = await searchLocations(companyId);
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
