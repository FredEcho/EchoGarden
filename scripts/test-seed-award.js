import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function testSeedAward() {
  let sql;
  try {
    console.log('🧪 Testing seed award functionality...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Get a sample help request with responses
    const [helpRequest] = await sql`
      SELECT hr.id, hr.title, c.name as category_name, c.id as category_id
      FROM help_requests hr
      JOIN categories c ON hr.category_id = c.id
      WHERE EXISTS (
        SELECT 1 FROM help_responses hresp 
        WHERE hresp.help_request_id = hr.id 
        AND hresp.is_marked_helpful = false
      )
      LIMIT 1
    `;
    
    if (!helpRequest) {
      console.log('❌ No help requests with unmarked helpful responses found');
      return;
    }
    
    console.log(`📋 Found help request: "${helpRequest.title}"`);
    console.log(`📂 Category: ${helpRequest.category_name}\n`);
    
    // Get a response that hasn't been marked helpful yet
    const [response] = await sql`
      SELECT id, user_id, content
      FROM help_responses
      WHERE help_request_id = ${helpRequest.id}
      AND is_marked_helpful = false
      LIMIT 1
    `;
    
    if (!response) {
      console.log('❌ No unmarked helpful responses found');
      return;
    }
    
    console.log(`💬 Found response from user: ${response.user_id}`);
    console.log(`📝 Content: ${response.content.substring(0, 50)}...\n`);
    
    // Check if there's already a garden item for this response
    const [existingGardenItem] = await sql`
      SELECT id, type, growth, is_grown
      FROM garden_items
      WHERE help_response_id = ${response.id}
    `;
    
    if (existingGardenItem) {
      console.log('🌱 Found existing garden item:');
      console.log(`   Type: ${existingGardenItem.type}`);
      console.log(`   Growth: ${existingGardenItem.growth}%`);
      console.log(`   Is Grown: ${existingGardenItem.is_grown}\n`);
    } else {
      console.log('❌ No garden item found for this response\n');
    }
    
    // Get user's current garden items count
    const [userGardenCount] = await sql`
      SELECT COUNT(*) as count
      FROM garden_items
      WHERE user_id = ${response.user_id}
    `;
    
    console.log(`🏡 User currently has ${userGardenCount.count} garden items\n`);
    
    // Simulate marking the response as helpful
    console.log('🎯 Marking response as helpful...');
    
    // Update the response to marked helpful
    await sql`
      UPDATE help_responses
      SET is_marked_helpful = true
      WHERE id = ${response.id}
    `;
    
    // Award XP
    const [user] = await sql`
      SELECT xp, level, total_help_provided
      FROM users
      WHERE id = ${response.user_id}
    `;
    
    const newXP = (user.xp || 0) + 50; // RESPONSE_MARKED_HELPFUL XP
    const newLevel = Math.floor(newXP / 100) + 1;
    
    await sql`
      UPDATE users
      SET xp = ${newXP}, 
          level = ${newLevel},
          total_help_provided = ${(user.total_help_provided || 0) + 1},
          updated_at = NOW()
      WHERE id = ${response.user_id}
    `;
    
    // Grow the existing garden item
    if (existingGardenItem) {
      const currentGrowth = existingGardenItem.growth || 0;
      const newGrowth = Math.min(currentGrowth + 50, 100);
      
      let newType = existingGardenItem.type;
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
        WHERE id = ${existingGardenItem.id}
      `;
      
      console.log('🌱 Garden item updated:');
      console.log(`   New Growth: ${newGrowth}%`);
      console.log(`   New Type: ${newType}`);
      console.log(`   Is Grown: ${newGrowth >= 100}\n`);
    }
    
    // Check final state
    const [finalUser] = await sql`
      SELECT xp, level, total_help_provided
      FROM users
      WHERE id = ${response.user_id}
    `;
    
    const [finalGardenItem] = await sql`
      SELECT type, growth, is_grown
      FROM garden_items
      WHERE help_response_id = ${response.id}
    `;
    
    console.log('✅ Test completed successfully!');
    console.log(`👤 User stats updated:`);
    console.log(`   XP: ${user.xp || 0} → ${finalUser.xp}`);
    console.log(`   Level: ${user.level || 1} → ${finalUser.level}`);
    console.log(`   Help Provided: ${user.total_help_provided || 0} → ${finalUser.total_help_provided}`);
    
    if (finalGardenItem) {
      console.log(`🌱 Garden item: ${finalGardenItem.type} (${finalGardenItem.growth}% grown)`);
    }
    
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
    
    console.log(`\n🎯 Expected seed type for "${helpRequest.category_name}": ${expectedSeedType}`);
    if (finalGardenItem && finalGardenItem.type.includes(expectedSeedType.replace('-seed', ''))) {
      console.log('✅ Seed type matches category correctly!');
    } else {
      console.log('❌ Seed type does not match category!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

testSeedAward();


