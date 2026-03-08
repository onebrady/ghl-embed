import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { invalidateTokenCache } from "@/lib/ghl/token-resolver";

/**
 * PUT /api/settings/locations/:id
 * Update a location's token or name.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.location_name) updates.location_name = body.location_name;
    if (body.private_integration_token)
      updates.private_integration_token = body.private_integration_token;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("ghl_locations")
      .update(updates as never)
      .eq("id", id)
      .select("location_id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Invalidate cached token so next request picks up the new one
    const row = data as unknown as { location_id: string };
    invalidateTokenCache(row.location_id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/locations/:id
 * Remove a location configuration.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createServerClient();

    // Get location_id before deleting so we can invalidate cache
    const { data: existing } = await supabase
      .from("ghl_locations")
      .select("location_id")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("ghl_locations")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (existing) {
      const row = existing as unknown as { location_id: string };
      invalidateTokenCache(row.location_id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
