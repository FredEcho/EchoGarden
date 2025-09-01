import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function fixMissingGardenItems() {
  let sql;
  try {
    console.log('🔧 Fixing missing garden items for existing responses...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Find responses without garden items
    const responsesWithoutGardenItems = await sql`
      SELECT hr.id, hr.content, hr.is_marked_helpful, hr.user_id,
             hr2.title as request_title, c.name as category_name
      FROM help_responses hr
      JOIN help_requests hr2 ON hr.help_request_id = hr2.id
      JOIN categories c ON hr2.category_id = c.id
      LEFT JOIN garden_items gi ON hr.id = gi.help_response_id
      WHERE gi.id IS NULL
      ORDER BY hr.created_at DESC
    `;
    
    if (responsesWithoutGardenItems.length === 0) {
      console.log('✅ All responses already have garden items!');
      return;
    }
    
    console.log(`🔍 Found ${responsesWithoutGardenItems.length} responses without garden items:\n`);
    
    let createdCount = 0;
    
    for (const response of responsesWithoutGardenItems) {
      console.log(`📝 Response: "${response.content.substring(0, 50)}..."`);
      console.log(`   Request: "${response.request_title}" (${response.category_name})`);
      console.log(`   Helpful: ${response.is_marked_helpful}`);
      
      // Determine seed type based on category
      let seedType = 'healing-seed';
      switch (response.category_name) {
        case 'Mental Health Support':
          seedType = 'healing-seed';
          break;
        case 'Study Help':
          seedType = 'knowledge-seed';
          break;
        case 'Career Advice':
          seedType = 'success-seed';
          break;
        case 'Life Skills':
          seedType = 'wisdom-seed';
          break;
        case 'Creative Feedback':
          seedType = 'inspiration-seed';
          break;
        case 'Tech Support':
          seedType = 'innovation-seed';
          break;
      }
      
      // Calculate initial growth based on whether it was marked helpful
      let initialGrowth = 0;
      let initialType = seedType;
      
      if (response.is_marked_helpful) {
        initialGrowth = 50; // If already marked helpful, start with 50% growth
        if (initialGrowth >= 25) {
          initialType = 'sprout';
        }
      }
      
      try {
        const [gardenItem] = await sql`
          INSERT INTO garden_items (user_id, help_response_id, type, growth, is_grown)
          VALUES (${response.user_id}, ${response.id}, ${initialType}, ${initialGrowth}, ${initialGrowth >= 100})
          RETURNING id, type, growth, is_grown
        `;
        
        console.log(`   ✅ Created: ${gardenItem.type} (${gardenItem.growth}% grown)`);
        createdCount++;
        
      } catch (error) {
        console.log(`   ❌ Failed to create garden item: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log(`🎉 Successfully created ${createdCount} garden items!`);
    
    // Show summary of all garden items
    const allGardenItems = await sql`
      SELECT type, COUNT(*) as count
      FROM garden_items
      GROUP BY type
      ORDER BY count DESC
    `;
    
    console.log('\n📊 Current garden items by type:');
    allGardenItems.forEach(item => {
      console.log(`   ${item.type}: ${item.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

fixMissingGardenItems();


