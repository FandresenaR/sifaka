"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const serverless_1 = require("@neondatabase/serverless");
require("./src/database/neon.config");
(0, dotenv_1.config)();
async function testConnection() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ DATABASE_URL not set');
        process.exit(1);
    }
    console.log('🔍 Testing Neon connection via WebSocket (port 443)...\n');
    const pool = new serverless_1.Pool({ connectionString });
    try {
        const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Connection successful!');
        console.log('📅 Server time:', result.rows[0].current_time);
        console.log('🗄️  PostgreSQL version:', result.rows[0].pg_version);
        console.log('\n✅ Neon WebSocket connection is working correctly!');
        await pool.end();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    }
}
testConnection();
//# sourceMappingURL=test-neon-connection.js.map