import { NextRequest, NextResponse } from "next/server";
import { getOpportunity, updateOpportunity } from "@/lib/ghl/opportunities";
import { GHLApiError } from "@/lib/ghl/client";
import type { GHLUpdateOpportunityBody } from "@/lib/ghl/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const locationId =
    request.nextUrl.searchParams.get("locationId") ||
    process.env.GHL_DEFAULT_LOCATION_ID ||
    undefined;

  try {
    const result = await getOpportunity(id, locationId);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = (await request.json()) as GHLUpdateOpportunityBody & { locationId?: string };
    const { locationId: bodyLocationId, ...updateBody } = body;
    const locationId =
      bodyLocationId ||
      request.nextUrl.searchParams.get("locationId") ||
      process.env.GHL_DEFAULT_LOCATION_ID ||
      undefined;

    const result = await updateOpportunity(id, updateBody as GHLUpdateOpportunityBody, locationId);
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
