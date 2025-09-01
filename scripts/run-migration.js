#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function runMigration() {
  let sql;
  try {
    console.log('🔄 Running migration to add XP and leveling system...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Check if columns already exist
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('xp', 'level', 'total_help_provided', 'total_help_received')
    `;
    
    if (existingColumns.length > 0) {
      console.log('✅ XP and leveling columns already exist:');
      existingColumns.forEach(col => console.log(`   - ${col.column_name}`));
      return;
    }
    
    // Add new columns
    console.log('📝 Adding XP and leveling columns to users table...');
    
    await sql`ALTER TABLE "users" ADD COLUMN "xp" integer DEFAULT 0`;
    console.log('   ✅ Added xp column');
    
    await sql`ALTER TABLE "users" ADD COLUMN "level" integer DEFAULT 1`;
    console.log('   ✅ Added level column');
    
    await sql`ALTER TABLE "users" ADD COLUMN "total_help_provided" integer DEFAULT 0`;
    console.log('   ✅ Added total_help_provided column');
    
    await sql`ALTER TABLE "users" ADD COLUMN "total_help_received" integer DEFAULT 0`;
    console.log('   ✅ Added total_help_received column');
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Verify the columns were added
    const newColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('xp', 'level', 'total_help_provided', 'total_help_received')
    `;
    
    console.log('\n📊 New columns in users table:');
    newColumns.forEach(col => console.log(`   - ${col.column_name}`));
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

runMigration();
