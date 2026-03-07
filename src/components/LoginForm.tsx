"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "parent" as "parent" | "admin",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password, role: form.role };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Tab switcher */}
      <div className="flex bg-green-50 rounded-xl p-1 mb-6">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "login"
              ? "bg-white text-green-700 shadow-sm"
              : "text-green-500"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "register"
              ? "bg-white text-green-700 shadow-sm"
              : "text-green-500"
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Smith"
              className="w-full px-4 py-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900 placeholder-green-300"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-green-800 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@example.com"
            className="w-full px-4 py-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900 placeholder-green-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-green-800 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900 placeholder-green-300"
          />
        </div>

        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium text-green-800 mb-1">
              Account Type
            </label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as "parent" | "admin" })
              }
              className="w-full px-4 py-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-green-900"
            >
              <option value="parent">Parent / Volunteer</option>
              <option value="admin">School Staff (Admin)</option>
            </select>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors shadow-md"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-xs text-green-500 mt-4">
        🌱 Together we make our school greener
      </p>
    </div>
  );
}
