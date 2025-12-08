#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Global-Eats2 Project...\n');

const runCommand = (command, cwd = process.cwd()) => {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash'
    });
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
};

// Create .env file for server
const serverEnvContent = `# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=postgres
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=faltuemailhaisala@gmail.com
SMTP_PASS=frilymrfoqojlmuf
SMTP_FROM=Global-Eats <faltuemailhaisala@gmail.com>

# Application Configuration
APP_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
`;

// Create .env file for client
const clientEnvContent = `VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=GlobalEats
`;

try {
  // Create server .env file
  fs.writeFileSync(path.join(__dirname, 'server', '.env'), serverEnvContent);
  console.log('✅ Created server/.env file');

  // Create client .env file
  fs.writeFileSync(path.join(__dirname, 'client', '.env'), clientEnvContent);
  console.log('✅ Created client/.env file');

  // Install root dependencies
  console.log('\n📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Check if Docker is running
  console.log('🐳 Checking Docker...');
  try {
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker is available');
  } catch (error) {
    console.error('❌ Docker is not available. Please install and start Docker first.');
    process.exit(1);
  }

  // Install server dependencies
  console.log('\n📦 Installing server dependencies...');
  runCommand('npm install', './server');

  // Install client dependencies
  console.log('\n📦 Installing client dependencies...');
  runCommand('npm install', './Client');

  // Start Docker services
  console.log('\n🐳 Starting Docker services...');
  runCommand('docker-compose up -d postgres redis');

  // Wait for PostgreSQL to be ready
  console.log('\n⏳ Waiting for PostgreSQL to be ready...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Run database migrations and seeds
  console.log('\n🗄️ Setting up database...');
  runCommand('npm run db:setup', './server');

  console.log('\n✅ Setup completed successfully!');
  console.log('\n🎉 Your Global-Eats2 project is ready!');
  console.log('\nNext steps:');
  console.log('1. Start the backend: cd server && npm run dev');
  console.log('2. Start the frontend: cd Client && npm run dev');
  console.log('3. Open http://localhost:3000 in your browser');
  console.log('\nDemo accounts:');
  console.log('- Customer: john.doe@example.com / password123');
  console.log('- Restaurant Owner: owner@mcdonalds.com / password123');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}
};

const main = async () => {
  try {
