import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { attendance, users } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Get attendance count
  const [attendanceCount] = await db
    .select({ count: count(attendance.id) })
    .from(attendance)
    .where(eq(attendance.userId, session.id));

  // Get rank (for parents)
  let rank: number | null = null;
  if (session.role === "parent") {
    const allParents = await db
      .select({ id: users.id, points: users.points })
      .from(users)
      .where(eq(users.role, "parent"))
      .orderBy(users.points);

    // Sort descending
    const sorted = allParents.sort((a, b) => b.points - a.points);
    const rankIndex = sorted.findIndex((p) => p.id === session.id);
    rank = rankIndex >= 0 ? rankIndex + 1 : null;
  }

  const eventsAttended = attendanceCount?.count || 0;

  return (
    <div className="min-h-screen bg-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 px-4 pt-12 pb-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-3xl font-bold">
              {session.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-white text-xl font-bold">{session.name}</h1>
          <p className="text-green-200 text-sm">{session.email}</p>
          <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 mt-2">
            <span className="text-green-100 text-xs font-medium capitalize">
              {session.role === "admin" ? "🏫 School Staff" : "👨‍👩‍👧 Parent Volunteer"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 space-y-4">
        {/* Stats Card */}
        {session.role === "parent" && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-green-900 font-semibold mb-4">Your Stats</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-green-50 rounded-xl p-3">
                <p className="text-green-700 font-bold text-2xl">{session.points}</p>
                <p className="text-green-400 text-xs mt-1">Total Points</p>
              </div>
              <div className="text-center bg-green-50 rounded-xl p-3">
                <p className="text-green-700 font-bold text-2xl">{eventsAttended}</p>
                <p className="text-green-400 text-xs mt-1">Events</p>
              </div>
              <div className="text-center bg-green-50 rounded-xl p-3">
                <p className="text-green-700 font-bold text-2xl">
                  {rank !== null ? `#${rank}` : "-"}
                </p>
                <p className="text-green-400 text-xs mt-1">Rank</p>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-green-900 font-semibold mb-4">Account Info</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-green-50">
              <span className="text-green-500 text-sm">Name</span>
              <span className="text-green-900 font-medium text-sm">{session.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-green-50">
              <span className="text-green-500 text-sm">Email</span>
              <span className="text-green-900 font-medium text-sm">{session.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-green-500 text-sm">Role</span>
              <span className="text-green-900 font-medium text-sm capitalize">{session.role}</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-green-900 font-semibold mb-3">About TINAOGAN ES- EcoVolunteer</h2>
          <p className="text-green-500 text-sm leading-relaxed">
            TINAOGAN ES- EcoVolunteer helps track parent participation in school clean-up events.
            Earn points for every event you attend and climb the leaderboard! 🌱
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-green-400 text-xs">10 points per event</span>
            <span className="text-green-200">•</span>
            <span className="text-green-400 text-xs">QR code check-in</span>
            <span className="text-green-200">•</span>
            <span className="text-green-400 text-xs">Live leaderboard</span>
          </div>
        </div>

        {/* Logout */}
        <LogoutButton />
      </div>

      <BottomNav role={session.role as "admin" | "parent"} />
    </div>
  );
}
