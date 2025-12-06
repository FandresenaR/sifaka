import 'dotenv/config'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import * as fs from 'fs'
import * as path from 'path'

neonConfig.webSocketConstructor = ws

async function applyMigration() {
  const migrationFile = process.argv[2]
  
  if (!migrationFile) {
    console.error('Usage: npx tsx scripts/apply-migration.ts <migration-file.sql>')
    console.error('Example: npx tsx scripts/apply-migration.ts migrations/001_init.sql')
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined')
    process.exit(1)
  }

  const migrationPath = path.resolve(process.cwd(), migrationFile)
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log(`🔄 Applying migration: ${path.basename(migrationFile)}`)
  console.log(`📁 From: ${migrationPath}\n`)

  const pool = new Pool({ connectionString })
  
  try {
    const client = await pool.connect()
    
    // Execute migration
    await client.query(sql)
    
    console.log('✅ Migration applied successfully!')
    
    client.release()
    await pool.end()
  } catch (error) {
    console.error('❌ Migration failed:', error)
    await pool.end()
    process.exit(1)
  }
}

applyMigration()
