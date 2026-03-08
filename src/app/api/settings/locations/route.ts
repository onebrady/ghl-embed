import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { invalidateTokenCache } from "@/lib/ghl/token-resolver";

interface LocationRow {
  id: string;
  location_id: string;
  location_name: string;
  private_integration_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/settings/locations
 * List all configured GHL locations (tokens masked).
 */
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("ghl_locations")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[GET /api/settings/locations] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mask tokens before sending to client
    const locations = (data as unknown as LocationRow[]).map((loc) => ({
      ...loc,
      private_integration_token: maskToken(loc.private_integration_token),
    }));

    return NextResponse.json({ locations });
  } catch (err) {
    console.error("[GET /api/settings/locations] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/locations
 * Add a new GHL location with its Private Integration Token.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location_id, location_name, private_integration_token } = body;

    if (!location_id || !location_name || !private_integration_token) {
      return NextResponse.json(
        {
          error:
            "location_id, location_name, and private_integration_token are required",
        },
        { status: 400 }
      );
    }

    // Validate the token works by making a test call to GHL
    const testResult = await testGHLToken(
      location_id,
      private_integration_token
    );
    if (!testResult.valid) {
      return NextResponse.json(
        { error: `Invalid token: ${testResult.error}` },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("ghl_locations")
      .insert({
        location_id,
        location_name: location_name || testResult.locationName,
        private_integration_token,
        is_active: true,
      } as never)
      .select()
      .single();

    if (error) {
      console.error("[POST /api/settings/locations] Supabase error:", error);
      if (error.code === "23505") {
        // Unique violation
        return NextResponse.json(
          { error: "This location ID is already configured" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const row = data as unknown as LocationRow;

    return NextResponse.json(
      {
        location: {
          ...row,
          private_integration_token: maskToken(row.private_integration_token),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/settings/locations] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Test that a GHL Private Integration Token is valid
 * by fetching the location details.
 */
async function testGHLToken(
  locationId: string,
  token: string
): Promise<{ valid: boolean; error?: string; locationName?: string }> {
  try {
    const response = await fetch(
      `https://services.leadconnectorhq.com/locations/${locationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return {
        valid: false,
        error: `GHL returned ${response.status}: ${body?.message || response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      valid: true,
      locationName: data.location?.name || data.name,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/**
 * Mask a token for display: show first 8 and last 4 chars.
 */
function maskToken(token: string): string {
  if (token.length <= 12) return "****";
  return `${token.slice(0, 8)}...${token.slice(-4)}`;
}
