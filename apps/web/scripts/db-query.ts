import 'dotenv/config'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

async function executeQuery() {
  const query = process.argv.slice(2).join(' ')
  
  if (!query) {
    console.error('Usage: npx tsx scripts/db-query.ts <SQL query>')
    console.error('Example: npx tsx scripts/db-query.ts "SELECT * FROM \\"User\\" LIMIT 5"')
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined')
    process.exit(1)
  }

  console.log(`🔍 Executing query via Neon Serverless...\n`)
  console.log(`Query: ${query}\n`)

  const pool = new Pool({ connectionString })
  
  try {
    const client = await pool.connect()
    const result = await client.query(query)
    
    if (result.rows && result.rows.length > 0) {
      console.log(`✅ Found ${result.rows.length} row(s):\n`)
      console.table(result.rows)
    } else if (result.rowCount !== null) {
      console.log(`✅ Query executed successfully. Affected rows: ${result.rowCount}`)
    } else {
      console.log('✅ Query executed successfully.')
    }
    
    client.release()
    await pool.end()
  } catch (error) {
    console.error('❌ Query failed:', error)
    await pool.end()
    process.exit(1)
  }
}

executeQuery()
