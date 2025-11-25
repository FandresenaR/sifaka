const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    console.log('\n=== Utilisateurs et leurs rôles ===\n');
    users.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Nom: ${user.name || 'Non défini'}`);
      console.log(`Rôle: ${user.role}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();
