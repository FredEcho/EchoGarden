-- Add XP and leveling system to users table
ALTER TABLE "users" ADD COLUMN "xp" integer DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "level" integer DEFAULT 1;
ALTER TABLE "users" ADD COLUMN "total_help_provided" integer DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "total_help_received" integer DEFAULT 0;
