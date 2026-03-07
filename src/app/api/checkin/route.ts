import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, attendance } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId, eventId } = await request.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: "User ID and Event ID are required" },
        { status: 400 }
      );
    }

    // Find the parent user
    const [parent] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    if (parent.role !== "parent") {
      return NextResponse.json(
        { error: "User is not a parent" },
        { status: 400 }
      );
    }

    // Check if already checked in for this event
    const existingAttendance = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, parent.id),
          eq(attendance.eventId, parseInt(eventId))
        )
      )
      .limit(1);

    if (existingAttendance.length > 0) {
      return NextResponse.json(
        { error: "Parent already checked in for this event" },
        { status: 409 }
      );
    }

    // Record attendance
    await db.insert(attendance).values({
      userId: parent.id,
      eventId: parseInt(eventId),
      pointsAwarded: 10,
    });

    // Increment parent's points
    await db
      .update(users)
      .set({ points: parent.points + 10 })
      .where(eq(users.id, parent.id));

    return NextResponse.json({
      success: true,
      message: `${parent.name} checked in! +10 points awarded.`,
      parentName: parent.name,
      newPoints: parent.points + 10,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
