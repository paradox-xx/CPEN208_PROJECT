import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

const registerSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  studentId: z
    .string()
    .trim()
    .min(1)
    .optional()
    .transform((v: string) => (v ? v : undefined)),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email, password, studentId } = parsed.data;

  // If a student ID is supplied, it must exist in the students table and
  // must not already be linked to another app_users account.
  if (studentId) {
    const students = await query(
      `SELECT student_id, full_name FROM academic.students WHERE student_id = $1`,
      [studentId]
    );
    if (students.length === 0) {
      return NextResponse.json(
        { error: "No student record matches that Student ID." },
        { status: 400 }
      );
    }

    const existingLink = await query(
      `SELECT user_id FROM academic.app_users WHERE student_id = $1`,
      [studentId]
    );
    if (existingLink.length > 0) {
      return NextResponse.json(
        { error: "That Student ID is already registered to an account." },
        { status: 409 }
      );
    }
  }

  const existingEmail = await query(
    `SELECT user_id FROM academic.app_users WHERE email = $1`,
    [email]
  );
  if (existingEmail.length > 0) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const role = studentId ? "student" : "student"; // default role; admins are provisioned directly in the DB

  const inserted = await query(
    `INSERT INTO academic.app_users (email, password_hash, role, student_id)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, email, role, student_id`,
    [email, passwordHash, role, studentId ?? null]
  );

  const user = inserted[0];
  const token = await createSessionToken({
    userId: user.user_id,
    email: user.email,
    role: user.role,
    studentId: user.student_id,
  });
  await setSessionCookie(token);

  return NextResponse.json({ success: true });
}
