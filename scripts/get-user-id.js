#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function getUserId(email) {
  let sql;
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    const user = await sql`
      SELECT id, email FROM users 
      WHERE email = ${email}
    `;
    
    if (user.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 User ID: ${user[0].id}`);
    console.log(`📧 Email: ${user[0].email}`);
    
  } catch (error) {
    console.error('❌ Error getting user ID:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

const email = process.argv[2] || 'frederiekwaege13@gmail.com';
getUserId(email);
