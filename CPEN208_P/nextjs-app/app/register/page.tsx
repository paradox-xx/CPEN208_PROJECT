"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, studentId: studentId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <p className="label-eyebrow text-navy">CENG Department Portal</p>
        <h1 className="mt-3 font-display text-3xl font-medium text-ink">
          Create an account
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="studentId">
              Student ID <span className="font-normal text-ink/50">(optional)</span>
            </label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-navy"
              placeholder="e.g. 22384451"
            />
            <p className="mt-1 text-xs text-ink/50">
              Links your account to your existing student record so your
              dashboard shows your real fees and enrollment.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-navy"
              placeholder="you@aitug.edu.gh"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-navy"
              placeholder="At least 8 characters"
            />
          </div>

          {error && (
            <p className="rounded-md bg-brick-light px-3 py-2 text-sm text-brick">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-700 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-navy underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
