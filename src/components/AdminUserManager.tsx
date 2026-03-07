"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface ParentUser {
  id: number;
  name: string;
  email: string;
  points: number;
  gradeLevel: string | null;
  createdAt: Date | null;
}

interface AdminUserManagerProps {
  users: ParentUser[];
}

export default function AdminUserManager({ users }: AdminUserManagerProps) {
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Edit state
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    points: 0,
    gradeLevel: "",
    password: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const openEdit = (user: ParentUser) => {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      points: user.points,
      gradeLevel: user.gradeLevel || "",
      password: "",
    });
    setEditError("");
    setDeletingUserId(null);
    setDeleteError("");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ name: "", email: "", points: 0, gradeLevel: "", password: "" });
    setEditError("");
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId === null) return;
    setEditLoading(true);
    setEditError("");

    try {
      const body: {
        id: number;
        name: string;
        email: string;
        points: number;
        gradeLevel?: string;
        password?: string;
      } = {
        id: editingUserId,
        name: editForm.name,
        email: editForm.email,
        points: editForm.points,
      };
      if (editForm.gradeLevel) {
        body.gradeLevel = editForm.gradeLevel;
      }
      if (editForm.password.trim()) {
        body.password = editForm.password.trim();
      }

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update account");
        return;
      }

      cancelEdit();
      router.refresh();
    } catch {
      setEditError("Network error. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const openDelete = (userId: number) => {
    setDeletingUserId(userId);
    setDeleteError("");
    setEditingUserId(null);
    setEditError("");
  };

  const cancelDelete = () => {
    setDeletingUserId(null);
    setDeleteError("");
  };

  const handleDeleteUser = async (userId: number) => {
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete account");
        return;
      }

      cancelDelete();
      router.refresh();
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-green-900 font-semibold text-lg mb-4">
        Registered Parent Volunteers
      </h2>

      {/* Search Bar */}
      {users.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900 text-sm placeholder-green-300"
            />
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">👨‍👩‍👧</div>
          <p className="text-green-400 text-sm">No parent volunteers yet.</p>
          <p className="text-green-300 text-xs mt-1">
            Parents will appear here once they register.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-green-400 text-sm">No matching volunteers found.</p>
              <p className="text-green-300 text-xs mt-1">
                Try a different search term.
              </p>
            </div>
          ) : (
            <>
              <p className="text-green-500 text-xs mb-2">
                Showing {filteredUsers.length} of {users.length} volunteer{users.length !== 1 ? "s" : ""}
              </p>
              {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="border border-green-100 rounded-xl p-4"
            >
              {editingUserId === user.id ? (
                /* Inline Edit Form */
                <form onSubmit={handleEditUser} className="space-y-3">
                  <h4 className="text-green-900 font-semibold text-sm mb-2">
                    Edit Account
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editForm.points}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          points: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">
                      Child&apos;s Grade Level
                    </label>
                    <select
                      value={editForm.gradeLevel}
                      onChange={(e) =>
                        setEditForm({ ...editForm, gradeLevel: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900 text-sm"
                    >
                      <option value="">Select grade level</option>
                      <option value="Kindergarten">Kindergarten</option>
                      <option value="1st Grade">1st Grade</option>
                      <option value="2nd Grade">2nd Grade</option>
                      <option value="3rd Grade">3rd Grade</option>
                      <option value="4th Grade">4th Grade</option>
                      <option value="5th Grade">5th Grade</option>
                      <option value="6th Grade">6th Grade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">
                      New Password{" "}
                      <span className="text-green-400 font-normal">
                        (leave blank to keep current)
                      </span>
                    </label>
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) =>
                        setEditForm({ ...editForm, password: e.target.value })
                      }
                      placeholder="Enter new password to change"
                      className="w-full px-3 py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900 text-sm placeholder-green-300"
                    />
                  </div>

                  {editError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
                      {editError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 py-2 rounded-xl border border-green-200 text-green-600 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                    >
                      {editLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : deletingUserId === user.id ? (
                /* Delete Confirmation */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      />
                    </svg>
                    <p className="text-sm font-semibold">Delete Account?</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    This will permanently delete{" "}
                    <span className="font-semibold">{user.name}</span>&apos;s
                    account and all their attendance records. This cannot be
                    undone.
                  </p>

                  {deleteError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
                      {deleteError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelDelete}
                      className="flex-1 py-2 rounded-xl border border-green-200 text-green-600 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                    >
                      {deleteLoading ? "Deleting..." : "Delete Account"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal User View */
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-green-900 font-semibold text-sm truncate">
                      {user.name}
                    </p>
                    <p className="text-green-500 text-xs truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-green-600 text-xs font-bold">
                        {user.points}
                      </span>
                      <span className="text-green-400 text-xs">pts</span>
                    </div>
                    {user.gradeLevel && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-green-400 text-xs">📚</span>
                        <span className="text-green-500 text-xs">
                          {user.gradeLevel}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {/* Edit Button */}
                    <button
                      onClick={() => openEdit(user)}
                      title="Edit account"
                      className="p-2 rounded-xl border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => openDelete(user.id)}
                      title="Delete account"
                      className="p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
