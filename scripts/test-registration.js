#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';

// Load environment variables
config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('❌ DATABASE_URL not found');
  process.exit(1);
}

async function testRegistration() {
  let sql;
  try {
    console.log('🔍 Testing user registration...\n');
    
    // Create connection
    sql = postgres(databaseUrl);
    
    // Test data
    const testUser = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123'
    };
    
    console.log('📋 Test user data:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
    
    // Check if user exists
    const existingUsers = await sql`
      SELECT id, email FROM users WHERE email = ${testUser.email}
    `;
    
    if (existingUsers.length > 0) {
      console.log('⚠️  User already exists, deleting for test...');
      await sql`DELETE FROM users WHERE email = ${testUser.email}`;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(testUser.password, 10);
    console.log('✅ Password hashed successfully');
    
    // Insert user
    const [newUser] = await sql`
      INSERT INTO users (email, first_name, last_name, password_hash)
      VALUES (${testUser.email}, ${testUser.firstName}, ${testUser.lastName}, ${passwordHash})
      RETURNING id, email, first_name, last_name, created_at
    `;
    
    console.log('✅ User created successfully!');
    console.log('📊 User details:');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Name: ${newUser.first_name} ${newUser.last_name}`);
    console.log(`   Created: ${newUser.created_at}`);
    
    // Verify user can be retrieved
    const [retrievedUser] = await sql`
      SELECT id, email, first_name, last_name FROM users WHERE email = ${testUser.email}
    `;
    
    if (retrievedUser) {
      console.log('✅ User retrieval test passed');
    } else {
      console.log('❌ User retrieval test failed');
    }
    
    // Clean up
    await sql`DELETE FROM users WHERE email = ${testUser.email}`;
    console.log('🧹 Test user cleaned up');
    
    console.log('\n🎉 Registration test passed!');
    
  } catch (error) {
    console.log('❌ Registration test failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    console.log(`   Detail: ${error.detail}`);
    
    if (error.code === '23505') {
      console.log('\n💡 This is a unique constraint violation - user already exists');
    }
    
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

testRegistration();
