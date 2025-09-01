import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import Database from 'better-sqlite3';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import * as schema from "@shared/schema";

// Load environment variables first
config();

let db: any;
let pool: any;

if (process.env.DATABASE_URL?.startsWith('postgresql://')) {
  // Use PostgreSQL (Supabase)
  const sql = postgres(process.env.DATABASE_URL);
  db = drizzlePg(sql, { schema });
  pool = sql;
} else {
  // Use SQLite for local development
  const dbPath = process.env.DATABASE_URL?.startsWith('file:') 
    ? process.env.DATABASE_URL.replace('file:', '') 
    : './dev.db';
  
  const sqlite = new Database(dbPath);
  // Provide compatibility shims for PostgreSQL functions used by schema
  try {
    sqlite.function('now', () => new Date().toISOString());
    sqlite.function('gen_random_uuid', () => {
      // Simple UUID v4 implementation for SQLite
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    });
  } catch {}

  // Ensure basic schema exists in SQLite (dev convenience)
  try {
    sqlite.pragma('foreign_keys = ON');
    sqlite.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  password_hash TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_help_provided INTEGER DEFAULT 0,
  total_help_received INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS help_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT,
  is_resolved BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS help_responses (
  id TEXT PRIMARY KEY,
  help_request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_marked_helpful BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS garden_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  help_response_id TEXT,
  type TEXT NOT NULL,
  growth INTEGER DEFAULT 0,
  is_grown BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pay_it_forward (
  id TEXT PRIMARY KEY,
  helper_id TEXT NOT NULL,
  helped_user_id TEXT NOT NULL,
  original_help_request_id TEXT NOT NULL,
  forward_help_request_id TEXT,
  is_completed BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
`);
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('SQLite schema initialization error:', e);
    }
  }

  db = drizzle(sqlite, { schema });
  
  // Create default user if no users exist
  try {
    const existingUsers = await db.select().from(schema.users);
    
    if (existingUsers.length === 0) {
      console.log('🔐 Creating default user account...');
      
      const defaultUser = {
        id: nanoid(),
        email: 'admin@echogarden.local',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: await bcrypt.hash('admin123', 10),
        xp: 0,
        level: 1,
        totalHelpProvided: 0,
        totalHelpReceived: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.insert(schema.users).values(defaultUser);
      console.log('✅ Default user created!');
      console.log('   Email: admin@echogarden.local');
      console.log('   Password: admin123');
      console.log('   (You can change this later in the app)');
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Default user creation error:', e);
    }
  }
  
  pool = undefined;
}

export { db, pool };