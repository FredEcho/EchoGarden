import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config();

async function testApiResponse() {
  try {
    console.log('🧪 Testing API response creation...\n');
    
    // First, let's get a help request
    const helpRequestsResponse = await fetch('http://localhost:3000/api/help-requests');
    if (!helpRequestsResponse.ok) {
      console.log('❌ Failed to fetch help requests');
      return;
    }
    
    const helpRequests = await helpRequestsResponse.json();
    if (helpRequests.length === 0) {
      console.log('❌ No help requests found');
      return;
    }
    
    const helpRequest = helpRequests[0];
    console.log(`📋 Found help request: "${helpRequest.title}"`);
    console.log(`📂 Category: ${helpRequest.category.name}\n`);
    
    // Create a response
    console.log('💬 Creating a response via API...');
    const responseData = {
      content: 'This is a test response to verify seed creation via API.'
    };
    
    const createResponse = await fetch(`http://localhost:3000/api/help-requests/${helpRequest.id}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData),
      credentials: 'include'
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log('❌ Failed to create response:', errorText);
      return;
    }
    
    const newResponse = await createResponse.json();
    console.log(`✅ Created response with ID: ${newResponse.id}\n`);
    
    // Wait a moment for any async operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if a garden item was created
    console.log('🔍 Checking if garden item was created...');
    const gardenResponse = await fetch('http://localhost:3000/api/garden', {
      credentials: 'include'
    });
    
    if (gardenResponse.ok) {
      const gardenItems = await gardenResponse.json();
      const newGardenItem = gardenItems.find(item => item.helpResponseId === newResponse.id);
      
      if (newGardenItem) {
        console.log('🌱 Garden item found:');
        console.log(`   Type: ${newGardenItem.type}`);
        console.log(`   Growth: ${newGardenItem.growth}%`);
        console.log(`   Is Grown: ${newGardenItem.isGrown}`);
      } else {
        console.log('❌ No garden item found for the new response');
      }
    } else {
      console.log('❌ Failed to fetch garden items');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testApiResponse();
