
import { PrismaClient } from '@prisma/client'

async function main() {
    const prisma = new PrismaClient()

    console.log('Checking if prisma.project definition exists...')

    // @ts-ignore
    if (prisma.project) {
        console.log('✅ prisma.project is defined on the client instance property!')
    } else {
        // Check if it's in the dmmf or just accessible
        // Sometimes it's a getter so checking property might invoke it or show undefined if not instantiated?
        // Actually properties like 'user', 'project' are getters on the client instance.

        // Let's try to access it safely
        try {
            // @ts-ignore
            const count = await prisma.project.count()
            console.log('✅ prisma.project.count() executed successfully. Count:', count)
        } catch (e: any) {
            console.error('❌ Failed to access prisma.project:', e.message)
            process.exit(1)
        }
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        // await prisma.$disconnect()
    })
