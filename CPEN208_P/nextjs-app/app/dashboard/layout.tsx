import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-10">
        <aside className="w-56 shrink-0">
          <p className="label-eyebrow text-navy">CENG Portal</p>
          <nav className="mt-6 flex flex-col gap-1 text-sm">
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 font-medium text-ink hover:bg-slate-100"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/fees"
              className="rounded-md px-3 py-2 font-medium text-ink hover:bg-slate-100"
            >
              Fees
            </Link>
            <Link
              href="/dashboard/courses"
              className="rounded-md px-3 py-2 font-medium text-ink hover:bg-slate-100"
            >
              Courses
            </Link>
          </nav>
          <div className="mt-10 border-t border-black/10 pt-4 text-xs text-ink/50">
            Signed in as
            <div className="mt-1 truncate font-medium text-ink">{session.email}</div>
            <SignOutButton />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
