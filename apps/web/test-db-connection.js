const { Client } = require('pg');

// Récupérer l'URL depuis les variables d'environnement
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

console.log('🔍 Test de connexion à Supabase...');
console.log('📍 Host:', connectionString?.match(/@([^:]+)/)?.[1] || 'non trouvé');
console.log('🔌 Port:', connectionString?.match(/:(\d+)\//)?.[1] || 'non trouvé');
console.log('');

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10 secondes
});

async function testConnection() {
    try {
        console.log('⏳ Tentative de connexion...');
        await client.connect();
        console.log('✅ Connexion réussie !');

        const result = await client.query('SELECT version()');
        console.log('📊 Version PostgreSQL:', result.rows[0].version);

        await client.end();
        console.log('👋 Connexion fermée proprement');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur de connexion:');
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);

        if (error.code === 'ENOTFOUND') {
            console.error('\n💡 Le serveur n\'a pas pu être trouvé. Vérifiez:');
            console.error('   - Votre connexion Internet');
            console.error('   - L\'URL de connexion dans .env');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            console.error('\n💡 La connexion a expiré. Vérifiez:');
            console.error('   - Votre pare-feu Windows');
            console.error('   - Les règles de sécurité de Supabase');
        } else if (error.message.includes('password')) {
            console.error('\n💡 Problème d\'authentification. Vérifiez:');
            console.error('   - Le mot de passe dans .env');
            console.error('   - L\'encodage des caractères spéciaux');
        }

        process.exit(1);
    }
}

testConnection();
