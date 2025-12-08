import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  console.log('📊 Total users:', users.length)
  console.log('\n👥 Users in database:')
  users.forEach((user) => {
    console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`)
  })

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
