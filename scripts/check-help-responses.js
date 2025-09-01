#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function checkHelpResponses() {
  let sql;
  try {
    console.log('🔍 Checking for help responses and garden items...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Check for help responses
    const responses = await sql`
      SELECT hr.*, hr.user_id, c.name as category_name
      FROM help_responses hr
      LEFT JOIN help_requests hreq ON hr.help_request_id = hreq.id
      LEFT JOIN categories c ON hreq.category_id = c.id
      ORDER BY hr.created_at DESC
    `;
    
    console.log(`📝 Found ${responses.length} help responses:`);
    responses.forEach(response => {
      console.log(`   - Response ID: ${response.id}`);
      console.log(`     User: ${response.user_id}`);
      console.log(`     Category: ${response.category_name || 'Unknown'}`);
      console.log(`     Created: ${response.created_at}`);
      console.log('');
    });
    
    // Check for garden items
    const gardenItems = await sql`
      SELECT * FROM garden_items ORDER BY created_at DESC
    `;
    
    console.log(`🌱 Found ${gardenItems.length} garden items:`);
    gardenItems.forEach(item => {
      console.log(`   - Item ID: ${item.id}`);
      console.log(`     User: ${item.user_id}`);
      console.log(`     Type: ${item.type} (${item.growth}% growth)`);
      console.log(`     Created: ${item.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking help responses:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

checkHelpResponses();
