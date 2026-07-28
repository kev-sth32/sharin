import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let db: any;
let pool: Pool | null = null;

function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      pool = new Pool({ connectionString, ssl: connectionString.includes("neon") ? { rejectUnauthorized: false } : false });
      db = drizzlePg(pool, { schema });
      console.log("[TripNaari DB] Connected to PostgreSQL");
      return db;
    } catch (e) {
      console.warn("[TripNaari DB] PG connection failed, falling back to mock", e);
    }
  }

  // Fallback mock DB - logs queries but doesn't persist to PG (for demo / no DB_URL)
  console.log("[TripNaari DB] Using in-memory fallback (set DATABASE_URL for real PG)");
  db = {
    _isMock: true,
    query: {},
    // mock insert that returns success
    insert: () => ({
      values: () => ({
        returning: async () => [{ id: Math.floor(Math.random()*10000) }],
      }),
    }),
    select: () => ({
      from: () => ({
        where: async () => [],
        limit: async () => [],
      }),
    }),
  };
  return db;
}

export const dbInstance = () => getDb();
export { schema };

// Helper to check if we have real DB
export function isRealDb() {
  return !!process.env.DATABASE_URL;
}
