"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRScanner from "./QRScanner";

interface Event {
  id: number;
  title: string;
  date: string;
  attendeeCount: number;
}

interface AdminEventManagerProps {
  events: Event[];
}

export default function AdminEventManager({ events }: AdminEventManagerProps) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [scanningEventId, setScanningEventId] = useState<number | null>(null);
  const [scanningEventTitle, setScanningEventTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", date: "" });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create event");
        return;
      }

      setForm({ title: "", date: "" });
      setShowCreateForm(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openScanner = (eventId: number, eventTitle: string) => {
    setScanningEventId(eventId);
    setScanningEventTitle(eventTitle);
  };

  const closeScanner = () => {
    setScanningEventId(null);
    setScanningEventTitle("");
  };

  return (
    <div className="space-y-4">
      {/* Create Event Button */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create New Clean-up Event
      </button>

      {/* Create Event Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-green-900 font-semibold mb-4">New Event Details</h3>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">
                Event Title
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Spring Campus Clean-up"
                className="w-full px-4 py-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900 placeholder-green-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">
                Event Date
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-3 rounded-xl border border-green-200 text-green-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-green-900 font-semibold text-lg mb-4">Clean-up Events</h2>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🌿</div>
            <p className="text-green-400 text-sm">No events yet.</p>
            <p className="text-green-300 text-xs mt-1">Create your first clean-up event above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="border border-green-100 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-green-900 font-semibold">{event.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-green-500 text-xs">{event.date}</span>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg px-3 py-1 text-center">
                    <p className="text-green-700 font-bold text-lg">{event.attendeeCount}</p>
                    <p className="text-green-400 text-xs">checked in</p>
                  </div>
                </div>
                <button
                  onClick={() => openScanner(event.id, event.title)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Check-in Parent
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {scanningEventId !== null && (
        <QRScanner
          eventId={scanningEventId}
          eventTitle={scanningEventTitle}
          onClose={closeScanner}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
