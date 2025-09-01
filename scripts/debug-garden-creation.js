import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function debugGardenCreation() {
  let sql;
  try {
    console.log('🔍 Debugging garden item creation...\n');
    
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
      VALUES (${helpRequest.id}, ${testUser.id}, 'Debug test response.')
      RETURNING id, user_id, content
    `;
    
    console.log(`✅ Created response: ${newResponse.id}\n`);
    
    // Step 2: Try to create garden item manually to see if there are any errors
    console.log('2️⃣ Testing garden item creation manually...');
    
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
    
    console.log(`🎯 Expected seed type: ${expectedSeedType}`);
    
    try {
      const [gardenItem] = await sql`
        INSERT INTO garden_items (user_id, help_response_id, type, growth, is_grown)
        VALUES (${testUser.id}, ${newResponse.id}, ${expectedSeedType}, 0, false)
        RETURNING id, type, growth, is_grown
      `;
      
      console.log('✅ Garden item created successfully:');
      console.log(`   ID: ${gardenItem.id}`);
      console.log(`   Type: ${gardenItem.type}`);
      console.log(`   Growth: ${gardenItem.growth}%`);
      console.log(`   Is Grown: ${gardenItem.is_grown}\n`);
      
      // Step 3: Test marking helpful
      console.log('3️⃣ Testing mark helpful...');
      await sql`
        UPDATE help_responses
        SET is_marked_helpful = true
        WHERE id = ${newResponse.id}
      `;
      
      // Step 4: Test growing the garden item
      console.log('4️⃣ Testing garden item growth...');
      const currentGrowth = gardenItem.growth || 0;
      const newGrowth = Math.min(currentGrowth + 50, 100);
      
      let newType = gardenItem.type;
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
        WHERE id = ${gardenItem.id}
      `;
      
      console.log('✅ Garden item grown:');
      console.log(`   Growth: ${currentGrowth}% → ${newGrowth}%`);
      console.log(`   Type: ${gardenItem.type} → ${newType}`);
      console.log(`   Is Grown: ${newGrowth >= 100}\n`);
      
      // Clean up
      console.log('🧹 Cleaning up...');
      await sql`DELETE FROM garden_items WHERE id = ${gardenItem.id}`;
      await sql`DELETE FROM help_responses WHERE id = ${newResponse.id}`;
      console.log('✅ Cleanup completed');
      
    } catch (error) {
      console.error('❌ Error creating garden item:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

debugGardenCreation();
