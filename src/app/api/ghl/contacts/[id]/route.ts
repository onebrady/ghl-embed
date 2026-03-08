import { NextRequest, NextResponse } from "next/server";
import { getContact, updateContact } from "@/lib/ghl/contacts";
import { GHLApiError } from "@/lib/ghl/client";
import type { GHLUpdateContactBody } from "@/lib/ghl/types";

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
    const result = await getContact(id, locationId);
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
    const body = (await request.json()) as GHLUpdateContactBody & { locationId?: string };
    const { locationId: bodyLocationId, ...updateBody } = body;
    const locationId =
      bodyLocationId ||
      request.nextUrl.searchParams.get("locationId") ||
      process.env.GHL_DEFAULT_LOCATION_ID ||
      undefined;

    const result = await updateContact(id, updateBody as GHLUpdateContactBody, locationId);
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
