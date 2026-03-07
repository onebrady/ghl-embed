import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/ghl/tasks";
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
    const result = await getTasks(contactId);
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
    const { contactId, ...taskBody } = body;

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

    const result = await createTask(contactId, {
      ...taskBody,
      completed: taskBody.completed ?? false,
    });
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
