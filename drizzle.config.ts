import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Determine if we're using SQLite or PostgreSQL
const isSQLite = process.env.DATABASE_URL.startsWith('file:');

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: isSQLite ? "sqlite" : "postgresql",
  dbCredentials: isSQLite ? {
    url: process.env.DATABASE_URL.replace('file:', ''),
  } : {
    url: process.env.DATABASE_URL,
  },
});
