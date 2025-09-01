import { config } from 'dotenv';
import { storage } from '../server/storage.js';

// Load environment variables
config();

async function testStorageDirectly() {
  try {
    console.log('🧪 Testing storage layer directly...\n');
    
    // Get a help request
    const helpRequests = await storage.getHelpRequests();
    if (helpRequests.length === 0) {
      console.log('❌ No help requests found');
      return;
    }
    
    const helpRequest = helpRequests[0];
    console.log(`📋 Using help request: "${helpRequest.title}" (${helpRequest.category.name})`);
    
    // Get a test user
    const testUser = await storage.getUser('frederiekwaege13@gmail.com');
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log(`👤 Using test user: ${testUser.email}\n`);
    
    // Test creating a response through storage layer
    console.log('💬 Creating response through storage layer...');
    
    const responseData = {
      helpRequestId: helpRequest.id,
      userId: testUser.id,
      content: 'This is a test response through storage layer.'
    };
    
    try {
      const newResponse = await storage.createHelpResponse(responseData);
      console.log(`✅ Created response: ${newResponse.id}`);
      
      // Check if garden item was created
      const gardenItems = await storage.getUserGarden(testUser.id);
      const newGardenItem = gardenItems.find(item => item.helpResponseId === newResponse.id);
      
      if (newGardenItem) {
        console.log('✅ Garden item created:');
        console.log(`   Type: ${newGardenItem.type}`);
        console.log(`   Growth: ${newGardenItem.growth}%`);
        console.log(`   Is Grown: ${newGardenItem.isGrown}`);
      } else {
        console.log('❌ No garden item found');
      }
      
      // Clean up
      console.log('\n🧹 Cleaning up...');
      // Note: We can't easily delete through storage layer, so we'll leave it for now
      
    } catch (error) {
      console.error('❌ Error creating response through storage:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStorageDirectly();
