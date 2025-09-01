#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function createSampleGarden(userId) {
  let sql;
  try {
    console.log(`🌱 Creating sample garden for user ${userId}...\n`);
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Sample garden items with different growth stages
    const sampleItems = [
      {
        type: 'healing-seed',
        growth: 0,
        description: 'Healing seed (0% growth)'
      },
      {
        type: 'knowledge-seed',
        growth: 25,
        description: 'Knowledge sprout (25% growth)'
      },
      {
        type: 'success-seed',
        growth: 75,
        description: 'Success plant (75% growth)'
      },
      {
        type: 'wisdom-seed',
        growth: 100,
        description: 'Wisdom flower (100% growth)'
      },
      {
        type: 'inspiration-seed',
        growth: 50,
        description: 'Inspiration plant (50% growth)'
      }
    ];
    
    console.log('📝 Creating garden items...');
    
    for (const item of sampleItems) {
      await sql`
        INSERT INTO garden_items (user_id, type, growth, is_grown, created_at, updated_at)
        VALUES (${userId}, ${item.type}, ${item.growth}, ${item.growth >= 100}, NOW(), NOW())
      `;
      
      console.log(`   ✅ Created ${item.description}`);
    }
    
    console.log('\n🎉 Sample garden created successfully!');
    
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
    console.error('❌ Error creating sample garden:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

// Get user ID from command line argument
const userId = process.argv[2] || '25bdac17-f46a-4624-8e94-947f6da7c616';

createSampleGarden(userId);
