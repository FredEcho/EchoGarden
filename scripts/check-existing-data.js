import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function checkExistingData() {
  let sql;
  try {
    console.log('🔍 Checking existing data in database...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Check help requests
    const helpRequests = await sql`SELECT COUNT(*) as count FROM help_requests`;
    console.log(`📋 Help requests: ${helpRequests[0].count}`);
    
    // Check help responses
    const helpResponses = await sql`SELECT COUNT(*) as count FROM help_responses`;
    console.log(`💬 Help responses: ${helpResponses[0].count}`);
    
    // Check garden items
    const gardenItems = await sql`SELECT COUNT(*) as count FROM garden_items`;
    console.log(`🌱 Garden items: ${gardenItems[0].count}`);
    
    // Check users
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`👤 Users: ${users[0].count}\n`);
    
    // Get sample data
    console.log('📊 Sample data:');
    
    // Sample help request with responses
    const [sampleRequest] = await sql`
      SELECT hr.id, hr.title, c.name as category_name, 
             COUNT(hr2.id) as response_count
      FROM help_requests hr
      JOIN categories c ON hr.category_id = c.id
      LEFT JOIN help_responses hr2 ON hr.id = hr2.help_request_id
      GROUP BY hr.id, hr.title, c.name
      LIMIT 1
    `;
    
    if (sampleRequest) {
      console.log(`📋 Sample help request: "${sampleRequest.title}" (${sampleRequest.category_name})`);
      console.log(`   Responses: ${sampleRequest.response_count}`);
      
      // Get responses for this request
      const responses = await sql`
        SELECT id, user_id, content, is_marked_helpful
        FROM help_responses
        WHERE help_request_id = ${sampleRequest.id}
        LIMIT 3
      `;
      
      console.log('   Sample responses:');
      responses.forEach((resp, index) => {
        console.log(`     ${index + 1}. ${resp.content.substring(0, 50)}... (helpful: ${resp.is_marked_helpful})`);
        
        // Check if this response has a garden item
        sql`SELECT id, type, growth FROM garden_items WHERE help_response_id = ${resp.id}`
          .then(gardenItems => {
            if (gardenItems.length > 0) {
              console.log(`       🌱 Garden item: ${gardenItems[0].type} (${gardenItems[0].growth}%)`);
            } else {
              console.log(`       ❌ No garden item`);
            }
          });
      });
    }
    
    // Check garden items by type
    console.log('\n🌱 Garden items by type:');
    const gardenItemTypes = await sql`
      SELECT type, COUNT(*) as count
      FROM garden_items
      GROUP BY type
      ORDER BY count DESC
    `;
    
    gardenItemTypes.forEach(item => {
      console.log(`   ${item.type}: ${item.count}`);
    });
    
    // Check if there are any garden items with help_response_id
    const gardenItemsWithResponse = await sql`
      SELECT COUNT(*) as count
      FROM garden_items
      WHERE help_response_id IS NOT NULL
    `;
    console.log(`\n🌱 Garden items linked to responses: ${gardenItemsWithResponse[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

checkExistingData();
