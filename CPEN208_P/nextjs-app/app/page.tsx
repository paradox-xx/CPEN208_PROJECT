import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6">
        <p className="label-eyebrow text-amber">Computer Engineering Department</p>
        <h1 className="mt-4 font-display text-5xl font-medium leading-tight sm:text-6xl">
          The department portal,
          <br />
          in one place.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/70">
          Student records, fee balances, course enrollment, and lecturer
          assignments — one system for the whole department.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/login"
            className="rounded-md bg-amber px-6 py-3 font-medium text-navy-900 transition hover:bg-amber/90"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-white/30 px-6 py-3 font-medium text-white transition hover:border-white/60"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
