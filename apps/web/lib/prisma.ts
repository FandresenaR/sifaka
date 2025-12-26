import { PrismaClient } from '../node_modules/.prisma/client-web'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

/**
 * Prisma Client - Development & Production Configuration
 * 
 * Configured to use Neon serverless driver with WebSockets to bypass
 * potential firewall restrictions on port 5432.
 */

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws
neonConfig.fetchConnectionCache = true
neonConfig.useSecureWebSocket = true
neonConfig.pipelineConnect = "password"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  // Warn but don't crash immediately in dev if env not loaded yet, 
  // though typically it fails later.
  console.warn('DATABASE_URL is not defined')
}

const adapter = new PrismaNeon({ connectionString: connectionString || '' })

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  })
}

declare const globalThis: {
  __prismaClient: PrismaClient | undefined
} & typeof global

const prisma = globalThis.__prismaClient ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClient = prisma
}

export default prisma
