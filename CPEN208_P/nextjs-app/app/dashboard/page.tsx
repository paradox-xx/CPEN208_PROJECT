import { getSession } from "@/lib/auth";
import { query, pool } from "@/lib/db";

async function getStudent(studentId: string) {
  const rows = await query(
    `SELECT s.student_id, s.full_name, s.level, s.status, s.admission_year,
            p.program_name
     FROM academic.students s
     LEFT JOIN academic.programs p ON p.program_id = s.program_id
     WHERE s.student_id = $1`,
    [studentId]
  );
  return rows[0] ?? null;
}

async function getFeesSummary(studentId: string) {
  const result = await pool.query(`SELECT academic.get_outstanding_fees($1) AS fees`, [studentId]);
  const arr = result.rows[0]?.fees ?? [];
  return arr[0] ?? null;
}

async function getEnrollmentCount(studentId: string) {
  const rows = await query(
    `SELECT COUNT(*)::int AS count FROM academic.course_enrollments WHERE student_id = $1`,
    [studentId]
  );
  return rows[0]?.count ?? 0;
}

export default async function DashboardOverviewPage() {
  const session = await getSession();

  if (!session?.studentId) {
    return (
      <div>
        <h1 className="font-display text-2xl font-medium text-ink">Overview</h1>
        <p className="mt-3 text-sm text-ink/60">
          This account isn&apos;t linked to a student record, so there&apos;s
          no personal fee or enrollment data to show here.
        </p>
      </div>
    );
  }

  const [student, fees, enrollmentCount] = await Promise.all([
    getStudent(session.studentId),
    getFeesSummary(session.studentId),
    getEnrollmentCount(session.studentId),
  ]);

  return (
    <div>
      <p className="label-eyebrow text-navy">Overview</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-ink">
        Welcome back{student ? `, ${student.full_name.split(" ")[0]}` : ""}
      </h1>

      {student && (
        <div className="mt-2 text-sm text-ink/60">
          {student.program_name} · Level {student.level} · {student.status}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Outstanding balance
          </p>
          <p className="mt-2 font-display text-2xl font-medium text-brick">
            GHS {Number(fees?.total_outstanding ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Total paid to date
          </p>
          <p className="mt-2 font-display text-2xl font-medium text-moss">
            GHS {Number(fees?.total_paid ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Courses enrolled
          </p>
          <p className="mt-2 font-display text-2xl font-medium text-navy">
            {enrollmentCount}
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-ink/50">
        See the <span className="font-medium text-ink">Fees</span> tab for a
        term-by-term breakdown, or <span className="font-medium text-ink">Courses</span> for your enrollment and grades.
      </p>
    </div>
  );
}
