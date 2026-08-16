# CPENG Department Records & Fee Management System

A relational database and web application for the Computer Engineering
Department, covering five core functions:

1. Student personal information
2. Student fee payments
3. Course enrollment
4. Lecturer-to-course assignment
5. Lecturer-to-TA assignment

Built with **PostgreSQL** (database) and **Next.js 14** (web app: register,
login, dashboard). Sample data is a real class roster of 70 students.

---

## Repo structure

```
.
├── sql/                              PostgreSQL database (run in order, 01 → 12)
│   ├── 01_create_database.sql
│   ├── 02_create_schema_and_tables.sql
│   ├── 03_seed_reference_data.sql
│   ├── 04_seed_students.sql
│   ├── 05_seed_fee_structure.sql
│   ├── 06_seed_fee_payments.sql
│   ├── 07_seed_course_enrollments.sql
│   ├── 08_seed_lecturer_course_assignments.sql
│   ├── 09_seed_teaching_assistants.sql
│   ├── 10_seed_ta_assignments.sql
│   ├── 11_seed_app_users.sql
│   └── 12_function_outstanding_fees.sql
├── nextjs-app/                       Next.js 14 web app (App Router)
│   ├── app/                          pages + API routes
│   ├── lib/                          db + auth helpers
│   ├── middleware.ts                 route protection
│   └── scripts/hash-password.js      generate a bcrypt hash manually
└── CENG_Department_Project_Report.pdf  full write-up: design, architecture, assumptions
```

For details on the app's internals specifically, see
[`nextjs-app/README.md`](nextjs-app/README.md). This file covers the
whole project end to end.

---

## 1. Database setup

Requires PostgreSQL 14+ installed and running locally (or reachable
remotely).

Run each script **in order** — later scripts depend on tables/data
created by earlier ones:

```bash
psql -U postgres -f sql/01_create_database.sql
psql -U postgres -d ceng_dept_db -f sql/02_create_schema_and_tables.sql
psql -U postgres -d ceng_dept_db -f sql/03_seed_reference_data.sql
psql -U postgres -d ceng_dept_db -f sql/04_seed_students.sql
psql -U postgres -d ceng_dept_db -f sql/05_seed_fee_structure.sql
psql -U postgres -d ceng_dept_db -f sql/06_seed_fee_payments.sql
psql -U postgres -d ceng_dept_db -f sql/07_seed_course_enrollments.sql
psql -U postgres -d ceng_dept_db -f sql/08_seed_lecturer_course_assignments.sql
psql -U postgres -d ceng_dept_db -f sql/09_seed_teaching_assistants.sql
psql -U postgres -d ceng_dept_db -f sql/10_seed_ta_assignments.sql
psql -U postgres -d ceng_dept_db -f sql/11_seed_app_users.sql
psql -U postgres -d ceng_dept_db -f sql/12_function_outstanding_fees.sql
```

All application tables live in the `academic` schema (not `public`).

### Outstanding fees function

`academic.get_outstanding_fees(p_student_id VARCHAR DEFAULT NULL)`
returns a JSON array of per-student, per-term billed/paid/outstanding
amounts.

```sql
SELECT academic.get_outstanding_fees();               -- whole department
SELECT academic.get_outstanding_fees('22384451');      -- one student
SELECT jsonb_pretty(academic.get_outstanding_fees('22384451')::jsonb); -- pretty-printed
```

### Windows: `psql` not recognized

If `psql` isn't found in PowerShell, PostgreSQL's `bin` folder isn't on
your PATH. Either:

- Call it by full path each time:
  `& "C:\Program Files\PostgreSQL\<version>\bin\psql.exe" -U postgres -d ceng_dept_db`
- Or add `C:\Program Files\PostgreSQL\<version>\bin` to your system PATH
  (Environment Variables → Path → New), then open a **new** terminal.

---

## 2. Web app setup

```bash
cd nextjs-app
npm install
cp .env.example .env.local     # then edit it, see below
npm run dev                    # http://localhost:3000
```

### `.env.local`

The app connects using explicit fields (not a single connection URL) —
this avoids issues with special characters in passwords breaking URL
parsing:

```
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your-real-postgres-password
PGDATABASE=ceng_dept_db

AUTH_SECRET=long-random-string
```

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 32
# or, if openssl isn't available:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Restart `npm run dev` after any change to `.env.local`** — Next.js
only reads env files at startup.

### Logging in

The seeded demo accounts (`11_seed_app_users.sql`) have placeholder
password hashes that don't correspond to any real password. Two
options:

- **Easiest:** go to `/register` and create a fresh account. Enter one
  of the 70 seeded Student IDs (e.g. `22384451`) to link it to real
  data.
- **To make the demo accounts work:** generate a real bcrypt hash and
  overwrite it in the database:
  ```bash
  cd nextjs-app
  node scripts/hash-password.js "Password123!"
  # or, without the script file:
  node -e "require('bcryptjs').hash('Password123!', 10).then(h => console.log(h))"
  ```
  Then in `psql`:
  ```sql
  UPDATE academic.app_users SET password_hash = 'PASTE_HASH_HERE'
    WHERE email = 'admin@aitug.edu.gh';
  ```

---

## 3. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `SyntaxError: Unexpected end of JSON input` in the browser | An API route crashed server-side before returning JSON | Check the `npm run dev` terminal for the real stack trace |
| `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` | `PGPASSWORD` (or old `DATABASE_URL`) isn't being read | Confirm the file is really named `.env.local` (not `.env.local.txt`), restart the dev server |
| `password authentication failed for user "postgres"` | The password in `.env.local` doesn't match Postgres | Test with `psql` directly using the same password; if that also fails, reset the password (see below) |
| `'psql' is not recognized...` (Windows) | PostgreSQL's `bin` folder isn't on PATH | See the Windows note above |
| `Cannot find module '...hash-password.js'` | The script file doesn't exist in your local copy | Use the inline `node -e "..."` one-liner instead, or create the file yourself (see `nextjs-app/scripts/hash-password.js`) |

### Forgot / unsure of your postgres password

1. Stop the PostgreSQL service (Windows: Services → `postgresql-x64-<version>` → Stop).
2. Edit `pg_hba.conf` (Windows: `C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf`) — change `scram-sha-256` or `md5` to `trust` for the `127.0.0.1/32` and `::1/128` lines.
3. Start the service again.
4. `psql -U postgres -d ceng_dept_db` (no password needed now), then:
   ```sql
   ALTER USER postgres WITH PASSWORD 'NewPassword123';
   ```
5. Revert `pg_hba.conf` back to `scram-sha-256`/`md5` and restart the service again — don't leave it in `trust` mode.
6. Update `.env.local` with the new password.

---

## 4. Demo credentials

Once you've fixed the password hashes (see above) or registered fresh
accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@aitug.edu.gh | Password123! (after re-hashing) |
| Student | abu.golda451@st.aitug.edu.gh | Password123! (after re-hashing) |

---

## Tech stack

- **Database:** PostgreSQL 14+
- **Web:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Auth:** bcryptjs (password hashing), jose (signed JWT session cookie)
- **DB driver:** pg (node-postgres)
- **Validation:** zod
