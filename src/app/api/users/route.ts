import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, attendance } from "@/db/schema";
import { getSession, hashPassword } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const parents = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        points: users.points,
        gradeLevel: users.gradeLevel,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "parent"))
      .orderBy(users.name);

    return NextResponse.json({ users: parents });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, name, email, password, points, gradeLevel } = await request.json();

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "Id, name, and email are required" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), eq(users.role, "parent")))
      .limit(1);

    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: "Email is already in use by another account" },
        { status: 409 }
      );
    }

    // Build update object
    const updateData: {
      name: string;
      email: string;
      points?: number;
      password?: string;
      gradeLevel?: string | null;
    } = { name, email };

    if (typeof points === "number" && points >= 0) {
      updateData.points = points;
    }

    if (gradeLevel !== undefined) {
      updateData.gradeLevel = gradeLevel || null;
    }

    if (password && password.trim().length > 0) {
      updateData.password = await hashPassword(password.trim());
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        points: users.points,
        gradeLevel: users.gradeLevel,
        createdAt: users.createdAt,
      });

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    // Delete attendance records first (foreign key constraint)
    await db.delete(attendance).where(eq(attendance.userId, id));

    // Delete the user
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
