import 'dotenv/config'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

async function syncSchema() {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined')
    process.exit(1)
  }

  console.log('🔄 Synchronizing Prisma schema with Neon database...\n')

  const pool = new Pool({ connectionString })
  
  try {
    const client = await pool.connect()
    
    // Get current schema from Prisma
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    // Execute any pending schema changes
    // This is a simplified version - you'd generate SQL from schema.prisma
    console.log('📊 Checking database schema...')
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    console.log('\n📋 Current tables in database:')
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`)
    })
    
    console.log('\n💡 To apply schema changes:')
    console.log('   1. Generate SQL from schema.prisma')
    console.log('   2. Use: npx tsx scripts/apply-migration.ts <file.sql>')
    console.log('   OR')
    console.log('   3. Use Prisma Studio to manage data')
    
    client.release()
    await pool.end()
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Schema sync failed:', error)
    await pool.end()
    process.exit(1)
  }
}

syncSchema()
