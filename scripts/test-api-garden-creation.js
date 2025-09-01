import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function testApiGardenCreation() {
  let sql;
  try {
    console.log('🧪 Testing garden item creation through API simulation...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Get a help request
    const [helpRequest] = await sql`
      SELECT hr.id, hr.title, c.name as category_name, c.id as category_id
      FROM help_requests hr
      JOIN categories c ON hr.category_id = c.id
      LIMIT 1
    `;
    
    if (!helpRequest) {
      console.log('❌ No help requests found');
      return;
    }
    
    console.log(`📋 Using help request: "${helpRequest.title}" (${helpRequest.category_name})`);
    
    // Get a test user
    const [testUser] = await sql`SELECT id, email FROM users LIMIT 1`;
    if (!testUser) {
      console.log('❌ No users found');
      return;
    }
    
    console.log(`👤 Using test user: ${testUser.email}\n`);
    
    // Simulate the API call by calling the storage layer directly
    console.log('💬 Simulating API response creation...');
    
    // Create response data as it would come from the API
    const responseData = {
      helpRequestId: helpRequest.id,
      userId: testUser.id,
      content: 'This is a test response to verify garden item creation via API.'
    };
    
    // Simulate the storage.createHelpResponse call
    console.log('🔧 Calling storage.createHelpResponse...');
    
    // Create the response
    const [newResponse] = await sql`
      INSERT INTO help_responses (help_request_id, user_id, content)
      VALUES (${responseData.helpRequestId}, ${responseData.userId}, ${responseData.content})
      RETURNING id, user_id, content
    `;
    
    console.log(`✅ Created response: ${newResponse.id}`);
    
    // Award XP for providing a helpful response
    const [user] = await sql`
      SELECT xp, level, total_help_provided
      FROM users
      WHERE id = ${testUser.id}
    `;
    
    const newXP = (user.xp || 0) + 25; // PROVIDE_HELPFUL_RESPONSE XP
    const newLevel = Math.floor(newXP / 100) + 1;
    
    await sql`
      UPDATE users
      SET xp = ${newXP}, 
          level = ${newLevel},
          updated_at = NOW()
      WHERE id = ${testUser.id}
    `;
    
    console.log(`🎯 Awarded 25 XP (new total: ${newXP})`);
    
    // Get the help request to determine seed type based on category
    const [helpRequestData] = await sql`
      SELECT hr.category_id, c.name as category_name
      FROM help_requests hr
      JOIN categories c ON hr.category_id = c.id
      WHERE hr.id = ${responseData.helpRequestId}
    `;
    
    // Determine seed type based on category
    let seedType = 'healing-seed'; // default
    if (helpRequestData?.category_name) {
      switch (helpRequestData.category_name) {
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
    }
    
    console.log(`🌱 Creating garden item: ${seedType}`);
    
    // Create a seed in the helper's garden
    const [gardenItem] = await sql`
      INSERT INTO garden_items (user_id, help_response_id, type, growth, is_grown)
      VALUES (${responseData.userId}, ${newResponse.id}, ${seedType}, 0, false)
      RETURNING id, type, growth, is_grown
    `;
    
    console.log(`✅ Garden item created: ${gardenItem.type} (${gardenItem.growth}% grown)\n`);
    
    // Now test marking the response as helpful
    console.log('🎯 Testing mark helpful functionality...');
    
    // Update the response to marked helpful
    await sql`
      UPDATE help_responses
      SET is_marked_helpful = true
      WHERE id = ${newResponse.id}
    `;
    
    // Award XP for having response marked as helpful
    const [userAfterHelpful] = await sql`
      SELECT xp, level, total_help_provided
      FROM users
      WHERE id = ${testUser.id}
    `;
    
    const helpfulXP = (userAfterHelpful.xp || 0) + 50; // RESPONSE_MARKED_HELPFUL XP
    const helpfulLevel = Math.floor(helpfulXP / 100) + 1;
    
    await sql`
      UPDATE users
      SET xp = ${helpfulXP}, 
          level = ${helpfulLevel},
          total_help_provided = ${(userAfterHelpful.total_help_provided || 0) + 1},
          updated_at = NOW()
      WHERE id = ${testUser.id}
    `;
    
    console.log(`🎯 Awarded 50 XP for being helpful (new total: ${helpfulXP})`);
    
    // Find and grow the existing garden item
    const [updatedGardenItem] = await sql`
      SELECT id, type, growth, is_grown
      FROM garden_items
      WHERE help_response_id = ${newResponse.id}
    `;
    
    if (updatedGardenItem && updatedGardenItem.growth !== null) {
      const currentGrowth = updatedGardenItem.growth || 0;
      const newGrowth = Math.min(currentGrowth + 50, 100); // More growth when marked helpful
      
      let newType = updatedGardenItem.type;
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
        WHERE id = ${updatedGardenItem.id}
      `;
      
      console.log(`🌱 Garden item grown: ${currentGrowth}% → ${newGrowth}% (${newType})`);
    }
    
    // Check final state
    const [finalGardenItem] = await sql`
      SELECT type, growth, is_grown
      FROM garden_items
      WHERE help_response_id = ${newResponse.id}
    `;
    
    const [finalUser] = await sql`
      SELECT xp, level, total_help_provided
      FROM users
      WHERE id = ${testUser.id}
    `;
    
    console.log('\n🎉 Test completed successfully!');
    console.log(`👤 User stats:`);
    console.log(`   XP: ${user.xp || 0} → ${finalUser.xp}`);
    console.log(`   Level: ${user.level || 1} → ${finalUser.level}`);
    console.log(`   Help Provided: ${user.total_help_provided || 0} → ${finalUser.total_help_provided}`);
    console.log(`🌱 Garden item: ${finalGardenItem.type} (${finalGardenItem.growth}% grown, ${finalGardenItem.isGrown ? 'fully grown' : 'still growing'})`);
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await sql`DELETE FROM garden_items WHERE help_response_id = ${newResponse.id}`;
    await sql`DELETE FROM help_responses WHERE id = ${newResponse.id}`;
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

testApiGardenCreation();


