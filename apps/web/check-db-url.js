const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract DATABASE_URL
const match = envContent.match(/DATABASE_URL\s*=\s*['"]?([^'"\r\n]+)['"]?/);
if (!match) {
    console.log('❌ DATABASE_URL not found in .env');
    process.exit(1);
}

const currentUrl = match[1];
console.log('Current DATABASE_URL format:');
console.log(currentUrl.replace(/:([^:@]+)@/, ':****@'));

// Check if it's using pooler
if (currentUrl.includes('-pooler.')) {
    console.log('✅ Using pooler endpoint');
} else {
    console.log('⚠️  Not using pooler endpoint');
    console.log('\nRecommended: Use the pooler endpoint from Neon dashboard');
    console.log('Format: postgresql://user:pass@ep-xxx-pooler.region.neon.tech/dbname?sslmode=require');
}

// Check SSL mode
if (currentUrl.includes('sslmode=require')) {
    console.log('✅ SSL mode is set to require');
} else {
    console.log('⚠️  SSL mode not set or incorrect');
    console.log('\nAdd ?sslmode=require to the end of your DATABASE_URL');
}

// Check for connection timeout params
if (currentUrl.includes('connect_timeout')) {
    console.log('✅ Connection timeout parameter present');
} else {
    console.log('ℹ️  Consider adding connection timeout: ?connect_timeout=20');
}
