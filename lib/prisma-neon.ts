import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
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
neonConfig.useSecureWebSocket = true
neonConfig.pipelineConnect = "password"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined')
}

const adapter = new PrismaNeon({ connectionString })

const prismaClientSingleton = () => {
  return new PrismaClient({ 
    adapter,
    log: ['error']
  })
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma
