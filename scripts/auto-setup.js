#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌱 Auto-Setup EchoGarden...\n');

// Create .env file with the correct connection string
const envPath = path.join(__dirname, '..', '.env');
const envContent = `# Database Configuration - Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Session Configuration
SESSION_SECRET="echogarden-session-secret-2024"

# Environment
NODE_ENV="development"

# Port
PORT=5000

# Supabase Configuration
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
`;

fs.writeFileSync(envPath, envContent);
console.log('✅ .env file created!');

console.log('\n⚠️  IMPORTANT: You still need to:');
console.log('1. Get your database password from Supabase dashboard');
console.log('2. Replace [YOUR-PASSWORD] and [YOUR-PROJECT-REF] in the .env file');
console.log('3. Get your anon key from Supabase dashboard');

console.log('\n📋 To get your credentials:');
console.log('1. Go to: https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → Database');
console.log('4. Copy the database password');
console.log('5. Go to Settings → API');
console.log('6. Copy the anon key');

console.log('\n🚀 Next steps:');
console.log('1. Update your .env file with the credentials');
console.log('2. Run: npm run test-db');
console.log('3. Run: npm run dev');
console.log('4. Open: http://localhost:5000');
