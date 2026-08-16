import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

type TermFee = {
  academic_year: string;
  semester: number;
  amount_due: string;
  amount_paid: string;
  outstanding: string;
};

async function getFeesForStudent(studentId: string) {
  const result = await pool.query(`SELECT academic.get_outstanding_fees($1) AS fees`, [studentId]);
  const arr = result.rows[0]?.fees ?? [];
  return arr[0] ?? null;
}

async function getAllFees() {
  const result = await pool.query(`SELECT academic.get_outstanding_fees() AS fees`);
  return result.rows[0]?.fees ?? [];
}

function money(n: string | number) {
  return `GHS ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default async function FeesPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role !== "student") {
    const allFees = await getAllFees();
    return (
      <div>
        <p className="label-eyebrow text-navy">Department fees</p>
        <h1 className="mt-2 font-display text-3xl font-medium text-ink">
          Outstanding balances, all students
        </h1>
        <p className="mt-1 text-sm text-ink/50">
          Powered by <code className="font-mono">academic.get_outstanding_fees()</code>
        </p>

        <div className="mt-6 overflow-hidden rounded-lg border border-black/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-right">Billed</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {allFees.map((row: any) => (
                <tr key={row.student_id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-mono text-xs">{row.student_id}</td>
                  <td className="px-4 py-3">{row.full_name}</td>
                  <td className="px-4 py-3 text-right">{money(row.total_billed)}</td>
                  <td className="px-4 py-3 text-right">{money(row.total_paid)}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      Number(row.total_outstanding) > 0 ? "text-brick" : "text-moss"
                    }`}
                  >
                    {money(row.total_outstanding)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!session.studentId) {
    return <p className="text-sm text-ink/60">No student record linked to this account.</p>;
  }

  const fees = await getFeesForStudent(session.studentId);

  return (
    <div>
      <p className="label-eyebrow text-navy">Fees</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-ink">
        Term-by-term breakdown
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Total billed</p>
          <p className="mt-2 font-display text-xl font-medium text-ink">{money(fees?.total_billed ?? 0)}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Total paid</p>
          <p className="mt-2 font-display text-xl font-medium text-moss">{money(fees?.total_paid ?? 0)}</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Outstanding</p>
          <p className="mt-2 font-display text-xl font-medium text-brick">{money(fees?.total_outstanding ?? 0)}</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3">Term</th>
              <th className="px-4 py-3 text-right">Amount due</th>
              <th className="px-4 py-3 text-right">Amount paid</th>
              <th className="px-4 py-3 text-right">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {(fees?.terms ?? []).map((t: TermFee, i: number) => (
              <tr key={i} className="border-t border-black/5">
                <td className="px-4 py-3">{t.academic_year} · Sem {t.semester}</td>
                <td className="px-4 py-3 text-right">{money(t.amount_due)}</td>
                <td className="px-4 py-3 text-right">{money(t.amount_paid)}</td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    Number(t.outstanding) > 0 ? "text-brick" : "text-moss"
                  }`}
                >
                  {money(t.outstanding)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
