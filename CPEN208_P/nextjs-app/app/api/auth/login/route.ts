import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const rows = await query(
    `SELECT user_id, email, password_hash, role, student_id
     FROM academic.app_users
     WHERE email = $1`,
    [email]
  );

  // Same generic error whether the email doesn't exist or the password is
  // wrong, so we don't leak which emails are registered.
  const genericError = NextResponse.json(
    { error: "Incorrect email or password." },
    { status: 401 }
  );

  if (rows.length === 0) return genericError;

  const user = rows[0];
  const validPassword = await verifyPassword(password, user.password_hash);
  if (!validPassword) return genericError;

  const token = await createSessionToken({
    userId: user.user_id,
    email: user.email,
    role: user.role,
    studentId: user.student_id,
  });
  await setSessionCookie(token);

  return NextResponse.json({ success: true });
}
