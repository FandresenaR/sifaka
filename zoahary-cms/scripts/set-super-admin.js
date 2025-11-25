/**
 * Script pour définir le super administrateur
 * 
 * Usage:
 *   node scripts/set-super-admin.js
 * 
 * Prérequis:
 *   - L'utilisateur fandresenar6@gmail.com doit avoir créé un compte via Google OAuth
 *   - La base de données doit être accessible
 *   - Le rôle SUPER_ADMIN doit exister dans le schéma Prisma
 * 
 * Ce script:
 *   1. Vérifie que l'utilisateur existe
 *   2. Met à jour son rôle en SUPER_ADMIN
 *   3. Affiche un message de confirmation
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = 'fandresenar6@gmail.com';

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (!user) {
      console.log(`❌ L'utilisateur avec l'email ${superAdminEmail} n'existe pas.`);
      console.log('Veuillez d\'abord créer un compte avec cet email via Google OAuth.');
      return;
    }

    // Mettre à jour le rôle en SUPER_ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: superAdminEmail },
      data: { role: 'SUPER_ADMIN' },
    });

    console.log('✅ Super administrateur défini avec succès !');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Rôle: ${updatedUser.role}`);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
