#!/usr/bin/env node

import { config } from 'dotenv';
import { DatabaseStorage } from '../server/storage.ts';
import { db } from '../server/db.ts';
import { helpRequests, helpResponses, users, categories, gardenItems } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Load environment variables
config();

console.log('🧪 Testing markResponseHelpful method...\n');

async function testMarkResponseHelpful() {
  try {
    console.log('📋 Step 1: Creating test data...');
    
    // Create a test user
    const testUserId = nanoid();
    const [testUser] = await db
      .insert(users)
      .values({
        id: testUserId,
        email: 'test@markhelpful.com',
        firstName: 'Test',
        lastName: 'User',
        xp: 100,
        level: 1,
        totalHelpProvided: 5,
        totalHelpReceived: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();
    
    console.log('✅ Test user created:', testUser.id);
    
    // Create a test category
    const testCategoryId = nanoid();
    const [testCategory] = await db
      .insert(categories)
      .values({
        id: testCategoryId,
        name: 'Test Category',
        color: 'blue',
        createdAt: new Date().toISOString()
      })
      .returning();
    
    console.log('✅ Test category created:', testCategory.id);
    
    // Create a test help request
    const testRequestId = nanoid();
    const [testRequest] = await db
      .insert(helpRequests)
      .values({
        id: testRequestId,
        userId: testUserId,
        categoryId: testCategoryId,
        title: 'Test Help Request',
        description: 'Test description',
        tags: null,
        isResolved: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();
    
    console.log('✅ Test help request created:', testRequest.id);
    
    // Create a test help response
    const testResponseId = nanoid();
    const [testResponse] = await db
      .insert(helpResponses)
      .values({
        id: testResponseId,
        helpRequestId: testRequestId,
        userId: testUserId,
        content: 'Test response content',
        isMarkedHelpful: 0,
        helpfulCount: 0,
        createdAt: new Date().toISOString()
      })
      .returning();
    
    console.log('✅ Test help response created:', testResponse.id);
    
    // Create a test garden item
    const [testGardenItem] = await db
      .insert(gardenItems)
      .values({
        id: nanoid(),
        userId: testUserId,
        helpResponseId: testResponseId,
        type: 'seed',
        growth: 25,
        isGrown: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();
    
    console.log('✅ Test garden item created:', testGardenItem.id);
    
    console.log('\n📋 Step 2: Testing markResponseHelpful method...');
    
    // Create storage instance
    const storage = new DatabaseStorage();
    
    // Test the method directly
    console.log('🔍 Calling markResponseHelpful...');
    await storage.markResponseHelpful(testResponseId, testRequestId);
    console.log('✅ markResponseHelpful completed successfully!');
    
    // Verify the results
    console.log('\n📋 Step 3: Verifying results...');
    
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId));
    
    console.log('👤 User totalHelpProvided:', updatedUser.totalHelpProvided);
    
    const [updatedResponse] = await db
      .select()
      .from(helpResponses)
      .where(eq(helpResponses.id, testResponseId));
    
    console.log('💬 Response isMarkedHelpful:', updatedResponse.isMarkedHelpful);
    console.log('💬 Response helpfulCount:', updatedResponse.helpfulCount);
    
    const [updatedGardenItem] = await db
      .select()
      .from(gardenItems)
      .where(eq(gardenItems.helpResponseId, testResponseId));
    
    console.log('🌱 Garden item growth:', updatedGardenItem.growth);
    console.log('🌱 Garden item type:', updatedGardenItem.type);
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's the SQLite error we're looking for
    if (error.message.includes('SQLite3 can only bind numbers, strings, bigints, buffers, and null')) {
      console.error('\n🔍 This is the SQLite binding error we\'re trying to fix!');
      console.error('The error is happening in the markResponseHelpful method.');
    }
  } finally {
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await db.delete(gardenItems).where(eq(gardenItems.userId, testUserId));
      await db.delete(helpResponses).where(eq(helpResponses.id, testResponseId));
      await db.delete(helpRequests).where(eq(helpRequests.userId, testUserId));
      await db.delete(categories).where(eq(categories.id, testCategoryId));
      await db.delete(users).where(eq(users.id, testUserId));
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError.message);
    }
    
    process.exit(0);
  }
}

testMarkResponseHelpful();
