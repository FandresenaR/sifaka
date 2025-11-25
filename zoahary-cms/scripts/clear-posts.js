const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearPosts() {
  const result = await prisma.blogPost.deleteMany();
  console.log(`✅ Supprimé: ${result.count} articles`);
  await prisma.$disconnect();
}

clearPosts();
