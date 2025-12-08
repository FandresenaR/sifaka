
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws
neonConfig.fetchConnectionCache = true
neonConfig.useSecureWebSocket = true
neonConfig.pipelineConnect = "password"

async function main() {
    const connectionString = process.env.DATABASE_URL
    const adapter = new PrismaNeon({ connectionString: connectionString || '' })
    const prisma = new PrismaClient({ adapter })

    console.log('🔄 Attempting to fetch projects with owner relation...')

    try {
        // Simulate the query from app/api/projects/route.ts
        // We don't have a user ID so we'll just try findMany without where first, or with a dummy ID structure 
        // but the error is column parsing, so even an empty result should trigger it if column is missing.

        const projects = await prisma.project.findMany({
            take: 1,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        console.log('✅ Query executed successfully!')
        console.log('Result:', projects)
    } catch (e: any) {
        console.error('❌ Query failed:')
        console.error(e)
        process.exit(1)
    } finally {
        // await prisma.$disconnect()
    }
}

main()
