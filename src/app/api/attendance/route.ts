import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendance, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await db
      .select({
        id: attendance.id,
        eventId: attendance.eventId,
        eventTitle: events.title,
        eventDate: events.date,
        pointsAwarded: attendance.pointsAwarded,
        checkedInAt: attendance.checkedInAt,
      })
      .from(attendance)
      .innerJoin(events, eq(attendance.eventId, events.id))
      .where(eq(attendance.userId, session.id))
      .orderBy(desc(attendance.checkedInAt));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Attendance history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
