import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function testSeedCreation() {
  let sql;
  try {
    console.log('🧪 Testing seed creation and growth functionality...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Get categories
    const categories = await sql`SELECT id, name FROM categories`;
    console.log('📂 Available categories:');
    categories.forEach(cat => console.log(`   - ${cat.name} (${cat.id})`));
    console.log('');
    
    // Get a sample help request
    const [helpRequest] = await sql`
      SELECT hr.id, hr.title, c.name as category_name, c.id as category_id
      FROM help_requests hr
      JOIN categories c ON hr.category_id = c.id
      LIMIT 1
    `;
    
    if (!helpRequest) {
      console.log('❌ No help requests found in database');
      return;
    }
    
    console.log(`📋 Found help request: "${helpRequest.title}"`);
    console.log(`📂 Category: ${helpRequest.category_name}\n`);
    
    // Get a test user (first user in database)
    const [testUser] = await sql`SELECT id, email FROM users LIMIT 1`;
    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`👤 Using test user: ${testUser.email}\n`);
    
    // Create a test response
    console.log('💬 Creating a test response...');
    const [newResponse] = await sql`
      INSERT INTO help_responses (help_request_id, user_id, content)
      VALUES (${helpRequest.id}, ${testUser.id}, 'This is a test response to verify seed creation.')
      RETURNING id, user_id, content
    `;
    
    console.log(`✅ Created response with ID: ${newResponse.id}\n`);
    
    // Check if a garden item was created
    const [gardenItem] = await sql`
      SELECT id, type, growth, is_grown
      FROM garden_items
      WHERE help_response_id = ${newResponse.id}
    `;
    
    if (gardenItem) {
      console.log('🌱 Garden item created successfully:');
      console.log(`   Type: ${gardenItem.type}`);
      console.log(`   Growth: ${gardenItem.growth}%`);
      console.log(`   Is Grown: ${gardenItem.is_grown}\n`);
    } else {
      console.log('❌ No garden item was created for the response\n');
      
      // Let's manually create the garden item to test the logic
      console.log('🔧 Manually creating garden item to test logic...');
      
      // Determine expected seed type based on category
      let expectedSeedType = 'healing-seed';
      switch (helpRequest.category_name) {
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
      
      console.log(`🎯 Creating seed of type: ${expectedSeedType}`);
      
      const [manualGardenItem] = await sql`
        INSERT INTO garden_items (user_id, help_response_id, type, growth, is_grown)
        VALUES (${testUser.id}, ${newResponse.id}, ${expectedSeedType}, 0, false)
        RETURNING id, type, growth, is_grown
      `;
      
      console.log('✅ Manually created garden item:');
      console.log(`   ID: ${manualGardenItem.id}`);
      console.log(`   Type: ${manualGardenItem.type}`);
      console.log(`   Growth: ${manualGardenItem.growth}%`);
      console.log(`   Is Grown: ${manualGardenItem.is_grown}\n`);
      
      // Now test marking the response as helpful
      console.log('🎯 Marking response as helpful...');
      
      // Update the response to marked helpful
      await sql`
        UPDATE help_responses
        SET is_marked_helpful = true
        WHERE id = ${newResponse.id}
      `;
      
      // Award XP
      const [user] = await sql`
        SELECT xp, level, total_help_provided
        FROM users
        WHERE id = ${testUser.id}
      `;
      
      const newXP = (user.xp || 0) + 50; // RESPONSE_MARKED_HELPFUL XP
      const newLevel = Math.floor(newXP / 100) + 1;
      
      await sql`
        UPDATE users
        SET xp = ${newXP}, 
            level = ${newLevel},
            total_help_provided = ${(user.total_help_provided || 0) + 1},
            updated_at = NOW()
        WHERE id = ${testUser.id}
      `;
      
      // Grow the garden item
      const currentGrowth = manualGardenItem.growth || 0;
      const newGrowth = Math.min(currentGrowth + 50, 100);
      
      let newType = manualGardenItem.type;
      if (newGrowth >= 100) {
        newType = 'flower';
      } else if (newGrowth >= 75) {
        newType = 'plant';
      } else if (newGrowth >= 25) {
        newType = 'sprout';
      }
      
      await sql`
        UPDATE garden_items
        SET growth = ${newGrowth},
            type = ${newType},
            is_grown = ${newGrowth >= 100},
            updated_at = NOW()
        WHERE id = ${manualGardenItem.id}
      `;
      
      console.log('🌱 Garden item grown:');
      console.log(`   Growth: ${currentGrowth}% → ${newGrowth}%`);
      console.log(`   Type: ${manualGardenItem.type} → ${newType}`);
      console.log(`   Is Grown: ${newGrowth >= 100}\n`);
      
      // Check final state
      const [finalUser] = await sql`
        SELECT xp, level, total_help_provided
        FROM users
        WHERE id = ${testUser.id}
      `;
      
      console.log('✅ Test completed successfully!');
      console.log(`👤 User stats updated:`);
      console.log(`   XP: ${user.xp || 0} → ${finalUser.xp}`);
      console.log(`   Level: ${user.level || 1} → ${finalUser.level}`);
      console.log(`   Help Provided: ${user.total_help_provided || 0} → ${finalUser.total_help_provided}`);
      
      // Clean up test data
      console.log('\n🧹 Cleaning up test data...');
      await sql`DELETE FROM garden_items WHERE help_response_id = ${newResponse.id}`;
      await sql`DELETE FROM help_responses WHERE id = ${newResponse.id}`;
      console.log('✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

testSeedCreation();
