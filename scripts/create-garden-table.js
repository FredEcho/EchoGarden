#!/usr/bin/env node

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config();

async function createGardenTable() {
  let sql;
  try {
    console.log('🔄 Checking for garden_items table...\n');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    sql = postgres(databaseUrl);
    
    // Check if garden_items table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'garden_items'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ garden_items table already exists');
      return;
    }
    
    // Create garden_items table
    console.log('📝 Creating garden_items table...');
    
    await sql`
      CREATE TABLE "garden_items" (
        "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" text NOT NULL,
        "help_response_id" text,
        "type" text NOT NULL,
        "growth" integer DEFAULT 0,
        "is_grown" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `;
    
    console.log('   ✅ Created garden_items table');
    
    // Add foreign key constraints
    await sql`
      ALTER TABLE "garden_items" 
      ADD CONSTRAINT "garden_items_user_id_users_id_fk" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
    `;
    console.log('   ✅ Added foreign key constraint for user_id');
    
    await sql`
      ALTER TABLE "garden_items" 
      ADD CONSTRAINT "garden_items_help_response_id_help_responses_id_fk" 
      FOREIGN KEY ("help_response_id") REFERENCES "help_responses"("id") ON DELETE CASCADE;
    `;
    console.log('   ✅ Added foreign key constraint for help_response_id');
    
    console.log('\n🎉 garden_items table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating garden_items table:', error);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

createGardenTable();
