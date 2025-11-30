const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, '');
            env[key] = value;
        }
    });
    return env;
}

const env = loadEnv(path.join(__dirname, '.env'));
const envLocal = loadEnv(path.join(__dirname, '.env.local'));
const combined = { ...env, ...envLocal };

const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'DATABASE_URL'
];

console.log('Environment Variable Check:');
required.forEach(key => {
    const value = combined[key];
    const status = value && value.length > 0 ? '✅ Present' : '❌ Missing/Empty';
    console.log(`${key}: ${status}`);
});
