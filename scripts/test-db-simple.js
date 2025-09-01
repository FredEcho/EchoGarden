#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

console.log('🔍 Testing Supabase database connection...\n');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ DATABASE_URL not found in environment variables');
  console.log('💡 Make sure you have a .env file with DATABASE_URL set');
  console.log('\n📝 Example .env file:');
  console.log('DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"');
  process.exit(1);
}

if (!databaseUrl.startsWith('postgresql://')) {
  console.log('❌ DATABASE_URL must be a PostgreSQL connection string');
  console.log('💡 Make sure it starts with "postgresql://"');
  process.exit(1);
}

console.log('📋 Connection details:');
console.log(`   Database: PostgreSQL (Supabase)`);
console.log(`   URL: ${databaseUrl.replace(/\/\/.*@/, '//***:***@')}`);

async function testConnection() {
  let sql;
  try {
    // Create connection
    sql = postgres(databaseUrl);
    
    // Test the connection by running a simple query
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Successfully connected to Supabase database!');
    console.log(`   Server time: ${result[0].current_time}`);
    
    // Test if our tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'categories', 'help_requests', 'help_responses', 'garden_items')
    `;
    
    console.log('\n📊 Database tables:');
    if (tables.length > 0) {
      tables.forEach(table => {
        console.log(`   ✅ ${table.table_name}`);
      });
    } else {
      console.log('   ⚠️  No tables found - you may need to run migrations');
    }
    
    console.log('\n🎉 Database connection test passed!');
    
  } catch (error) {
    console.log('❌ Failed to connect to Supabase database:');
    console.log(`   Error: ${error.message}`);
    
    console.log('\n💡 Common Supabase connection issues:');
    console.log('   1. Check if your Supabase project is active');
    console.log('   2. Verify the database password is correct');
    console.log('   3. Ensure the project URL is correct');
    console.log('   4. Make sure your IP is allowed (check RLS policies)');
    
    console.log('\n🔧 To fix:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to Settings → Database');
    console.log('   4. Copy the correct connection string');
    console.log('   5. Check Settings → API for any IP restrictions');
    
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

testConnection();
