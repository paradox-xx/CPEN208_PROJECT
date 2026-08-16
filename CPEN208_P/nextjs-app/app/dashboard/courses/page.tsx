import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

async function getEnrollments(studentId: string) {
  return query(
    `SELECT ce.enrollment_id, c.course_code, c.course_title, c.credit_hours,
            t.academic_year, t.semester, ce.grade,
            l.full_name AS lecturer_name
     FROM academic.course_enrollments ce
     JOIN academic.courses c ON c.course_code = ce.course_code
     JOIN academic.academic_terms t ON t.term_id = ce.term_id
     LEFT JOIN academic.lecturer_course_assignments lca
            ON lca.course_code = ce.course_code AND lca.term_id = ce.term_id AND lca.role = 'main_lecturer'
     LEFT JOIN academic.lecturers l ON l.lecturer_id = lca.lecturer_id
     WHERE ce.student_id = $1
     ORDER BY t.academic_year, t.semester, c.course_code`,
    [studentId]
  );
}

async function getCourseSummary() {
  return query(
    `SELECT c.course_code, c.course_title, t.academic_year, t.semester,
            COUNT(ce.enrollment_id) AS enrolled_count
     FROM academic.courses c
     JOIN academic.course_enrollments ce ON ce.course_code = c.course_code
     JOIN academic.academic_terms t ON t.term_id = ce.term_id
     GROUP BY c.course_code, c.course_title, t.academic_year, t.semester
     ORDER BY t.academic_year, t.semester, c.course_code`
  );
}

export default async function CoursesPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role !== "student") {
    const summary = await getCourseSummary();
    return (
      <div>
        <p className="label-eyebrow text-navy">Courses</p>
        <h1 className="mt-2 font-display text-3xl font-medium text-ink">
          Department enrollment
        </h1>
        <div className="mt-6 overflow-hidden rounded-lg border border-black/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3 text-right">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row: any, i: number) => (
                <tr key={i} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-ink/50">{row.course_code}</span>{" "}
                    {row.course_title}
                  </td>
                  <td className="px-4 py-3">{row.academic_year} · Sem {row.semester}</td>
                  <td className="px-4 py-3 text-right">{row.enrolled_count}</td>
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

  const enrollments = await getEnrollments(session.studentId);

  return (
    <div>
      <p className="label-eyebrow text-navy">Courses</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-ink">
        Your enrollment
      </h1>

      <div className="mt-6 overflow-hidden rounded-lg border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Term</th>
              <th className="px-4 py-3">Lecturer</th>
              <th className="px-4 py-3 text-right">Credits</th>
              <th className="px-4 py-3 text-right">Grade</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((row: any) => (
              <tr key={row.enrollment_id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-ink/50">{row.course_code}</span>{" "}
                  {row.course_title}
                </td>
                <td className="px-4 py-3">{row.academic_year} · Sem {row.semester}</td>
                <td className="px-4 py-3">{row.lecturer_name ?? "—"}</td>
                <td className="px-4 py-3 text-right">{row.credit_hours}</td>
                <td className="px-4 py-3 text-right font-medium">{row.grade ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
