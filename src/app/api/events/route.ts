import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.date));

    return NextResponse.json({ events: allEvents });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, date } = await request.json();

    if (!title || !date) {
      return NextResponse.json(
        { error: "Title and date are required" },
        { status: 400 }
      );
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        title,
        date,
        createdBy: session.id,
      })
      .returning();

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
