#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌱 Setting up EchoGarden for local development...\n');

// Create .env file with SQLite for local development
const envPath = path.join(__dirname, '..', '.env');
const envContent = `# Database Configuration - Using SQLite for local development
DATABASE_URL="file:./dev.db"

# Session Configuration (generate a secure random string)
SESSION_SECRET="echogarden-local-dev-secret-key-2024"

# Environment
NODE_ENV="development"

# Port (optional, defaults to 5000)
PORT=5000
`;

fs.writeFileSync(envPath, envContent);
console.log('✅ .env file updated for local development!');

console.log('\n🚀 Next steps:');
console.log('1. Run: npm run db:push (to set up the database schema)');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:5000 in Chrome');

console.log('\n📝 This setup uses SQLite for local development, which is perfect for testing in Chrome!');
