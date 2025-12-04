const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
    console.log("Testing database connection...");

    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("❌ DATABASE_URL is missing in .env");
        return;
    }

    // Masquer le mot de passe pour l'affichage
    const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
    console.log(`URL found: ${maskedUrl}`);

    const client = new Client({
        connectionString: url,
        ssl: {
            rejectUnauthorized: false // Nécessaire pour Neon parfois
        }
    });

    try {
        await client.connect();
        console.log("✅ Connection successful!");
        const res = await client.query('SELECT NOW()');
        console.log("Database time:", res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error("❌ Connection failed:", err);
    }
}

testConnection();
