#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function addMoreGardenVariety(userId) {
  let sql;
  try {
    console.log(`🌱 Adding more garden variety for user ${userId}...\n`);
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Additional garden items to showcase all categories
    const additionalItems = [
      {
        type: 'innovation-seed',
        growth: 15,
        description: 'Innovation seed (15% growth)'
      },
      {
        type: 'healing-seed',
        growth: 60,
        description: 'Healing plant (60% growth)'
      },
      {
        type: 'knowledge-seed',
        growth: 90,
        description: 'Knowledge library (90% growth)'
      },
      {
        type: 'success-seed',
        growth: 40,
        description: 'Success plant (40% growth)'
      },
      {
        type: 'wisdom-seed',
        growth: 80,
        description: 'Wisdom plant (80% growth)'
      },
      {
        type: 'inspiration-seed',
        growth: 30,
        description: 'Inspiration sprout (30% growth)'
      }
    ];
    
    console.log('📝 Adding additional garden items...');
    
    for (const item of additionalItems) {
      await sql`
        INSERT INTO garden_items (user_id, type, growth, is_grown, created_at, updated_at)
        VALUES (${userId}, ${item.type}, ${item.growth}, ${item.growth >= 100}, NOW(), NOW())
      `;
      
      console.log(`   ✅ Created ${item.description}`);
    }
    
    console.log('\n🎉 Garden variety added successfully!');
    
    // Verify the items were created
    const gardenItems = await sql`
      SELECT * FROM garden_items 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    
    console.log(`\n📊 Garden now has ${gardenItems.length} items:`);
    gardenItems.forEach(item => {
      console.log(`   - ${item.type} (${item.growth}% growth) - ${item.is_grown ? '✅ Grown' : '🌱 Growing'}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding garden variety:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

// Get user ID from command line argument
const userId = process.argv[2] || '25bdac17-f46a-4624-8e94-947f6da7c616';

addMoreGardenVariety(userId);
