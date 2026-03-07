import { NextRequest, NextResponse } from "next/server";
import { getPipelines } from "@/lib/ghl/opportunities";
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
    const result = await getPipelines(locationId);
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
