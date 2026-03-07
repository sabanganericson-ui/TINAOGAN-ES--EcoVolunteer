import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { attendance, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import BottomNav from "@/components/BottomNav";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  // Get attendance history
  const history = await db
    .select({
      id: attendance.id,
      eventTitle: events.title,
      eventDate: events.date,
      pointsAwarded: attendance.pointsAwarded,
      checkedInAt: attendance.checkedInAt,
    })
    .from(attendance)
    .innerJoin(events, eq(attendance.eventId, events.id))
    .where(eq(attendance.userId, session.id))
    .orderBy(desc(attendance.checkedInAt))
    .limit(10);

  return (
    <div className="min-h-screen bg-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <p className="text-green-200 text-sm">Welcome back,</p>
          <h1 className="text-white text-2xl font-bold">{session.name} 👋</h1>
          
          {/* Points Card */}
          <div className="mt-6 bg-white/20 backdrop-blur rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Volunteer Points</p>
                <p className="text-white text-4xl font-bold mt-1">{session.points}</p>
                <p className="text-green-200 text-xs mt-1">
                  {history.length} event{history.length !== 1 ? "s" : ""} attended
                </p>
              </div>
              <div className="bg-white/20 rounded-2xl p-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {/* QR Code Section */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-green-900 font-semibold text-lg mb-1">Your Check-in QR Code</h2>
          <p className="text-green-500 text-sm mb-4">Show this to the admin at events to earn points</p>
          <QRCodeDisplay userId={session.id} userName={session.name} />
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-green-900 font-semibold text-lg mb-4">Attendance History</h2>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🌱</div>
              <p className="text-green-400 text-sm">No events attended yet.</p>
              <p className="text-green-300 text-xs mt-1">Check in at your first clean-up event!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-900 font-medium text-sm">{item.eventTitle}</p>
                      <p className="text-green-400 text-xs">{item.eventDate}</p>
                    </div>
                  </div>
                  <div className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    +{item.pointsAwarded}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav role="parent" />
    </div>
  );
}
