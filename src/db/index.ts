import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";

const sqlite = new Database("local.db");

export const db = drizzle(sqlite, { schema });

// Run migrations on startup
try {
  migrate(db, { migrationsFolder: path.join(process.cwd(), "src/db/migrations") });
  console.log("Database migrations completed");
} catch (error) {
  console.error("Migration error:", error);
}
