import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.role === "student") {
    if (!session.studentId) {
      return NextResponse.json({ error: "No student record linked to this account." }, { status: 400 });
    }

    const enrollments = await query(
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
      [session.studentId]
    );

    return NextResponse.json({ enrollments });
  }

  // Admins / lecturers: department-wide enrollment counts per course.
  const rows = await query(
    `SELECT c.course_code, c.course_title, t.academic_year, t.semester,
            COUNT(ce.enrollment_id) AS enrolled_count
     FROM academic.courses c
     JOIN academic.course_enrollments ce ON ce.course_code = c.course_code
     JOIN academic.academic_terms t ON t.term_id = ce.term_id
     GROUP BY c.course_code, c.course_title, t.academic_year, t.semester
     ORDER BY t.academic_year, t.semester, c.course_code`
  );

  return NextResponse.json({ courseSummary: rows });
}
