#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function matureSeed(userId) {
  let sql;
  try {
    console.log('🌱 Looking for seeds to mature...');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Get all garden items for the user
    const items = await sql`
      SELECT * FROM garden_items 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    
    if (items.length === 0) {
      console.log('❌ No garden items found for this user');
      return;
    }
    
    console.log(`Found ${items.length} garden item(s):`);
    items.forEach(item => {
      console.log(`- ${item.type} (${item.growth}% growth) - Created: ${item.created_at}`);
    });
    
    // Find seeds that aren't fully grown
    const seedsToMature = items.filter(item => 
      item.growth < 100 && item.type.includes('seed')
    );
    
    if (seedsToMature.length === 0) {
      console.log('✅ All seeds are already mature!');
      return;
    }
    
    console.log(`\n🌿 Maturing ${seedsToMature.length} seed(s)...`);
    
    // Mature each seed
    for (const seed of seedsToMature) {
      const newType = getMatureType(seed.type);
      
      await sql`
        UPDATE garden_items 
        SET growth = 100, type = ${newType}, is_grown = true, updated_at = NOW()
        WHERE id = ${seed.id}
      `;
      
      console.log(`✅ Matured ${seed.type} → ${newType} (100% growth)`);
    }
    
    console.log('\n🎉 All seeds have been matured!');
    
  } catch (error) {
    console.error('❌ Error maturing seeds:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

function getMatureType(seedType) {
  switch (seedType) {
    case 'healing-seed':
      return 'healing-flower';
    case 'knowledge-seed':
      return 'knowledge-library';
    case 'success-seed':
      return 'success-trophy';
    case 'wisdom-seed':
      return 'wisdom-tree';
    case 'inspiration-seed':
      return 'inspiration-masterpiece';
    case 'innovation-seed':
      return 'innovation-lightning';
    default:
      return 'flower';
  }
}

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.log('❌ Please provide a user ID as an argument');
  console.log('Usage: node mature-seed.js <userId>');
  process.exit(1);
}

console.log(`🌱 Maturing seeds for user: ${userId}`);
matureSeed(userId);
