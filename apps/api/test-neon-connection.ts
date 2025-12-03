import { config } from 'dotenv';
import { Pool } from '@neondatabase/serverless';
import './src/database/neon.config';

// Charger les variables d'environnement
config();

async function testConnection() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ DATABASE_URL not set');
        process.exit(1);
    }

    console.log('🔍 Testing Neon connection via WebSocket (port 443)...\n');

    const pool = new Pool({ connectionString });

    try {
        const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Connection successful!');
        console.log('📅 Server time:', result.rows[0].current_time);
        console.log('🗄️  PostgreSQL version:', result.rows[0].pg_version);
        console.log('\n✅ Neon WebSocket connection is working correctly!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    }
}

testConnection();
