import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const parents = await db
      .select({
        id: users.id,
        name: users.name,
        points: users.points,
      })
      .from(users)
      .where(eq(users.role, "parent"))
      .orderBy(desc(users.points));

    return NextResponse.json({ leaderboard: parents });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
