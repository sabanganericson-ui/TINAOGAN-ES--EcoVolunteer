import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import BottomNav from "@/components/BottomNav";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const parents = await db
    .select({
      id: users.id,
      name: users.name,
      points: users.points,
    })
    .from(users)
    .where(eq(users.role, "parent"))
    .orderBy(desc(users.points));

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-green-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-white text-2xl font-bold">Leaderboard 🏆</h1>
          <p className="text-green-200 text-sm mt-1">Top volunteer parents</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6">
        {/* Top 3 Podium */}
        {parents.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-6">
            {/* 2nd place */}
            <div className="flex-1 text-center">
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-green-100">
                <div className="text-2xl mb-1">🥈</div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-gray-600 font-bold text-sm">
                    {parents[1].name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-green-900 font-semibold text-xs truncate">{parents[1].name.split(" ")[0]}</p>
                <p className="text-green-600 font-bold text-sm">{parents[1].points} pts</p>
              </div>
              <div className="bg-gray-200 h-12 rounded-b-xl mx-2" />
            </div>

            {/* 1st place */}
            <div className="flex-1 text-center -mt-4">
              <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-yellow-300">
                <div className="text-3xl mb-1">🥇</div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-700 font-bold">
                    {parents[0].name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-green-900 font-semibold text-sm truncate">{parents[0].name.split(" ")[0]}</p>
                <p className="text-green-600 font-bold">{parents[0].points} pts</p>
              </div>
              <div className="bg-yellow-300 h-16 rounded-b-xl mx-2" />
            </div>

            {/* 3rd place */}
            <div className="flex-1 text-center">
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-green-100">
                <div className="text-2xl mb-1">🥉</div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-orange-600 font-bold text-sm">
                    {parents[2].name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-green-900 font-semibold text-xs truncate">{parents[2].name.split(" ")[0]}</p>
                <p className="text-green-600 font-bold text-sm">{parents[2].points} pts</p>
              </div>
              <div className="bg-orange-300 h-8 rounded-b-xl mx-2" />
            </div>
          </div>
        )}

        {/* Full Rankings */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-green-900 font-semibold text-lg mb-4">All Rankings</h2>
          {parents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🌱</div>
              <p className="text-green-400 text-sm">No volunteers yet.</p>
              <p className="text-green-300 text-xs mt-1">Be the first to earn points!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {parents.map((parent, index) => {
                const isCurrentUser = parent.id === session.id;
                return (
                  <div
                    key={parent.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      isCurrentUser
                        ? "bg-green-50 border border-green-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {index < 3 ? (
                        <span className="text-xl">{medals[index]}</span>
                      ) : (
                        <span className="text-green-400 font-bold text-sm">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isCurrentUser
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {parent.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <p className="text-green-900 font-medium text-sm">
                        {parent.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-green-500 font-normal">
                            (You)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="text-green-700 font-bold">{parent.points}</p>
                      <p className="text-green-400 text-xs">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav role={session.role as "admin" | "parent"} />
    </div>
  );
}
