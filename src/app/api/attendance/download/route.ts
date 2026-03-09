import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attendance, events, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const eventIdNum = parseInt(eventId, 10);
    if (isNaN(eventIdNum)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    // Get event details
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventIdNum));

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get all attendance records for this event with user details
    const attendanceRecords = await db
      .select({
        id: attendance.id,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        gradeLevel: users.gradeLevel,
        pointsAwarded: attendance.pointsAwarded,
        checkedInAt: attendance.checkedInAt,
      })
      .from(attendance)
      .innerJoin(users, eq(attendance.userId, users.id))
      .where(eq(attendance.eventId, eventIdNum))
      .orderBy(users.name);

    // Format the data as CSV
    const headers = ["Name", "Email", "Grade Level", "Points Awarded", "Check-in Time"];
    const csvRows = [
      headers.join(","),
      ...attendanceRecords.map((record) =>
        [
          `"${record.userName || ""}"`,
          `"${record.userEmail || ""}"`,
          `"${record.gradeLevel || ""}"`,
          record.pointsAwarded,
          `"${record.checkedInAt ? new Date(record.checkedInAt).toLocaleString() : ""}"`,
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    // Create response with CSV content
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance_${event.date}_${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv"`,
      },
    });

    return response;
  } catch (error) {
    console.error("Download attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
