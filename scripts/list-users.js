#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function listUsers() {
  let sql;
  try {
    console.log('👥 Listing all users and their garden items...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Get all users
    const allUsers = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in the database');
      return;
    }
    
    for (const user of allUsers) {
      console.log(`👤 User: ${user.email || user.id}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.created_at}`);
      
      // Get garden items for this user
      const items = await sql`
        SELECT * FROM garden_items 
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
      `;
      
      if (items.length === 0) {
        console.log('   🌱 No garden items');
      } else {
        console.log(`   🌱 Garden items (${items.length}):`);
        items.forEach(item => {
          console.log(`      - ${item.type} (${item.growth}% growth) - ${item.is_grown ? '✅ Grown' : '🌱 Growing'}`);
        });
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

listUsers();
