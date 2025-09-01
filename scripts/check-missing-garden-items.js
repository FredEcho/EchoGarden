import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function checkMissingGardenItems() {
  let sql;
  try {
    console.log('🔍 Checking for responses without garden items...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Get all responses and check if they have garden items
    const responses = await sql`
      SELECT hr.id, hr.content, hr.is_marked_helpful, hr.created_at,
             hr2.title as request_title, c.name as category_name,
             CASE WHEN gi.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_garden_item,
             gi.type as garden_item_type, gi.growth as garden_item_growth
      FROM help_responses hr
      JOIN help_requests hr2 ON hr.help_request_id = hr2.id
      JOIN categories c ON hr2.category_id = c.id
      LEFT JOIN garden_items gi ON hr.id = gi.help_response_id
      ORDER BY hr.created_at DESC
    `;
    
    console.log(`📊 Found ${responses.length} responses:`);
    
    let responsesWithGardenItems = 0;
    let responsesWithoutGardenItems = 0;
    
    responses.forEach((resp, index) => {
      console.log(`\n${index + 1}. Response ID: ${resp.id}`);
      console.log(`   Content: ${resp.content.substring(0, 50)}...`);
      console.log(`   Request: "${resp.request_title}" (${resp.category_name})`);
      console.log(`   Helpful: ${resp.is_marked_helpful}`);
      console.log(`   Has Garden Item: ${resp.has_garden_item}`);
      
      if (resp.has_garden_item === 'Yes') {
        console.log(`   Garden Item: ${resp.garden_item_type} (${resp.garden_item_growth}%)`);
        responsesWithGardenItems++;
      } else {
        console.log(`   ❌ Missing garden item!`);
        responsesWithoutGardenItems++;
      }
    });
    
    console.log(`\n📈 Summary:`);
    console.log(`   Responses with garden items: ${responsesWithGardenItems}`);
    console.log(`   Responses without garden items: ${responsesWithoutGardenItems}`);
    
    if (responsesWithoutGardenItems > 0) {
      console.log(`\n🔧 Fix: Need to create garden items for ${responsesWithoutGardenItems} responses`);
      
      // Offer to create missing garden items
      console.log('\nWould you like to create garden items for missing responses? (y/n)');
      // For now, let's just show what would be created
      
      const missingResponses = responses.filter(r => r.has_garden_item === 'No');
      console.log('\nMissing garden items that should be created:');
      
      missingResponses.forEach((resp, index) => {
        let expectedSeedType = 'healing-seed';
        switch (resp.category_name) {
          case 'Mental Health Support':
            expectedSeedType = 'healing-seed';
            break;
          case 'Study Help':
            expectedSeedType = 'knowledge-seed';
            break;
          case 'Career Advice':
            expectedSeedType = 'success-seed';
            break;
          case 'Life Skills':
            expectedSeedType = 'wisdom-seed';
            break;
          case 'Creative Feedback':
            expectedSeedType = 'inspiration-seed';
            break;
          case 'Tech Support':
            expectedSeedType = 'innovation-seed';
            break;
        }
        
        console.log(`   ${index + 1}. Response ${resp.id}: ${expectedSeedType} for "${resp.category_name}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

checkMissingGardenItems();
