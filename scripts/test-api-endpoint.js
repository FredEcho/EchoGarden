import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config();

async function testApiEndpoint() {
  try {
    console.log('🧪 Testing API endpoint for fetching responses...\n');
    
    const helpRequestId = '93cde2e1-a0fe-4a88-be73-7b1c11733a9b'; // From the test data we just created
    
    console.log(`📋 Testing help request ID: ${helpRequestId}\n`);
    
    // Test the API endpoint
    const response = await fetch(`http://localhost:3000/api/help-requests/${helpRequestId}/responses`);
    
    if (!response.ok) {
      console.log(`❌ API request failed with status: ${response.status}`);
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ API request successful!`);
    console.log(`📊 Response data:`, JSON.stringify(data, null, 2));
    
    if (Array.isArray(data)) {
      console.log(`\n📝 Found ${data.length} responses:`);
      data.forEach((resp, index) => {
        console.log(`   ${index + 1}. ID: ${resp.id}`);
        console.log(`      Content: "${resp.content}"`);
        console.log(`      User: ${resp.user?.email || 'Unknown'}`);
        console.log(`      Created: ${resp.createdAt}`);
        console.log(`      Helpful: ${resp.isMarkedHelpful}`);
        console.log('');
      });
    } else {
      console.log('❌ Expected array of responses, got:', typeof data);
    }
    
  } catch (error) {
    console.error('❌ Error testing API endpoint:', error);
  }
}

testApiEndpoint();
