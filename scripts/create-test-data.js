import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function createTestData() {
  let sql;
  try {
    console.log('🧪 Creating test data to verify comment system...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Get a test user
    const [testUser] = await sql`SELECT id, email FROM users LIMIT 1`;
    if (!testUser) {
      console.log('❌ No users found');
      return;
    }
    
    console.log(`👤 Using test user: ${testUser.email}`);
    
    // Get a category
    const [category] = await sql`SELECT id, name FROM categories LIMIT 1`;
    if (!category) {
      console.log('❌ No categories found');
      return;
    }
    
    console.log(`📂 Using category: ${category.name}\n`);
    
    // Create a test help request
    console.log('1️⃣ Creating test help request...');
    const [helpRequest] = await sql`
      INSERT INTO help_requests (user_id, category_id, title, description)
      VALUES (${testUser.id}, ${category.id}, 'Test Help Request', 'This is a test help request to verify the comment system works.')
      RETURNING id, title
    `;
    
    console.log(`✅ Created help request: "${helpRequest.title}" (ID: ${helpRequest.id})\n`);
    
    // Create a test response
    console.log('2️⃣ Creating test response...');
    const [response] = await sql`
      INSERT INTO help_responses (help_request_id, user_id, content)
      VALUES (${helpRequest.id}, ${testUser.id}, 'This is a test response to verify the comment system works.')
      RETURNING id, content
    `;
    
    console.log(`✅ Created response: "${response.content.substring(0, 50)}..." (ID: ${response.id})\n`);
    
    // Create a garden item for the response
    console.log('3️⃣ Creating garden item...');
    let seedType = 'healing-seed';
    switch (category.name) {
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
    
    const [gardenItem] = await sql`
      INSERT INTO garden_items (user_id, help_response_id, type, growth, is_grown)
      VALUES (${testUser.id}, ${response.id}, ${seedType}, 0, false)
      RETURNING id, type, growth
    `;
    
    console.log(`✅ Created garden item: ${gardenItem.type} (${gardenItem.growth}% growth)\n`);
    
    // Verify the data was created
    console.log('4️⃣ Verifying data...');
    
    const [helpRequestCount] = await sql`SELECT COUNT(*) as count FROM help_requests`;
    const [responseCount] = await sql`SELECT COUNT(*) as count FROM help_responses`;
    const [gardenItemCount] = await sql`SELECT COUNT(*) as count FROM garden_items`;
    
    console.log(`📊 Database state:`);
    console.log(`   Help requests: ${helpRequestCount.count}`);
    console.log(`   Help responses: ${responseCount.count}`);
    console.log(`   Garden items: ${gardenItemCount.count}\n`);
    
    // Test the API endpoint by simulating the query
    console.log('5️⃣ Testing API endpoint simulation...');
    const responses = await sql`
      SELECT 
        hr.id,
        hr.content,
        hr.created_at,
        hr.is_marked_helpful,
        json_build_object(
          'id', u.id,
          'firstName', u.first_name,
          'lastName', u.last_name,
          'email', u.email,
          'profileImageUrl', u.profile_image_url
        ) as user
      FROM help_responses hr
      LEFT JOIN users u ON hr.user_id = u.id
      WHERE hr.help_request_id = ${helpRequest.id}
      ORDER BY hr.created_at DESC
    `;
    
    console.log(`✅ Found ${responses.length} responses for help request ${helpRequest.id}:`);
    responses.forEach((resp, index) => {
      console.log(`   ${index + 1}. "${resp.content.substring(0, 50)}..." by ${resp.user.email}`);
    });
    
    console.log('\n🎉 Test data created successfully!');
    console.log(`🔗 You can now test the comment system with help request ID: ${helpRequest.id}`);
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

createTestData();
