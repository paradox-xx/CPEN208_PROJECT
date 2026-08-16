import { Pool } from "pg";

// Reuse a single pool across hot-reloads in dev and across invocations
// in serverless environments.
declare global {
  // eslint-disable-next-line no-var
  var _cengPool: Pool | undefined;
}

// Sanity check at startup: fail loudly and clearly instead of the cryptic
// "password must be a string" / "password authentication failed" errors
// pg throws when PGPASSWORD is missing, blank, or wrong.
if (typeof process.env.PGPASSWORD !== "string" || process.env.PGPASSWORD.length === 0) {
  throw new Error(
    "PGPASSWORD is not set (or is empty) in your .env.local file. " +
      "Add a line like PGPASSWORD=yourpassword, save the file, and fully restart `npm run dev`."
  );
}

export const pool =
  global._cengPool ??
  new Pool({
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || "ceng_dept_db",
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  global._cengPool = pool;
}

// Every query in this app operates against the `academic` schema.
pool.on("connect", (client) => {
  client.query("SET search_path TO academic, public");
});

export async function query<T = any>(text: string, params: any[] = []) {
  const result = await pool.query<T>(text, params);
  return result.rows;
}
