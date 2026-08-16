import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

// Calls the academic.get_outstanding_fees(student_id) Postgres function
// (see sql/12_function_outstanding_fees.sql) and returns its JSON result
// straight through to the client.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.role === "student") {
    if (!session.studentId) {
      return NextResponse.json({ error: "No student record linked to this account." }, { status: 400 });
    }
    const result = await pool.query(
      `SELECT academic.get_outstanding_fees($1) AS fees`,
      [session.studentId]
    );
    const feesArray = result.rows[0]?.fees ?? [];
    return NextResponse.json({ fees: feesArray[0] ?? null });
  }

  // Admins / lecturers can see the whole department's outstanding fees.
  const result = await pool.query(`SELECT academic.get_outstanding_fees() AS fees`);
  return NextResponse.json({ fees: result.rows[0]?.fees ?? [] });
}
