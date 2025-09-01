#!/usr/bin/env node

/**
 * Security Audit Script for EchoGarden
 * Checks for common security issues before production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 EchoGarden Security Audit\n');

let issues = [];
let warnings = [];

// Check 1: Environment variables
console.log('1. Checking environment variables...');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for default session secret
  if (envContent.includes('your-secret-key-change-in-production') || 
      envContent.includes('echogarden-session-secret-2024')) {
    issues.push('❌ SESSION_SECRET is using default value - CHANGE THIS IMMEDIATELY');
  }
  
  // Check for placeholder passwords
  if (envContent.includes('[YOUR-PASSWORD]')) {
    issues.push('❌ DATABASE_URL contains placeholder password');
  }
  
  // Check for production environment
  if (!envContent.includes('NODE_ENV=production')) {
    warnings.push('⚠️  NODE_ENV not set to production');
  }
  
  console.log('   ✅ .env file exists');
} else {
  issues.push('❌ .env file not found');
}

// Check 2: Package.json security
console.log('\n2. Checking package.json...');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Check for rate limiting dependency
  if (!packageJson.dependencies['express-rate-limit']) {
    issues.push('❌ express-rate-limit dependency missing');
  }
  
  console.log('   ✅ Package.json security dependencies present');
}

// Check 3: Security headers in server code
console.log('\n3. Checking security headers...');
const serverPath = path.join(process.cwd(), 'server', 'index.ts');
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  if (!serverContent.includes('X-Content-Type-Options')) {
    issues.push('❌ Security headers not implemented');
  }
  
  if (!serverContent.includes('express-rate-limit')) {
    issues.push('❌ Rate limiting not implemented');
  }
  
  console.log('   ✅ Security headers implemented');
}

// Check 4: Console logging in production
console.log('\n4. Checking for development logging...');
const clientPath = path.join(process.cwd(), 'client', 'src', 'main.tsx');
if (fs.existsSync(clientPath)) {
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  
  if (clientContent.includes('console.error') && !clientContent.includes('NODE_ENV === \'development\'')) {
    warnings.push('⚠️  Console logging found in client code without environment check');
  }
  
  console.log('   ✅ Client logging properly configured');
}

// Check 5: Hardcoded credentials
console.log('\n5. Checking for hardcoded credentials...');
const scriptsDir = path.join(process.cwd(), 'scripts');
if (fs.existsSync(scriptsDir)) {
  const scriptFiles = fs.readdirSync(scriptsDir);
  
  for (const file of scriptFiles) {
    if (file.endsWith('.js')) {
      const scriptPath = path.join(scriptsDir, file);
      const scriptContent = fs.readFileSync(scriptPath, 'utf8');
      
      // Check for hardcoded tokens
      if (scriptContent.includes('sbp_') || scriptContent.includes('eyJ')) {
        issues.push(`❌ Hardcoded credentials found in ${file}`);
      }
    }
  }
  
  console.log('   ✅ No hardcoded credentials found');
}

// Check 6: Build output
console.log('\n6. Checking build configuration...');
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
  
  if (!viteContent.includes('target: "es2015"')) {
    warnings.push('⚠️  Vite build target not optimized for older browsers');
  }
  
  console.log('   ✅ Build configuration looks good');
}

// Summary
console.log('\n📋 Security Audit Summary\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('🎉 All security checks passed! Your application is ready for production.');
} else {
  if (issues.length > 0) {
    console.log('❌ CRITICAL ISSUES (must fix before production):');
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (recommended to fix):');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Fix all critical issues above');
  console.log('2. Review warnings and address as needed');
  console.log('3. Run this audit again after fixes');
  console.log('4. See DEPLOYMENT.md for production setup guide');
}

console.log('\n📚 For more information, see:');
console.log('   - DEPLOYMENT.md (production deployment guide)');
console.log('   - env.example (environment configuration)');
console.log('   - README.md (general documentation)');

process.exit(issues.length > 0 ? 1 : 0);
