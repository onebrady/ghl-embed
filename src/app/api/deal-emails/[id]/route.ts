import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { DealEmail } from "@/lib/supabase/deal-emails";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("deal_emails")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Email not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ email: data as DealEmail });
  } catch (err) {
    console.error("GET /api/deal-emails/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch email" },
      { status: 500 }
    );
  }
}
