import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Load environment variables
config();

async function resetUserAccount(userId) {
  let sql;
  
  try {
    console.log(`🔄 Resetting account for user: ${userId}`);
    
    // Create database connection
    sql = postgres(process.env.DATABASE_URL);
    
    // Delete all garden items for the user
    const deletedGardenItems = await sql`
      DELETE FROM garden_items 
      WHERE user_id = ${userId}
    `;
    
    console.log(`🗑️  Deleted garden items for user ${userId}`);
    
    // Reset user XP and level to 0
    const resetUser = await sql`
      UPDATE users 
      SET xp = 0, level = 1 
      WHERE id = ${userId}
    `;
    
    console.log(`🔄 Reset XP and level for user ${userId}`);
    
    console.log(`✅ Account reset successful for user: ${userId}`);
    console.log(`   - All garden items removed`);
    console.log(`   - XP reset to 0`);
    console.log(`   - Level reset to 1`);
    
  } catch (error) {
    console.error('❌ Error resetting account:', error);
  } finally {
    // Close the database connection
    if (sql) {
      await sql.end();
    }
  }
}

// Get the user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID as an argument');
  console.log('Usage: node scripts/reset-user-account.js <userId>');
  process.exit(1);
}

resetUserAccount(userId).then(() => {
  console.log('🎉 Account reset complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed to reset account:', error);
  process.exit(1);
});
