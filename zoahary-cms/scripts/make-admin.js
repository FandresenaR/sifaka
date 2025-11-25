const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    console.log('\n👤 Recherche d\'utilisateurs...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé!');
      console.log('💡 Connectez-vous d\'abord avec Google OAuth sur http://localhost:3000\n');
      return;
    }

    console.log('📋 Utilisateurs trouvés:');
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} (${u.name}) - Role: ${u.role}`);
    });

    // Prendre le premier utilisateur et le rendre ADMIN
    const user = users[0];
    
    if (user.role === 'ADMIN') {
      console.log(`\n✅ ${user.email} est déjà ADMIN!\n`);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    });

    console.log(`\n✅ ${user.email} est maintenant ADMIN!`);
    console.log('💡 Vous pouvez maintenant exécuter: node scripts/migrate-blog-from-markdown.js\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
