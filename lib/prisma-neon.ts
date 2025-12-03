import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

/**
 * Prisma Client - Production Configuration (Neon Serverless)
 * 
 * This version uses the Neon adapter for WebSocket connections (port 443).
 * Ideal for serverless environments like Vercel Edge Runtime.
 * 
 * Usage in Next.js API routes or Server Components:
 * ```typescript
 * import prisma from '@/lib/prisma-neon'
 * const users = await prisma.user.findMany()
 * ```
 * 
 * For local development, use lib/prisma.ts instead.
 */

// Configure Neon to use WebSockets (port 443)
neonConfig.webSocketConstructor = ws
neonConfig.fetchConnectionCache = true

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

const prisma = new PrismaClient({ 
  adapter,
  log: ['error']
})

export default prisma
