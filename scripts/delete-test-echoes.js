#!/usr/bin/env node

import { config } from 'dotenv';
import Database from 'better-sqlite3';

// Load environment variables
config();

async function deleteTestEchoes() {
  let db;
  try {
    console.log('🗑️ Checking for test echoes to delete...\n');
    
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
    
    // First, let's see what echoes exist
    console.log('📋 Current echoes in database:');
    const echoes = db.prepare(`
      SELECT hr.id, hr.title, hr.description, hr.created_at, u.email
      FROM help_requests hr
      LEFT JOIN users u ON hr.user_id = u.id
      ORDER BY hr.created_at DESC
    `).all();
    
    if (echoes.length === 0) {
      console.log('   No echoes found in database.');
      return;
    }
    
    echoes.forEach((echo, index) => {
      console.log(`   ${index + 1}. "${echo.title}" by ${echo.email || 'Unknown'}`);
      console.log(`      ID: ${echo.id}`);
      console.log(`      Created: ${echo.created_at}`);
      console.log(`      Description: ${echo.description.substring(0, 100)}${echo.description.length > 100 ? '...' : ''}`);
      console.log('');
    });
    
    // Look for test echoes (titles containing "test", "Test", "TEST", etc.)
    const testEchoes = echoes.filter(echo => 
      echo.title.toLowerCase().includes('test') ||
      echo.description.toLowerCase().includes('test') ||
      echo.title.toLowerCase().includes('example') ||
      echo.description.toLowerCase().includes('example')
    );
    
    if (testEchoes.length === 0) {
      console.log('✅ No test echoes found to delete.');
      return;
    }
    
    console.log(`🎯 Found ${testEchoes.length} test echo(es) to delete:`);
    testEchoes.forEach((echo, index) => {
      console.log(`   ${index + 1}. "${echo.title}" (ID: ${echo.id})`);
    });
    
    // Delete test echoes
    console.log('\n🗑️ Deleting test echoes...');
    let deletedCount = 0;
    
    for (const echo of testEchoes) {
      try {
        // Delete related garden items first
        const gardenItems = db.prepare(`
          SELECT gi.id FROM garden_items gi
          JOIN help_responses hr ON gi.help_response_id = hr.id
          WHERE hr.help_request_id = ?
        `).all(echo.id);
        
        for (const item of gardenItems) {
          db.prepare('DELETE FROM garden_items WHERE id = ?').run(item.id);
        }
        
        // Delete help responses
        db.prepare('DELETE FROM help_responses WHERE help_request_id = ?').run(echo.id);
        
        // Delete the help request
        db.prepare('DELETE FROM help_requests WHERE id = ?').run(echo.id);
        
        console.log(`   ✅ Deleted: "${echo.title}"`);
        deletedCount++;
      } catch (error) {
        console.log(`   ❌ Failed to delete: "${echo.title}" - ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Successfully deleted ${deletedCount} test echo(es)!`);
    
    // Show remaining echoes
    const remainingEchoes = db.prepare(`
      SELECT COUNT(*) as count FROM help_requests
    `).get();
    
    console.log(`📊 Remaining echoes in database: ${remainingEchoes.count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Run the deletion
deleteTestEchoes();
