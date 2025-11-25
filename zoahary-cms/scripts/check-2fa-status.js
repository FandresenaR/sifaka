const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check2FAStatus() {
  try {
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
      },
    });

    console.log('\n=== Statut 2FA des utilisateurs ===\n');
    users.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Nom: ${user.name || 'Non défini'}`);
      console.log(`Rôle: ${user.role}`);
      console.log(`2FA activé: ${user.twoFactorEnabled ? 'OUI ✓' : 'NON'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check2FAStatus();
