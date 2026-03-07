import { NextRequest, NextResponse } from "next/server";
import { getNotes, createNote } from "@/lib/ghl/notes";
import { GHLApiError } from "@/lib/ghl/client";

export async function GET(request: NextRequest) {
  const contactId = request.nextUrl.searchParams.get("contactId");

  if (!contactId) {
    return NextResponse.json(
      { error: "contactId is required" },
      { status: 400 }
    );
  }

  try {
    const result = await getNotes(contactId);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactId, ...noteBody } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: "contactId is required" },
        { status: 400 }
      );
    }

    if (!noteBody.body) {
      return NextResponse.json(
        { error: "body is required" },
        { status: 400 }
      );
    }

    const result = await createNote(contactId, noteBody);
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
