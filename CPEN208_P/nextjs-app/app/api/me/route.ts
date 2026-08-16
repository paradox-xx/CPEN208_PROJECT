import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!session.studentId) {
    return NextResponse.json({
      user: { email: session.email, role: session.role },
      student: null,
    });
  }

  const rows = await query(
    `SELECT s.student_id, s.full_name, s.gender, s.date_of_birth, s.email,
            s.phone, s.address, s.level, s.admission_year, s.status,
            p.program_name, p.program_code
     FROM academic.students s
     LEFT JOIN academic.programs p ON p.program_id = s.program_id
     WHERE s.student_id = $1`,
    [session.studentId]
  );

  return NextResponse.json({
    user: { email: session.email, role: session.role },
    student: rows[0] ?? null,
  });
}
