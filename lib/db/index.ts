import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let db: any;
let pool: mysql.Pool | null = null;

function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      pool = mysql.createPool({ uri: connectionString });
      db = drizzleMysql(pool, { schema, mode: "default" });
      console.log("[TripNaari DB] Connected to MySQL");
      return db;
    } catch (e) {
      console.warn("[TripNaari DB] MySQL connection failed, falling back to mock", e);
    }
  }

  // Fallback mock DB - logs queries but doesn't persist to MySQL (for demo / no DB_URL)
  console.log("[TripNaari DB] Using in-memory fallback (set DATABASE_URL for real MySQL)");
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
