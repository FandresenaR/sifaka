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

declare global {
  var __prismaClient: PrismaClient | undefined
}

const prisma = global.__prismaClient ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  global.__prismaClient = prisma
}

export default prisma
