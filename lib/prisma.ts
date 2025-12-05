import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client - Development Configuration
 * 
 * This is the standard Prisma client for development.
 * For production/Edge runtime with Neon, use lib/prisma-neon.ts instead.
 * 
 * Note: Neon requires WebSocket connections (port 443), which Prisma CLI 
 * doesn't support. Use npm run db:* scripts for database operations.
 */

const prismaClientSingleton = () => {
  return new PrismaClient({
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
