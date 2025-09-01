#!/usr/bin/env node

import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { db } from '../server/db.ts';

// Load environment variables
config();

console.log('🔍 Testing database connection...\n');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ DATABASE_URL not found in environment variables');
  console.log('💡 Make sure you have a .env file with DATABASE_URL set');
  process.exit(1);
}

console.log('📋 Connection details:');
if (databaseUrl.startsWith('postgresql://')) {
  console.log(`   Database: PostgreSQL (Supabase)`);
  console.log(`   URL: ${databaseUrl.replace(/\/\/.*@/, '//***:***@')}`);
} else {
  console.log(`   Database: SQLite`);
  console.log(`   Path: ${databaseUrl.replace('file:', '')}`);
}

async function testConnection() {
  try {
    // Test the connection by running a simple query
    if (databaseUrl.startsWith('postgresql://')) {
      // PostgreSQL test
      const result = await db.execute(sql`SELECT NOW() as current_time`);
      console.log('✅ Successfully connected to PostgreSQL database!');
      console.log(`   Server time: ${result[0].current_time}`);
    } else {
      // SQLite test
      const result = await db.execute(sql`SELECT datetime('now') as current_time`);
      console.log('✅ Successfully connected to SQLite database!');
      console.log(`   Server time: ${result[0].current_time}`);
    }
    
    console.log('\n🎉 Database connection test passed!');
    
  } catch (error) {
    console.log('❌ Failed to connect to database:');
    console.log(`   Error: ${error.message}`);
    
    if (databaseUrl.startsWith('postgresql://')) {
      console.log('\n💡 For Supabase connection issues:');
      console.log('   1. Check if your Supabase project is active');
      console.log('   2. Verify the database password is correct');
      console.log('   3. Ensure the project URL is correct');
      console.log('\n🔧 To fix:');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Select your project');
      console.log('   3. Go to Settings → Database');
      console.log('   4. Copy the correct connection string');
    }
    
    process.exit(1);
  }
}

testConnection();
