import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "parent";
  points: number;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    );
    const userId = sessionData.userId;
    if (!userId) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "parent",
      points: user.points,
    };
  } catch {
    return null;
  }
}

export function createSessionToken(userId: number): string {
  return Buffer.from(JSON.stringify({ userId })).toString("base64");
}

export async function hashPassword(password: string): Promise<string> {
  // Simple hash using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "volunteer-tracker-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}
