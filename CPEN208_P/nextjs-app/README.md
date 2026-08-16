# CENG Department Portal (Next.js 14)

A Next.js 14 (App Router) front end for the Computer Engineering
Department database. Provides register / login / dashboard, backed
directly by the `ceng_dept_db` PostgreSQL database.

## Setup

1. Build the database first (see `../sql/`, run files `01` through `12`
   in order against PostgreSQL).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your own values:
   ```bash
   cp .env.example .env.local
   ```
   - `DATABASE_URL` — connection string to `ceng_dept_db`
   - `AUTH_SECRET` — random string used to sign session cookies
     (`openssl rand -base64 32`)
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

## What's included

- **`/register`, `/login`** — creates/authenticates a row in
  `academic.app_users`. Passwords are hashed with bcrypt; sessions are
  a signed JWT in an httpOnly cookie (see `lib/auth.ts`).
- **`/dashboard`** — overview cards (outstanding balance, total paid,
  courses enrolled).
- **`/dashboard/fees`** — full term-by-term fee breakdown, calling the
  `academic.get_outstanding_fees()` Postgres function directly.
- **`/dashboard/courses`** — the signed-in student's course
  enrollment, grades, and assigned lecturer.
- Route protection via `middleware.ts`: unauthenticated visitors are
  bounced from `/dashboard/*` to `/login`; signed-in users are bounced
  away from `/login` and `/register`.
- Registering with a Student ID links the new account to an existing
  row in `academic.students`, so the dashboard shows that student's
  real data. Registering without one creates an account with no
  student record attached (e.g. for staff).

## Project layout

```
app/
  page.tsx                 landing page
  login/page.tsx
  register/page.tsx
  dashboard/
    layout.tsx             sidebar + auth guard
    page.tsx               overview
    fees/page.tsx
    courses/page.tsx
  api/
    auth/{login,register,logout}/route.ts
    me/route.ts
    fees/route.ts
    courses/route.ts
lib/
  db.ts                    pg Pool, scoped to the `academic` schema
  auth.ts                  bcrypt + JWT session helpers
middleware.ts              route protection
```

## Notes / assumptions

- Roles are `student`, `lecturer`, `admin` (`academic.app_users.role`).
  Only self-registration for students is exposed in the UI; lecturer
  and admin accounts are expected to be provisioned directly in the
  database for this assignment's scope.
- This was built and reviewed without a live network connection, so
  `npm install` / `npm run dev` have not been executed in this
  environment. The code follows standard Next.js 14 App Router and
  `pg`/`bcryptjs`/`jose` API contracts; run `npm install && npm run dev`
  locally to verify.
