import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function testConnection() {
  try {
    console.log('Testing Neon connection...')
    const result = await sql`SELECT version()`
    console.log('✅ Connection successful!')
    console.log('PostgreSQL version:', result[0].version)
    
    // Test tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log(`\n📊 Found ${tables.length} tables:`)
    tables.forEach(t => console.log(`  - ${t.table_name}`))
    
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  }
}

testConnection()
