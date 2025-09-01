#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function awardXP(userId, xpAmount, reason) {
  let sql;
  try {
    console.log(`🎯 Awarding ${xpAmount} XP to user ${userId} for: ${reason}\n`);
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Get current user stats
    const [user] = await sql`
      SELECT xp, level, total_help_provided, total_help_received 
      FROM users 
      WHERE id = ${userId}
    `;
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('📊 Current stats:');
    console.log(`   XP: ${user.xp || 0}`);
    console.log(`   Level: ${user.level || 1}`);
    console.log(`   Help Provided: ${user.total_help_provided || 0}`);
    console.log(`   Help Received: ${user.total_help_received || 0}`);
    
    // Calculate new XP and level
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const newXP = currentXP + xpAmount;
    
    // Simple level calculation (every 100 XP = 1 level)
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > currentLevel;
    
    // Update user
    await sql`
      UPDATE users 
      SET xp = ${newXP}, level = ${newLevel}, updated_at = NOW()
      WHERE id = ${userId}
    `;
    
    console.log('\n🎉 XP awarded successfully!');
    console.log(`   New XP: ${newXP}`);
    console.log(`   New Level: ${newLevel}`);
    if (leveledUp) {
      console.log(`   🎊 LEVELED UP from ${currentLevel} to ${newLevel}!`);
    }
    
    // Get level title
    let title = "New Gardener 🌱";
    if (newLevel >= 30) title = "Legendary Gardener 🌟";
    else if (newLevel >= 25) title = "Master Gardener 👑";
    else if (newLevel >= 20) title = "Expert Gardener 🌺";
    else if (newLevel >= 15) title = "Advanced Gardener 🌿";
    else if (newLevel >= 10) title = "Skilled Gardener 🌱";
    else if (newLevel >= 5) title = "Growing Gardener 🌷";
    
    console.log(`   Title: ${title}`);
    
  } catch (error) {
    console.error('❌ Error awarding XP:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

// Get command line arguments
const userId = process.argv[2];
const xpAmount = parseInt(process.argv[3]) || 100;
const reason = process.argv[4] || 'Testing XP system';

if (!userId) {
  console.log('❌ Please provide a user ID as an argument');
  console.log('Usage: node award-xp.js <userId> [xpAmount] [reason]');
  console.log('Example: node award-xp.js 25bdac17-f46a-4624-8e94-947f6da7c616 150 "Helping others"');
  process.exit(1);
}

awardXP(userId, xpAmount, reason);
