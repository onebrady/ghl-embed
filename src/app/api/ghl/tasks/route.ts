import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/ghl/tasks";
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
    const result = await getTasks(contactId, locationId);
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
    const { contactId, locationId: bodyLocationId, ...taskBody } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: "contactId is required" },
        { status: 400 }
      );
    }

    if (!taskBody.title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    if (!taskBody.dueDate) {
      return NextResponse.json(
        { error: "dueDate is required" },
        { status: 400 }
      );
    }

    const locationId =
      bodyLocationId ||
      process.env.GHL_DEFAULT_LOCATION_ID ||
      undefined;

    const result = await createTask(
      contactId,
      { ...taskBody, completed: taskBody.completed ?? false },
      locationId
    );
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
