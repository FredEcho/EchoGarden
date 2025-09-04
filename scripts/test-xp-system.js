#!/usr/bin/env node

import { config } from 'dotenv';
import Database from 'better-sqlite3';

// Load environment variables
config();

async function testXPSystem() {
  let db;
  try {
    console.log('🧪 Testing XP System...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    // Use SQLite for local development
    const dbPath = databaseUrl.startsWith('file:') 
      ? databaseUrl.replace('file:', '') 
      : './dev.db';
    
    db = new Database(dbPath);
    
    // Get a test user
    const user = db.prepare(`
      SELECT id, email, xp, level, total_help_provided, total_help_received 
      FROM users 
      LIMIT 1
    `).get();
    
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('👤 Test User:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current XP: ${user.xp || 0}`);
    console.log(`   Current Level: ${user.level || 1}`);
    console.log(`   Help Provided: ${user.total_help_provided || 0}`);
    console.log(`   Help Received: ${user.total_help_received || 0}`);
    
    // Test level calculation
    console.log('\n📊 Testing Level Calculation:');
    const testXPValues = [0, 50, 100, 150, 250, 500, 1000, 2000];
    
    for (const xp of testXPValues) {
      const level = calculateLevel(xp);
      const progress = calculateProgress(xp, level);
      console.log(`   ${xp} XP = Level ${level} (${progress.toFixed(1)}% to next level)`);
    }
    
    // Test XP rewards
    console.log('\n🎯 XP Rewards:');
    console.log('   Post Help Request: 10 XP');
    console.log('   Provide Response: 25 XP');
    console.log('   Response Marked Helpful: 50 XP');
    console.log('   Resolve Help Request: 30 XP');
    console.log('   Complete Pay-it-Forward: 75 XP');
    console.log('   Daily Login: 5 XP');
    
    console.log('\n✅ XP System test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Simple level calculation for testing
function calculateLevel(xp) {
  const XP_PER_LEVEL = [
    0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
    3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
    11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200
  ];
  
  let level = 1;
  for (let i = 0; i < XP_PER_LEVEL.length; i++) {
    if (xp >= XP_PER_LEVEL[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

// Simple progress calculation for testing
function calculateProgress(xp, level) {
  const XP_PER_LEVEL = [
    0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
    3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
    11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200
  ];
  
  if (level >= XP_PER_LEVEL.length) return 100;
  
  const xpRequired = XP_PER_LEVEL[level - 1];
  const xpForNextLevel = XP_PER_LEVEL[level];
  const xpInCurrentLevel = xp - xpRequired;
  const xpNeededForNextLevel = xpForNextLevel - xpRequired;
  
  return xpNeededForNextLevel > 0 ? (xpInCurrentLevel / xpNeededForNextLevel) * 100 : 0;
}

// Run the test
testXPSystem();
