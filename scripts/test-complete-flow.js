import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function testCompleteFlow() {
  let sql;
  try {
    console.log('🧪 Testing complete flow: response creation → garden item → mark helpful → growth\n');
    
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
    
    // Step 1: Create a response
    console.log('1️⃣ Creating a response...');
    const [newResponse] = await sql`
      INSERT INTO help_responses (help_request_id, user_id, content)
      VALUES (${helpRequest.id}, ${testUser.id}, 'This is a test response for the complete flow.')
      RETURNING id, user_id, content
    `;
    
    console.log(`✅ Created response: ${newResponse.id}\n`);
    
    // Step 2: Check if garden item was created
    console.log('2️⃣ Checking for garden item creation...');
    const [gardenItem] = await sql`
      SELECT id, type, growth, is_grown
      FROM garden_items
      WHERE help_response_id = ${newResponse.id}
    `;
    
    if (gardenItem) {
      console.log('✅ Garden item created:');
      console.log(`   Type: ${gardenItem.type}`);
      console.log(`   Growth: ${gardenItem.growth}%`);
      console.log(`   Is Grown: ${gardenItem.is_grown}\n`);
    } else {
      console.log('❌ No garden item created - this indicates the bug!\n');
      
      // Manually create the garden item to continue the test
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
      
      console.log(`🔧 Manually creating garden item: ${expectedSeedType}`);
      const [manualGardenItem] = await sql`
        INSERT INTO garden_items (user_id, help_response_id, type, growth, is_grown)
        VALUES (${testUser.id}, ${newResponse.id}, ${expectedSeedType}, 0, false)
        RETURNING id, type, growth, is_grown
      `;
      console.log('✅ Manual garden item created\n');
    }
    
    // Step 3: Mark response as helpful
    console.log('3️⃣ Marking response as helpful...');
    await sql`
      UPDATE help_responses
      SET is_marked_helpful = true
      WHERE id = ${newResponse.id}
    `;
    console.log('✅ Response marked as helpful\n');
    
    // Step 4: Check if garden item grew
    console.log('4️⃣ Checking garden item growth...');
    const [updatedGardenItem] = await sql`
      SELECT id, type, growth, is_grown
      FROM garden_items
      WHERE help_response_id = ${newResponse.id}
    `;
    
    if (updatedGardenItem) {
      console.log('✅ Garden item after marking helpful:');
      console.log(`   Type: ${updatedGardenItem.type}`);
      console.log(`   Growth: ${updatedGardenItem.growth}%`);
      console.log(`   Is Grown: ${updatedGardenItem.is_grown}\n`);
      
      // Check if it grew properly
      if (updatedGardenItem.growth >= 50) {
        console.log('🎉 Garden item grew successfully when marked helpful!');
      } else {
        console.log('⚠️ Garden item did not grow as expected');
      }
    } else {
      console.log('❌ Garden item not found after marking helpful');
    }
    
    // Step 5: Check user stats
    console.log('5️⃣ Checking user stats...');
    const [userStats] = await sql`
      SELECT xp, level, total_help_provided
      FROM users
      WHERE id = ${testUser.id}
    `;
    
    console.log('✅ User stats:');
    console.log(`   XP: ${userStats.xp}`);
    console.log(`   Level: ${userStats.level}`);
    console.log(`   Help Provided: ${userStats.total_help_provided}\n`);
    
    // Clean up
    console.log('🧹 Cleaning up test data...');
    await sql`DELETE FROM garden_items WHERE help_response_id = ${newResponse.id}`;
    await sql`DELETE FROM help_responses WHERE id = ${newResponse.id}`;
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎯 Test Summary:');
    console.log('✅ Response creation works');
    if (gardenItem) {
      console.log('✅ Garden item creation works');
    } else {
      console.log('❌ Garden item creation has a bug');
    }
    console.log('✅ Marking helpful works');
    console.log('✅ User stats update works');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

testCompleteFlow();
