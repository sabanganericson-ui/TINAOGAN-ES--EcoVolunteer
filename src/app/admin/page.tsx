import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { events, attendance, users } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import BottomNav from "@/components/BottomNav";
import AdminEventManager from "@/components/AdminEventManager";
import AdminUserManager from "@/components/AdminUserManager";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  // Get all events with attendance count
  const allEvents = await db
    .select({
      id: events.id,
      title: events.title,
      date: events.date,
      createdAt: events.createdAt,
    })
    .from(events)
    .orderBy(desc(events.date));

  // Get attendance counts per event
  const attendanceCounts = await db
    .select({
      eventId: attendance.eventId,
      count: count(attendance.id),
    })
    .from(attendance)
    .groupBy(attendance.eventId);

  const countMap = new Map(attendanceCounts.map((a) => [a.eventId, a.count]));

  const eventsWithCounts = allEvents.map((e) => ({
    ...e,
    attendeeCount: countMap.get(e.id) || 0,
  }));

  // Get all parent volunteers
  const allParents = await db
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

  const parentCount = allParents.length;

  return (
    <div className="min-h-screen bg-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 to-green-800 px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-white/20 rounded-lg px-2 py-0.5">
              <span className="text-green-100 text-xs font-medium">ADMIN</span>
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold">TINAOGAN ES- EcoVolunteer</h1>
          <p className="text-green-200 text-sm mt-1">Welcome, {session.name}</p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-green-100 text-xs">Total Events</p>
              <p className="text-white text-2xl font-bold">{allEvents.length}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-green-100 text-xs">Registered Parents</p>
              <p className="text-white text-2xl font-bold">{parentCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        <AdminEventManager events={eventsWithCounts} />
        <AdminUserManager users={allParents} />
      </div>

      <BottomNav role="admin" />
    </div>
  );
}
